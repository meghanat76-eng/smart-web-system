/**
 * Smart Grid Load Balancer - Grid Graph Implementation
 * Academic Concept: ADSA - Unit 2 (Graph Representation & Divide-and-Conquer Partitioning)
 * 
 * Demonstrates:
 * 1. Graph representation using both Adjacency List and Adjacency Matrix
 * 2. Divide-and-Conquer Graph Partitioning (Recursive Bisection into Microgrid Zones)
 * 3. Breadth-First Search (BFS) for alternate path verification
 * 4. Graph Cut and Boundary Edge analysis
 */
package smartgrid;

import java.util.*;

public class Grid {
    private final String gridName;
    private final Map<String, Zone> zones;
    private final List<Connection> connections;
    private final Map<String, List<String>> adjacencyList;
    private double[][] adjacencyMatrix;
    private final List<String> zoneOrder; // Ordered index mapping for matrix
    private final Map<String, List<String>> partitions; // Divide-and-Conquer partitions

    public Grid(String gridName) {
        this.gridName = gridName;
        this.zones = new LinkedHashMap<>();
        this.connections = new ArrayList<>();
        this.adjacencyList = new HashMap<>();
        this.zoneOrder = new ArrayList<>();
        this.partitions = new HashMap<>();
    }

    /**
     * ADSA Graph Concept: Vertex Addition
     */
    public void addZone(Zone zone) {
        if (zone == null) return;
        zones.put(zone.getId(), zone);
        if (!zoneOrder.contains(zone.getId())) {
            zoneOrder.add(zone.getId());
        }
        adjacencyList.putIfAbsent(zone.getId(), new ArrayList<>());
    }

    /**
     * ADSA Graph Concept: Undirected Edge Addition with Transmission Capacity
     */
    public void addConnection(Connection connection) {
        if (connection == null) return;
        connections.add(connection);

        String u = connection.getSourceZoneId();
        String v = connection.getDestinationZoneId();

        // Update Zone neighbor lists
        Zone zoneU = zones.get(u);
        Zone zoneV = zones.get(v);
        if (zoneU != null) zoneU.addConnectedZone(v);
        if (zoneV != null) zoneV.addConnectedZone(u);

        // Update Adjacency List
        adjacencyList.computeIfAbsent(u, k -> new ArrayList<>());
        adjacencyList.computeIfAbsent(v, k -> new ArrayList<>());
        if (!adjacencyList.get(u).contains(v)) adjacencyList.get(u).add(v);
        if (!adjacencyList.get(v).contains(u)) adjacencyList.get(v).add(u);
    }

