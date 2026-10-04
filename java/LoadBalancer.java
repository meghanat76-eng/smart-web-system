/**
 * Smart Grid Load Balancer - LoadBalancer Class
 * Academic Concept: OOPJ (Polymorphism, Strategy Pattern, Exception Handling, Encapsulation)
 * 
 * Executes safe load transfer decisions based on ADSA graph adjacency,
 * short-term Python forecast limits, and recipient headroom constraints.
 */
package smartgrid;

import java.util.*;

public class LoadBalancer {
    // Thresholds
    public static final double OVERLOAD_THRESHOLD_PCT = 85.0; // Overload danger line
    public static final double TARGET_BALANCED_PCT = 76.0;   // Target utilization for overloaded zone
    public static final double MAX_RECIPIENT_PCT = 78.0;     // Recipient must not exceed this after transfer

    private final Grid grid;
    private final List<LoadTransfer> transferHistory;
    private int transactionCounter;

    public LoadBalancer(Grid grid) {
        if (grid == null) {
            throw new IllegalArgumentException("Grid instance cannot be null.");
        }
        this.grid = grid;
        this.transferHistory = new ArrayList<>();
        this.transactionCounter = 100;
    }

    /**
     * Identifies zones experiencing current or forecasted overload.
     */
    public List<Zone> detectOverloadedZones(Map<String, Forecast> forecasts) {
        List<Zone> overloaded = new ArrayList<>();
        for (Zone zone : grid.getAllZones()) {
            Forecast fc = (forecasts != null) ? forecasts.get(zone.getId()) : null;
            double currentPct = zone.getLoadPercentage();
            double fcPct = (fc != null) ? fc.getForecastedLoadPct() : currentPct;

            if (currentPct >= OVERLOAD_THRESHOLD_PCT || fcPct >= OVERLOAD_THRESHOLD_PCT) {
                overloaded.add(zone);
            }
        }
        return overloaded;
    }

    /**
     * Selects the most suitable connected neighboring zone capable of safely absorbing load.
     */
    public Zone selectBestRecipientZone(Zone sourceZone) {
        List<String> neighbors = sourceZone.getConnectedZoneIds();
        Zone bestCandidate = null;
        double maxAvailableHeadroom = -1.0;

        for (String neighborId : neighbors) {
            Zone neighbor = grid.getZone(neighborId);
            if (neighbor == null) continue;

            // Recipient must be currently under 75% load
            double neighborPct = neighbor.getLoadPercentage();
            if (neighborPct < 75.0) {
                double headroom = neighbor.getAvailableHeadroomMW();
                // Check if connection line has available transfer limit
                Connection conn = grid.findConnection(sourceZone.getId(), neighborId);
                if (conn != null && conn.getAvailableCapacityMW() >= 10.0 && headroom > maxAvailableHeadroom) {
                    maxAvailableHeadroom = headroom;
                    bestCandidate = neighbor;
                }
            }
        }
        return bestCandidate;
    }

    /**
     * Computes the mathematically safe transfer amount without overloading destination.
     * Constraint: Recipient utilization must not exceed MAX_RECIPIENT_PCT (78%).
     */
    public double calculateSafeTransferAmount(Zone source, Zone destination, Connection connection) {
        // Desired relief amount for source zone: bring it down to TARGET_BALANCED_PCT
        double excessLoad = source.getCurrentLoadMW() - (source.getCapacityMW() * (TARGET_BALANCED_PCT / 100.0));
        if (excessLoad <= 0) return 0.0;

        // Maximum additional load destination can safely accept before reaching MAX_RECIPIENT_PCT
        double maxAcceptableByDest = (destination.getCapacityMW() * (MAX_RECIPIENT_PCT / 100.0)) - destination.getCurrentLoadMW();
        if (maxAcceptableByDest <= 0) return 0.0;

        // Transmission line thermal limit
        double lineLimit = connection.getAvailableCapacityMW();

        // Safe transfer is the minimum of all 3 physical constraints
        double safeAmount = Math.min(excessLoad, Math.min(maxAcceptableByDest, lineLimit));
        return Math.round(safeAmount * 10.0) / 10.0; // round to 1 decimal place
    }

