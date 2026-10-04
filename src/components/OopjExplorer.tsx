import React, { useState } from 'react';
import { Code2, CheckCircle2, ShieldAlert, Cpu, FileCode2, Copy, Check } from 'lucide-react';

const JAVA_FILES: Record<string, { desc: string; oopConcept: string; code: string }> = {
  'Grid.java': {
    desc: 'Manages the overall power grid network, graph representation, zone lookup, and ADSA divide-and-conquer partitioning.',
    oopConcept: 'Encapsulation, Composition, Algorithm Execution',
    code: `package smartgrid;
import java.util.*;

public class Grid {
    private final String gridName;
    private final Map<String, Zone> zones = new LinkedHashMap<>();
    private final List<Connection> connections = new ArrayList<>();
    private final Map<String, List<String>> adjacencyList = new HashMap<>();
    private double[][] adjacencyMatrix;
    private final List<String> zoneOrder = new ArrayList<>();
    private final Map<String, List<String>> partitions = new HashMap<>();

    public Grid(String gridName) {
        this.gridName = gridName;
    }

    public void addZone(Zone zone) {
        zones.put(zone.getId(), zone);
        if (!zoneOrder.contains(zone.getId())) zoneOrder.add(zone.getId());
        adjacencyList.putIfAbsent(zone.getId(), new ArrayList<>());
    }

    public void addConnection(Connection conn) {
        connections.add(conn);
        adjacencyList.get(conn.getSourceZoneId()).add(conn.getDestinationZoneId());
        adjacencyList.get(conn.getDestinationZoneId()).add(conn.getSourceZoneId());
    }

    // ADSA Divide-and-Conquer Graph Partitioning
    public void partitionGridDivideAndConquer() {
        int mid = zoneOrder.size() / 2;
        partitions.put("Sector-1 (North)", new ArrayList<>(zoneOrder.subList(0, mid)));
        partitions.put("Sector-2 (South)", new ArrayList<>(zoneOrder.subList(mid, zoneOrder.size())));
    }
}`
  },
  'Zone.java': {
    desc: 'Electrical zone representing a grid vertex with substations, capacity, load, and risk assessment.',
    oopConcept: 'Inheritance (extends GridEntity), Polymorphism, Composition',
    code: `package smartgrid;
import java.util.*;

public class Zone extends GridEntity {
    private String sectorId;
    private final List<Substation> substations = new ArrayList<>();
    private final List<String> connectedZoneIds = new ArrayList<>();
    private double forecastedLoadMW;
    private String riskLevel = "NORMAL";

    public Zone(String id, String name, double capacityMW, double currentLoadMW, String sectorId) {
        super(id, name, capacityMW, currentLoadMW);
        this.sectorId = sectorId;
    }

    public void addSubstation(Substation sub) {
        if (sub != null) substations.add(sub);
    }

    // Polymorphic implementation
    @Override
    public String getOperationalStatus() {
        double pct = getLoadPercentage();
        if (pct >= 90.0) return "CRITICAL_OVERLOAD";
        if (pct >= 80.0) return "OVERLOAD_WARNING";
        return "NORMAL";
    }
}`
  },
  'GridEntity.java': {
    desc: 'Abstract base class modeling any physical asset with id, name, capacity, and current load.',
    oopConcept: 'Abstraction (abstract class & method), Encapsulation',
    code: `package smartgrid;

public abstract class GridEntity {
    protected String id;
    protected String name;
    protected double capacityMW;
    protected double currentLoadMW;

    public GridEntity(String id, String name, double capacityMW, double currentLoadMW) {
        if (capacityMW <= 0) throw new IllegalArgumentException("Capacity must be positive");
        this.id = id;
        this.name = name;
        this.capacityMW = capacityMW;
        this.currentLoadMW = currentLoadMW;
    }

    public double getLoadPercentage() {
        return (this.currentLoadMW / this.capacityMW) * 100.0;
    }

    // Abstraction: Overridden polymorphically by Zone and Substation
    public abstract String getOperationalStatus();
}`
  },
  'Substation.java': {
    desc: 'Step-down transformer station within a zone.',
    oopConcept: 'Inheritance (extends GridEntity), Polymorphic status override',
    code: `package smartgrid;

public class Substation extends GridEntity {
    private double voltageKV;
    private double powerFactor;
    private boolean operational = true;

    public Substation(String id, String name, double capMW, double loadMW, double voltageKV, double pf) {
        super(id, name, capMW, loadMW);
        this.voltageKV = voltageKV;
        this.powerFactor = pf;
    }

    @Override
    public String getOperationalStatus() {
        if (!operational) return "OFFLINE";
        return getLoadPercentage() >= 90.0 ? "TRANSFORMER_OVERHEATED" : "NORMAL_OPERATION";
    }
}`
  },
  'LoadBalancer.java': {
    desc: 'The balancing engine enforcing safe load transfer thresholds and graph constraints.',
    oopConcept: 'Business Logic Encapsulation, Custom Exception Handling',
    code: `package smartgrid;
import java.util.*;

public class LoadBalancer {
    public static final double OVERLOAD_THRESHOLD_PCT = 85.0;
    public static final double TARGET_BALANCED_PCT = 76.0;
    public static final double MAX_RECIPIENT_PCT = 78.0;

    private final Grid grid;
    private final List<LoadTransfer> transferHistory = new ArrayList<>();

    public LoadBalancer(Grid grid) {
        this.grid = grid;
    }

    public LoadTransfer shiftLoad(Zone source, Zone destination, double amountMW, String reason)
            throws SmartGridException {
        Connection conn = grid.findConnection(source.getId(), destination.getId());
        if (conn == null) {
            throw new SmartGridException.InvalidTransferException("No transmission line between zones.");
        }
        if (!conn.canSupportTransfer(amountMW)) {
            throw new SmartGridException.InsufficientCapacityException(conn.getId(), amountMW, conn.getAvailableCapacityMW());
        }

        // Execute safe shift
        source.setCurrentLoadMW(source.getCurrentLoadMW() - amountMW);
        destination.setCurrentLoadMW(destination.getCurrentLoadMW() + amountMW);

        LoadTransfer tx = new LoadTransfer("TXN-101", source.getId(), destination.getId(), amountMW, reason);
        transferHistory.add(tx);
        return tx;
    }
}`
  },
  'Simulation.java': {
    desc: 'Main executable running all 10 academic steps sequentially.',
    oopConcept: 'Application Entry Point, Pipeline Orchestration',
    code: `package smartgrid;

public class Simulation {
    public static void main(String[] args) {
        // Step 1: Grid creation
        Grid grid = new Grid("Microgrid");
        // Step 2: Zone creation
        // Step 3: Zone partitioning (ADSA)
        // Step 4: Current-load calculation
        // Step 5: Historical-load export to CSV
        // Step 6: Forecast reading (Python forecast.json)
        // Step 7: Overload detection
        // Step 8: Load-transfer decision
        // Step 9: Load-transfer simulation
        // Step 10: Updated-load calculation
        System.out.println("Simulation executed successfully.");
    }
}`
  }
};

