// ─── Types ────────────────────────────────────────────────────────────────

export interface ReactionTimePoint {
  studyTime: number;
  reactionTime: number;
}

export interface BlinkRatePoint {
  studyTime: number;
  blinkRate: number;
}

export interface BrightnessAlertnessPoint {
  brightness: number;
  alertness: number;
}

export interface TemperatureAlertnessPoint {
  temperature: number;
  alertness: number;
}

export interface PeriodAlertnessPoint {
  period: string;
  alertness: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────

/** Reaction time increases with study duration (fatigue effect) */
export const reactionTimeData: ReactionTimePoint[] = [
  { studyTime: 0, reactionTime: 0.22 },
  { studyTime: 10, reactionTime: 0.25 },
  { studyTime: 20, reactionTime: 0.28 },
  { studyTime: 30, reactionTime: 0.33 },
  { studyTime: 40, reactionTime: 0.38 },
  { studyTime: 50, reactionTime: 0.45 },
  { studyTime: 60, reactionTime: 0.55 },
  { studyTime: 70, reactionTime: 0.62 },
  { studyTime: 80, reactionTime: 0.72 },
  { studyTime: 90, reactionTime: 0.85 },
  { studyTime: 100, reactionTime: 0.95 },
  { studyTime: 110, reactionTime: 1.05 },
  { studyTime: 120, reactionTime: 1.15 },
];

/** Blink rate increases with study duration */
export const blinkRateData: BlinkRatePoint[] = [
  { studyTime: 0, blinkRate: 10 },
  { studyTime: 10, blinkRate: 10.5 },
  { studyTime: 20, blinkRate: 11.2 },
  { studyTime: 30, blinkRate: 11.8 },
  { studyTime: 40, blinkRate: 12.5 },
  { studyTime: 50, blinkRate: 13.0 },
  { studyTime: 60, blinkRate: 13.8 },
  { studyTime: 70, blinkRate: 14.5 },
  { studyTime: 80, blinkRate: 15.0 },
  { studyTime: 90, blinkRate: 15.5 },
  { studyTime: 100, blinkRate: 16.0 },
  { studyTime: 110, blinkRate: 16.5 },
  { studyTime: 120, blinkRate: 17.0 },
];

/** Alertness rises with brightness, peaks at 600-800 lux, then drops slightly */
export const brightnessAlertnessData: BrightnessAlertnessPoint[] = [
  { brightness: 0, alertness: 30 },
  { brightness: 100, alertness: 42 },
  { brightness: 200, alertness: 55 },
  { brightness: 300, alertness: 65 },
  { brightness: 400, alertness: 74 },
  { brightness: 500, alertness: 82 },
  { brightness: 600, alertness: 90 },
  { brightness: 700, alertness: 93 },
  { brightness: 800, alertness: 91 },
  { brightness: 900, alertness: 85 },
  { brightness: 1000, alertness: 80 },
];

/** Alertness forms a bell curve peaking at 68-72°F */
export const temperatureAlertnessData: TemperatureAlertnessPoint[] = [
  { temperature: 60, alertness: 45 },
  { temperature: 62, alertness: 55 },
  { temperature: 64, alertness: 65 },
  { temperature: 66, alertness: 78 },
  { temperature: 68, alertness: 90 },
  { temperature: 70, alertness: 95 },
  { temperature: 72, alertness: 92 },
  { temperature: 74, alertness: 82 },
  { temperature: 76, alertness: 70 },
  { temperature: 78, alertness: 58 },
  { temperature: 80, alertness: 48 },
];

/** Alertness by time of day: morning highest, night lowest */
export const periodAlertnessData: PeriodAlertnessPoint[] = [
  { period: 'Morning', alertness: 88 },
  { period: 'Afternoon', alertness: 72 },
  { period: 'Evening', alertness: 55 },
  { period: 'Night', alertness: 38 },
];
