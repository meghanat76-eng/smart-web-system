#!/usr/bin/env python3
"""
Smart Grid Load Balancer - Data Processor Module
Academic Concept: Python (Data Cleaning, Aggregation, and Statistical Analysis)

This module reads the historical load data exported from Java (CSV format),
validates data integrity, and calculates essential statistical indicators:
- Peak (Maximum) Load (MW)
- Minimum Base Load (MW)
- Mean Load (MW)
- Standard Deviation & Variance
- Utilization / Load Factor (% of capacity)
"""

import csv
import math
import os
from typing import Dict, List, Any


def load_csv_data(filepath: str) -> List[Dict[str, Any]]:
    """Reads CSV file containing zone load history."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Historical load file not found: {filepath}")

    records = []
    with open(filepath, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append({
                "timestamp": row["Timestamp"],
                "zone_id": row["ZoneId"],
                "zone_name": row["ZoneName"],
                "sector": row.get("Sector", "Sector-1 (North)"),
                "capacity_mw": float(row["CapacityMW"]),
                "load_mw": float(row["LoadMW"]),
                "load_percentage": float(row["LoadPercentage"]),
                "substations": int(row.get("SubstationCount", 3)),
            })
    return records


def group_by_zone(records: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """Groups historical time-series observations by Zone ID."""
    zones_data: Dict[str, Dict[str, Any]] = {}

    for record in records:
        zid = record["zone_id"]
        if zid not in zones_data:
            zones_data[zid] = {
                "zone_id": zid,
                "zone_name": record["zone_name"],
                "sector": record["sector"],
                "capacity_mw": record["capacity_mw"],
                "substations": record["substations"],
                "history": [],
            }
        zones_data[zid]["history"].append({
            "timestamp": record["timestamp"],
            "load_mw": record["load_mw"],
            "percentage": record["load_percentage"],
        })

    # Sort each zone history by timestamp
    for zid in zones_data:
        zones_data[zid]["history"].sort(key=lambda x: x["timestamp"])

    return zones_data


def calculate_zone_statistics(zone_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Computes basic statistical metrics for a single zone's time-series."""
    loads = [h["load_mw"] for h in zone_dict["history"]]
    if not loads:
        return {}

    n = len(loads)
    mean_val = sum(loads) / n
    variance = sum((x - mean_val) ** 2 for x in loads) / (n if n > 1 else 1)
    std_dev = math.sqrt(variance)
    max_val = max(loads)
    min_val = min(loads)
    latest_val = loads[-1]
    capacity = zone_dict["capacity_mw"]

    return {
        "zone_id": zone_dict["zone_id"],
        "zone_name": zone_dict["zone_name"],
        "sector": zone_dict["sector"],
        "capacity_mw": capacity,
        "sample_count": n,
        "current_load_mw": latest_val,
        "current_utilization_pct": round((latest_val / capacity) * 100, 2),
        "mean_load_mw": round(mean_val, 2),
        "std_dev_mw": round(std_dev, 2),
        "peak_load_mw": max_val,
        "base_load_mw": min_val,
        "available_headroom_mw": round(capacity - latest_val, 2),
    }


def process_all_zones(filepath: str) -> Dict[str, Any]:
    """Top-level pipeline function to parse, group, and compute statistics."""
    records = load_csv_data(filepath)
    grouped = group_by_zone(records)
    stats = {}
    for zid, zdata in grouped.items():
        stats[zid] = calculate_zone_statistics(zdata)
    return {
        "raw_grouped": grouped,
        "statistics": stats,
    }


if __name__ == "__main__":
    import json
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "load_history.csv")
    results = process_all_zones(data_path)
    print("=== Processed Zone Statistics ===")
    print(json.dumps(results["statistics"], indent=2))
