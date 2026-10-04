/**
 * Smart Grid Load Balancer - Custom Exception Hierarchy
 * Academic Concept: OOPJ (Exception Handling and Custom Checked/Unchecked Exceptions)
 */
package smartgrid;

public class SmartGridException extends Exception {
    public SmartGridException(String message) {
        super(message);
    }

    public SmartGridException(String message, Throwable cause) {
        super(message, cause);
    }

    // Specific domain exceptions
    public static class ZoneNotFoundException extends SmartGridException {
        public ZoneNotFoundException(String zoneId) {
            super("Zone with identifier '" + zoneId + "' not found in Grid topology.");
        }
    }

    public static class OverloadRiskException extends SmartGridException {
        public OverloadRiskException(String zoneId, double loadPct) {
            super(String.format("Critical Overload Violation: Zone %s reached %.2f%% of rated capacity!", zoneId, loadPct));
        }
    }

    public static class InsufficientCapacityException extends SmartGridException {
        public InsufficientCapacityException(String zoneId, double requestedMW, double availableMW) {
            super(String.format("Transfer Denied: Zone %s cannot accept %.2f MW (only %.2f MW available headroom).",
                    zoneId, requestedMW, availableMW));
        }
    }

    public static class InvalidTransferException extends SmartGridException {
        public InvalidTransferException(String message) {
            super("Invalid Load Transfer: " + message);
        }
    }
}
