import React, { useState } from 'react';
import { Terminal, FileSpreadsheet, Bot, Sparkles, Code2, Play, Check } from 'lucide-react';

const PYTHON_FILES: Record<string, { desc: string; role: string; codeSnippet: string }> = {
  'forecast.py': {
    desc: 'Reads historical CSV data, computes EWMA short-term load projections, assesses overload risk, and writes forecast.json.',
    role: 'Short-Term Load Forecasting Engine',
    codeSnippet: `#!/usr/bin/env python3
import json, csv, os

def forecast_zone_load(history, capacity_mw, alpha=0.65):
    loads = [h["load_mw"] for h in history]
    l_t = loads[-1]
    sma_3 = sum(loads[-3:]) / 3.0
    trend_slope = (l_t - loads[-3]) / 2.0

    # Short-Term Projected Load
    projected = (alpha * l_t) + ((1.0 - alpha) * sma_3) + trend_slope
    forecast_pct = (projected / capacity_mw) * 100.0

    risk_level = "CRITICAL_OVERLOAD" if forecast_pct >= 90.0 else \\
                 "OVERLOAD_WARNING" if forecast_pct >= 80.0 else "NORMAL"

    return {
        "forecasted_load_mw": round(projected, 2),
        "forecasted_load_percentage": round(forecast_pct, 2),
        "risk_level": risk_level
    }`
  },
  'chatbot.py': {
    desc: 'Offline rule- and intent-matching assistant answering operator questions using forecast.json and simulation state.',
    role: 'Smart Grid Assistant Chatbot Engine',
    codeSnippet: `#!/usr/bin/env python3
import json, re

class SmartGridChatbot:
    def __init__(self, forecast_path="data/forecast.json"):
        with open(forecast_path) as f:
            self.data = json.load(f)

    def answer_question(self, query):
        q = query.lower()
        if "overloaded" in q:
            crit = [z for z in self.data["zones"].values() if z["risk_level"] == "CRITICAL_OVERLOAD"]
            return f"CRITICAL OVERLOAD: {', '.join([z['zone_name'] for z in crit])}"
        elif "zone a" in q:
            zA = self.data["zones"]["A"]
            return f"Zone A current: {zA['current_load_mw']} MW ({zA['current_load_percentage']}%)"
        # Offline pattern matching for all grid questions
        return "I can answer questions regarding load, forecasts, and balancing decisions."`
  },
  'data_processor.py': {
    desc: 'Parses CSV historical load records, groups observations by zone, and calculates statistics (peak, mean, variance).',
    role: 'Historical Data Ingestion & Sanitization',
    codeSnippet: `#!/usr/bin/env python3
import csv, math

def process_all_zones(csv_filepath):
    records = []
    with open(csv_filepath, mode='r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append({
                "timestamp": row["Timestamp"],
                "zone_id": row["ZoneId"],
                "load_mw": float(row["LoadMW"])
            })
    return records`
  }
};

export const PythonExplorer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>('forecast.py');
  const file = PYTHON_FILES[activeFile];

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Terminal className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Python : Short-Term Forecasting & Assistant Chatbot
              </h2>
              <p className="text-xs text-slate-400">
                Data Processing, Explainable EWMA Time-Series Model, and Pattern-Matching Assistant
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 100% Offline Python Execution
          </span>
        </div>
      </div>

      {/* Mathematical Formula Explanation Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 font-mono">
          Mathematical Formulation : Explainable Short-Term Load Forecast
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
            <div className="text-slate-400 text-[10px] mb-1">1. Moving Average:</div>
            <div className="text-emerald-400 font-bold">SMA₃ = (L_t + L_(t-1) + L_(t-2)) / 3</div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">Smoothes out sudden high-frequency consumer noise.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
            <div className="text-slate-400 text-[10px] mb-1">2. Trend Slope (Delta):</div>
            <div className="text-amber-400 font-bold">Δ_trend = (L_t - L_(t-2)) / 2</div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">Captures velocity of peak-hour evening surge.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
            <div className="text-slate-400 text-[10px] mb-1">3. Forecasted Load (MW):</div>
            <div className="text-cyan-400 font-bold">L̂_(t+1) = α·L_t + (1-α)·SMA₃ + Δ_trend</div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">Weighted interpolation with α = 0.65 weighting.</p>
          </div>
        </div>
      </div>

      {/* Python Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-1.5 lg:col-span-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold px-2 block mb-2">
            Python Modules
          </span>
          {Object.keys(PYTHON_FILES).map((fname) => (
            <button
              key={fname}
              onClick={() => setActiveFile(fname)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                activeFile === fname
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{fname}</span>
            </button>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:col-span-3 flex flex-col">
          <div className="pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white font-mono">{activeFile}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                {file.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{file.desc}</p>
          </div>

          <pre className="flex-1 overflow-x-auto p-3 bg-slate-950 rounded-lg border border-slate-850 font-mono text-xs text-slate-200 leading-relaxed max-h-[340px]">
            <code>{file.codeSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