    /**
     * Simulates and commits load transfer between two zones.
     * Demonstrates custom exception handling.
     */
    public LoadTransfer shiftLoad(Zone source, Zone destination, double amountMW, String reason)
            throws SmartGridException {

        if (source == null || destination == null) {
            throw new SmartGridException.InvalidTransferException("Source or Destination zone is null.");
        }
        if (source.getId().equalsIgnoreCase(destination.getId())) {
            throw new SmartGridException.InvalidTransferException("Source and destination zones cannot be identical.");
        }

        Connection conn = grid.findConnection(source.getId(), destination.getId());
        if (conn == null) {
            throw new SmartGridException.InvalidTransferException("No direct transmission line exists between "
                    + source.getId() + " and " + destination.getId());
        }

        // Validate line limit
        if (!conn.canSupportTransfer(amountMW)) {
            throw new SmartGridException.InsufficientCapacityException("Link " + conn.getId(), amountMW, conn.getAvailableCapacityMW());
        }

        // Validate destination capacity headroom
        double projectedDestPct = ((destination.getCurrentLoadMW() + amountMW) / destination.getCapacityMW()) * 100.0;
        if (projectedDestPct > MAX_RECIPIENT_PCT + 1.0) {
            throw new SmartGridException.InsufficientCapacityException(destination.getId(), amountMW, destination.getAvailableHeadroomMW());
        }

        transactionCounter++;
        String txId = "TXN-" + transactionCounter;
        LoadTransfer transfer = new LoadTransfer(txId, source.getId(), destination.getId(), amountMW, reason);

        // Record pre-transfer state
        double srcBefore = source.getCurrentLoadMW();
        double dstBefore = destination.getCurrentLoadMW();

        // Execute load shift
        source.setCurrentLoadMW(srcBefore - amountMW);
        destination.setCurrentLoadMW(dstBefore + amountMW);
        conn.setCurrentFlowMW(conn.getCurrentFlowMW() + amountMW);

        // Update risk classification for both zones
        source.updateRiskClassification();
        destination.updateRiskClassification();

        // Record post-transfer state
        transfer.recordExecution(srcBefore, source.getCurrentLoadMW(), dstBefore, destination.getCurrentLoadMW());
        transferHistory.add(transfer);

        return transfer;
    }

    /**
     * Top-level auto-balancing execution across the smart grid.
     */
    public List<LoadTransfer> balanceGrid(Map<String, Forecast> forecasts) {
        List<LoadTransfer> successfulTransfers = new ArrayList<>();
        List<Zone> overloadedZones = detectOverloadedZones(forecasts);

        for (Zone source : overloadedZones) {
            Zone recipient = selectBestRecipientZone(source);
            if (recipient != null) {
                Connection conn = grid.findConnection(source.getId(), recipient.getId());
                double safeAmount = calculateSafeTransferAmount(source, recipient, conn);

                if (safeAmount > 5.0) { // Transfer only if meaningful (> 5 MW)
                    String reason = String.format("Relieve %s (%.1f%%) via %s (%.1f%% cap available)",
                            source.getName(), source.getLoadPercentage(), recipient.getName(), recipient.getAvailableHeadroomMW());
                    try {
                        LoadTransfer tx = shiftLoad(source, recipient, safeAmount, reason);
                        successfulTransfers.add(tx);
                    } catch (SmartGridException ex) {
                        System.err.println("[WARN] Could not shift load: " + ex.getMessage());
                    }
                }
            }
        }
        return successfulTransfers;
    }

    public List<LoadTransfer> getTransferHistory() {
        return Collections.unmodifiableList(transferHistory);
    }
}
