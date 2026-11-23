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
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.loader import async_get_integration

from .engine import PHASE_LIMITS, Horizon, SolarModel, next_boundary, next_matching_day

DOMAIN = "terrain_sun"
PLATFORMS = (Platform.BINARY_SENSOR, Platform.SENSOR, Platform.SELECT)
RESOURCE = "/terrain_sun/terrain-sun.js"
DEFAULT_PROFILE = "default_profile"
_LOGGER = logging.getLogger(__name__)


class TerrainRuntime(DataUpdateCoordinator[dict]):
    """Cache chart data and update the current conditions on the server."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, profile_id: str, profile: dict):
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_{profile_id}",
            config_entry=entry,
            update_interval=timedelta(minutes=1),
        )
        self.profile_id = profile_id
        self.profile_name = profile["name"]
        self.device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{entry.entry_id}_{profile_id}")},
            name=f"Terrain Sun – {self.profile_name}",
        )
        horizon = Horizon(tuple(profile["bearings"]), tuple(profile["elevations"]))
        lat, lon = profile["coordinates"] or (hass.config.latitude, hass.config.longitude)
        self.model = SolarModel(lat, lon, horizon, ZoneInfo(hass.config.time_zone))
        self._days: OrderedDict[date, dict] = OrderedDict()
        self._moon_paths: OrderedDict[int, list[list]] = OrderedDict()
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

    async def async_moon_path(self, day: dict) -> list[list]:
        """Cache lunar paths for the dates viewed in the horizon card."""
        start = day["start"]
        async with self._day_lock:
            if start not in self._moon_paths:
                self._moon_paths[start] = await self.hass.async_add_executor_job(
                    self.model.moon_path, start, day["end"]
                )
                if len(self._moon_paths) > 12:
                    self._moon_paths.popitem(last=False)
            self._moon_paths.move_to_end(start)
            return self._moon_paths[start]

    def _calculate_year(self, year: int) -> dict:
        current = date(year, 1, 1)
        stop = date(year + 1, 1, 1)
        days = []
        while current < stop:
            days.append(self.model.day(current, details=False))
            current += timedelta(days=1)
        seasons = self.model.season_events(year)
        return {
            "year": year,
            "zone": self.model.zone.key,
            "days": days,
            "seasons": seasons,
            "solstices": [
                {"month": str(month), "date": event["date"]}
                for month, event in zip((6, 12), seasons[1::2], strict=True)
            ],
            "totals": {
                key: sum(day["totals"][key] for day in days)
                for key in ("direct", "daylight", "terrain_shade")
            },
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

    async def async_matching_day(self, reference_date: date) -> dict | None:
        year = await self.async_year(reference_date.year)
        days = year["days"]
        reference = days[(reference_date - date(reference_date.year, 1, 1)).days]
        following_year = reference_date.year + 1
        upcoming_seasons = await self.hass.async_add_executor_job(
            self.model.season_events, following_year
        )
        solstices = year["solstices"] + upcoming_seasons[1::2]
        turn, following_turn, *_ = (
            event["date"] for event in solstices if event["date"] > reference["date"]
        )
        turns = turn, following_turn
        no_sun = reference["totals"]["direct"] == 0
        if not no_sun and date.fromisoformat(following_turn).year == following_year:
            upcoming = await self.async_year(following_year)
            days = days + upcoming["days"]
        match = next_matching_day(days, reference, turns)
        if match is None and no_sun:
            upcoming = await self.async_year(following_year)
            match = next_matching_day(days + upcoming["days"], reference, turns)
        if match is None:
            return None
        return {"date": match["date"], "duration": match["totals"]["direct"]}

    async def async_daily(self, selected: date) -> tuple[dict, dict]:
        """Get the selected day, its comparisons and tomorrow's transition data."""
        last_week, yesterday, day, tomorrow, next_week = await asyncio.gather(
            *(
                self._async_day(selected + timedelta(days=offset))
                for offset in (-7, -1, 0, 1, 7)
            )
        )
        direct_seconds = day["totals"]["direct"]
        return {
            "zone": self.model.zone.key,
            "day": day,
            "yesterday_delta": direct_seconds - yesterday["totals"]["direct"],
            "tomorrow_delta": tomorrow["totals"]["direct"] - direct_seconds,
            "last_week_delta": direct_seconds - last_week["totals"]["direct"],
            "next_week_delta": next_week["totals"]["direct"] - direct_seconds,
        }, tomorrow

    async def async_current(self, now: datetime | None = None) -> dict:
        now = now or datetime.now(UTC)
        today = now.astimezone(self.model.zone).date()
        daily, tomorrow = await self.async_daily(today)
        stamp = now.timestamp()
        pos = self.model.position(stamp)
        terrain = self.model.horizon.at(pos.azimuth)
        return {
            **daily,
            "time": int(stamp),
            "azimuth": pos.azimuth,
            "elevation": pos.elevation,
            "upper_limb": pos.upper_limb,
            "terrain": terrain,
            "direct": pos.upper_limb >= terrain,
            "next": next_boundary(daily["day"], tomorrow, stamp),
        }


