"""Direct sun conditions for Home Assistant automations."""

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import TerrainConfigEntry


async def async_setup_entry(
    hass, entry: TerrainConfigEntry, async_add_entities
) -> None:
    async_add_entities([DirectSunSensor(entry)])


class DirectSunSensor(CoordinatorEntity, BinarySensorEntity):
    """Whether the apparent solar disk clears the profile right now."""

    _attr_has_entity_name = True
    _attr_translation_key = "direct_sun"
    _attr_icon = "mdi:white-balance-sunny"

    def __init__(self, entry: TerrainConfigEntry):
        super().__init__(entry.runtime_data)
        self._attr_unique_id = f"{entry.entry_id}_direct_sun"

    @property
    def is_on(self) -> bool:
        return self.coordinator.data["direct"]
