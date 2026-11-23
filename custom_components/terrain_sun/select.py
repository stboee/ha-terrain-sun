"""Select the default profile used by the dashboard cards."""

from homeassistant.components.select import SelectEntity
from homeassistant.const import EntityCategory
from homeassistant.core import callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from . import (
    DEFAULT_PROFILE,
    DOMAIN,
    TerrainConfigEntry,
    async_set_default_profile,
    default_profile_id,
    sorted_profiles,
)


async def async_setup_entry(
    hass, entry: TerrainConfigEntry, async_add_entities
) -> None:
    async_add_entities([DefaultProfileSelect(entry, hass.config.language)])


class DefaultProfileSelect(SelectEntity):
    """Set a display preference without rebinding any location's sensors."""

    _attr_translation_key = DEFAULT_PROFILE
    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, entry: TerrainConfigEntry, language: str):
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_{DEFAULT_PROFILE}"
        self.entity_id = f"select.{DOMAIN}_{DEFAULT_PROFILE}"
        self._names = {
            data["name"]: key
            for key, data in sorted_profiles(entry.data["profiles"], language)
        }
        self._attr_options = list(self._names)
        self._attr_current_option = entry.data["profiles"][default_profile_id(entry)][
            "name"
        ]
        self._attr_extra_state_attributes = {"terrain_sun_profiles": self._names}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, f"{DOMAIN}_{self.unique_id}", self._update_default
            )
        )
        self._update_default()

    @callback
    def _update_default(self) -> None:
        self._attr_current_option = self._entry.data["profiles"][
            default_profile_id(self._entry)
        ]["name"]
        self.async_write_ha_state()

    async def async_select_option(self, option: str) -> None:
        profile_id = self._names[option]
        if profile_id not in self._entry.data["profiles"]:
            raise ServiceValidationError("The Terrain Sun profile no longer exists")
        async_set_default_profile(self.hass, self._entry, profile_id)
