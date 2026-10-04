/**
 * Smart Grid Load Balancer - LoadData Class
 * Academic Concept: OOPJ (File I/O, Data Persistence, Encapsulation)
 * 
 * Manages historical load records for zones and exports them to CSV for Python consumption.
 */
package smartgrid;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class LoadData {
    public static class Record {
        private final String timestamp;
        private final String zoneId;
        private final String zoneName;
        private final String sector;
        private final double capacityMW;
        private final double loadMW;
        private final double loadPercentage;
        private final int substationCount;

        public Record(String timestamp, String zoneId, String zoneName, String sector, double capacityMW, double loadMW, int substationCount) {
            this.timestamp = timestamp;
            this.zoneId = zoneId;
            this.zoneName = zoneName;
            this.sector = sector;
            this.capacityMW = capacityMW;
            this.loadMW = loadMW;
            this.loadPercentage = (loadMW / capacityMW) * 100.0;
            this.substationCount = substationCount;
        }

        public String toCsvRow() {
            return String.format("%s,%s,%s,%s,%.1f,%.1f,%.2f,%d",
                    timestamp, zoneId, zoneName, sector, capacityMW, loadMW, loadPercentage, substationCount);
        }

        public String getTimestamp() { return timestamp; }
        public String getZoneId() { return zoneId; }
        public double getLoadMW() { return loadMW; }
        public double getCapacityMW() { return capacityMW; }
    }

    private final List<Record> records;

    public LoadData() {
        this.records = new ArrayList<>();
    }

    public void addRecord(Record record) {
        if (record != null) {
            records.add(record);
        }
    }

    public List<Record> getRecords() {
        return records;
    }

    /**
     * Exports all time-series records to CSV format.
     */
    public void exportToCsv(String destinationPath) throws IOException {
        File file = new File(destinationPath);
        if (file.getParentFile() != null) {
            file.getParentFile().mkdirs();
        }

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
            writer.write("Timestamp,ZoneId,ZoneName,Sector,CapacityMW,LoadMW,LoadPercentage,SubstationCount");
            writer.newLine();
            for (Record r : records) {
                writer.write(r.toCsvRow());
                writer.newLine();
            }
        }
    }
}
