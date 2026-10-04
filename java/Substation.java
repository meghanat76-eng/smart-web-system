/**
 * Smart Grid Load Balancer - Substation Class
 * Academic Concept: OOPJ (Inheritance, Polymorphism)
 * 
 * Represents a localized transformer substation within a power grid zone.
 * Demonstrates:
 * - Inheritance (extends GridEntity)
 * - Polymorphism (overrides getOperationalStatus())
 * - Encapsulation (voltage rating and transformer efficiency)
 */
package smartgrid;

public class Substation extends GridEntity {
    private double voltageKV;
    private double powerFactor;
    private boolean operational;

    public Substation(String id, String name, double capacityMW, double currentLoadMW, double voltageKV, double powerFactor) {
        super(id, name, capacityMW, currentLoadMW);
        this.voltageKV = voltageKV;
        this.powerFactor = powerFactor;
        this.operational = true;
    }

    public double getVoltageKV() {
        return voltageKV;
    }

    public void setVoltageKV(double voltageKV) {
        this.voltageKV = voltageKV;
    }

    public double getPowerFactor() {
        return powerFactor;
    }

    public void setPowerFactor(double powerFactor) {
        this.powerFactor = powerFactor;
    }

    public boolean isOperational() {
        return operational;
    }

    public void setOperational(boolean operational) {
        this.operational = operational;
    }

    // Polymorphic implementation of abstract method
    @Override
    public String getOperationalStatus() {
        if (!operational) {
            return "OFFLINE";
        }
        double pct = getLoadPercentage();
        if (pct >= 90.0) {
            return "TRANSFORMER_OVERHEATED";
        } else if (pct >= 80.0) {
            return "HIGH_UTILIZATION";
        } else {
            return "NORMAL_OPERATION";
        }
    }
}
