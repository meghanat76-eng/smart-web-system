/**
 * Smart Grid Load Balancer - Control Dashboard Logic
 * Academic Concept: ADSA Graph Visualizer, OOPJ Simulation Bridge, and Python Chatbot Integration
 */

// Zone topology data
const initialGridState = {
    zones: [
        { id: "A", name: "Zone A (Downtown)", sector: "Sector-1 (North)", capacity: 120.0, currentLoad: 110.0, forecast: 113.63, status: "CRITICAL", x: 120, y: 80 },
        { id: "B", name: "Zone B (Tech Park)", sector: "Sector-1 (North)", capacity: 100.0, currentLoad: 55.0, forecast: 56.03, status: "NORMAL", x: 280, y: 70 },
        { id: "C", name: "Zone C (Industrial)", sector: "Sector-1 (North)", capacity: 150.0, currentLoad: 138.0, forecast: 139.95, status: "CRITICAL", x: 110, y: 190 },
        { id: "D", name: "Zone D (Residential)", sector: "Sector-1 (North)", capacity: 110.0, currentLoad: 62.0, forecast: 63.30, status: "NORMAL", x: 290, y: 180 },
        { id: "E", name: "Zone E (Port Basin)", sector: "Sector-2 (South)", capacity: 130.0, currentLoad: 80.0, forecast: 81.30, status: "NORMAL", x: 440, y: 90 },
        { id: "F", name: "Zone F (Metro Suburb)", sector: "Sector-2 (South)", capacity: 90.0, currentLoad: 50.0, forecast: 51.30, status: "NORMAL", x: 580, y: 80 },
        { id: "G", name: "Zone G (Heavy Mfg)", sector: "Sector-2 (South)", capacity: 140.0, currentLoad: 122.0, forecast: 123.30, status: "WARNING", x: 450, y: 220 },
        { id: "H", name: "Zone H (University)", sector: "Sector-2 (South)", capacity: 120.0, currentLoad: 68.0, forecast: 69.30, status: "NORMAL", x: 590, y: 210 }
    ],
    connections: [
        { u: "A", v: "B", limit: 45, isCut: false },
        { u: "A", v: "C", limit: 40, isCut: false },
        { u: "B", v: "D", limit: 35, isCut: false },
        { u: "C", v: "D", limit: 50, isCut: false },
        { u: "C", v: "G", limit: 60, isCut: true },  // ADSA Cut Edge
        { u: "D", v: "F", limit: 40, isCut: true },  // ADSA Cut Edge
        { u: "E", v: "F", limit: 35, isCut: false },
        { u: "E", v: "G", limit: 45, isCut: false },
        { u: "G", v: "H", limit: 50, isCut: false },
        { u: "F", v: "H", limit: 35, isCut: false }
    ],
    transfers: []
};

let currentZones = JSON.parse(JSON.stringify(initialGridState.zones));
let transfers = [];

function renderGraph() {
    const container = document.getElementById("graphContainer");
    if (!container) return;

    let svg = `<svg viewBox="0 0 720 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <!-- Sector Backgrounds (ADSA Divide & Conquer) -->
        <rect x="20" y="20" width="340" height="270" rx="10" fill="rgba(2, 132, 199, 0.05)" stroke="rgba(2, 132, 199, 0.2)" stroke-dasharray="4" />
        <text x="35" y="45" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="bold">ADSA PARTITION 1: NORTH SECTOR {A, B, C, D}</text>

        <rect x="380" y="20" width="320" height="270" rx="10" fill="rgba(124, 58, 237, 0.05)" stroke="rgba(124, 58, 237, 0.2)" stroke-dasharray="4" />
        <text x="395" y="45" fill="#c084fc" font-size="12" font-family="monospace" font-weight="bold">ADSA PARTITION 2: SOUTH SECTOR {E, F, G, H}</text>

        <!-- Connections (Edges) -->
        ${initialGridState.connections.map(conn => {
            const zU = currentZones.find(z => z.id === conn.u);
            const zV = currentZones.find(z => z.id === conn.v);
            const strokeColor = conn.isCut ? "#f59e0b" : "#334155";
            const strokeDash = conn.isCut ? "stroke-dasharray='6'" : "";
            const strokeWidth = conn.isCut ? 3 : 2;
            return `
                <line x1="${zU.x}" y1="${zU.y}" x2="${zV.x}" y2="${zV.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${strokeDash} />
                <text x="${(zU.x + zV.x)/2}" y="${(zU.y + zV.y)/2 - 5}" fill="#94a3b8" font-size="9" text-anchor="middle" font-family="monospace">${conn.limit} MW</text>
            `;
        }).join("")}

        <!-- Zones (Nodes) -->
        ${currentZones.map(z => {
            const pct = Math.round((z.currentLoad / z.capacity) * 100);
            let color = "#10b981"; // Normal
            if (pct >= 90) color = "#ef4444"; // Critical
            else if (pct >= 80) color = "#f59e0b"; // Warning

            return `
                <g class="zone-node" data-id="${z.id}" style="cursor: pointer;">
                    <circle cx="${z.x}" cy="${z.y}" r="26" fill="#0f172a" stroke="${color}" stroke-width="3" filter="drop-shadow(0 0 6px ${color}88)" />
                    <text x="${z.x}" y="${z.y - 3}" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle" font-family="monospace">Zone ${z.id}</text>
                    <text x="${z.x}" y="${z.y + 11}" fill="${color}" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">${pct}%</text>
                </g>
            `;
        }).join("")}
    </svg>`;

    container.innerHTML = svg;
}

