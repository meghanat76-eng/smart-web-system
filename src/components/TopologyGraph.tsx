import React, { useState } from 'react';
import { Zone, Connection, LoadTransferRecord } from '../types';
import { Zap, ShieldAlert, CheckCircle, Info, ChevronRight, Layers } from 'lucide-react';

interface TopologyGraphProps {
  zones: Zone[];
  connections: Connection[];
  activeTransfers: LoadTransferRecord[];
  selectedZone: Zone | null;
  onSelectZone: (zone: Zone) => void;
}

export const TopologyGraph: React.FC<TopologyGraphProps> = ({
  zones,
  connections,
  activeTransfers,
  selectedZone,
  onSelectZone,
}) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Check if an edge is actively carrying a transfer
  const getTransferOnEdge = (uId: string, vId: string) => {
    return activeTransfers.find(
      (t) => (t.source === uId && t.destination === vId) || (t.source === vId && t.destination === uId)
    );
  };

  return (
    <div className="relative bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              ADSA Graph Topology • Microgrid Zones
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Divide-and-Conquer Bipartition: Sector-1 (North) & Sector-2 (South) with Inter-Sector Cut Edges
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span>Normal (&lt;80%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
            <span>Risk (80-89%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
            <span>Critical (&ge;90%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-400"></span>
            <span>ADSA Cut Edge</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full aspect-[21/10] max-h-[460px] relative bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden">
        <svg viewBox="0 0 820 360" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="northSectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="southSectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.02" />
            </linearGradient>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ADSA Sector 1 (North) Partition Container */}
          <g>
            <rect
              x="30"
              y="25"
              width="360"
              height="310"
              rx="16"
              fill="url(#northSectorGrad)"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.8"
            />
            <rect x="45" y="38" width="180" height="22" rx="6" fill="#0369a1" fillOpacity="0.25" />
            <text x="52" y="53" fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
              ADSA PARTITION 1: NORTH {`{A, B, C, D}`}
            </text>
          </g>

          {/* ADSA Sector 2 (South) Partition Container */}
          <g>
            <rect
              x="430"
              y="25"
              width="360"
              height="310"
              rx="16"
              fill="url(#southSectorGrad)"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.8"
            />
            <rect x="445" y="38" width="180" height="22" rx="6" fill="#6d28d9" fillOpacity="0.25" />
            <text x="452" y="53" fill="#c084fc" fontSize="11" fontWeight="700" fontFamily="monospace">
              ADSA PARTITION 2: SOUTH {`{E, F, G, H}`}
            </text>
          </g>

          {/* Transmission Lines (Edges) */}
          {connections.map((conn) => {
            const zU = zones.find((z) => z.id === conn.source);
            const zV = zones.find((z) => z.id === conn.destination);
            if (!zU || !zV) return null;

            const isHovered = hoveredZone === conn.source || hoveredZone === conn.destination;
            const activeTx = getTransferOnEdge(conn.source, conn.destination);

            const midX = (zU.x + zV.x) / 2;
            const midY = (zU.y + zV.y) / 2;

            let strokeColor = '#334155';
            let strokeWidth = 2.5;

            if (conn.isCutEdge) {
              strokeColor = '#f59e0b';
              strokeWidth = 3;
            }

            if (activeTx) {
              strokeColor = '#06b6d4';
              strokeWidth = 4;
            } else if (isHovered) {
              strokeColor = '#94a3b8';
            }

            return (
              <g key={conn.id} className="transition-all duration-300">
                <line
                  x1={zU.x}
                  y1={zU.y}
                  x2={zV.x}
                  y2={zV.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={conn.isCutEdge ? '6 4' : undefined}
                  className={activeTx ? 'animate-pulse' : ''}
                />

                {/* Animated Power Flow Particle when transferring */}
                {activeTx && (
                  <circle r="4.5" fill="#38bdf8" filter="url(#glow-cyan)">
                    <animateMotion
                      path={`M ${zU.id === activeTx.source ? zU.x : zV.x} ${zU.id === activeTx.source ? zU.y : zV.y} L ${zU.id === activeTx.source ? zV.x : zU.x} ${zU.id === activeTx.source ? zV.y : zU.y}`}
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Transmission capacity badge */}
                <rect
                  x={midX - 24}
                  y={midY - 10}
                  width="48"
                  height="18"
                  rx="4"
                  fill="#0b1324"
                  stroke={activeTx ? '#06b6d4' : conn.isCutEdge ? '#d97706' : '#1e293b'}
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={midY + 2.5}
                  fill={activeTx ? '#38bdf8' : conn.isCutEdge ? '#fbbf24' : '#94a3b8'}
                  fontSize="9.5"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {conn.maxTransferLimitMW} MW
                </text>
              </g>
            );
          })}

          {/* Zones (Graph Vertices) */}
          {zones.map((zone) => {
            const pct = Math.round((zone.currentLoadMW / zone.capacityMW) * 100);
            const isSelected = selectedZone?.id === zone.id;
            const isHovered = hoveredZone === zone.id;

            let strokeColor = '#10b981';
            let fillColor = '#064e3b';
            let glow = '';

            if (pct >= 90) {
              strokeColor = '#f43f5e';
              fillColor = '#881337';
              glow = 'url(#glow-red)';
            } else if (pct >= 80) {
              strokeColor = '#f59e0b';
              fillColor = '#78350f';
            }

            return (
              <g
                key={zone.id}
                transform={`translate(${zone.x}, ${zone.y})`}
                onClick={() => onSelectZone(zone)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer transition-transform duration-200 hover:scale-110"
              >
                {/* Outer ring on selection */}
                {isSelected && (
                  <circle
                    r="34"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Main node circle */}
                <circle
                  r="26"
                  fill="#0f172a"
                  stroke={strokeColor}
                  strokeWidth={isHovered ? 4 : 3}
                  filter={glow}
                />

                {/* Utilization gauge arc */}
                <circle
                  r="21"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeDasharray={`${(pct / 100) * 131.9} 131.9`}
                  transform="rotate(-90)"
                  opacity="0.4"
                />

                {/* Node Label */}
                <text
                  x="0"
                  y="-2"
                  fill="#f8fafc"
                  fontSize="12.5"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  Zone {zone.id}
                </text>
                <text
                  x="0"
                  y="12"
                  fill={strokeColor}
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {pct}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Zone Mini-Inspector Banner */}
        {selectedZone && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md animate-fadeIn">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold font-mono text-base ${
                  (selectedZone.currentLoadMW / selectedZone.capacityMW) >= 0.9
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : (selectedZone.currentLoadMW / selectedZone.capacityMW) >= 0.8
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {selectedZone.id}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {selectedZone.name}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {selectedZone.sector}
                  </span>
                </h4>
                <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5 font-mono">
                  <span>Current: <strong className="text-white">{selectedZone.currentLoadMW} MW</strong> ({Math.round((selectedZone.currentLoadMW / selectedZone.capacityMW) * 100)}%)</span>
                  <span>Capacity: <strong className="text-white">{selectedZone.capacityMW} MW</strong></span>
                  <span>Forecast: <strong className="text-cyan-400">{selectedZone.forecastedLoadMW} MW</strong></span>
                  <span>Substations: <strong className="text-white">{selectedZone.substations} Units</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold font-mono ${
                  selectedZone.riskLevel === 'CRITICAL_OVERLOAD'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : selectedZone.riskLevel === 'OVERLOAD_WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {selectedZone.riskLevel}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
