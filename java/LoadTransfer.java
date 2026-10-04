/**
 * Smart Grid Load Balancer - LoadTransfer Class
 * Academic Concept: OOPJ (Encapsulation, Data Validation, Audit Records)
 * 
 * Records the transaction details of shifting load between microgrid zones.
 */
package smartgrid;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LoadTransfer {
    private String transferId;
    private String sourceZoneId;
    private String destinationZoneId;
    private double amountMW;
    private double sourceLoadBeforeMW;
    private double sourceLoadAfterMW;
    private double destLoadBeforeMW;
    private double destLoadAfterMW;
    private String reason;
    private String status;
    private String timestamp;

    public LoadTransfer(String transferId, String sourceZoneId, String destinationZoneId, double amountMW, String reason) {
        if (amountMW <= 0) {
            throw new IllegalArgumentException("Transfer amount must be strictly greater than 0 MW.");
        }
        this.transferId = transferId;
        this.sourceZoneId = sourceZoneId;
        this.destinationZoneId = destinationZoneId;
        this.amountMW = amountMW;
        this.reason = reason;
        this.status = "INITIALIZED";
        this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public void recordExecution(double srcBefore, double srcAfter, double dstBefore, double dstAfter) {
        this.sourceLoadBeforeMW = srcBefore;
        this.sourceLoadAfterMW = srcAfter;
        this.destLoadBeforeMW = dstBefore;
        this.destLoadAfterMW = dstAfter;
        this.status = "COMPLETED";
    }

    public void reject(String rejectionReason) {
        this.status = "REJECTED: " + rejectionReason;
    }

    public String getTransferId() { return transferId; }
    public String getSourceZoneId() { return sourceZoneId; }
    public String getDestinationZoneId() { return destinationZoneId; }
    public double getAmountMW() { return amountMW; }
    public double getSourceLoadBeforeMW() { return sourceLoadBeforeMW; }
    public double getSourceLoadAfterMW() { return sourceLoadAfterMW; }
    public double getDestLoadBeforeMW() { return destLoadBeforeMW; }
    public double getDestLoadAfterMW() { return destLoadAfterMW; }
    public String getReason() { return reason; }
    public String getStatus() { return status; }
    public String getTimestamp() { return timestamp; }

    @Override
    public String toString() {
        return String.format("[%s] Shift %.1f MW: Zone %s (%.1f -> %.1f MW) to Zone %s (%.1f -> %.1f MW) | Status: %s | Reason: %s",
                transferId, amountMW, sourceZoneId, sourceLoadBeforeMW, sourceLoadAfterMW,
                destinationZoneId, destLoadBeforeMW, destLoadAfterMW, status, reason);
    }
}