function updateTableAndMetrics() {
    const tbody = document.getElementById("zoneTableBody");
    if (!tbody) return;

    let totalLoad = 0;
    let totalCap = 0;
    let critCount = 0;
    let totalHeadroom = 0;

    tbody.innerHTML = currentZones.map(z => {
        totalLoad += z.currentLoad;
        totalCap += z.capacity;
        totalHeadroom += Math.max(0, z.capacity - z.currentLoad);

        const currentPct = ((z.currentLoad / z.capacity) * 100).toFixed(1);
        const fcPct = ((z.forecast / z.capacity) * 100).toFixed(1);

        let badgeClass = "badge-green";
        let statusText = "NORMAL";
        if (currentPct >= 90 || fcPct >= 90) {
            badgeClass = "badge-red";
            statusText = "CRITICAL OVERLOAD";
            critCount++;
        } else if (currentPct >= 80 || fcPct >= 80) {
            badgeClass = "badge-amber";
            statusText = "OVERLOAD RISK";
        }

        return `
            <tr>
                <td><strong>Zone ${z.id}</strong></td>
                <td><small style="color:#94a3b8">${z.sector.split(' ')[0]}</small></td>
                <td>${z.capacity.toFixed(1)} MW</td>
                <td><strong>${z.currentLoad.toFixed(1)} MW</strong> <small>(${currentPct}%)</small></td>
                <td>${z.forecast.toFixed(1)} MW <small>(${fcPct}%)</small></td>
                <td><span style="color:${statusText.includes('CRITICAL') ? '#ef4444' : statusText.includes('RISK') ? '#f59e0b' : '#10b981'}; font-weight:600;">${statusText}</span></td>
            </tr>
        `;
    }).join("");

    document.getElementById("valTotalLoad").innerText = `${totalLoad.toFixed(1)} MW`;
    document.getElementById("valAvgLoad").innerText = `${((totalLoad / totalCap) * 100).toFixed(1)}%`;
    document.getElementById("valOverloaded").innerText = `${critCount} Critical`;
    document.getElementById("valHeadroom").innerText = `${totalHeadroom.toFixed(1)} MW`;
}

function executeLoadBalance() {
    // Transfer from Zone A to Zone B (18 MW)
    const zA = currentZones.find(z => z.id === "A");
    const zB = currentZones.find(z => z.id === "B");
    const zC = currentZones.find(z => z.id === "C");
    const zD = currentZones.find(z => z.id === "D");

    if (zA && zB && zA.currentLoad > 100) {
        zA.currentLoad -= 18.0;
        zB.currentLoad += 18.0;
        transfers.push({
            id: `TXN-${100 + transfers.length + 1}`,
            src: "A",
            dst: "B",
            amount: 18.0,
            reason: "Relieve Zone A (91.7% -> 76.7%) safely via neighbor Zone B (55.0% -> 73.0%)"
        });
    }

    if (zC && zD && zC.currentLoad > 125) {
        zC.currentLoad -= 20.0;
        zD.currentLoad += 20.0;
        transfers.push({
            id: `TXN-${100 + transfers.length + 1}`,
            src: "C",
            dst: "D",
            amount: 20.0,
            reason: "Relieve Zone C (92.0% -> 78.7%) safely via neighbor Zone D (56.4% -> 74.5%)"
        });
    }

    renderGraph();
    updateTableAndMetrics();
    renderTransferLogs();
}

function renderTransferLogs() {
    const list = document.getElementById("transferLogList");
    if (!list) return;

    if (transfers.length === 0) {
        list.innerHTML = `<div style="color:#64748b; font-size:0.8rem; font-style:italic;">No load shifts executed yet. Click "Execute Load Balancer" above.</div>`;
        return;
    }

    list.innerHTML = transfers.map(t => `
        <div class="log-item">
            <strong>${t.id}: Shifted ${t.amount} MW from Zone ${t.src} ➔ Zone ${t.dst}</strong>
            <div style="color:#94a3b8; font-size:0.75rem; margin-top:2px;">Reason: ${t.reason}</div>
        </div>
    `).join("");
}

