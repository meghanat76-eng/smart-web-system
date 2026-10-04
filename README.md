# Smart Grid Load Balancer

An academic engineering project demonstrating load re-balancing in a regional microgrid by combining three core curriculum subjects:
1. **ADSA – Unit 2** (Graph Theory, Adjacency Representations & Divide-and-Conquer Partitioning)
2. **OOPJ** (Object-Oriented Programming with Java for Grid Topology Simulation)
3. **Python** (Statistical Short-Term Load Forecasting & Offline Smart Grid Assistant Chatbot)

---

## 1. Problem Statement

Modern microgrid operators face sudden, localized demand surges during evening peak hours. When high-density industrial or downtown zones exceed rated transformer and line capacities, thermal stress leads to cascading blackouts if surplus load is not promptly relieved. Monolithic grid dispatching is computationally slow and vulnerable to single-point failures. 

There is a critical need to:
- Model the electrical grid topology as a formal graph.
- Divide the grid into decoupled sector clusters using **Divide-and-Conquer** graph partitioning (ADSA Unit 2).
- Simulate physical zone, substation, line impedance, and load transfer transactions using **Object-Oriented Programming in Java (OOPJ)**.
- Export time-series load observations to CSV.
- Apply **Python** to forecast short-term demand trends and detect impending thermal overloads pre-emptively.
- Execute safe intra- and inter-sector load shifts without overloading recipient zones.
- Provide a responsive **Smart Grid Assistant Chatbot** powered by Python that runs completely offline to answer operator queries.

---

## 2. Objective

1. Represent an 8-zone smart microgrid as an undirected weighted graph $G = (V, E)$.
2. Partition the graph into balanced North and South sectors using Divide-and-Conquer algorithms.
3. Simulate zone substations, transmission lines, and power transfers in Java with full OOP principles.
4. Export historical load profiles to `data/load_history.csv`.
5. Predict short-term peak load in Python using an explainable Exponential Weighted Moving Average (EWMA) model and output to `data/forecast.json`.
6. Formulate and execute safe load transfer decisions to normalize overloaded zones (Zone A & Zone C) via adjacent headroom zones (Zone B & Zone D).
7. Deploy an offline Python assistant chatbot capable of answering operator questions about grid metrics, forecasts, and transfer rationale.

---

## 3. Proposed Solution & System Flow

```
+-----------------------------------------------------------------------+
|                             Smart Grid                                |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                     1. ADSA – Grid as Graph                           |
|       - 8 Vertices: Zone A through Zone H                             |
|       - 10 Edges: High-Voltage Transmission Corridors                 |
|       - Adjacency Matrix (Capacity) & Adjacency List (Topology)       |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|               2. ADSA – Divide-and-Conquer Partitioning                |
|       - Sector 1 (North): {Zone A, Zone B, Zone C, Zone D}            |
|       - Sector 2 (South): {Zone E, Zone F, Zone G, Zone H}            |
|       - Cut Boundary Edges: {(C, G), (D, F)}                          |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                       3. OOPJ – Java Simulation                       |
|       - Entities: Grid, Zone, Substation, Connection, LoadBalancer    |
|       - Current Load & Utilization Calculation                        |
|       - Export Time-Series to: data/load_history.csv                  |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                4. Python – Short-Term Load Forecasting                 |
|       - Reads: data/load_history.csv                                  |
|       - EWMA Model: L̂_(t+1) = α·L_t + (1-α)·SMA₃ + Δ_trend            |
|       - Risk Classification (Critical Overload if >= 90%)             |
|       - Writes: data/forecast.json                                    |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|               5. OOPJ – Load Balancer (Safe Power Shift)              |
|       - Detect Overloaded Zones (Zone A: 91.7%, Zone C: 92.0%)        |
|       - Select Safe Adjacent Recipients (Zone B & Zone D)             |
|       - Calculate Safe Transfer Amount (Δ = min(Excess, Headroom))    |
|       - Execute Safe Transfer: Zone A ➔ B (18 MW), Zone C ➔ D (20 MW) |
|       - Updated Loads: Zone A (76.7%), Zone B (73.0%)                 |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                    6. Professional Web Dashboard                      |
|       - Live SVG Topology Canvas with Animated Power Flows            |
|       - Real-Time KPI Cards (Total Load, Headroom, Overload Alerts)   |
|       - ADSA, OOPJ, and Python Deep-Dive Explorers                    |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                7. Python Smart Grid Assistant Chatbot                 |
|       - 100% Offline Rule/Intent Matching Engine                      |
|       - Queries Live State, Forecasts, and Transfer Logs              |
|       - Answers: "Which zone is overloaded?", "Show grid status"      |
+-----------------------------------------------------------------------+
```

