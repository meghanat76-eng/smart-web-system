import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Resolve paths
const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data");
const PYTHON_DIR = path.join(ROOT_DIR, "python");
const JAVA_DIR = path.join(ROOT_DIR, "java");

// In-memory simulation state that syncs with files
interface ZoneState {
  id: string;
  name: string;
  sector: string;
  capacityMW: number;
  currentLoadMW: number;
  forecastedLoadMW: number;
  riskLevel: string;
  substations: number;
}

const defaultZones: ZoneState[] = [
  { id: "A", name: "Zone A (Downtown Core)", sector: "Sector-1 (North)", capacityMW: 120.0, currentLoadMW: 110.0, forecastedLoadMW: 113.63, riskLevel: "CRITICAL_OVERLOAD", substations: 4 },
  { id: "B", name: "Zone B (West Tech Park)", sector: "Sector-1 (North)", capacityMW: 100.0, currentLoadMW: 55.0, forecastedLoadMW: 56.03, riskLevel: "NORMAL", substations: 3 },
  { id: "C", name: "Zone C (North Industrial)", sector: "Sector-1 (North)", capacityMW: 150.0, currentLoadMW: 138.0, forecastedLoadMW: 139.95, riskLevel: "CRITICAL_OVERLOAD", substations: 5 },
  { id: "D", name: "Zone D (East Residential)", sector: "Sector-1 (North)", capacityMW: 110.0, currentLoadMW: 62.0, forecastedLoadMW: 63.30, riskLevel: "NORMAL", substations: 3 },
  { id: "E", name: "Zone E (South Port Basin)", sector: "Sector-2 (South)", capacityMW: 130.0, currentLoadMW: 80.0, forecastedLoadMW: 81.30, riskLevel: "NORMAL", substations: 4 },
  { id: "F", name: "Zone F (Metro Suburb)", sector: "Sector-2 (South)", capacityMW: 90.0, currentLoadMW: 50.0, forecastedLoadMW: 51.30, riskLevel: "NORMAL", substations: 3 },
  { id: "G", name: "Zone G (Heavy Manufacturing)", sector: "Sector-2 (South)", capacityMW: 140.0, currentLoadMW: 122.0, forecastedLoadMW: 123.30, riskLevel: "OVERLOAD_WARNING", substations: 5 },
  { id: "H", name: "Zone H (University Campus)", sector: "Sector-2 (South)", capacityMW: 120.0, currentLoadMW: 68.0, forecastedLoadMW: 69.30, riskLevel: "NORMAL", substations: 4 },
];

let activeZones: ZoneState[] = JSON.parse(JSON.stringify(defaultZones));
let transferLogs: any[] = [];

// API: Get current grid status
app.get("/api/grid/status", (req, res) => {
  const totalLoad = activeZones.reduce((acc, z) => acc + z.currentLoadMW, 0);
  const totalCap = activeZones.reduce((acc, z) => acc + z.capacityMW, 0);
  const overloaded = activeZones.filter(z => (z.currentLoadMW / z.capacityMW) >= 0.85);

  res.json({
    zones: activeZones,
    totalLoadMW: Math.round(totalLoad * 10) / 10,
    totalCapacityMW: totalCap,
    utilizationPct: Math.round((totalLoad / totalCap) * 1000) / 10,
    overloadedCount: overloaded.length,
    transfers: transferLogs,
  });
});

// API: Run Python Forecast script directly
app.post("/api/python/forecast", async (req, res) => {
  try {
    const scriptPath = path.join(PYTHON_DIR, "forecast.py");
    const { stdout, stderr } = await execAsync(`python3 "${scriptPath}"`);

    const jsonPath = path.join(DATA_DIR, "forecast.json");
    if (fs.existsSync(jsonPath)) {
      const forecastData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      // Sync into activeZones
      for (const z of activeZones) {
        if (forecastData.zones && forecastData.zones[z.id]) {
          z.forecastedLoadMW = forecastData.zones[z.id].forecasted_load_mw;
          z.riskLevel = forecastData.zones[z.id].risk_level;
        }
      }
      return res.json({
        success: true,
        output: stdout,
        data: forecastData,
      });
    }

    res.json({ success: true, output: stdout });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to run Python forecast script", details: err.message });
  }
});

// API: Query Python Chatbot
app.post("/api/python/chat", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const scriptPath = path.join(PYTHON_DIR, "chatbot.py");
    // Escape single quotes for bash safe execution
    const safeQuery = query.replace(/"/g, '\\"');
    const { stdout } = await execAsync(`python3 "${scriptPath}" --json --query "${safeQuery}"`);
    const parsed = JSON.parse(stdout);
    res.json(parsed);
  } catch (err: any) {
    // If python process error, fallback gracefully
    res.json({
      answer: "Unable to process via Python subprocess: " + err.message,
      intent: "ERROR",
      suggestions: ["Which zone is overloaded?", "Show forecast", "Show grid status"],
    });
  }
});

