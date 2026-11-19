"""Solar geometry and visibility against a local horizon profile."""

from __future__ import annotations

import math
import re
from bisect import bisect_right
from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta
from itertools import pairwise
from zoneinfo import ZoneInfo

SUN_RADIUS = 0.26667
SUNRISE = -0.833
PHASE_LIMITS = (-18.0, -12.0, -6.0, SUNRISE)
PHASES = ("night", "astronomical", "nautical", "civil", "daylight")
GOLDEN_LIMITS = (-4.0, 6.0)
SAMPLE_SECONDS = 60
PEAKFINDER_COORDS = re.compile(
    r"(\d+(?:\.\d+)?)\s*°?\s*([NS])\s*,\s*(\d+(?:\.\d+)?)\s*°?\s*([EW])",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class Horizon:
    """A clockwise profile, with north at 0° and linear interpolation."""

    bearings: tuple[float, ...]
    elevations: tuple[float, ...]

    def at(self, bearing: float) -> float:
        """Interpolate at a bearing, including across north."""
        bearing %= 360
        index = bisect_right(self.bearings, bearing)
        left = self.bearings[index - 1]
        right = self.bearings[index % len(self.bearings)]
        before = self.elevations[index - 1]
        after = self.elevations[index % len(self.elevations)]
        return before + (after - before) * ((bearing - left) % 360) / (
            (right - left) % 360
        )


def parse_horizon(text: str) -> tuple[Horizon, tuple[float, float] | None]:
    """Read a Stellarium horizon export with optional PeakFinder coordinates."""
    points: dict[float, float] = {}
    coordinates = None
    for line_number, line in enumerate(text.splitlines(), 1):
        line = line.strip()
        if line.startswith("#"):
            if match := PEAKFINDER_COORDS.search(line):
                lat, north, lon, east = match.groups()
                coordinates = (
                    float(lat) * (-1 if north.upper() == "S" else 1),
                    float(lon) * (-1 if east.upper() == "W" else 1),
                )
                if abs(coordinates[0]) > 90 or abs(coordinates[1]) > 180:
                    raise ValueError("Coordinates outside their valid range")
        elif line:
            try:
                bearing, elevation = map(float, line.partition("#")[0].split())
            except ValueError as err:
                raise ValueError(f"Expected two angles on line {line_number}") from err
            if not (0 <= bearing <= 360 and -90 <= elevation <= 90):
                raise ValueError(f"Angle outside its valid range on line {line_number}")
            bearing %= 360
            if bearing in points and points[bearing] != elevation:
                raise ValueError(f"Conflicting elevations on line {line_number}")
            points[bearing] = elevation
    bearings = tuple(sorted(points))
    if len(bearings) < 3 or any(
        (right - left) % 360 >= 180
        for left, right in zip(bearings, (*bearings[1:], bearings[0]))
    ):
        raise ValueError("The profile must cover all compass directions")
    return Horizon(
        bearings, tuple(points[azimuth] for azimuth in bearings)
    ), coordinates


@dataclass(frozen=True)
class Position:
    """Azimuth clockwise from north, geometric elevation, and apparent upper limb."""

    azimuth: float
    elevation: float
    upper_limb: float


@dataclass(frozen=True)
class Interval:
    start: int
    end: int
    phase: str
    direct: bool


def _refraction(elevation: float) -> float:
    """Approximate standard atmospheric refraction in degrees (NOAA)."""
    if elevation > 85:
        return 0
    tangent = math.tan(math.radians(elevation))
    if elevation > 5:
        return (58.1 / tangent - 0.07 / tangent**3 + 0.000086 / tangent**5) / 3600
    if elevation > -0.575:
        return (
            1735
            + elevation
            * (-518.2 + elevation * (103.4 + elevation * (-12.79 + 0.711 * elevation)))
        ) / 3600
    return -20.772 / tangent / 3600


def _solar_elements(timestamp: float) -> tuple[float, float, float, float, float]:
    """Return the orbital elements used for solar position and solstices."""
    t = (timestamp / 86400 + 2440587.5 - 2451545.0) / 36525
    mean_longitude = math.radians((280.46646 + t * (36000.76983 + t * 0.0003032)) % 360)
    anomaly = math.radians(357.52911 + t * (35999.05029 - 0.0001537 * t))
    eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t)
    center = math.radians(
        math.sin(anomaly) * (1.914602 - t * (0.004817 + 0.000014 * t))
        + math.sin(2 * anomaly) * (0.019993 - 0.000101 * t)
        + math.sin(3 * anomaly) * 0.000289
    )
    omega = math.radians(125.04 - 1934.136 * t)
    longitude = (
        mean_longitude + center - math.radians(0.00569 + 0.00478 * math.sin(omega))
    )
    obliquity = math.radians(
        23
        + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60
        + 0.00256 * math.cos(omega)
    )
    return mean_longitude, anomaly, eccentricity, longitude, obliquity


