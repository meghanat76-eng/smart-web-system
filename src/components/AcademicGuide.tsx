import React, { useState } from 'react';
import { BookOpen, Terminal, CheckCircle2, AlertTriangle, ArrowRight, Layers, HelpCircle, Download } from 'lucide-react';

export const AcademicGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flow' | 'viva' | 'commands'>('flow');

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Academic Project Documentation & Viva Guide
              </h2>
              <p className="text-xs text-slate-400">
                System flow, Algorithm, Sample Input/Output, Viva questions, and VS Code terminal guide
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'flow' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            System Flow & Algorithm
          </button>
          <button
            onClick={() => setActiveTab('viva')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'viva' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Examiner Viva Q&A
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'commands' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            VS Code Run Commands
          </button>
        </div>
      </div>

      {activeTab === 'flow' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Flow Diagram Banner */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              End-to-End Execution Flow (ADSA ➔ OOPJ ➔ Python ➔ Dashboard)
            </h4>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center flex-1 min-w-[130px]">
                <span className="text-[10px] text-sky-400 block font-bold">1. ADSA</span>
                <span className="text-white font-bold">Graph Topology</span>
                <span className="text-[10px] text-slate-500 block">8 Microgrid Nodes</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center flex-1 min-w-[130px]">
                <span className="text-[10px] text-sky-400 block font-bold">2. ADSA</span>
                <span className="text-white font-bold">D&C Partition</span>
                <span className="text-[10px] text-slate-500 block">North & South Sectors</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center flex-1 min-w-[130px]">
                <span className="text-[10px] text-amber-400 block font-bold">3. OOPJ (Java)</span>
                <span className="text-white font-bold">Grid Simulation</span>
                <span className="text-[10px] text-slate-500 block">load_history.csv</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center flex-1 min-w-[130px]">
                <span className="text-[10px] text-emerald-400 block font-bold">4. Python</span>
                <span className="text-white font-bold">Short-Term Forecast</span>
                <span className="text-[10px] text-slate-500 block">forecast.json</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center flex-1 min-w-[130px]">
                <span className="text-[10px] text-amber-400 block font-bold">5. OOPJ (Java)</span>
                <span className="text-white font-bold">Load Balancer</span>
                <span className="text-[10px] text-slate-500 block">Shift 18MW & 20MW</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center flex-1 min-w-[130px]">
                <span className="text-[10px] text-cyan-400 block font-bold">6. Python</span>
                <span className="text-white font-bold">Assistant Chatbot</span>
                <span className="text-[10px] text-slate-500 block">Operator Guidance</span>
              </div>
            </div>
          </div>

          {/* Algorithm Outline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
                Safe Load Balancing Algorithm
              </h4>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                <li><strong className="text-white">Detect Overload:</strong> For each Zone i in V, evaluate if max(loadPct_i, forecastPct_i) &ge; 85%.</li>
                <li><strong className="text-white">Query Adjacency List:</strong> Retrieve adjacent neighbors N(i) from the graph topology.</li>
                <li><strong className="text-white">Filter Safe Recipients:</strong> Select neighbor j in N(i) where current utilization &le; 75% and connection capacity is available.</li>
                <li><strong className="text-white">Compute Safe Shift:</strong> Set transfer amount &Delta; = min(Excess_i, Headroom_j, LineLimit_ij).</li>
                <li><strong className="text-white">Commit Transaction:</strong> Decrement source load, increment destination load, and record audit record.</li>
              </ol>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Sample Numerical Input & Output
              </h4>
              <div className="text-xs font-mono space-y-2 text-slate-300">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-rose-400 font-bold block">Initial Overloaded Condition:</span>
                  Zone A: 110 MW / 120 MW (91.7%) ➔ CRITICAL<br />
                  Zone B: 55 MW / 100 MW (55.0%) ➔ AVAILABLE
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 font-bold block">Post Load Transfer Result:</span>
                  Shift: Zone A ➔ 18.0 MW ➔ Zone B<br />
                  Zone A: 92.0 MW (76.7%) ➔ BALANCED<br />
                  Zone B: 73.0 MW (73.0%) ➔ SAFE HEADROOM
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'viva' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h5 className="text-xs font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              Q1: How is ADSA Unit 2 applied in this project?
            </h5>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              <strong>Answer:</strong> The smart grid is modeled as an undirected weighted graph where nodes represent 8 distribution zones and edges represent high-voltage transmission lines. We use Divide-and-Conquer to bisect the graph into North Sector {`{A,B,C,D}`} and South Sector {`{E,F,G,H}`}. This bounds fault propagation and allows intra-cluster power balancing first before crossing the cut-boundary edges.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h5 className="text-xs font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Q2: Which Object-Oriented Programming with Java (OOPJ) concepts are implemented?
            </h5>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              <strong>Answer:</strong> We implemented <strong>Abstraction</strong> (GridEntity abstract base class), <strong>Inheritance</strong> (Zone and Substation extending GridEntity), <strong>Polymorphism</strong> (overriding getOperationalStatus() differently for zones and substations), <strong>Encapsulation</strong> (private attributes with bounded getters/setters), <strong>Composition</strong> (Zone has-a list of Substations), and <strong>Exception Handling</strong> (custom SmartGridException hierarchy).
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h5 className="text-xs font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Q3: Why is Python used for forecasting and chatbot instead of external APIs?
            </h5>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              <strong>Answer:</strong> External AI APIs require paid subscriptions and constant internet access. In industrial power utilities, operations must run deterministically and offline. Python processes the CSV load history and applies Exponential Weighted Moving Average (EWMA) with linear trend projection. The chatbot uses a lightweight offline pattern-matching engine that queries the actual simulation state.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'commands' && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-xs text-slate-300">
            Run these exact commands in your terminal or inside VS Code to demonstrate the Java and Python components independently:
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-amber-400 uppercase font-bold mb-1">1. Compile & Run Java Simulation:</div>
              <pre className="text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-850 overflow-x-auto">
{`# From project root directory:
javac -d bin java/*.java
java -cp bin smartgrid.Simulation`}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-emerald-400 uppercase font-bold mb-1">2. Run Python Short-Term Forecasting:</div>
              <pre className="text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-850 overflow-x-auto">
{`python3 python/forecast.py`}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-cyan-400 uppercase font-bold mb-1">3. Run Python Smart Grid Assistant (Interactive Chat):</div>
              <pre className="text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-850 overflow-x-auto">
{`python3 python/chatbot.py`}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-sky-400 uppercase font-bold mb-1">4. Launch the Web Control Room Dashboard:</div>
              <pre className="text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-850 overflow-x-auto">
{`npm run dev`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
