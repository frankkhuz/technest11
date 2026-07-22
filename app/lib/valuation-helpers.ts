export function getBatteryDeduction(batteryHealth: number): number {
  if (batteryHealth < 80) return 20;
  if (batteryHealth < 85) return 12;
  if (batteryHealth < 90) return 7;
  if (batteryHealth < 95) return 3;
  return 0;
}
