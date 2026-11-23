"""Direct sun conditions for Home Assistant automations."""

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import DOMAIN, TerrainConfigEntry, TerrainRuntime


async def async_setup_entry(
    hass, entry: TerrainConfigEntry, async_add_entities
) -> None:
    async_add_entities(DirectSunSensor(entry, runtime) for runtime in entry.runtime_data.values())


class DirectSunSensor(CoordinatorEntity, BinarySensorEntity):
    """Whether the apparent solar disk clears the profile right now."""

    _attr_has_entity_name = True
    _attr_translation_key = "direct_sun"
    _attr_icon = "mdi:white-balance-sunny"

    def __init__(self, entry: TerrainConfigEntry, runtime: TerrainRuntime):
        super().__init__(runtime)
        self._attr_unique_id = f"{entry.entry_id}_{runtime.profile_id}_direct_sun"
        self._attr_device_info = runtime.device_info
        self.entity_id = f"binary_sensor.{DOMAIN}_{runtime.profile_id}_direct_sun"

    @property
    def is_on(self) -> bool:
        return self.coordinator.data["direct"]
