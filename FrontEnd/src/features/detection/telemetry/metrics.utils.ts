export function getAlertnessColor(score: number): string {
  if (score >= 80) return "#22c55e";   // Green
  if (score >= 50) return "#facc15";   // Yellow
  return "#ef4444";                    // Red
}

export function getAlertnessLabel(score: number): string {
  if (score >= 80) return "Focused";
  if (score >= 50) return "Neutral";
  return "Sleepy";
}

export function smoothValue(prev: number, next: number, alpha = 0.3) {
  return prev * (1 - alpha) + next * alpha;
}