---

## 4. Academic Subject Mapping

### 4.1 ADSA – Unit 2 (Graph Theory & Divide and Conquer)

- **Graph Model**: $G = (V, E)$ where $|V| = 8$ (Zones A-H) and $|E| = 10$ (transmission lines).
- **Adjacency Matrix**: An $8 \times 8$ matrix storing transmission line capacity in MW for $O(1)$ transfer boundary validation.
- **Adjacency List**: Dynamic vertex neighbor list used for $O(V+E)$ Breadth-First Search (BFS) reachability validation.
- **Divide-and-Conquer Partitioning**:
  - *Divide*: Bisect the graph vertices into two subsets:
    $$V_1 = \{A, B, C, D\}, \quad V_2 = \{E, F, G, H\}$$
  - *Conquer*: Solve load balance locally within each sector first, minimizing transmission line impedance losses.
  - *Combine*: Cross-sector balancing takes place across designated cut edges:
    $$E_{\text{cut}} = \{(C, G), (D, F)\} \quad \text{with Cut Capacity} = 60 + 40 = 100\text{ MW}$$

### 4.2 OOPJ (Object-Oriented Programming with Java)

The Java simulation engine strictly demonstrates the key OOP principles:
- **Classes & Objects**: `Grid`, `Zone`, `Substation`, `Connection`, `LoadData`, `LoadTransfer`, `Forecast`, `LoadBalancer`, `Simulation`.
- **Abstraction**: Abstract base class `GridEntity` defining common electrical properties and abstract method `getOperationalStatus()`.
- **Inheritance**: `Zone` and `Substation` extend `GridEntity` via `super(id, name, capacity, load)`.
- **Polymorphism**: `getOperationalStatus()` is overridden polymorphically in `Zone` (evaluating overload risks) and `Substation` (evaluating transformer thermal status).
- **Encapsulation**: Private attributes with guarded getters and setters validating positive capacities and invariant boundaries.
- **Composition**: `Zone` contains a `List<Substation>` and `List<String> connectedZoneIds`.
- **Exception Handling**: Custom exception hierarchy `SmartGridException` with `OverloadRiskException`, `InsufficientCapacityException`, and `InvalidTransferException`.

### 4.3 Python (Data Science & NLP Chatbot)

- **Historical Data Processing (`python/data_processor.py`)**: Uses Python's standard `csv` module to aggregate, clean, and compute descriptive statistics (mean, variance, peak load, headroom).
- **Short-Term Load Forecasting (`python/forecast.py`)**:
  Computes an explainable hybrid Exponential Weighted Moving Average (EWMA) and linear trend extrapolation:
  $$\text{SMA}_3 = \frac{L_t + L_{t-1} + L_{t-2}}{3}$$
  $$\Delta_{\text{trend}} = \frac{L_t - L_{t-2}}{2}$$
  $$\hat{L}_{t+1} = \alpha L_t + (1 - \alpha) \text{SMA}_3 + \Delta_{\text{trend}} \quad (\alpha = 0.65)$$
- **Smart Grid Assistant Chatbot (`python/chatbot.py`)**:
  An offline, zero-external-API pattern matching and entity recognition engine. It queries `data/forecast.json` and active simulation states to answer operator questions with precise values and actionable advice.

---

## 5. Zone Dataset Overview

