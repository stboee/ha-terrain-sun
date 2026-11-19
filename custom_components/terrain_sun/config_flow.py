"""Import and replace a local horizon profile through the setup UI."""

from __future__ import annotations

import logging

import probatio as vol
from homeassistant import config_entries
from homeassistant.components.file_upload import process_uploaded_file
from homeassistant.core import HomeAssistant
from homeassistant.helpers.selector import FileSelector

from . import DOMAIN
from .engine import parse_horizon

_LOGGER = logging.getLogger(__name__)
_PROFILE = "profile"
_MAX_BYTES = 256 * 1024
_UPLOAD_FORM = vol.Schema(
    {vol.Required(_PROFILE): FileSelector({"accept": ".txt,text/plain"})}
)


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
    """Set up Terrain Sun and let the user replace the same entry's profile."""

    async def async_step_user(self, user_input=None):
        return await self._async_profile_form("user", user_input)

    async def async_step_reconfigure(self, user_input=None):
        return await self._async_profile_form("reconfigure", user_input)

    async def _async_profile_form(self, step, user_input):
        errors = {}
        if user_input is not None:
            try:
                data = await self.hass.async_add_executor_job(
                    _read_upload, self.hass, user_input[_PROFILE]
                )
            except (ValueError, OSError) as err:
                _LOGGER.debug("Could not import a horizon profile: %s", err)
                errors[_PROFILE] = "invalid_profile"
            else:
                if step == "reconfigure":
                    return self.async_update_reload_and_abort(
                        self._get_reconfigure_entry(), data=data
                    )
                return self.async_create_entry(title="Terrain Sun", data=data)
        return self.async_show_form(
            step_id=step, data_schema=_UPLOAD_FORM, errors=errors
        )
