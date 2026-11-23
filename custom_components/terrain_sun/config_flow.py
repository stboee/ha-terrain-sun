"""Import and manage named horizon profiles through the setup UI."""

from __future__ import annotations

import logging

import probatio as vol
from homeassistant import config_entries
from homeassistant.components.file_upload import process_uploaded_file
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.selector import (
    BooleanSelector,
    FileSelector,
    SelectSelector,
    TextSelector,
)
from homeassistant.util import slugify

from . import DEFAULT_PROFILE, DOMAIN
from .engine import parse_horizon
from .sensor import SENSORS

_LOGGER = logging.getLogger(__name__)
_PROFILE = "profile"
_MAX_BYTES = 256 * 1024
_UPLOAD = FileSelector({"accept": ".txt,text/plain"})


def _read_upload(hass: HomeAssistant, file_id: str) -> dict:
    with process_uploaded_file(hass, file_id) as path, path.open("rb") as file:
        content = file.read(_MAX_BYTES + 1)
    if len(content) > _MAX_BYTES:
        raise ValueError("Horizon profile is too large")
    horizon, coordinates = parse_horizon(content.decode("utf-8-sig"))
    return {
        "bearings": list(horizon.bearings),
        "elevations": list(horizon.elevations),
        "coordinates": list(coordinates) if coordinates else None,
    }


class TerrainSunConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Keep the profiles and their names in one integration entry."""

    VERSION = 2

    async def async_step_user(self, user_input=None):
        return await self._async_profile_form("user", user_input)

    async def async_step_reconfigure(self, user_input=None):
        profiles = self._get_reconfigure_entry().data["profiles"]
        actions = ["add_profile", "choose_profile"]
        if len(profiles) > 1:
            actions.append("remove_profile")
        return self.async_show_menu(step_id="reconfigure", menu_options=actions)

    async def async_step_add_profile(self, user_input=None):
        return await self._async_profile_form("add_profile", user_input)

    def _profile_selector(self, profiles):
        return SelectSelector(
            {
                "options": [
                    {"value": key, "label": profile["name"]}
                    for key, profile in profiles.items()
                ],
                "mode": "dropdown",
            }
        )

    async def async_step_choose_profile(self, user_input=None):
        profiles = self._get_reconfigure_entry().data["profiles"]
        if user_input is not None and user_input["profile_id"] in profiles:
            self._edit_id = user_input["profile_id"]
            return await self.async_step_edit_profile()
        return self.async_show_form(
            step_id="choose_profile",
            data_schema=vol.Schema(
                {
                    vol.Required("profile_id"): self._profile_selector(profiles),
                }
            ),
        )

    async def async_step_edit_profile(self, user_input=None):
        return await self._async_profile_form("edit_profile", user_input, self._edit_id)

    async def async_step_remove_profile(self, user_input=None):
        entry = self._get_reconfigure_entry()
        profiles = dict(entry.data["profiles"])
        if len(profiles) <= 1:
            return self.async_abort(reason="last_profile")
        errors = {}
        if user_input is not None:
            profile_id = user_input["profile_id"]
            if profile_id not in profiles:
                return self.async_abort(reason="unknown_profile")
            if user_input["confirm"]:
                del profiles[profile_id]
                result = self._save_profiles(entry, profiles)
                identifier = (DOMAIN, f"{entry.entry_id}_{profile_id}")
                entities = er.async_get(self.hass)
                keys = [
                    (Platform.BINARY_SENSOR, "direct_sun"),
                    *((Platform.SENSOR, sensor.key) for sensor in SENSORS),
                ]
                for domain, key in keys:
                    entity_id = entities.async_get_entity_id(
                        domain, DOMAIN, f"{identifier[1]}_{key}"
                    )
                    if entity_id:
                        entities.async_remove(entity_id)
                registry = dr.async_get(self.hass)
                device = registry.async_get_device(identifiers={identifier})
                if (
                    device
                    and device.identifiers == {identifier}
                    and device.config_entries == {entry.entry_id}
                ):
                    registry.async_remove_device(device.id)
                return result
            errors["confirm"] = "confirm_removal"
        return self.async_show_form(
            step_id="remove_profile",
            errors=errors,
            data_schema=vol.Schema(
                {
                    vol.Required("profile_id"): self._profile_selector(profiles),
                    vol.Required("confirm", default=False): BooleanSelector(),
                }
            ),
        )

    def _save_profiles(self, entry, profiles):
        options = dict(entry.options)
        if options.get(DEFAULT_PROFILE) not in profiles:
            options[DEFAULT_PROFILE] = next(iter(profiles))
        return self.async_update_reload_and_abort(
            entry,
            data={"profiles": profiles},
            options=options,
            reload_even_if_entry_is_unchanged=False,
        )

    async def _async_profile_form(self, step, user_input, profile_id=None):
        entry = None if step == "user" else self._get_reconfigure_entry()
        profiles = entry.data["profiles"] if entry else {}
        if profile_id is not None and profile_id not in profiles:
            return self.async_abort(reason="unknown_profile")
        editing = profile_id is not None
        name_field = (
            vol.Required("name", default=profiles[profile_id]["name"])
            if editing
            else vol.Required("name")
        )
        data_schema = vol.Schema(
            {
                name_field: TextSelector(),
                (
                    vol.Optional(_PROFILE) if editing else vol.Required(_PROFILE)
                ): _UPLOAD,
            }
        )
        errors = {}
        if user_input is not None:
            name = user_input["name"].strip()
            if not name:
                errors["name"] = "empty_name"
            elif any(
                key != profile_id and profile["name"].casefold() == name.casefold()
                for key, profile in profiles.items()
            ):
                errors["name"] = "name_in_use"
            try:
                data = profiles.get(profile_id)
                if not errors and user_input.get(_PROFILE):
                    data = await self.hass.async_add_executor_job(
                        _read_upload, self.hass, user_input[_PROFILE]
                    )
            except (ValueError, OSError) as err:
                _LOGGER.debug("Could not import a horizon profile: %s", err)
                errors[_PROFILE] = "invalid_profile"
            if not errors:
                profiles = dict(entry.data["profiles"]) if entry else {}
                if editing and profile_id not in profiles:
                    return self.async_abort(reason="unknown_profile")
                if any(
                    key != profile_id and profile["name"].casefold() == name.casefold()
                    for key, profile in profiles.items()
                ):
                    errors["name"] = "name_in_use"
                else:
                    if not editing:
                        base = slugify(name)[:64].rstrip("_") or "profile"
                        profile_id = base
                        index = 2
                        while profile_id in profiles:
                            profile_id = f"{base}_{index}"
                            index += 1
                    profiles[profile_id] = {**data, "name": name}
                    if entry:
                        return self._save_profiles(entry, profiles)
                    return self.async_create_entry(
                        title="Terrain Sun", data={"profiles": profiles}
                    )
        return self.async_show_form(
            step_id=step, data_schema=data_schema, errors=errors
        )
