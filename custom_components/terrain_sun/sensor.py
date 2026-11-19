"""Entities for today's totals, the next boundary and the current Sun position."""

from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.const import UnitOfTime
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import TerrainConfigEntry


@dataclass(frozen=True, kw_only=True)
class TerrainDescription(SensorEntityDescription):
    value: Callable


SENSORS = (
    TerrainDescription(
        key="next_transition",
        translation_key="next_transition",
        device_class=SensorDeviceClass.TIMESTAMP,
        value=lambda data: (
            datetime.fromtimestamp(data["next"], UTC)
            if data["next"] is not None
            else None
        ),
    ),
    TerrainDescription(
        key="direct_duration",
        translation_key="direct_duration",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.MINUTES,
        value=lambda data: round(data["day"]["totals"]["direct"] / 60, 1),
    ),
    TerrainDescription(
        key="daylight_duration",
        translation_key="daylight_duration",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.MINUTES,
        value=lambda data: round(data["day"]["totals"]["daylight"] / 60, 1),
    ),
    TerrainDescription(
        key="solar_elevation",
        translation_key="solar_elevation",
        native_unit_of_measurement="°",
        value=lambda data: round(data["elevation"], 2),
    ),
    TerrainDescription(
        key="solar_azimuth",
        translation_key="solar_azimuth",
        native_unit_of_measurement="°",
        value=lambda data: round(data["azimuth"], 2),
    ),
    TerrainDescription(
        key="terrain_elevation",
        translation_key="terrain_elevation",
        native_unit_of_measurement="°",
        value=lambda data: round(data["terrain"], 2),
    ),
)


async def async_setup_entry(
    hass, entry: TerrainConfigEntry, async_add_entities
) -> None:
    async_add_entities(TerrainSensor(entry, description) for description in SENSORS)


class TerrainSensor(CoordinatorEntity, SensorEntity):
    """Expose a calculated value without recording chart arrays as attributes."""

    _attr_has_entity_name = True

    def __init__(self, entry: TerrainConfigEntry, description: TerrainDescription):
        super().__init__(entry.runtime_data)
        self.entity_description = description
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"

    @property
    def native_value(self):
        return self.entity_description.value(self.coordinator.data)
