/**
 * Recent Vehicles — localStorage helpers for the MotorHelloEntry conversational
 * entry screen. Tracks the last 3 vehicles a user has looked at (post vehicle-
 * confirmation step) and detects which contextual opening script to show.
 */

export interface RecentVehicle {
  make: string;
  model: string;
  variant?: string;
  vehicleType: 'car' | 'bike';
  registrationNumber?: string;
  brandLogoUrl?: string;   // e.g. /logos/Suzuki.svg
  expiryDate?: string;     // ISO — presence within 60 days triggers renewal script
  savedAt: string;         // ISO
}

export type EntryState =
  | { type: 'renewal_pending'; vehicle: RecentVehicle; daysLeft: number }
  | { type: 'has_history';     vehicles: RecentVehicle[] }
  | { type: 'fresh' };

const STORAGE_KEY = 'acko_motor_recent_vehicles';
const MAX_RECENT  = 3;

// ── Read / Write ──────────────────────────────────────────────────────────────

function readAll(): RecentVehicle[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Prepend a new vehicle, dedupe by make+model, keep last MAX_RECENT */
export function saveRecentVehicle(v: Omit<RecentVehicle, 'savedAt'>): void {
  const existing = readAll().filter(
    (r) => !(r.make === v.make && r.model === v.model)
  );
  const next: RecentVehicle[] = [
    { ...v, savedAt: new Date().toISOString() },
    ...existing,
  ].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** Overwrite the entire list — used when a profile scenario is seeded */
export function seedRecentVehicles(vehicles: RecentVehicle[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles.slice(0, MAX_RECENT)));
}

export function getRecentVehicles(): RecentVehicle[] {
  return readAll();
}

export function clearRecentVehicles(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ── State detection ───────────────────────────────────────────────────────────

export function detectEntryState(vehicles: RecentVehicle[]): EntryState {
  if (vehicles.length === 0) return { type: 'fresh' };

  for (const v of vehicles) {
    if (!v.expiryDate) continue;
    const daysLeft = Math.ceil(
      (new Date(v.expiryDate).getTime() - Date.now()) / 86_400_000
    );
    if (daysLeft > 0 && daysLeft <= 60) {
      return { type: 'renewal_pending', vehicle: v, daysLeft };
    }
  }

  return { type: 'has_history', vehicles };
}

// ── Brand logo helper ─────────────────────────────────────────────────────────

const LOGO_MAP: Record<string, string> = {
  maruti:       '/logos/Suzuki.svg',
  suzuki:       '/logos/Suzuki.svg',
  hyundai:      '/logos/Hyundai.svg',
  tata:         '/logos/TATA.svg',
  honda:        '/logos/Honda.svg',
  toyota:       '/logos/Toyota.svg',
  mahindra:     '/logos/Mahindra.svg',
  kia:          '/logos/Kia.svg',
  volkswagen:   '/logos/Volkswagen.svg',
  renault:      '/logos/Renault.svg',
  ford:         '/logos/Ford.svg',
  bajaj:        '/logos/Bajaj.svg',
  hero:         '/logos/Hero.svg',
  tvs:          '/logos/TVS.svg',
  'royal enfield': '/logos/Royal Enfield.svg',
  yamaha:       '/logos/Yamaha.svg',
};

export function getBrandLogoUrl(make: string): string {
  return LOGO_MAP[make.toLowerCase()] ?? '/logos/default_vehicle.svg';
}
