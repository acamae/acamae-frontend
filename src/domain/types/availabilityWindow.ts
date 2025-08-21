export interface AvailabilityWindow {
  dayOfWeek: number; // 0..6 (0=Monday)
  start: string; // HH:mm
  end: string; // HH:mm
}
