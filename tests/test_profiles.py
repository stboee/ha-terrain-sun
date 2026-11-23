"""Regression coverage for existing settings and profile-bound entities."""

from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import Mock, patch

from homeassistant.const import Platform

from custom_components.terrain_sun import async_migrate_entry, default_profile_id
from custom_components.terrain_sun.binary_sensor import DirectSunSensor
from custom_components.terrain_sun.select import DefaultProfileSelect
from custom_components.terrain_sun.sensor import SENSORS, TerrainSensor


class ProfileTest(IsolatedAsyncioTestCase):
    async def test_migration_keeps_horizon_and_renames_old_registry_entries(self):
        data = {
            "coordinates": [61.1, 10.4],
            "bearings": [0, 120, 240],
            "elevations": [0, 2, 1],
        }
        entry = SimpleNamespace(entry_id="entry", version=1, data=data)
        hass = SimpleNamespace(
            config=SimpleNamespace(language="nb"), config_entries=Mock()
        )
        registry = Mock()
        registry.async_get_available_entity_id.return_value = (
            "binary_sensor.terrain_sun_hjemme_direct_sun"
        )
        old_sensor = SimpleNamespace(
            unique_id="entry_direct_sun",
            domain=Platform.BINARY_SENSOR,
            entity_id="binary_sensor.direkte_sol",
        )
        converted = SimpleNamespace(
            unique_id="entry_hjemme_direct_duration",
            domain=Platform.SENSOR,
            entity_id="sensor.terrain_sun_hjemme_direct_duration",
        )
        with (
            patch("custom_components.terrain_sun.er.async_get", return_value=registry),
            patch(
                "custom_components.terrain_sun.er.async_entries_for_config_entry",
                return_value=[old_sensor, converted],
            ),
        ):
            self.assertTrue(await async_migrate_entry(hass, entry))
        registry.async_update_entity.assert_called_once_with(
            "binary_sensor.direkte_sol",
            new_entity_id="binary_sensor.terrain_sun_hjemme_direct_sun",
            new_unique_id="entry_hjemme_direct_sun",
        )
        hass.config_entries.async_update_entry.assert_called_once_with(
            entry, version=2, data={"profiles": {"hjemme": {**data, "name": "Hjemme"}}}
        )

    async def test_preference_changes_keep_each_entity_bound_to_its_profile(self):
        home = SimpleNamespace(
            profile_id="hjemme", device_info={}, data={"direct": True}
        )
        cabin = SimpleNamespace(
            profile_id="hytta", device_info={}, data={"direct": False}
        )
        profiles = {"hjemme": {"name": "Hjemme"}, "hytta": {"name": "Hytta"}}
        entry = SimpleNamespace(
            entry_id="entry", data={"profiles": profiles}, options={}
        )
        picker = DefaultProfileSelect(entry)
        picker.hass = SimpleNamespace(config_entries=Mock())
        binary = DirectSunSensor(entry, home)
        numeric = TerrainSensor(entry, cabin, SENSORS[1])
        self.assertEqual(picker.current_option, "Hjemme")
        self.assertEqual(numeric.entity_id, "sensor.terrain_sun_hytta_direct_duration")
        with patch.object(picker, "async_write_ha_state"):
            await picker.async_select_option("Hytta")
        picker.hass.config_entries.async_update_entry.assert_called_once_with(
            entry, options={"default_profile": "hytta"}
        )
        self.assertEqual(picker.current_option, "Hytta")
        self.assertTrue(binary.is_on)
        self.assertIs(numeric.coordinator, cabin)
        self.assertEqual(
            default_profile_id(
                SimpleNamespace(data=entry.data, options={"default_profile": "removed"})
            ),
            "hjemme",
        )