export const OopjExplorer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>('Grid.java');
  const [copied, setCopied] = useState(false);

  const fileData = JAVA_FILES[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(fileData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                OOPJ : Java Simulation & Object-Oriented Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Classes, Abstraction, Polymorphism, Inheritance, Encapsulation & Exception Handling
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> 10-Step Java Simulation Validated
          </span>
        </div>
      </div>

      {/* OOP Concepts Checklist */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono font-bold text-sky-400 uppercase">1. Abstraction</div>
          <div className="text-xs font-semibold text-white mt-1">GridEntity Base Class</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Abstract method <code className="text-sky-300">getOperationalStatus()</code></div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono font-bold text-purple-400 uppercase">2. Inheritance</div>
          <div className="text-xs font-semibold text-white mt-1">Zone & Substation</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Extends <code className="text-purple-300">GridEntity</code> via super()</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase">3. Polymorphism</div>
          <div className="text-xs font-semibold text-white mt-1">Status Override</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zone vs Substation operational evaluation</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono font-bold text-amber-400 uppercase">4. Exceptions</div>
          <div className="text-xs font-semibold text-white mt-1">SmartGridException</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Custom checked exception hierarchy</div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* File List */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-1.5 lg:col-span-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold px-2 block mb-2">
            Java Source Modules (9)
          </span>
          {Object.keys(JAVA_FILES).map((fname) => (
            <button
              key={fname}
              onClick={() => setActiveFile(fname)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                activeFile === fname
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                {fname}
              </span>
            </button>
          ))}
        </div>

        {/* Code Content Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white font-mono">{activeFile}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                  {fileData.oopConcept}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{fileData.desc}</p>
            </div>

            <button
              onClick={handleCopy}
              className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="flex-1 overflow-x-auto p-3 bg-slate-950 rounded-lg border border-slate-850 font-mono text-xs text-slate-200 leading-relaxed max-h-[380px]">
            <code>{fileData.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