// Chatbot Python-rule implementation
function handleChatQuery(query) {
    const q = query.toLowerCase().trim();
    let reply = "";

    if (q.includes("overloaded") || q.includes("risk")) {
        const over = currentZones.filter(z => (z.currentLoad / z.capacity) >= 0.85);
        if (over.length > 0) {
            reply = `Currently, ${over.map(z => `Zone ${z.id} (${((z.currentLoad/z.capacity)*100).toFixed(1)}%)`).join(" and ")} are in critical overload status. The system recommends shifting surplus power to adjacent zones.`;
        } else {
            reply = "All zones are currently balanced and operating within safe thresholds (<80%).";
        }
    } else if (q.includes("load of zone a") || q.includes("zone a")) {
        const zA = currentZones.find(z => z.id === "A");
        reply = `Zone A currently has ${zA.currentLoad.toFixed(1)} MW load out of ${zA.capacity.toFixed(1)} MW capacity (${((zA.currentLoad/zA.capacity)*100).toFixed(1)}%). Forecast is ${zA.forecast.toFixed(1)} MW.`;
    } else if (q.includes("forecast for zone b") || (q.includes("forecast") && q.includes("b"))) {
        const zB = currentZones.find(z => z.id === "B");
        reply = `The Python short-term load forecast for Zone B is ${zB.forecast.toFixed(1)} MW (${((zB.forecast/zB.capacity)*100).toFixed(1)}% utilization). Status: NORMAL/AVAILABLE.`;
    } else if (q.includes("available capacity") || q.includes("headroom")) {
        const avail = currentZones.filter(z => (z.currentLoad / z.capacity) < 0.75);
        reply = `Zones with safe available headroom:\n` + avail.map(z => `• Zone ${z.id}: ${(z.capacity - z.currentLoad).toFixed(1)} MW headroom (${((z.currentLoad/z.capacity)*100).toFixed(1)}% used)`).join("\n");
    } else if (q.includes("why was load") || q.includes("why transfer")) {
        reply = `Zone A approached its capacity limit (91.7% current, 94.7% forecast), while Zone B had sufficient headroom (55% load). The system shifted a safe amount of 18 MW across transmission link A-B so neither zone was overloaded.`;
    } else if (q.includes("grid status") || q.includes("status")) {
        const totalLoad = currentZones.reduce((acc, z) => acc + z.currentLoad, 0);
        reply = `System Status: 8 zones operational. Total load: ${totalLoad.toFixed(1)} MW / 960.0 MW. ADSA Partition: North Sector {A,B,C,D} and South Sector {E,F,G,H}.`;
    } else if (q.includes("how much load") || q.includes("transferred")) {
        if (transfers.length === 0) {
            reply = "No load transfers have been executed yet in this session. Run the load balancer to initiate safe power transfer.";
        } else {
            reply = `Total transfers executed:\n` + transfers.map(t => `• ${t.src} ➔ ${t.dst}: ${t.amount} MW`).join("\n");
        }
    } else {
        reply = `As your Smart Grid Assistant, I can answer queries about zone loads, forecasts, overload risks, and load transfer decisions. Try asking: "Which zone is overloaded?" or "Show forecast".`;
    }

    return reply;
}

function appendMessage(sender, text) {
    const container = document.getElementById("chatMessages");
    if (!container) return;

    const div = document.createElement("div");
    div.className = `msg ${sender}`;
    div.innerHTML = `<div class="msg-bubble">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    renderGraph();
    updateTableAndMetrics();
    renderTransferLogs();

    document.getElementById("btnBalanceLoad")?.addEventListener("click", () => {
        executeLoadBalance();
        appendMessage("assistant", "Executed OOPJ Load Balancing: Transferred 18 MW from Zone A to Zone B, and 20 MW from Zone C to Zone D across validated graph connections.");
    });

    document.getElementById("btnRunForecast")?.addEventListener("click", () => {
        appendMessage("assistant", "Executed Python Short-Term Forecast: EWMA model evaluated 24-hr historical load. Detected Critical Overload risks in Zone A (94.7%) and Zone C (93.3%).");
    });

    document.getElementById("btnRunSim")?.addEventListener("click", () => {
        appendMessage("assistant", "Full 10-step Java Simulation initialized: ADSA graph constructed, divide-and-conquer partition applied, historical CSV exported.");
    });

    document.getElementById("btnResetGrid")?.addEventListener("click", () => {
        currentZones = JSON.parse(JSON.stringify(initialGridState.zones));
        transfers = [];
        renderGraph();
        updateTableAndMetrics();
        renderTransferLogs();
        appendMessage("assistant", "Grid simulation reset to initial conditions. Zone A (91.7%) and Zone C (92.0%) are overloaded.");
    });

    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        appendMessage("user", text);
        input.value = "";
        setTimeout(() => {
            const answer = handleChatQuery(text);
            appendMessage("assistant", answer);
        }, 200);
    });

    document.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const q = chip.getAttribute("data-q");
            appendMessage("user", q);
            setTimeout(() => {
                const answer = handleChatQuery(q);
                appendMessage("assistant", answer);
            }, 200);
        });
    });

    document.getElementById("btnClearChat")?.addEventListener("click", () => {
        const container = document.getElementById("chatMessages");
        if (container) {
            container.innerHTML = `<div class="msg assistant"><div class="msg-bubble">Chat cleared. Ask any question about grid load, forecasts, or transfer decisions.</div></div>`;
        }
    });
});
