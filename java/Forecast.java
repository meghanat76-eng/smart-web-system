/**
 * Smart Grid Load Balancer - Forecast Model Class
 * Academic Concept: OOPJ (Encapsulation, File Processing, Robust Parsing)
 * 
 * Represents the short-term load forecast produced by the Python module.
 */
package smartgrid;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Forecast {
    private String zoneId;
    private double currentLoadMW;
    private double currentLoadPct;
    private double forecastedLoadMW;
    private double forecastedLoadPct;
    private double headroomMW;
    private String riskLevel;
    private String recommendedAction;

    public Forecast(String zoneId, double currentLoadMW, double forecastedLoadMW, double capacityMW, String riskLevel) {
        this.zoneId = zoneId;
        this.currentLoadMW = currentLoadMW;
        this.forecastedLoadMW = forecastedLoadMW;
        this.currentLoadPct = (currentLoadMW / capacityMW) * 100.0;
        this.forecastedLoadPct = (forecastedLoadMW / capacityMW) * 100.0;
        this.headroomMW = Math.max(0.0, capacityMW - forecastedLoadMW);
        this.riskLevel = riskLevel;
        this.recommendedAction = "Maintain standard monitor";
    }

    public Forecast() {
        this.riskLevel = "NORMAL";
    }

    public String getZoneId() { return zoneId; }
    public void setZoneId(String zoneId) { this.zoneId = zoneId; }

    public double getCurrentLoadMW() { return currentLoadMW; }
    public void setCurrentLoadMW(double currentLoadMW) { this.currentLoadMW = currentLoadMW; }

    public double getCurrentLoadPct() { return currentLoadPct; }
    public void setCurrentLoadPct(double currentLoadPct) { this.currentLoadPct = currentLoadPct; }

    public double getForecastedLoadMW() { return forecastedLoadMW; }
    public void setForecastedLoadMW(double forecastedLoadMW) { this.forecastedLoadMW = forecastedLoadMW; }

    public double getForecastedLoadPct() { return forecastedLoadPct; }
    public void setForecastedLoadPct(double forecastedLoadPct) { this.forecastedLoadPct = forecastedLoadPct; }

    public double getHeadroomMW() { return headroomMW; }
    public void setHeadroomMW(double headroomMW) { this.headroomMW = headroomMW; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String action) { this.recommendedAction = action; }

    public boolean isCritical() {
        return "CRITICAL_OVERLOAD".equalsIgnoreCase(riskLevel) || forecastedLoadPct >= 90.0;
    }

    /**
     * Reads and parses forecast.json without requiring external JSON libraries.
     */
    public static Map<String, Forecast> loadFromFile(String jsonFilePath) throws IOException {
        Map<String, Forecast> map = new HashMap<>();
        File file = new File(jsonFilePath);
        if (!file.exists()) {
            throw new IOException("Forecast JSON file not found at: " + jsonFilePath);
        }

        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        String json = sb.toString();

        // Regex parsing to support standard Java without external dependencies (e.g. Jackson or Gson)
        Pattern zoneBlockPattern = Pattern.compile("\"([A-H])\"\\s*:\\s*\\{([^}]+)\\}");
        Matcher zoneMatcher = zoneBlockPattern.matcher(json);

        while (zoneMatcher.find()) {
            String zid = zoneMatcher.group(1);
            String block = zoneMatcher.group(2);

            Forecast fc = new Forecast();
            fc.setZoneId(zid);

            fc.setCurrentLoadMW(extractDouble(block, "current_load_mw", 50.0));
            fc.setCurrentLoadPct(extractDouble(block, "current_load_percentage", 50.0));
            fc.setForecastedLoadMW(extractDouble(block, "forecasted_load_mw", 55.0));
            fc.setForecastedLoadPct(extractDouble(block, "forecasted_load_percentage", 55.0));
            fc.setHeadroomMW(extractDouble(block, "headroom_mw", 20.0));
            fc.setRiskLevel(extractString(block, "risk_level", "NORMAL"));
            fc.setRecommendedAction(extractString(block, "recommended_action", ""));

            map.put(zid, fc);
        }

        return map;
    }

    private static double extractDouble(String block, String key, double defaultVal) {
        Pattern p = Pattern.compile("\"" + key + "\"\\s*:\\s*([0-9.]+)");
        Matcher m = p.matcher(block);
        if (m.find()) {
            try {
                return Double.parseDouble(m.group(1));
            } catch (NumberFormatException ignored) {}
        }
        return defaultVal;
    }

    private static String extractString(String block, String key, String defaultVal) {
        Pattern p = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
        Matcher m = p.matcher(block);
        if (m.find()) {
            return m.group(1);
        }
        return defaultVal;
    }

    @Override
    public String toString() {
        return String.format("Forecast[Zone %s] Fcst: %.2f MW (%.1f%%) | Headroom: %.2f MW | Status: %s",
                zoneId, forecastedLoadMW, forecastedLoadPct, headroomMW, riskLevel);
    }
}