| Zone ID | Zone Name | Sector | Capacity (MW) | Initial Load (MW) | Utilization (%) | Initial Risk Status |
|---|---|---|---|---|---|---|
| **Zone A** | Downtown Core | Sector-1 (North) | 120.0 | 110.0 | 91.7% | **CRITICAL OVERLOAD** |
| **Zone B** | West Tech Park | Sector-1 (North) | 100.0 | 55.0 | 55.0% | **AVAILABLE** |
| **Zone C** | North Industrial | Sector-1 (North) | 150.0 | 138.0 | 92.0% | **CRITICAL OVERLOAD** |
| **Zone D** | East Residential | Sector-1 (North) | 110.0 | 62.0 | 56.4% | **AVAILABLE** |
| **Zone E** | South Port Basin | Sector-2 (South) | 130.0 | 80.0 | 61.5% | NORMAL |
| **Zone F** | Metro Suburb | Sector-2 (South) | 90.0 | 50.0 | 55.6% | AVAILABLE |
| **Zone G** | Heavy Manufacturing | Sector-2 (South) | 140.0 | 122.0 | 87.1% | OVERLOAD WARNING |
| **Zone H** | University Campus | Sector-2 (South) | 120.0 | 68.0 | 56.7% | AVAILABLE |

---

## 6. Load Balancing Example & Verification

### Step 1: Zone A Overload Relief
- **Source**: Zone A (Load: 110.0 MW / 120.0 MW = 91.7%)
- **Target Recipient**: Zone B (Load: 55.0 MW / 100.0 MW = 55.0%, Headroom: 45.0 MW)
- **Direct Transmission Link**: Line A-B (Max Capacity: 45.0 MW)
- **Safe Transfer Amount**: 18.0 MW
- **Post-Transfer Verification**:
  - Zone A: $110.0 - 18.0 = 92.0\text{ MW}$ (76.7% utilization $\rightarrow$ **NORMAL**)
  - Zone B: $55.0 + 18.0 = 73.0\text{ MW}$ (73.0% utilization $\rightarrow$ **SAFE**)

### Step 2: Zone C Overload Relief
- **Source**: Zone C (Load: 138.0 MW / 150.0 MW = 92.0%)
- **Target Recipient**: Zone D (Load: 62.0 MW / 110.0 MW = 56.4%, Headroom: 48.0 MW)
- **Direct Transmission Link**: Line C-D (Max Capacity: 50.0 MW)
- **Safe Transfer Amount**: 20.0 MW
- **Post-Transfer Verification**:
  - Zone C: $138.0 - 20.0 = 118.0\text{ MW}$ (78.7% utilization $\rightarrow$ **NORMAL**)
  - Zone D: $62.0 + 20.0 = 82.0\text{ MW}$ (74.5% utilization $\rightarrow$ **SAFE**)

*Note: Neither recipient zone exceeds the 78% safety limit, preventing secondary cascading overloads.*

---

## 7. Project Directory Structure

```
Smart-Grid-Load-Balancer/
│
├── java/                         # OOPJ Source Code
│   ├── GridEntity.java           # Abstract base class
│   ├── Substation.java           # Substation entity (Inheritance)
│   ├── Zone.java                 # Microgrid zone node (Inheritance & Composition)
│   ├── Connection.java           # Graph transmission line edge
│   ├── LoadData.java             # Time-series model & CSV exporter
│   ├── Forecast.java             # Forecast reader & parser
│   ├── LoadTransfer.java         # Transfer transaction record
│   ├── LoadBalancer.java         # Safe balancing algorithmic logic
│   ├── SmartGridException.java   # Custom exception hierarchy
│   └── Simulation.java           # Complete 10-step executable main()
│
├── python/                       # Python Forecasting & Chatbot
│   ├── data_processor.py         # CSV ingestion & statistical calculator
│   ├── forecast.py               # Short-term EWMA load forecaster
│   └── chatbot.py                # Smart Grid Assistant offline NLP engine
│
├── data/                         # Data Exchange Layer
│   ├── load_history.csv          # Exported historical load time-series
│   └── forecast.json             # Python forecast output consumed by Java
│
├── dashboard/                    # Standalone HTML5/CSS3/JS Dashboard
│   ├── index.html                # Control room user interface
│   ├── style.css                 # Dark control room styling
│   └── script.js                 # Interactive SVG graph & local chat engine
│
├── src/                          # Full-Stack React Application
│   ├── App.tsx                   # Main dashboard application
│   ├── mockData.ts               # Topology & adjacency matrix constants
│   ├── types.ts                  # TypeScript data interfaces
│   └── components/
│       ├── TopologyGraph.tsx     # Visual ADSA graph canvas with flow animation
│       ├── ChatbotPanel.tsx      # Embedded Smart Grid Assistant Chatbot
│       ├── AdsaExplorer.tsx      # Adjacency Matrix & D&C visualizer
│       ├── OopjExplorer.tsx      # UML diagram & Java code viewer
│       ├── PythonExplorer.tsx    # EWMA formula cards & Python code viewer
│       └── AcademicGuide.tsx     # Viva prep, questions & terminal commands
│
├── server.ts                     # Express server bridging Python scripts & Vite
├── metadata.json                 # AI Studio applet metadata
├── package.json                  # Node dependencies and scripts
└── README.md                     # Comprehensive academic documentation
```