class SolarModel:
    """NOAA/Meeus solar position and daily crossings in elapsed UTC seconds."""

    def __init__(
        self, latitude: float, longitude: float, horizon: Horizon, zone: ZoneInfo
    ):
        self.latitude = latitude
        self.longitude = longitude
        self.horizon = horizon
        self.zone = zone
        self._sin_latitude = math.sin(math.radians(latitude))
        self._cos_latitude = math.cos(math.radians(latitude))

    def position(self, timestamp: float) -> Position:
        """Calculate topocentric-style solar angles using the NOAA equations."""
        mean_longitude, anomaly, eccentricity, longitude, obliquity = _solar_elements(
            timestamp
        )
        declination = math.asin(math.sin(obliquity) * math.sin(longitude))
        y = math.tan(obliquity / 2) ** 2
        equation_of_time = 4 * math.degrees(
            y * math.sin(2 * mean_longitude)
            - 2 * eccentricity * math.sin(anomaly)
            + 4 * eccentricity * y * math.sin(anomaly) * math.cos(2 * mean_longitude)
            - 0.5 * y**2 * math.sin(4 * mean_longitude)
            - 1.25 * eccentricity**2 * math.sin(2 * anomaly)
        )
        hour_angle = math.radians(
            (timestamp / 60 + equation_of_time + 4 * self.longitude) % 1440 / 4 - 180
        )
        projection = self._sin_latitude * math.sin(
            declination
        ) + self._cos_latitude * math.cos(declination) * math.cos(hour_angle)
        elevation = math.degrees(math.asin(max(-1, min(1, projection))))
        azimuth = (
            math.degrees(
                math.atan2(
                    math.sin(hour_angle),
                    math.cos(hour_angle) * self._sin_latitude
                    - math.tan(declination) * self._cos_latitude,
                )
            )
            + 180
        ) % 360
        return Position(
            azimuth, elevation, elevation + _refraction(elevation) + SUN_RADIUS
        )

    def solstices(self, year: int) -> list[dict[str, str]]:
        """Find the 90° and 270° apparent ecliptic longitude crossings."""
        events = []
        for month, degrees in ((6, 90), (12, 270)):
            left = int(datetime(year, month, 18, tzinfo=UTC).timestamp())
            right = int(datetime(year, month, 24, tzinfo=UTC).timestamp())
            while right - left > 1:
                middle = (left + right) // 2
                longitude = math.degrees(_solar_elements(middle)[3]) % 360
                if longitude < degrees:
                    left = middle
                else:
                    right = middle
            events.append(
                {
                    "month": str(month),
                    "date": datetime.fromtimestamp(right, self.zone).date().isoformat(),
                }
            )
        return events

    def _values(self, position: Position) -> tuple[float, float]:
        return position.elevation, position.upper_limb - self.horizon.at(
            position.azimuth
        )

    def _crossing(
        self, left: int, right: int, axis: int, target: float, above: bool
    ) -> int:
        """Locate a bracketed threshold crossing to one second."""
        while right - left > 1:
            middle = (left + right) // 2
            if (self._values(self.position(middle))[axis] >= target) == above:
                left = middle
            else:
                right = middle
        return right

    def day(self, day: date, *, details: bool = True) -> dict:
        """Calculate daylight, twilight and all direct-sun intervals for a local day."""
        start = int(datetime.combine(day, time.min, self.zone).timestamp())
        end = int(
            datetime.combine(day + timedelta(days=1), time.min, self.zone).timestamp()
        )
        thresholds = (*PHASE_LIMITS, *GOLDEN_LIMITS) if details else PHASE_LIMITS
        boundaries = {start, end}
        left = start
        before = self._values(self.position(left))
        for right in (*range(start + SAMPLE_SECONDS, end, SAMPLE_SECONDS), end):
            after = self._values(self.position(right))
            for axis, levels in enumerate((thresholds, (0.0,))):
                lower, upper = sorted((before[axis], after[axis]))
                for target in levels:
                    if lower < target <= upper:
                        boundaries.add(
                            self._crossing(
                                left, right, axis, target, before[axis] >= target
                            )
                        )
            left, before = right, after
        boundaries = sorted(boundaries)
        intervals: list[Interval] = []
        golden: list[tuple[int, int]] = []
        for left, right in pairwise(boundaries):
            elevation, clearance = self._values(self.position((left + right) / 2))
            phase = PHASES[bisect_right(PHASE_LIMITS, elevation)]
            direct = clearance >= 0
            if details and GOLDEN_LIMITS[0] <= elevation < GOLDEN_LIMITS[1]:
                if golden and golden[-1][1] == left:
                    golden[-1] = (golden[-1][0], right)
                else:
                    golden.append((left, right))
            if intervals and (intervals[-1].phase, intervals[-1].direct) == (
                phase,
                direct,
            ):
                intervals[-1] = Interval(intervals[-1].start, right, phase, direct)
            else:
                intervals.append(Interval(left, right, phase, direct))

        totals = dict.fromkeys((*PHASES, "direct", "terrain_shade"), 0)
        direct_periods: list[tuple[int, int]] = []
        for item in intervals:
            seconds = item.end - item.start
            totals[item.phase] += seconds
            if item.direct:
                totals["direct"] += seconds
                if direct_periods and direct_periods[-1][1] == item.start:
                    direct_periods[-1] = (direct_periods[-1][0], item.end)
                else:
                    direct_periods.append((item.start, item.end))
            elif item.phase == "daylight":
                totals["terrain_shade"] += seconds
        bands = []
        for item in intervals:
            for begin, finish, clock_begin, clock_finish in self._clock_segments(
                item.start, item.end
            ):
                bands.append(
                    [begin, finish, item.phase, item.direct, clock_begin, clock_finish]
                )
        return {
            "date": day.isoformat(),
            "start": start,
            "end": end,
            "bands": bands,
            "direct": direct_periods,
            "golden": golden,
            "totals": totals,
        }

    def _clock_segments(self, start: int, end: int):
        """Split at offset changes so the year graph uses real wall-clock labels."""
        first = datetime.fromtimestamp(start, self.zone)
        last = datetime.fromtimestamp(end - 1, self.zone)
        if first.utcoffset() == last.utcoffset():
            wall_start = first.hour * 3600 + first.minute * 60 + first.second
            yield start, end, wall_start, wall_start + end - start
            return
        left, right = start, end - 1
        while right - left > 1:
            middle = (left + right) // 2
            if (
                datetime.fromtimestamp(middle, self.zone).utcoffset()
                == first.utcoffset()
            ):
                left = middle
            else:
                right = middle
        yield from self._clock_segments(start, right)
        yield from self._clock_segments(right, end)

    def path(self, day: dict) -> list[list]:
        """Get sun positions at five-minute intervals and at all terrain crossings."""
        start, end = day["start"], day["end"]
        stamps = {start, end, *range(start, end, 300)}
        for first, last in day["direct"]:
            stamps.update((first, last))
        result = []
        for stamp in sorted(stamps):
            pos = self.position(stamp)
            result.append([stamp, pos.azimuth, pos.upper_limb])
        return result


def next_boundary(day: dict, tomorrow: dict, timestamp: float) -> int | None:
    """Find the next direct-sun change through the end of tomorrow."""
    periods = list(day["direct"])
    for start, end in tomorrow["direct"]:
        if periods and periods[-1][1] == start:
            periods[-1] = (periods[-1][0], end)
        else:
            periods.append((start, end))
    return next(
        (
            tick
            for interval in periods
            for tick in interval
            if timestamp < tick < tomorrow["end"]
        ),
        None,
    )
