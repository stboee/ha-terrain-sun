"""Regression tests for card loading with YAML-managed resources."""

from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import Mock, patch

from custom_components.terrain_sun import (
    DOMAIN,
    RESOURCE,
    _async_register_resource,
    async_remove_entry,
)
from homeassistant.components import lovelace
from homeassistant.components.lovelace.resources import ResourceYAMLCollection

VERSION = "2026.11.19.1"
MODULE_URL = f"{RESOURCE}?v={VERSION}"


class DashboardResourceTest(IsolatedAsyncioTestCase):
    def _hass(self, resources):
        hass = Mock()
        hass.data = {
            DOMAIN: {},
            lovelace.LOVELACE_DATA: SimpleNamespace(resources=resources),
        }
        hass.config_entries.async_entries.return_value = []
        return hass

    async def test_yaml_configuration_loads_the_module_once(self):
        resources = ResourceYAMLCollection([])
        hass = self._hass(resources)
        with patch("custom_components.terrain_sun.add_extra_js_url") as add:
            await _async_register_resource(hass, VERSION)
            await _async_register_resource(hass, VERSION)
        add.assert_called_once_with(hass, MODULE_URL)
        self.assertEqual(resources.async_items(), [])

        with patch("custom_components.terrain_sun.remove_extra_js_url") as remove:
            await async_remove_entry(hass, SimpleNamespace(entry_id="test"))
        remove.assert_called_once_with(hass, MODULE_URL)

    async def test_existing_yaml_module_is_reused(self):
        resources = ResourceYAMLCollection([{"url": RESOURCE, "type": "module"}])
        hass = self._hass(resources)
        with patch("custom_components.terrain_sun.add_extra_js_url") as add:
            await _async_register_resource(hass, VERSION)
        add.assert_not_called()
