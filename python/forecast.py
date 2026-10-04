#!/usr/bin/env python3
"""
Smart Grid Load Balancer - Short-Term Load Forecasting Module
Academic Concept: Python (Time-Series Short-Term Load Forecasting)

This module implements an explainable, college-level short-term load forecasting
algorithm combining Exponential Weighted Moving Average (EWMA) and Linear Trend
Extrapolation.

Mathematical Formulation:
-------------------------
1. Moving Average:
   SMA_3 = (L_{t} + L_{t-1} + L_{t-2}) / 3

2. Trend Delta:
   Trend_Delta = (L_{t} - L_{t-2}) / 2

3. Weighted Forecast (Horizon t+1):
   Forecast_{t+1} = alpha * L_{t} + (1 - alpha) * SMA_3 + Trend_Delta

4. Risk Thresholds:
   - >= 90%: CRITICAL_OVERLOAD (Immediate load transfer required)
   - >= 80%: OVERLOAD_WARNING  (Pre-emptive monitoring advised)
   - < 80%:  NORMAL            (Safe operating zone / potential recipient)
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Any

# Import local processor
try:
    from data_processor import process_all_zones
except ImportError:
    from python.data_processor import process_all_zones


def forecast_zone_load(zone_history: List[Dict[str, Any]], capacity_mw: float, alpha: float = 0.65) -> Dict[str, Any]:
    """
    Computes explainable short-term load forecast for a single zone.
    """
    loads = [h["load_mw"] for h in zone_history]
    if len(loads) < 3:
        # Fallback if insufficient historical data points
        current = loads[-1] if loads else 50.0
        projected = current * 1.05
    else:
        l_t = loads[-1]
        l_prev1 = loads[-2]
        l_prev2 = loads[-3]

        sma_3 = (l_t + l_prev1 + l_prev2) / 3.0
        trend_slope = (l_t - l_prev2) / 2.0

        # Projected load for next operating cycle (peak hour)
        projected = (alpha * l_t) + ((1.0 - alpha) * sma_3) + trend_slope

    projected = round(projected, 2)
    current_load = round(loads[-1], 2)
    current_pct = round((current_load / capacity_mw) * 100.0, 2)
    forecast_pct = round((projected / capacity_mw) * 100.0, 2)
    headroom = round(capacity_mw - projected, 2)

    # Classify risk level based on standard utility grid operating margins
    if forecast_pct >= 90.0:
        risk_level = "CRITICAL_OVERLOAD"
        action = f"URGENT: Shift at least {round(projected - (capacity_mw * 0.80), 1)} MW to an adjacent zone."
    elif forecast_pct >= 80.0:
        risk_level = "OVERLOAD_WARNING"
        action = "MONITOR: Zone approaching peak capacity limit; prepare transfer routes."
    else:
        risk_level = "NORMAL"
        action = f"AVAILABLE: Has {headroom} MW headroom; can receive transferred load."

    return {
        "current_load_mw": current_load,
        "current_load_percentage": current_pct,
        "forecasted_load_mw": projected,
        "forecasted_load_percentage": forecast_pct,
        "capacity_mw": capacity_mw,
        "headroom_mw": headroom,
        "risk_level": risk_level,
        "recommended_action": action,
    }


def generate_all_forecasts(csv_path: str, output_json_path: str = None) -> Dict[str, Any]:
    """
    Reads CSV historical load data, generates forecasts for all zones,
    and outputs the forecast report as JSON.
    """
    processed = process_all_zones(csv_path)
    grouped = processed["raw_grouped"]
    stats = processed["statistics"]

    forecast_results = {}
    overloaded_zones = []
    available_zones = []
    total_grid_current_mw = 0.0
    total_grid_forecast_mw = 0.0
    total_grid_capacity_mw = 0.0

    for zid, zinfo in grouped.items():
        capacity = zinfo["capacity_mw"]
        fc = forecast_zone_load(zinfo["history"], capacity)
        fc["zone_id"] = zid
        fc["zone_name"] = zinfo["zone_name"]
        fc["sector"] = zinfo["sector"]

        forecast_results[zid] = fc

        total_grid_current_mw += fc["current_load_mw"]
        total_grid_forecast_mw += fc["forecasted_load_mw"]
        total_grid_capacity_mw += capacity

        if fc["risk_level"] in ("CRITICAL_OVERLOAD", "OVERLOAD_WARNING"):
            overloaded_zones.append(zid)
        elif fc["risk_level"] == "NORMAL":
            available_zones.append(zid)

    report = {
        "generated_at": datetime.now().isoformat(),
        "algorithm": "EWMA_LinearTrend_Hybrid (alpha=0.65)",
        "summary": {
            "total_zones": len(forecast_results),
            "overloaded_count": len(overloaded_zones),
            "available_count": len(available_zones),
            "total_grid_capacity_mw": round(total_grid_capacity_mw, 2),
            "total_grid_current_mw": round(total_grid_current_mw, 2),
            "total_grid_forecast_mw": round(total_grid_forecast_mw, 2),
            "grid_utilization_current_pct": round((total_grid_current_mw / total_grid_capacity_mw) * 100.0, 2),
            "grid_utilization_forecast_pct": round((total_grid_forecast_mw / total_grid_capacity_mw) * 100.0, 2),
            "overloaded_zones": overloaded_zones,
            "available_zones": available_zones,
        },
        "zones": forecast_results,
    }

    if output_json_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_json_path)), exist_ok=True)
        with open(output_json_path, mode="w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

    return report


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_file = os.path.join(base_dir, "data", "load_history.csv")
    json_file = os.path.join(base_dir, "data", "forecast.json")

    print("=" * 72)
    print("  SMART GRID LOAD BALANCER - PYTHON SHORT-TERM LOAD FORECASTING")
    print("  Academic Concept: Python (Statistical Time-Series Modeling)")
    print("=" * 72)
    print(f"[*] Reading historical observations from: {csv_file}")

    report = generate_all_forecasts(csv_file, json_file)

    print(f"[*] Forecast generated successfully -> Saved to: {json_file}")
    print("\n{:<8} {:<24} {:<12} {:<12} {:<14} {:<18}".format(
        "Zone", "Name", "Capacity", "Current MW", "Forecast MW", "Risk Status"
    ))
    print("-" * 92)

    for zid, zdata in report["zones"].items():
        print("{:<8} {:<24} {:<12} {:<12} {:<14} {:<18}".format(
            zid,
            zdata["zone_name"][:22],
            f"{zdata['capacity_mw']} MW",
            f"{zdata['current_load_mw']} ({zdata['current_load_percentage']}%)",
            f"{zdata['forecasted_load_mw']} ({zdata['forecasted_load_percentage']}%)",
            zdata["risk_level"]
        ))

    print("-" * 92)
    print(f"Grid Total Capacity: {report['summary']['total_grid_capacity_mw']} MW")
    print(f"Grid Current Load:   {report['summary']['total_grid_current_mw']} MW ({report['summary']['grid_utilization_current_pct']}%)")
    print(f"Grid Forecast Load:  {report['summary']['total_grid_forecast_mw']} MW ({report['summary']['grid_utilization_forecast_pct']}%)")
    print(f"At-Risk Zones:       {', '.join(report['summary']['overloaded_zones'])}")
    print("=" * 72)


if __name__ == "__main__":
    main()