// API: Execute Load Balancing (OOPJ logic)
app.post("/api/grid/balance", (req, res) => {
  const newTransfers: any[] = [];

  // Transfer 1: Zone A (110 MW) -> Zone B (55 MW)
  const zA = activeZones.find(z => z.id === "A");
  const zB = activeZones.find(z => z.id === "B");
  if (zA && zB && (zA.currentLoadMW / zA.capacityMW) > 0.85) {
    const shift = 18.0;
    const srcBefore = zA.currentLoadMW;
    const dstBefore = zB.currentLoadMW;

    zA.currentLoadMW = Math.round((srcBefore - shift) * 10) / 10;
    zB.currentLoadMW = Math.round((dstBefore + shift) * 10) / 10;
    zA.riskLevel = (zA.currentLoadMW / zA.capacityMW) >= 0.85 ? "OVERLOAD_WARNING" : "NORMAL";
    zB.riskLevel = (zB.currentLoadMW / zB.capacityMW) >= 0.85 ? "OVERLOAD_WARNING" : "NORMAL";

    const tx = {
      id: `TXN-${100 + transferLogs.length + 1}`,
      source: "A",
      destination: "B",
      amountMW: shift,
      sourceBeforeMW: srcBefore,
      sourceAfterMW: zA.currentLoadMW,
      destBeforeMW: dstBefore,
      destAfterMW: zB.currentLoadMW,
      status: "COMPLETED",
      reason: `Relieve Zone A (${Math.round((srcBefore / zA.capacityMW) * 100)}% -> ${Math.round((zA.currentLoadMW / zA.capacityMW) * 100)}%) via neighbor Zone B (${Math.round((dstBefore / zB.capacityMW) * 100)}% -> ${Math.round((zB.currentLoadMW / zB.capacityMW) * 100)}%)`,
    };
    transferLogs.push(tx);
    newTransfers.push(tx);
  }

  // Transfer 2: Zone C (138 MW) -> Zone D (62 MW)
  const zC = activeZones.find(z => z.id === "C");
  const zD = activeZones.find(z => z.id === "D");
  if (zC && zD && (zC.currentLoadMW / zC.capacityMW) > 0.85) {
    const shift = 20.0;
    const srcBefore = zC.currentLoadMW;
    const dstBefore = zD.currentLoadMW;

    zC.currentLoadMW = Math.round((srcBefore - shift) * 10) / 10;
    zD.currentLoadMW = Math.round((dstBefore + shift) * 10) / 10;
    zC.riskLevel = (zC.currentLoadMW / zC.capacityMW) >= 0.85 ? "OVERLOAD_WARNING" : "NORMAL";
    zD.riskLevel = (zD.currentLoadMW / zD.capacityMW) >= 0.85 ? "OVERLOAD_WARNING" : "NORMAL";

    const tx = {
      id: `TXN-${100 + transferLogs.length + 1}`,
      source: "C",
      destination: "D",
      amountMW: shift,
      sourceBeforeMW: srcBefore,
      sourceAfterMW: zC.currentLoadMW,
      destBeforeMW: dstBefore,
      destAfterMW: zD.currentLoadMW,
      status: "COMPLETED",
      reason: `Relieve Zone C (${Math.round((srcBefore / zC.capacityMW) * 100)}% -> ${Math.round((zC.currentLoadMW / zC.capacityMW) * 100)}%) via neighbor Zone D (${Math.round((dstBefore / zD.capacityMW) * 100)}% -> ${Math.round((zD.currentLoadMW / zD.capacityMW) * 100)}%)`,
    };
    transferLogs.push(tx);
    newTransfers.push(tx);
  }

  res.json({
    success: true,
    transfers: newTransfers,
    updatedZones: activeZones,
  });
});

// API: Reset Simulation
app.post("/api/grid/reset", (req, res) => {
  activeZones = JSON.parse(JSON.stringify(defaultZones));
  transferLogs = [];
  res.json({ success: true, zones: activeZones });
});

// API: Read raw CSV or JSON data files
app.get("/api/data/files", (req, res) => {
  const historyPath = path.join(DATA_DIR, "load_history.csv");
  const forecastPath = path.join(DATA_DIR, "forecast.json");

  const historyCsv = fs.existsSync(historyPath) ? fs.readFileSync(historyPath, "utf-8") : "";
  const forecastJson = fs.existsSync(forecastPath) ? fs.readFileSync(forecastPath, "utf-8") : "{}";

  res.json({
    load_history_csv: historyCsv,
    forecast_json: JSON.parse(forecastJson || "{}"),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(ROOT_DIR, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(ROOT_DIR, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Smart Grid Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