---

## 8. How to Run the Project in VS Code

### Prerequisites
- Java Development Kit (JDK 8 or higher)
- Python 3.8+ (standard library only; no pip install needed)
- Node.js 18+ (for the interactive web dashboard)

### Step 1: Run Java Simulation (OOPJ & ADSA)
Open the VS Code Terminal and run:
```bash
# Create compilation directory
mkdir -p bin

# Compile all Java source files
javac -d bin java/*.java

# Run the 10-step Smart Grid Simulation
java -cp bin smartgrid.Simulation
```

### Step 2: Run Python Short-Term Forecasting
```bash
# Generates short-term forecasts from load_history.csv into data/forecast.json
python3 python/forecast.py
```

### Step 3: Run Python Smart Grid Assistant (CLI Mode)
```bash
# Interactive REPL mode:
python3 python/chatbot.py

# Or run a single query:
python3 python/chatbot.py --query "Which zone is overloaded?"
python3 python/chatbot.py --query "Why was load shifted from Zone A?"
```

### Step 4: Launch the Full Interactive Dashboard
```bash
# Start the web control room on http://localhost:3000
npm run dev
```

---

## 9. Sample Chatbot Interactions

```
Operator > Which zone is overloaded?
Assistant:
Current grid analysis indicates:
• CRITICAL OVERLOAD: Zone A (Downtown Core) (91.67% current, 94.69% forecast), Zone C (North Industrial) (92.00% current, 93.30% forecast). Immediate load balancing is recommended.
• WARNING LEVEL: Zone G (Heavy Manufacturing) (87.14% current, 88.07% forecast). Approaching operating headroom.

Operator > Why was load shifted from Zone A?
Assistant:
Zone A was predicted to approach its capacity limit (91.67% current, 94.69% forecast), while connected neighbor Zone B had sufficient available capacity (55.0% utilized, 45 MW headroom). Therefore, the OOPJ LoadBalancer shifted a safe amount of 18.0 MW across transmission link A-B. Post-transfer, Zone A normalized to ~76.7% while Zone B safely absorbed the load at ~73.0%.

Operator > Which zone has available capacity?
Assistant:
The following zones have sufficient available headroom to receive shifted load:
• Zone H (University Campus): 52.0 MW available (56.7% loaded)
• Zone D (East Residential): 48.0 MW available (56.4% loaded)
• Zone E (South Port Basin): 50.0 MW available (61.5% loaded)
• Zone B (West Tech Park): 45.0 MW available (55.0% loaded)
• Zone F (Metro Suburb): 40.0 MW available (55.6% loaded)
```

---

## 10. Advantages, Limitations & Future Scope

### Advantages
1. **Explainable & Deterministic**: Uses established graph theory (ADSA) and transparent statistical formulas (EWMA) suitable for academic defense and safety-critical utility operations.
2. **Zero Dependency & 100% Offline**: Runs without third-party external Python packages, paid AI API keys, or internet connectivity.
3. **Multi-Disciplinary Integration**: Demonstrates how ADSA algorithms, OOP software engineering in Java, and Python data pipelines interact seamlessly.
4. **Cascading Failure Prevention**: Enforces a strict headroom ceiling (78%) on receiving zones so transfers never trigger secondary overloads.

### Limitations
- AC power flow non-linearities (reactive power VAR and bus voltage angles) are simplified to active real power (MW).
- Graph partitioning uses bisection; for grids with >100 zones, multi-way spectral clustering or Kernighan-Lin heuristics would be preferable.

### Future Scope
- Integration with renewable solar/wind intermittency models.
- Incorporation of battery energy storage systems (BESS) as dynamic buffer nodes in the ADSA graph.
- Automated SCADA hardware-in-the-loop (HIL) testing via Modbus/DNP3 protocols.