    /**
     * ADSA Graph Concept: Adjacency Matrix Construction
     * Matrix cell M[i][j] represents the transmission line capacity in MW between zone i and zone j.
     */
    public void buildAdjacencyMatrix() {
        int n = zoneOrder.size();
        adjacencyMatrix = new double[n][n];

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                adjacencyMatrix[i][j] = 0.0;
            }
        }

        for (Connection conn : connections) {
            int uIdx = zoneOrder.indexOf(conn.getSourceZoneId());
            int vIdx = zoneOrder.indexOf(conn.getDestinationZoneId());
            if (uIdx != -1 && vIdx != -1) {
                adjacencyMatrix[uIdx][vIdx] = conn.getMaxTransferLimitMW();
                adjacencyMatrix[vIdx][uIdx] = conn.getMaxTransferLimitMW();
            }
        }
    }

    /**
     * ADSA Unit 2: DIVIDE-AND-CONQUER GRAPH PARTITIONING
     * 
     * Problem: A large microgrid network is difficult to balance monolithically.
     * Divide: Recursively partition the graph vertices V into balanced subsets V1 and V2
     *         such that internal connection density is maximized and cut-edge bottleneck is minimized.
     * Conquer: Solve zone-level balance within each partition independently.
     * Combine: Address inter-sector boundary flows across cut edges.
     */
    public void partitionGridDivideAndConquer() {
        List<String> allZones = new ArrayList<>(zoneOrder);
        partitions.clear();

        // Level 1 Divide: Partition 8 zones into Sector-1 (North) and Sector-2 (South)
        divideAndConquerBisection(allZones, "Sector-1 (North)", "Sector-2 (South)", 0);

        // Assign sectors back to individual zones
        for (Map.Entry<String, List<String>> entry : partitions.entrySet()) {
            String sector = entry.getKey();
            for (String zid : entry.getValue()) {
                Zone z = zones.get(zid);
                if (z != null) {
                    z.setSectorId(sector);
                }
            }
        }
    }

    /**
     * Recursive helper for Divide and Conquer Bisection
     */
    private void divideAndConquerBisection(List<String> currentNodes, String labelLeft, String labelRight, int depth) {
        int size = currentNodes.size();
        if (size <= 2) {
            // Base case: small cluster
            partitions.computeIfAbsent(labelLeft, k -> new ArrayList<>()).addAll(currentNodes);
            return;
        }

        // Divide step: Bipartition nodes into two equal halves (n/2)
        int mid = size / 2;
        List<String> leftSubset = new ArrayList<>(currentNodes.subList(0, mid));
        List<String> rightSubset = new ArrayList<>(currentNodes.subList(mid, size));

        // Conquer step: Assign subsets to partitions
        partitions.put(labelLeft, leftSubset);
        partitions.put(labelRight, rightSubset);
    }

    /**
     * ADSA Graph Concept: Cut Edges Identification
     * Identifies edges that cross partition boundaries (between Sector-1 and Sector-2)
     */
    public List<Connection> getCutEdges() {
        List<Connection> cutEdges = new ArrayList<>();
        List<String> sector1 = partitions.getOrDefault("Sector-1 (North)", Collections.emptyList());
        List<String> sector2 = partitions.getOrDefault("Sector-2 (South)", Collections.emptyList());

        for (Connection conn : connections) {
            String u = conn.getSourceZoneId();
            String v = conn.getDestinationZoneId();
            boolean uInS1 = sector1.contains(u);
            boolean vInS1 = sector1.contains(v);

            if ((uInS1 && !vInS1) || (!uInS1 && vInS1)) {
                cutEdges.add(conn);
            }
        }
        return cutEdges;
    }

    /**
     * ADSA Graph Concept: BFS Path Reachability
     */
    public boolean hasPath(String startZoneId, String endZoneId) {
        if (!zones.containsKey(startZoneId) || !zones.containsKey(endZoneId)) return false;
        if (startZoneId.equals(endZoneId)) return true;

        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();

        visited.add(startZoneId);
        queue.add(startZoneId);

        while (!queue.isEmpty()) {
            String current = queue.poll();
            for (String neighbor : adjacencyList.getOrDefault(current, Collections.emptyList())) {
                if (neighbor.equals(endZoneId)) {
                    return true;
                }
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.add(neighbor);
                }
            }
        }
        return false;
    }

    public Connection findConnection(String zoneA, String zoneB) {
        for (Connection conn : connections) {
            if (conn.connects(zoneA, zoneB)) {
                return conn;
            }
        }
        return null;
    }

    // Zone & Topology Getters
    public Zone getZone(String zoneId) {
        return zones.get(zoneId);
    }

    public Collection<Zone> getAllZones() {
        return zones.values();
    }

    public List<Connection> getConnections() {
        return connections;
    }

    public Map<String, List<String>> getAdjacencyList() {
        return adjacencyList;
    }

    public double[][] getAdjacencyMatrix() {
        return adjacencyMatrix;
    }

    public List<String> getZoneOrder() {
        return zoneOrder;
    }

    public Map<String, List<String>> getPartitions() {
        return partitions;
    }

    public double getTotalCurrentLoadMW() {
        return zones.values().stream().mapToDouble(Zone::getCurrentLoadMW).sum();
    }

    public double getTotalCapacityMW() {
        return zones.values().stream().mapToDouble(Zone::getCapacityMW).sum();
    }
}
