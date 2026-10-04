/**
 * Smart Grid Load Balancer - OOPJ Implementation
 * Academic Concept: OOPJ (Abstraction and Inheritance Base Class)
 * 
 * Abstract base class representing an electrical asset in the Smart Grid.
 * Demonstrates:
 * - Abstraction (abstract method getOperationalStatus())
 * - Encapsulation (protected fields with public getters/setters)
 */
package smartgrid;

public abstract class GridEntity {
    protected String id;
    protected String name;
    protected double capacityMW;
    protected double currentLoadMW;

    // Parameterized constructor
    public GridEntity(String id, String name, double capacityMW, double currentLoadMW) {
        if (capacityMW <= 0) {
            throw new IllegalArgumentException("Capacity must be strictly positive (> 0 MW).");
        }
        if (currentLoadMW < 0) {
            throw new IllegalArgumentException("Current load cannot be negative.");
        }
        this.id = id;
        this.name = name;
        this.capacityMW = capacityMW;
        this.currentLoadMW = currentLoadMW;
    }

    // Default constructor
    public GridEntity() {
        this.id = "UNKNOWN";
        this.name = "Unnamed Entity";
        this.capacityMW = 100.0;
        this.currentLoadMW = 0.0;
    }

    // Encapsulation: Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getCapacityMW() {
        return capacityMW;
    }

    public void setCapacityMW(double capacityMW) {
        if (capacityMW <= 0) {
            throw new IllegalArgumentException("Capacity must be positive.");
        }
        this.capacityMW = capacityMW;
    }

    public double getCurrentLoadMW() {
        return currentLoadMW;
    }

    public void setCurrentLoadMW(double currentLoadMW) {
        if (currentLoadMW < 0) {
            throw new IllegalArgumentException("Load cannot be negative.");
        }
        this.currentLoadMW = currentLoadMW;
    }

    // Derived metric
    public double getLoadPercentage() {
        return (this.currentLoadMW / this.capacityMW) * 100.0;
    }

    public double getAvailableHeadroomMW() {
        return Math.max(0.0, this.capacityMW - this.currentLoadMW);
    }

    // Abstraction: Must be implemented by derived concrete classes (Zone, Substation)
    public abstract String getOperationalStatus();

    @Override
    public String toString() {
        return String.format("[%s] %s | Load: %.2f / %.2f MW (%.1f%%) | Status: %s",
                id, name, currentLoadMW, capacityMW, getLoadPercentage(), getOperationalStatus());
    }
}
