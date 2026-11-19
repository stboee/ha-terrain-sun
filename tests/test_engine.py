"""Regression tests for the solar model and local-day partition."""

import unittest
from datetime import date, datetime
from zoneinfo import ZoneInfo

from custom_components.terrain_sun.engine import (
    Horizon,
    SolarModel,
    next_boundary,
    next_matching_day,
    parse_horizon,
)

OSLO = ZoneInfo("Europe/Oslo")
FLAT = Horizon((0, 90, 180, 270), (0, 0, 0, 0))


class SolarTest(unittest.TestCase):
    def test_matching_day_uses_first_crossing_after_solstice(self):
        reference = {"date": "2026-11-19", "totals": {"direct": 500}}
        days = [
            {"date": day, "totals": {"direct": seconds}}
            for day, seconds in (
                ("2026-11-20", 500),
                ("2026-12-21", 100),
                ("2027-01-21", 470),
                ("2027-01-22", 510),
                ("2027-01-23", 500),
            )
        ]
        turns = ("2026-12-21", "2027-06-21")
        self.assertEqual(next_matching_day(days, reference, turns), days[3])

    def test_matching_day_handles_no_sun_and_near_extremum(self):
        reference = {"date": "2026-12-20", "totals": {"direct": 0}}
        solstice = {"date": "2026-12-21", "totals": {"direct": 0}}
        first_sun = {"date": "2027-01-02", "totals": {"direct": 125}}
        turns = ("2026-12-21", "2027-06-21")
        self.assertEqual(
            next_matching_day([solstice, first_sun], reference, turns), first_sun
        )
        self.assertIsNone(next_matching_day([solstice], reference, turns))

        reference["totals"]["direct"] = 110
        solstice["totals"]["direct"] = 112
        self.assertEqual(
            next_matching_day([solstice, first_sun], reference, turns), first_sun
        )
        self.assertIsNone(next_matching_day([solstice], reference, turns))

    def test_wrap_and_coordinates(self):
        horizon, coordinates = parse_horizon(
            "# 33.1°S, 18.4°E\n350 3\n170 7\n10 5\n260 0\n90 5"
        )
        self.assertEqual(coordinates, (-33.1, 18.4))
        self.assertAlmostEqual(horizon.at(0), 4)
        self.assertAlmostEqual(horizon.at(360), 4)
        self.assertAlmostEqual(horizon.at(-5), 3.5)

    def test_invalid_profiles(self):
        for raw in ("45 4\n60 2", "0 2\n90 3\n180 91\n270 2", "0 1\n360 2"):
            with self.subTest(raw=raw), self.assertRaises(ValueError):
                parse_horizon(raw)

    def test_standard_sunrise_and_sunset_for_lillehammer(self):
        model = SolarModel(61.115, 10.466, FLAT, OSLO)
        result = model.day(date(2026, 11, 19))
        phases = [band for band in result["bands"] if band[2] == "daylight"]
        rise = datetime.fromtimestamp(phases[0][0], OSLO)
        setting = datetime.fromtimestamp(phases[-1][1], OSLO)
        self.assertLess(abs((rise.hour * 60 + rise.minute) - (8 * 60 + 33)), 3)
        self.assertLess(abs((setting.hour * 60 + setting.minute) - (15 * 60 + 32)), 3)

    def test_ridge_splits_direct_sun(self):
        horizon = Horizon(
            (0, 130, 155, 175, 185, 205, 230, 315), (1, 1, 1, 60, 60, 1, 1, 1)
        )
        model = SolarModel(61.2, 10.4, horizon, OSLO)
        day = model.day(date(2026, 6, 21))
        periods = day["direct"]
        self.assertEqual(len(periods), 2)
        self.assertLess(periods[0][1], periods[1][0])
        self.assertEqual(
            day["totals"]["direct"], sum(end - start for start, end in periods)
        )
        self.assertEqual(
            day["totals"]["daylight"],
            day["totals"]["direct"] + day["totals"]["terrain_shade"],
        )
        self.assertEqual(
            next_boundary(day, model.day(date(2026, 6, 22)), periods[0][0]),
            periods[0][1],
        )
        self.assertTrue(
            {value for pair in periods for value in pair}.issubset(
                point[0] for point in model.path(day)
            )
        )

    def test_never_clears_terrain(self):
        model = SolarModel(61.2, 10.4, Horizon(FLAT.bearings, (80,) * 4), OSLO)
        day = model.day(date(2026, 12, 21))
        self.assertEqual(day["direct"], [])
        self.assertEqual(day["totals"]["terrain_shade"], day["totals"]["daylight"])
        self.assertIsNone(
            next_boundary(day, model.day(date(2026, 12, 22)), day["start"])
        )

    def test_dst_duration_and_clock_bands(self):
        model = SolarModel(61.2, 10.4, FLAT, OSLO)
        for day, hours in ((date(2026, 3, 29), 23), (date(2026, 10, 25), 25)):
            with self.subTest(day=day):
                data = model.day(day)
                self.assertEqual(data["end"] - data["start"], hours * 3600)
                self.assertEqual(sum(b[1] - b[0] for b in data["bands"]), hours * 3600)
                self.assertEqual(data["bands"][0][4], 0)
                self.assertEqual(data["bands"][-1][5], 86400)
                self.assertTrue(
                    all(a[1] == b[0] for a, b in zip(data["bands"], data["bands"][1:]))
                )


if __name__ == "__main__":
    unittest.main()
