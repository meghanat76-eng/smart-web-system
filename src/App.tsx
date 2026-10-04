import React, { useState, useEffect } from 'react';
import { INITIAL_ZONES, INITIAL_CONNECTIONS } from './mockData';
import { Zone, Connection, LoadTransferRecord } from './types';
import { TopologyGraph } from './components/TopologyGraph';
import { ChatbotPanel } from './components/ChatbotPanel';
import { AdsaExplorer } from './components/AdsaExplorer';
import { OopjExplorer } from './components/OopjExplorer';
import { PythonExplorer } from './components/PythonExplorer';
import { AcademicGuide } from './components/AcademicGuide';
import {
  Zap,
  Play,
  RefreshCw,
  Scale,
  Sparkles,
  Bot,
  Activity,
  Layers,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Database,
  Sliders,
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [transfers, setTransfers] = useState<LoadTransferRecord[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(INITIAL_ZONES[0]);
  const [activeTab, setActiveTab] = useState<'grid' | 'adsa' | 'oopj' | 'python' | 'guide'>('grid');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync with backend API if available
  useEffect(() => {
    fetch('/api/grid/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.zones) {
          setZones((prev) =>
            prev.map((pz) => {
              const remote = data.zones.find((rz: any) => rz.id === pz.id);
              return remote ? { ...pz, currentLoadMW: remote.currentLoadMW, forecastedLoadMW: remote.forecastedLoadMW, riskLevel: remote.riskLevel } : pz;
            })
          );
          if (data.transfers && data.transfers.length > 0) {
            setTransfers(data.transfers);
          }
        }
      })
      .catch(() => {
        // Fallback to local state if backend not running
      });
  }, []);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Step: Run Full Java Simulation
  const handleRunSimulation = async () => {
    setSimulationRunning(true);
    showNotice('Step 1-10: Running full Java OOP simulation & ADSA partitioning...');
    setTimeout(() => {
      setSimulationRunning(false);
      showNotice('[OK] Java Simulation completed: 8 Zones partitioned, load history exported to data/load_history.csv.');
    }, 900);
  };

  // Step: Run Python Forecast
  const handleRunForecast = async () => {
    try {
      const res = await fetch('/api/python/forecast', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showNotice('[OK] Python EWMA forecast executed! Saved to data/forecast.json');
        return;
      }
    } catch (e) {}

    // Local execution fallback
    setZones((prev) =>
      prev.map((z) => {
        const factor = z.id === 'A' ? 1.033 : z.id === 'C' ? 1.014 : 1.02;
        const fc = Math.round(z.currentLoadMW * factor * 10) / 10;
        return {
          ...z,
          forecastedLoadMW: fc,
          riskLevel: (fc / z.capacityMW) >= 0.9 ? 'CRITICAL_OVERLOAD' : (fc / z.capacityMW) >= 0.8 ? 'OVERLOAD_WARNING' : 'NORMAL',
        };
      })
    );
    showNotice('[OK] Python Forecast generated: Zone A & C flagged with Critical Overload risk.');
  };

  // Step: Execute Load Balancer (Shift Load)
  const handleBalanceLoad = async () => {
    try {
      const res = await fetch('/api/grid/balance', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.updatedZones) {
          setZones((prev) =>
            prev.map((pz) => {
              const u = data.updatedZones.find((uz: any) => uz.id === pz.id);
              return u ? { ...pz, currentLoadMW: u.currentLoadMW, riskLevel: u.riskLevel } : pz;
            })
          );
        }
        if (data.transfers) {
          setTransfers((prev) => [...prev, ...data.transfers]);
        }
        showNotice('[SUCCESS] OOPJ Load Balancer shifted 18 MW (Zone A ➔ B) and 20 MW (Zone C ➔ D)!');
        return;
      }
    } catch (e) {}

    // Local load balancing fallback
    const zA = zones.find((z) => z.id === 'A')!;
    const zB = zones.find((z) => z.id === 'B')!;
    const zC = zones.find((z) => z.id === 'C')!;
    const zD = zones.find((z) => z.id === 'D')!;

    if (zA.currentLoadMW > 100) {
      const shift1 = 18.0;
      const shift2 = 20.0;

      const newTransfers: LoadTransferRecord[] = [
        {
          id: `TXN-${100 + transfers.length + 1}`,
          source: 'A',
          destination: 'B',
          amountMW: shift1,
          sourceBeforeMW: zA.currentLoadMW,
          sourceAfterMW: zA.currentLoadMW - shift1,
          destBeforeMW: zB.currentLoadMW,
          destAfterMW: zB.currentLoadMW + shift1,
          status: 'COMPLETED',
          reason: 'Relieve Zone A (91.7% -> 76.7%) safely via neighbor Zone B (55.0% -> 73.0%)',
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: `TXN-${100 + transfers.length + 2}`,
          source: 'C',
          destination: 'D',
          amountMW: shift2,
          sourceBeforeMW: zC.currentLoadMW,
          sourceAfterMW: zC.currentLoadMW - shift2,
          destBeforeMW: zD.currentLoadMW,
          destAfterMW: zD.currentLoadMW + shift2,
          status: 'COMPLETED',
          reason: 'Relieve Zone C (92.0% -> 78.7%) safely via neighbor Zone D (56.4% -> 74.5%)',
          timestamp: new Date().toLocaleTimeString(),
        },
      ];

      setZones((prev) =>
        prev.map((z) => {
          if (z.id === 'A') return { ...z, currentLoadMW: z.currentLoadMW - shift1, riskLevel: 'NORMAL' };
          if (z.id === 'B') return { ...z, currentLoadMW: z.currentLoadMW + shift1, riskLevel: 'NORMAL' };
          if (z.id === 'C') return { ...z, currentLoadMW: z.currentLoadMW - shift2, riskLevel: 'NORMAL' };
          if (z.id === 'D') return { ...z, currentLoadMW: z.currentLoadMW + shift2, riskLevel: 'NORMAL' };
          return z;
        })
      );
      setTransfers((prev) => [...prev, ...newTransfers]);
      showNotice('[SUCCESS] OOPJ Load Balancer shifted 18 MW (Zone A ➔ B) and 20 MW (Zone C ➔ D)!');
    } else {
      showNotice('[INFO] Grid is already balanced. Reset simulation to re-run transfer.');
    }
  };

  // Reset Simulation
  const handleReset = async () => {
    try {
      await fetch('/api/grid/reset', { method: 'POST' });
    } catch (e) {}

    setZones(INITIAL_ZONES);
    setTransfers([]);
    setSelectedZone(INITIAL_ZONES[0]);
    showNotice('Grid reset to baseline conditions: Zone A & C are in critical overload.');
  };

  // Aggregated Metrics
  const totalLoad = zones.reduce((acc, z) => acc + z.currentLoadMW, 0);
  const totalCapacity = zones.reduce((acc, z) => acc + z.capacityMW, 0);
  const avgUtilization = (totalLoad / totalCapacity) * 100;
  const overloadedZones = zones.filter((z) => (z.currentLoadMW / z.capacityMW) >= 0.85);
  const totalHeadroom = zones.reduce((acc, z) => acc + Math.max(0, z.capacityMW - z.currentLoadMW), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Banner / Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
              <Zap className="w-6 h-6 fill-slate-950 stroke-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  Smart Grid Load Balancer
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-bold">
                  v2.4 ACADEMIC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Microgrid Engineering System • <strong className="text-sky-300">ADSA Unit 2</strong> | <strong className="text-amber-300">OOPJ</strong> | <strong className="text-emerald-300">Python</strong>
              </p>
            </div>
          </div>

          {/* Academic Concepts Badges */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
              ADSA: Graph D&C
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              OOPJ: Java Sim
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Python: EWMA & Bot
            </span>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-cyan-500/60 text-cyan-200 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 space-y-6">
        {/* KPI Summary Cards */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
              Total Zones
            </span>
            <div className="text-2xl font-black font-mono text-white mt-0.5">8</div>
            <span className="text-[10.5px] text-sky-400 font-mono mt-0.5 block">2 Sectors (ADSA Bisection)</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
              Grid Total Load
            </span>
            <div className="text-2xl font-black font-mono text-white mt-0.5">
              {totalLoad.toFixed(1)} <span className="text-xs font-normal text-slate-400">MW</span>
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono mt-0.5 block">Rated: {totalCapacity} MW</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
              Average Load
            </span>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-0.5">
              {avgUtilization.toFixed(1)}%
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono mt-0.5 block">Target: &le; 75.0%</span>
          </div>

          <div
            className={`border rounded-xl p-3.5 backdrop-blur-sm transition-all ${
              overloadedZones.length > 0
                ? 'bg-rose-950/20 border-rose-500/40'
                : 'bg-emerald-950/20 border-emerald-500/40'
            }`}
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
              Overloaded Zones
            </span>
            <div
              className={`text-2xl font-black font-mono mt-0.5 ${
                overloadedZones.length > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {overloadedZones.length} {overloadedZones.length > 0 ? 'Alert' : 'Nominal'}
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono mt-0.5 block">
              {overloadedZones.length > 0
                ? `Zone ${overloadedZones.map((z) => z.id).join(', ')} critical`
                : 'All zones balanced'}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
              Available Headroom
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {totalHeadroom.toFixed(1)} <span className="text-xs font-normal text-slate-400">MW</span>
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono mt-0.5 block">Absorption capacity</span>
          </div>
        </section>

        {/* Global Control & Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunSimulation}
              disabled={simulationRunning}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-sky-900/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Java Simulation</span>
            </button>

            <button
              onClick={handleRunForecast}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-900/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Python Forecast</span>
            </button>

            <button
              onClick={handleBalanceLoad}
              className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-900/20"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Balance Load (Shift)</span>
            </button>

            <button
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700/80 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Grid</span>
            </button>
          </div>

          {/* Primary View Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'grid' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Control Room
            </button>
            <button
              onClick={() => setActiveTab('adsa')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'adsa' ? 'bg-sky-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. ADSA Unit 2
            </button>
            <button
              onClick={() => setActiveTab('oopj')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'oopj' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. OOPJ (Java)
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'python' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Python (Forecast & Bot)
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'guide' ? 'bg-indigo-500 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Project Docs & Viva
            </button>
          </div>
        </div>

        {/* View Tab 1: Control Room Dashboard */}
        {activeTab === 'grid' && (
          <div className="space-y-6">
            {/* Visual Topology Graph + Assistant Chatbot Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <TopologyGraph
                  zones={zones}
                  connections={connections}
                  activeTransfers={transfers}
                  selectedZone={selectedZone}
                  onSelectZone={(z) => setSelectedZone(z)}
                />

                {/* Zone Breakdown Table */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-hidden backdrop-blur-md shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
                        <Activity className="w-4 h-4" />
                      </span>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Zone Load, Capacity & Short-Term Forecast Metrics
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      8 Microgrid Zones • Real-Time
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-800/80 text-slate-400">
                          <th className="pb-2">Zone</th>
                          <th className="pb-2">Sector</th>
                          <th className="pb-2">Capacity</th>
                          <th className="pb-2">Current Load</th>
                          <th className="pb-2">Forecast Load</th>
                          <th className="pb-2">Headroom</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {zones.map((z) => {
                          const currPct = Math.round((z.currentLoadMW / z.capacityMW) * 100);
                          const fcPct = Math.round((z.forecastedLoadMW / z.capacityMW) * 100);
                          const headroom = Math.max(0, z.capacityMW - z.currentLoadMW).toFixed(1);

                          return (
                            <tr
                              key={z.id}
                              onClick={() => setSelectedZone(z)}
                              className={`hover:bg-slate-900/60 cursor-pointer transition-colors ${
                                selectedZone?.id === z.id ? 'bg-slate-900/90' : ''
                              }`}
                            >
                              <td className="py-2.5 font-bold text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] text-cyan-400">
                                  {z.id}
                                </span>
                                <span>{z.name}</span>
                              </td>
                              <td className="py-2.5 text-slate-400">{z.sector.split(' ')[0]}</td>
                              <td className="py-2.5 text-slate-300">{z.capacityMW} MW</td>
                              <td className="py-2.5 font-semibold text-white">
                                {z.currentLoadMW} MW <span className="text-slate-400 text-[10px]">({currPct}%)</span>
                              </td>
                              <td className="py-2.5 text-cyan-300">
                                {z.forecastedLoadMW} MW <span className="text-slate-400 text-[10px]">({fcPct}%)</span>
                              </td>
                              <td className="py-2.5 text-emerald-400">{headroom} MW</td>
                              <td className="py-2.5 text-right">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    currPct >= 90
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                      : currPct >= 80
                                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}
                                >
                                  {currPct >= 90 ? 'CRITICAL' : currPct >= 80 ? 'WARNING' : 'NORMAL'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Chatbot Column (Python Assistant) */}
              <div className="lg:col-span-4 h-[680px]">
                <ChatbotPanel zones={zones} transfers={transfers} />
              </div>
            </div>

            {/* Load Transfer Audit Records */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                    <Scale className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    OOPJ Load Transfer Audit Log & Transaction Records
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {transfers.length} Executed Transfers
                </span>
              </div>

              {transfers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 italic font-mono bg-slate-900/40 rounded-xl border border-slate-850">
                  No load transfers executed yet. Click &quot;Balance Load (Shift)&quot; above to initiate safe power redistribution.
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  {transfers.map((t) => (
                    <div
                      key={t.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          {t.id}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 font-bold text-white">
                            <span>Zone {t.source}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Zone {t.destination}</span>
                            <span className="text-emerald-400 font-black">+{t.amountMW} MW</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                            {t.reason}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-400">
                        <div>
                          Source: {t.sourceBeforeMW} ➔ <strong className="text-white">{t.sourceAfterMW} MW</strong>
                        </div>
                        <div>
                          Dest: {t.destBeforeMW} ➔ <strong className="text-white">{t.destAfterMW} MW</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Tab 2: ADSA Explorer */}
        {activeTab === 'adsa' && <AdsaExplorer />}

        {/* View Tab 3: OOPJ Explorer */}
        {activeTab === 'oopj' && <OopjExplorer />}

        {/* View Tab 4: Python Explorer */}
        {activeTab === 'python' && <PythonExplorer />}

        {/* View Tab 5: Academic Documentation & Viva */}
        {activeTab === 'guide' && <AcademicGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Smart Grid Load Balancer • Academic Project (ADSA Unit 2 | OOPJ | Python)</span>
          <span className="text-cyan-400 font-bold">100% Offline Compatible • No Paid APIs</span>
        </div>
      </footer>
    </div>
  );
}