type TerrainConfigEntry = ConfigEntry[dict[str, TerrainRuntime]]


def default_profile_id(entry: TerrainConfigEntry) -> str:
    profiles = entry.data["profiles"]
    selected = entry.options.get(DEFAULT_PROFILE)
    return selected if selected in profiles else next(iter(profiles))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "terrain_sun/data",
        vol.Required("view"): vol.In(("profiles", "now", "horizon", "day", "year", "similar_sun")),
        vol.Optional("profile_id"): str,
        vol.Optional("date"): str,
        vol.Optional("year"): int,
        vol.Optional("moon"): bool,
        vol.Optional("moon_path"): bool,
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
    entry = next(iter(entries.values()))
    default_id = default_profile_id(entry)
    view = message["view"]
    if view == "profiles":
        selector = er.async_get(hass).async_get_entity_id(
            Platform.SELECT, DOMAIN, f"{entry.entry_id}_{DEFAULT_PROFILE}"
        )
        connection.send_result(message["id"], {
            "default_profile": default_id,
            "selector": selector,
            "today": datetime.now(UTC).astimezone(ZoneInfo(hass.config.time_zone)).date().isoformat(),
            "profiles": [
                {"id": runtime.profile_id, "name": runtime.profile_name}
                for runtime in entry.runtime_data.values()
            ],
        })
        return
    runtime = entry.runtime_data.get(message.get("profile_id", default_id))
    if runtime is None:
        connection.send_error(message["id"], "profile_not_found", "Terrain Sun profile is unavailable")
        return
    now = datetime.now(UTC)
    today = now.astimezone(runtime.model.zone).date()
    try:
        if view == "year":
            year = message.get("year", today.year)
            if abs(year - today.year) > 5:
                raise ValueError("Year is outside the allowed range")
            annual = await runtime.async_year(year)
            next_seasons = await hass.async_add_executor_job(runtime.model.next_season_events, today)
            result = {**annual, "today": today.isoformat(), "next_seasons": next_seasons}
        else:
            day = date.fromisoformat(message.get("date", today.isoformat()))
            if abs(day.year - today.year) > 5:
                raise ValueError("Date is outside the allowed range")
            if view == "day":
                result = await runtime._async_day(day)
            elif view == "similar_sun":
                result = await runtime.async_matching_day(day)
            elif view == "now":
                if day == today:
                    result = await runtime.async_current(now)
                else:
                    result, _ = await runtime.async_daily(day)
                result["today"] = today.isoformat()
            else:
                result = (
                    await runtime.async_current(now)
                    if day == today
                    else {
                        "day": await runtime._async_day(day),
                        "zone": runtime.model.zone.key,
                    }
                )
                result["today"] = today.isoformat()
                result["phase_limits"] = PHASE_LIMITS
                if day == today and message.get("moon"):
                    result["moon"] = await hass.async_add_executor_job(
                        runtime.model.moon_position, now
                    )
                if message.get("moon_path"):
                    result["moon_path"] = await runtime.async_moon_path(result["day"])
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
    runtimes = {
        profile_id: TerrainRuntime(hass, entry, profile_id, profile)
        for profile_id, profile in entry.data["profiles"].items()
    }
    await asyncio.gather(*(runtime.async_config_entry_first_refresh() for runtime in runtimes.values()))
    integration = await async_get_integration(hass, DOMAIN)
    await _async_register_resource(hass, str(integration.version))
    entry.runtime_data = runtimes
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    hass.data[DOMAIN]["entries"][entry.entry_id] = entry
    return True


async def async_unload_entry(hass: HomeAssistant, entry: TerrainConfigEntry) -> bool:
    """Unload entities without disturbing resources during a config reload."""
    if not await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        return False
    hass.data[DOMAIN]["entries"].pop(entry.entry_id, None)
    return True


async def async_migrate_entry(hass: HomeAssistant, entry: TerrainConfigEntry) -> bool:
    """Keep the imported horizon and give its entities profile-specific IDs."""
    if entry.version != 1:
        return entry.version == 2
    norwegian = hass.config.language.split("-")[0] in ("nb", "nn", "no")
    profile_id, name = ("hjemme", "Hjemme") if norwegian else ("home", "Home")
    registry = er.async_get(hass)
    prefix = f"{entry.entry_id}_"
    for entity in er.async_entries_for_config_entry(registry, entry.entry_id):
        if not entity.unique_id.startswith(prefix):
            continue
        key = entity.unique_id.removeprefix(prefix)
        if key.startswith(f"{profile_id}_") or entity.domain not in (Platform.SENSOR, Platform.BINARY_SENSOR):
            continue
        new_id = registry.async_get_available_entity_id(
            entity.domain, f"{DOMAIN}_{profile_id}_{key}", current_entity_id=entity.entity_id
        )
        registry.async_update_entity(
            entity.entity_id, new_entity_id=new_id, new_unique_id=f"{prefix}{profile_id}_{key}"
        )
    hass.config_entries.async_update_entry(
        entry, data={"profiles": {profile_id: {**entry.data, "name": name}}}, version=2
    )
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
