/**
 * Smart Grid Load Balancer - Connection Class
 * Academic Concept: ADSA Unit 2 (Graph Edge) & OOPJ (Encapsulation)
 * 
 * Represents a physical high-voltage transmission corridor connecting two zones.
 */
package smartgrid;

public class Connection {
    private String id;
    private String sourceZoneId;
    private String destinationZoneId;
    private double maxTransferLimitMW;
    private double currentFlowMW;
    private double lineResistanceOhms;

    public Connection(String id, String sourceZoneId, String destinationZoneId, double maxTransferLimitMW, double lineResistanceOhms) {
        this.id = id;
        this.sourceZoneId = sourceZoneId;
        this.destinationZoneId = destinationZoneId;
        this.maxTransferLimitMW = maxTransferLimitMW;
        this.currentFlowMW = 0.0;
        this.lineResistanceOhms = lineResistanceOhms;
    }

    public String getId() {
        return id;
    }

    public String getSourceZoneId() {
        return sourceZoneId;
    }

    public String getDestinationZoneId() {
        return destinationZoneId;
    }

    public double getMaxTransferLimitMW() {
        return maxTransferLimitMW;
    }

    public double getCurrentFlowMW() {
        return currentFlowMW;
    }

    public void setCurrentFlowMW(double currentFlowMW) {
        this.currentFlowMW = currentFlowMW;
    }

    public double getLineResistanceOhms() {
        return lineResistanceOhms;
    }

    public double getAvailableCapacityMW() {
        return Math.max(0.0, maxTransferLimitMW - currentFlowMW);
    }

    public boolean canSupportTransfer(double amountMW) {
        return (currentFlowMW + amountMW) <= maxTransferLimitMW;
    }

    public boolean connects(String zoneA, String zoneB) {
        return (sourceZoneId.equalsIgnoreCase(zoneA) && destinationZoneId.equalsIgnoreCase(zoneB)) ||
               (sourceZoneId.equalsIgnoreCase(zoneB) && destinationZoneId.equalsIgnoreCase(zoneA));
    }

    @Override
    public String toString() {
        return String.format("Link[%s]: %s <---> %s (Limit: %.1f MW, Flow: %.1f MW, Avail: %.1f MW)",
                id, sourceZoneId, destinationZoneId, maxTransferLimitMW, currentFlowMW, getAvailableCapacityMW());
    }
}
