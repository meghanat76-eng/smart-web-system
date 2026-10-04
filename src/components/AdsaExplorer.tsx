import React, { useState } from 'react';
import { ADJACENCY_MATRIX, ADJACENCY_LIST } from '../mockData';
import { Network, GitBranch, Layers, Scissors, Check, Cpu } from 'lucide-react';

export const AdsaExplorer: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'matrix' | 'list' | 'divide_conquer' | 'concepts'>('divide_conquer');
  const zoneNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40">
              <Network className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                ADSA – Unit 2 : Graph Theory & Divide and Conquer
              </h2>
              <p className="text-xs text-slate-400">
                Formal algorithm mapping: Graph representation, recursive bisection, and min-cut analysis
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setSelectedTab('divide_conquer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTab === 'divide_conquer' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Divide & Conquer Partition
          </button>
          <button
            onClick={() => setSelectedTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTab === 'matrix' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Adjacency Matrix
          </button>
          <button
            onClick={() => setSelectedTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTab === 'list' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Adjacency List
          </button>
          <button
            onClick={() => setSelectedTab('concepts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTab === 'concepts' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Syllabus Mapping
          </button>
        </div>
      </div>

      {/* Tab: Divide and Conquer */}
      {selectedTab === 'divide_conquer' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-mono font-bold text-sky-400 uppercase">Step 1: Divide (Bipartition)</span>
              <h4 className="text-sm font-bold text-white mt-1">Recursive Graph Bisection</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                The monolithic 8-node grid graph G=(V,E) is partitioned into two balanced subgraphs V₁ (North Sector) and V₂ (South Sector) to isolate localized disturbances.
              </p>
              <div className="mt-3 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-sky-300">
                V₁ = {`{A, B, C, D}`} | |V₁| = 4 nodes<br />
                V₂ = {`{E, F, G, H}`} | |V₂| = 4 nodes
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-mono font-bold text-purple-400 uppercase">Step 2: Conquer (Solve Locally)</span>
              <h4 className="text-sm font-bold text-white mt-1">Zone-Wise Intra-Sector Balance</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Overload is first evaluated and balanced within the same sector via high-capacity intra-cluster links (e.g. A ➔ B, C ➔ D), avoiding high inter-sector line losses.
              </p>
              <div className="mt-3 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-purple-300">
                Intra-North: Links A-B (45MW), C-D (50MW)<br />
                Intra-South: Links E-F (35MW), G-H (50MW)
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">Step 3: Combine (Min-Cut)</span>
              <h4 className="text-sm font-bold text-white mt-1">Inter-Sector Cut Edges</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                If an entire sector is deficient, power flows across the cut boundary edges (E_cut). Minimizing cut capacity prevents cascading cross-sector trips.
              </p>
              <div className="mt-3 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-amber-300">
                E_cut = {`{(C, G), (D, F)}`}<br />
                Cut Capacity = 60 MW + 40 MW = 100 MW
              </div>
            </div>
          </div>

          {/* Visual D&C Tree */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-sky-400" />
              Divide-and-Conquer Recursive Partitioning Hierarchy
            </h4>
            <div className="flex flex-col items-center gap-4">
              {/* Root */}
              <div className="bg-slate-800 border-2 border-sky-500/60 px-5 py-2.5 rounded-xl text-center shadow-lg">
                <span className="text-[10px] text-sky-400 font-mono uppercase block font-bold">Root Problem</span>
                <span className="text-xs font-bold text-white">Full Microgrid Network G = (8 Zones, 10 Lines)</span>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Total Load: 685 MW | Capacity: 960 MW</span>
              </div>

              {/* Branch indicator */}
              <div className="w-0.5 h-6 bg-slate-700"></div>

              {/* Subproblems Level 1 */}
              <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                <div className="bg-slate-900 border-2 border-sky-500/40 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-sky-400 font-mono font-bold uppercase">Partition 1 (North Sector)</span>
                  <div className="text-xs font-bold text-white mt-1">Zones {`{A, B, C, D}`}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Load: 365 MW / 480 MW (76%)<br />
                    <span className="text-rose-400 font-semibold">Overload: Zone A & C</span>
                  </div>
                </div>

                <div className="bg-slate-900 border-2 border-purple-500/40 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-purple-400 font-mono font-bold uppercase">Partition 2 (South Sector)</span>
                  <div className="text-xs font-bold text-white mt-1">Zones {`{E, F, G, H}`}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Load: 320 MW / 480 MW (66%)<br />
                    <span className="text-amber-400 font-semibold">Warning: Zone G</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Adjacency Matrix */}
      {selectedTab === 'matrix' && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-xs text-slate-400">
            Adjacency Matrix representation where cell <code className="text-sky-300 font-mono">M[u][v]</code> specifies the high-voltage transmission capacity limit in Megawatts (MW). A value of <code className="text-slate-500 font-mono">0</code> denotes no direct physical transmission line.
          </p>

          <div className="overflow-x-auto bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <table className="w-full text-center font-mono text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-slate-500 font-bold">Node</th>
                  {zoneNames.map((name) => (
                    <th key={name} className="p-2 text-sky-400 font-bold bg-slate-800/40 rounded">
                      Zone {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ADJACENCY_MATRIX.map((row, i) => (
                  <tr key={i} className="border-t border-slate-800/60 hover:bg-slate-800/20">
                    <td className="p-2 font-bold text-sky-400 bg-slate-800/40 rounded">
                      Zone {zoneNames[i]}
                    </td>
                    {row.map((val, j) => {
                      const isConnected = val > 0;
                      const isCut = (i < 4 && j >= 4) || (i >= 4 && j < 4);
                      return (
                        <td
                          key={j}
                          className={`p-2 transition-colors ${
                            !isConnected
                              ? 'text-slate-600'
                              : isCut
                              ? 'text-amber-300 bg-amber-500/10 font-bold border border-amber-500/20 rounded'
                              : 'text-emerald-400 bg-emerald-500/10 font-bold rounded'
                          }`}
                        >
                          {val > 0 ? `${val}` : '0'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 inline-block text-center text-[9px] font-bold">MW</span> Intra-Sector Transmission Line</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 inline-block text-center text-[9px] font-bold">MW</span> Inter-Sector Boundary Cut Edge</span>
          </div>
        </div>
      )}

      {/* Tab: Adjacency List */}
      {selectedTab === 'list' && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-xs text-slate-400">
            Adjacency List structure storing dynamic neighbor references for rapid $O(V+E)$ graph traversal and breadth-first search path verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(ADJACENCY_LIST).map(([node, neighbors]) => (
              <div
                key={node}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-mono font-bold text-sky-300 text-sm">
                    {node}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Zone {node}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Degree: {neighbors.length} connections
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-slate-500">➔</span>
                  {neighbors.map((n) => (
                    <span
                      key={n}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700"
                    >
                      Zone {n}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Syllabus Mapping */}
      {selectedTab === 'concepts' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h4 className="text-sm font-bold text-sky-400 mb-2">
              ADSA – Unit 2 Syllabus Alignment Checklist
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Graph Modeling:</strong> Vertices represent 8 discrete microgrid distribution zones; edges model electrical transmission links with capacity constraints.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Divide-and-Conquer:</strong> Graph bipartitioning into North & South clusters to bound fault propagation and achieve localized load equilibrium.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Dual Representations:</strong> Adjacency Matrix used for $O(1)$ capacity lookup; Adjacency List utilized for $O(V+E)$ BFS reachable-path validation.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Cut-Edge Constraints:</strong> Cross-partition transfer evaluated against thermal bottleneck limits on inter-sector tie lines.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
