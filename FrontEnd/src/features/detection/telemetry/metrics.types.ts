export interface MetricsPacket {
  alertnessScore: number;   // 0–100
  blinkRate: number;        // blinks per minute
  brightness: number;       // lux
  temperature: number;      // °F
  eyeClosed: number;
  timestamp: string;        // ISO8601
}
