import { Zone, Connection } from './types';

export const INITIAL_ZONES: Zone[] = [
  { id: 'A', name: 'Zone A (Downtown Core)', sector: 'Sector-1 (North)', capacityMW: 120.0, currentLoadMW: 110.0, forecastedLoadMW: 113.63, riskLevel: 'CRITICAL_OVERLOAD', substations: 4, x: 140, y: 110 },
  { id: 'B', name: 'Zone B (West Tech Park)', sector: 'Sector-1 (North)', capacityMW: 100.0, currentLoadMW: 55.0, forecastedLoadMW: 56.03, riskLevel: 'NORMAL', substations: 3, x: 310, y: 90 },
  { id: 'C', name: 'Zone C (North Industrial)', sector: 'Sector-1 (North)', capacityMW: 150.0, currentLoadMW: 138.0, forecastedLoadMW: 139.95, riskLevel: 'CRITICAL_OVERLOAD', substations: 5, x: 130, y: 250 },
  { id: 'D', name: 'Zone D (East Residential)', sector: 'Sector-1 (North)', capacityMW: 110.0, currentLoadMW: 62.0, forecastedLoadMW: 63.30, riskLevel: 'NORMAL', substations: 3, x: 320, y: 230 },
  { id: 'E', name: 'Zone E (South Port Basin)', sector: 'Sector-2 (South)', capacityMW: 130.0, currentLoadMW: 80.0, forecastedLoadMW: 81.30, riskLevel: 'NORMAL', substations: 4, x: 510, y: 100 },
  { id: 'F', name: 'Zone F (Metro Suburb)', sector: 'Sector-2 (South)', capacityMW: 90.0, currentLoadMW: 50.0, forecastedLoadMW: 51.30, riskLevel: 'NORMAL', substations: 3, x: 680, y: 90 },
  { id: 'G', name: 'Zone G (Heavy Manufacturing)', sector: 'Sector-2 (South)', capacityMW: 140.0, currentLoadMW: 122.0, forecastedLoadMW: 123.30, riskLevel: 'OVERLOAD_WARNING', substations: 5, x: 500, y: 260 },
  { id: 'H', name: 'Zone H (University Campus)', sector: 'Sector-2 (South)', capacityMW: 120.0, currentLoadMW: 68.0, forecastedLoadMW: 69.30, riskLevel: 'NORMAL', substations: 4, x: 670, y: 250 },
];

export const INITIAL_CONNECTIONS: Connection[] = [
  { id: 'L-AB', source: 'A', destination: 'B', maxTransferLimitMW: 45.0, currentFlowMW: 0.0, isCutEdge: false, lineResistanceOhms: 0.04 },
  { id: 'L-AC', source: 'A', destination: 'C', maxTransferLimitMW: 40.0, currentFlowMW: 0.0, isCutEdge: false, lineResistanceOhms: 0.05 },
  { id: 'L-BD', source: 'B', destination: 'D', maxTransferLimitMW: 35.0, currentFlowMW: 0.0, isCutEdge: false, lineResistanceOhms: 0.06 },
  { id: 'L-CD', source: 'C', destination: 'D', maxTransferLimitMW: 50.0, currentFlowMW: 0.0, isCutEdge: false, lineResistanceOhms: 0.03 },
  // Cut edges between Sector 1 (North) and Sector 2 (South)
  { id: 'L-CG', source: 'C', destination: 'G', maxTransferLimitMW: 60.0, currentFlowMW: 0.0, isCutEdge: true, lineResistanceOhms: 0.02 },
  { id: 'L-DF', source: 'D', destination: 'F', maxTransferLimitMW: 40.0, currentFlowMW: 0.0, isCutEdge: true, lineResistanceOhms: 0.05 },
  // Sector 2 internal edges
  { id: 'L-EF', source: 'E', destination: 'F', maxTransferLimitMW: 35.0, currentFlowMW: 0.0, isCutEdge: false, lineResistanceOhms: 0.04 },
  { id: 'L-EG', source: 'E', destination: 'G', maxTransferLimitMW: 45.0, currentFlowMW: 0.0, isCutEdge: false, lineResistanceOhms: 0.04 },
  { id: 'L-GH', source: 'G', destination: 'H', maxTransferLimitMW: 50.0, currentFlowMW: 0.0, isCutEdge: false, lineResistanceOhms: 0.03 },
  { id: 'L-FH', source: 'F', destination: 'H', maxTransferLimitMW: 35.0, currentFlowMW: 0.0, isCutEdge: false, lineResistanceOhms: 0.05 },
];

export const ADJACENCY_LIST: Record<string, string[]> = {
  A: ['B', 'C'],
  B: ['A', 'D'],
  C: ['A', 'D', 'G'],
  D: ['B', 'C', 'F'],
  E: ['F', 'G'],
  F: ['D', 'E', 'H'],
  G: ['C', 'E', 'H'],
  H: ['F', 'G'],
};

// 8x8 Adjacency Matrix representing transmission capacities (MW)
export const ADJACENCY_MATRIX = [
  // A   B   C   D   E   F   G   H
  [  0, 45, 40,  0,  0,  0,  0,  0], // A
  [ 45,  0,  0, 35,  0,  0,  0,  0], // B
  [ 40,  0,  0, 50,  0,  0, 60,  0], // C
  [  0, 35, 50,  0,  0, 40,  0,  0], // D
  [  0,  0,  0,  0,  0, 35, 45,  0], // E
  [  0,  0,  0, 40, 35,  0,  0, 35], // F
  [  0,  0, 60,  0, 45,  0,  0, 50], // G
  [  0,  0,  0,  0,  0, 35, 50,  0], // H
];
