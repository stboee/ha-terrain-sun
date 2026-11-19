"""Home Assistant integration for the local terrain horizon."""

from __future__ import annotations

import asyncio
import logging
from collections import OrderedDict
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import probatio as vol
from homeassistant.components import lovelace, websocket_api
from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.loader import async_get_integration

from .engine import Horizon, SolarModel, next_boundary

DOMAIN = "terrain_sun"
PLATFORMS = (Platform.BINARY_SENSOR, Platform.SENSOR)
RESOURCE = "/terrain_sun/terrain-sun.js"
_LOGGER = logging.getLogger(__name__)


class TerrainRuntime(DataUpdateCoordinator[dict]):
    """Cache chart data and update the current conditions on the server."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, model: SolarModel):
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            config_entry=entry,
            update_interval=timedelta(minutes=1),
        )
        self.model = model
        self._days: OrderedDict[date, dict] = OrderedDict()
        self._years: OrderedDict[int, dict] = OrderedDict()
        self._day_lock = asyncio.Lock()
        self._year_lock = asyncio.Lock()

    async def _async_day(self, today: date) -> dict:
        async with self._day_lock:
            if today not in self._days:
                day = await self.hass.async_add_executor_job(self.model.day, today)
                path = await self.hass.async_add_executor_job(self.model.path, day)
                self._days[today] = {**day, "path": path}
                if len(self._days) > 12:
                    self._days.popitem(last=False)
            self._days.move_to_end(today)
            return self._days[today]

    def _calculate_year(self, year: int) -> dict:
        current = date(year, 1, 1)
        stop = date(year + 1, 1, 1)
        days = []
        while current < stop:
            days.append(self.model.day(current, details=False))
            current += timedelta(days=1)
        return {
            "year": year,
            "zone": self.model.zone.key,
            "days": days,
            "solstices": self.model.solstices(year),
        }

    async def async_year(self, year: int) -> dict:
        async with self._year_lock:
            if year not in self._years:
                self._years[year] = await self.hass.async_add_executor_job(
                    self._calculate_year, year
                )
                if len(self._years) > 3:
                    self._years.popitem(last=False)
            self._years.move_to_end(year)
            return self._years[year]

    async def _async_update_data(self) -> dict:
        return await self.async_current()

    async def async_current(self) -> dict:
        now = datetime.now(UTC)
        today = now.astimezone(self.model.zone).date()
        yesterday, day, tomorrow = await asyncio.gather(
            self._async_day(today - timedelta(days=1)),
            self._async_day(today),
            self._async_day(today + timedelta(days=1)),
        )
        stamp = now.timestamp()
        pos = self.model.position(stamp)
        terrain = self.model.horizon.at(pos.azimuth)
        return {
            "time": int(stamp),
            "zone": self.model.zone.key,
            "day": day,
            "azimuth": pos.azimuth,
            "elevation": pos.elevation,
            "upper_limb": pos.upper_limb,
            "terrain": terrain,
            "direct": pos.upper_limb >= terrain,
            "next": next_boundary(day, tomorrow, stamp),
            "yesterday_delta": day["totals"]["direct"] - yesterday["totals"]["direct"],
            "tomorrow_delta": tomorrow["totals"]["direct"] - day["totals"]["direct"],
        }


type TerrainConfigEntry = ConfigEntry[TerrainRuntime]


@websocket_api.websocket_command(
    {
        vol.Required("type"): "terrain_sun/data",
        vol.Required("view"): vol.In(("now", "horizon", "day", "year")),
        vol.Optional("date"): str,
        vol.Optional("year"): int,
    }
)
@websocket_api.async_response
async def _async_get_data(hass, connection, message):
    entries = hass.data[DOMAIN]["entries"]
    if not entries:
        connection.send_error(
            message["id"], "not_configured", "Set up Terrain Sun first"
        )
        return
    runtime = next(iter(entries.values()))
    today = datetime.now(runtime.model.zone).date()
    view = message["view"]
    try:
        if view == "year":
            year = message.get("year", today.year)
            if abs(year - today.year) > 5:
                raise ValueError("Year is outside the allowed range")
            result = await runtime.async_year(year)
        elif view == "day":
            day = date.fromisoformat(message.get("date", today.isoformat()))
            if abs(day.year - today.year) > 5:
                raise ValueError("Date is outside the allowed range")
            result = await runtime._async_day(day)
        else:
            result = await runtime.async_current()
            if view == "horizon":
                profile = runtime.model.horizon
                result["profile"] = [
                    [0, profile.at(0)],
                    *zip(profile.bearings, profile.elevations),
                    [360, profile.at(0)],
                ]
    except ValueError as err:
        connection.send_error(message["id"], "invalid_request", str(err))
        return
    connection.send_result(message["id"], result)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Serve the versioned card module and register the chart API."""
    hass.data[DOMAIN] = {"entries": {}}
    cards = Path(__file__).parent / "frontend" / "terrain-sun.js"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(RESOURCE, str(cards), False)]
    )
    websocket_api.async_register_command(hass, _async_get_data)
    return True


