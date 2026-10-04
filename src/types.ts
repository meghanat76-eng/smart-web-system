export interface Zone {
  id: string;
  name: string;
  sector: string;
  capacityMW: number;
  currentLoadMW: number;
  forecastedLoadMW: number;
  riskLevel: 'NORMAL' | 'OVERLOAD_WARNING' | 'CRITICAL_OVERLOAD';
  substations: number;
  x: number;
  y: number;
}

export interface Connection {
  id: string;
  source: string;
  destination: string;
  maxTransferLimitMW: number;
  currentFlowMW: number;
  isCutEdge: boolean; // ADSA divide-and-conquer cut edge
  lineResistanceOhms: number;
}

export interface LoadTransferRecord {
  id: string;
  source: string;
  destination: string;
  amountMW: number;
  sourceBeforeMW: number;
  sourceAfterMW: number;
  destBeforeMW: number;
  destAfterMW: number;
  status: string;
  reason: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intent?: string;
  suggestions?: string[];
  timestamp: string;
}