async def _async_register_resource(hass: HomeAssistant, version: str) -> None:
    """Register once, updating only our own resource when the version changes."""
    resources = hass.data[lovelace.LOVELACE_DATA].resources
    url = f"{RESOURCE}?v={version}"
    if not isinstance(resources, ResourceStorageCollection):
        # YAML resources are read-only. Use the frontend's module hook unless
        # the user already listed our module in configuration.yaml.
        configured_module = any(
            _is_card_resource(item) and item["type"] == "module"
            for item in resources.async_items()
        )
        if not configured_module and "extra_module_url" not in hass.data[DOMAIN]:
            add_extra_js_url(hass, url)
            hass.data[DOMAIN]["extra_module_url"] = url
        return
    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True
    for item in resources.async_items():
        if _is_card_resource(item):
            if item["url"] != url or item["type"] != "module":
                await resources.async_update_item(
                    item["id"], {"url": url, "res_type": "module"}
                )
            return
    await resources.async_create_item({"url": url, "res_type": "module"})


def _is_card_resource(item: dict) -> bool:
    return item["url"].partition("?")[0] == RESOURCE


async def async_setup_entry(hass: HomeAssistant, entry: TerrainConfigEntry) -> bool:
    """Set up entities and the shared calculation service."""
    profile = Horizon(tuple(entry.data["bearings"]), tuple(entry.data["elevations"]))
    lat, lon = entry.data["coordinates"] or (
        hass.config.latitude,
        hass.config.longitude,
    )
    runtime = TerrainRuntime(
        hass, entry, SolarModel(lat, lon, profile, ZoneInfo(hass.config.time_zone))
    )
    await runtime.async_config_entry_first_refresh()
    integration = await async_get_integration(hass, DOMAIN)
    await _async_register_resource(hass, str(integration.version))
    entry.runtime_data = runtime
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    hass.data[DOMAIN]["entries"][entry.entry_id] = runtime
    return True


async def async_unload_entry(hass: HomeAssistant, entry: TerrainConfigEntry) -> bool:
    """Unload entities without disturbing resources during a config reload."""
    if not await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        return False
    hass.data[DOMAIN]["entries"].pop(entry.entry_id, None)
    return True


async def async_remove_entry(hass: HomeAssistant, entry: TerrainConfigEntry) -> None:
    """Clean up only our dashboard resource when the integration is removed."""
    if any(
        other.entry_id != entry.entry_id
        for other in hass.config_entries.async_entries(DOMAIN)
    ):
        return
    if url := hass.data[DOMAIN].pop("extra_module_url", None):
        remove_extra_js_url(hass, url)
    resources = hass.data[lovelace.LOVELACE_DATA].resources
    if not isinstance(resources, ResourceStorageCollection):
        return
    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True
    for item in resources.async_items():
        if _is_card_resource(item):
            await resources.async_delete_item(item["id"])
