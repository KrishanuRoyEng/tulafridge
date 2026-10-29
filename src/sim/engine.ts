// Simulation engine — pure functions
// All time in seconds from simulation start (0 = Thu 6:40 pm)

import { FoodItem, SPECIFIC_HEAT, SEED_ITEMS } from '../data/items';

// ============================================================
// Time helpers
// ============================================================
export function simTimeToWallClock(simSec: number): string {
  // sim starts at 18:40:00 (67200 sec from midnight)
  const absSeconds = 67200 + simSec;
  const daySeconds = ((absSeconds % 86400) + 86400) % 86400;
  const h = Math.floor(daySeconds / 3600);
  const m = Math.floor((daySeconds % 3600) / 60);
  const s = Math.floor(daySeconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function simTimeToDisplay(simSec: number): string {
  const absSeconds = 67200 + simSec;
  const daySeconds = ((absSeconds % 86400) + 86400) % 86400;
  const h = Math.floor(daySeconds / 3600);
  const m = Math.floor((daySeconds % 3600) / 60);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function simDayOfWeek(simSec: number): string {
  const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
  const absSeconds = 67200 + simSec;
  const dayIndex = Math.floor(absSeconds / 86400) % 7;
  return days[((dayIndex % 7) + 7) % 7];
}

export function simDayDate(simSec: number): string {
  const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
  const dates = [30, 31, 1, 2, 3, 4, 5]; // Oct 30, Oct 31, Nov 1...
  const months = ['Oct', 'Oct', 'Nov', 'Nov', 'Nov', 'Nov', 'Nov'];
  const absSeconds = 67200 + simSec;
  const dayIndex = Math.floor(absSeconds / 86400) % 7;
  const idx = ((dayIndex % 7) + 7) % 7;
  return `${days[idx]} ${dates[idx]} ${months[idx]}`;
}

export function hourOfDay(simSec: number): number {
  const absSeconds = 67200 + simSec;
  const daySeconds = ((absSeconds % 86400) + 86400) % 86400;
  return daySeconds / 3600;
}

// ============================================================
// Cabinet model
// ============================================================
export const CABINET = {
  ambientTemp: 28, // °C outside
  setPoint: 4,     // °C target
  massKg: 12,      // cabinet thermal mass (kg equiv)
  specificHeat: 800, // J/kg·K
};

// Base temperature at different zones
export function zoneTemp(zone: FoodItem['shelf'], simSec: number, state: SimState): number {
  const base = state.cabinetTemp;
  const offsets: Record<string, number> = {
    shelf1: 0.2,
    shelf2: -0.1,
    shelf3: 0.3,
    door: 1.5,   // door bin is warmer
    crisper: -0.3,
    medicine: -0.5, // coldest zone
  };
  return base + (offsets[zone] ?? 0);
}

// ============================================================
// Item temperature
// ============================================================
export function itemTemp(item: FoodItem, simSec: number, state: SimState): number {
  const zt = zoneTemp(item.shelf, simSec, state);
  if (item.tempBehaviour === 'cooling') {
    // Hot food cooling: exponential with tau ~4500 s (~75 min to reach near cabinet temp)
    const elapsed = simSec - Math.max(0, item.addedAt);
    const tau = 4500;
    const T0 = item.initialTemp;
    return zt + (T0 - zt) * Math.exp(-elapsed / tau);
  }
  return zt + (item.initialTemp - (item.shelf === 'door' ? 5.5 : 4.0)) * 0.05;
}

// Simpler version used directly:
export function computeItemTemp(item: FoodItem, simSec: number, cabinetTemp: number, doorOpenSeconds: number): number {
  const offsets: Record<string, number> = {
    shelf1: 0.2,
    shelf2: -0.1,
    shelf3: 0.3,
    door: 1.5,
    crisper: -0.3,
    medicine: -0.5,
  };
  const doorEffect = Math.max(0, Math.exp(-doorOpenSeconds / 300) * -1 + 1) * offsets['door'] * 0.5;
  const baseZoneTemp = cabinetTemp + (offsets[item.shelf] ?? 0) + doorEffect;

  if (item.tempBehaviour === 'cooling') {
    const elapsed = Math.max(0, simSec - item.addedAt);
    const tau = 4500;
    return baseZoneTemp + (item.initialTemp - baseZoneTemp) * Math.exp(-elapsed / tau);
  }
  return baseZoneTemp;
}

// ============================================================
// Spoilage / remaining life
// ============================================================
// Deterioration doubles every 7°C (Q10 = 2)
// At 4°C, rate = 1/spoilageHours
// Integrate over history steps
export function computeRemainingLife(
  item: FoodItem,
  simSec: number,
  cabinetTemp: number
): { fractionUsed: number; hoursRemaining: number } {
  const ageHours = (simSec - item.addedAt) / 3600;
  const avgTemp = cabinetTemp + (item.shelf === 'door' ? 1.5 : item.shelf === 'medicine' ? -0.5 : 0);
  // Temperature-accelerated rate
  const refTemp = 4;
  const q10factor = Math.pow(2, (avgTemp - refTemp) / 7);
  const effectiveHoursUsed = ageHours * q10factor;
  const fractionUsed = Math.min(1, effectiveHoursUsed / item.spoilageHours);
  const hoursRemaining = Math.max(0, (item.spoilageHours - effectiveHoursUsed) / q10factor);
  return { fractionUsed, hoursRemaining };
}

export function remainingLifeLabel(
  item: FoodItem,
  simSec: number,
  cabinetTemp: number
): string {
  const { hoursRemaining } = computeRemainingLife(item, simSec, cabinetTemp);
  if (hoursRemaining <= 0) return 'Discard';
  const absEnd = 67200 + simSec + hoursRemaining * 3600;
  const daySeconds = ((absEnd % 86400) + 86400) % 86400;
  const h = Math.floor(daySeconds / 3600);
  const m = Math.floor((daySeconds % 3600) / 60);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
  const dayIdx = Math.floor(absEnd / 86400) % 7;
  return `Use by ${days[((dayIdx % 7) + 7) % 7]} ${h12}${m > 0 ? ':' + m.toString().padStart(2, '0') : ''} ${ampm}`;
}

export function itemStatus(fractionUsed: number): 'In range' | 'Use first' | 'Discard' {
  if (fractionUsed >= 1) return 'Discard';
  if (fractionUsed >= 0.75) return 'Use first';
  return 'In range';
}

// ============================================================
// Fermentation model
// ============================================================
export function batterFillFraction(item: FoodItem, simSec: number): number {
  // Batter ferments: CO2 causes expansion; peaks at ~8h at room temp,
  // but in fridge at 4°C it's much slower (~50h to peak)
  const elapsed = simSec - item.addedAt;
  const peakTime = 50 * 3600; // 50 hours
  const fraction = Math.min(0.85, 0.55 + 0.30 * (elapsed / peakTime));
  return fraction;
}

export function batterReadyTime(item: FoodItem, simSec: number): number {
  // "Ready" at 0.72 fraction; hours remaining
  const current = batterFillFraction(item, simSec);
  if (current >= 0.72) return 0;
  const peakTime = 50 * 3600;
  const target = 0.72;
  const targetElapsed = ((target - 0.55) / 0.30) * peakTime;
  const elapsed = simSec - item.addedAt;
  return Math.max(0, (targetElapsed - elapsed) / 3600);
}

export function batterReady(item: FoodItem, simSec: number): boolean {
  return batterFillFraction(item, simSec) >= 0.72;
}

// ============================================================
// Load cell centroid
// ============================================================
// Shelf: 60cm wide, 40cm deep
// Load cells at corners: TL(0,0), TR(60,0), BL(0,40), BR(60,40)
export interface LoadCellReadings {
  tl: number; fl: number; // front-left = tl for our layout
  tr: number; fr: number; // front-right = tr
  bl: number; rl: number; // rear-left = bl
  br: number; rr: number; // rear-right = br
}

export function computeCentroid(
  cells: { tl: number; tr: number; bl: number; br: number }
): { x: number; y: number } {
  const total = cells.tl + cells.tr + cells.bl + cells.br;
  if (total <= 0) return { x: 30, y: 20 };
  const x = (cells.tr * 60 + cells.br * 60) / total; // weighted right
  const y = (cells.bl * 40 + cells.br * 40) / total; // weighted rear
  return { x: Math.round(x), y: Math.round(y) };
}

export function itemLoadCells(
  item: FoodItem
): { tl: number; tr: number; bl: number; br: number } {
  // Distribute mass based on position
  const { x, y, massGross } = item;
  const W = 60, D = 40;
  // Bilinear interpolation
  const tl = massGross * ((W - x) / W) * ((D - y) / D);
  const tr = massGross * (x / W) * ((D - y) / D);
  const bl = massGross * ((W - x) / W) * (y / D);
  const br = massGross * (x / W) * (y / D);
  return { tl, tr, bl, br };
}

// ============================================================
// Portion allocation
// ============================================================
// member mass = measured total * (member volume / sum of volumes)
export function allocatePortion(
  totalMassG: number,
  volumes: number[] // in litres
): number[] {
  const sum = volumes.reduce((a, b) => a + b, 0);
  if (sum <= 0) return volumes.map(() => 0);
  return volumes.map(v => Math.round(totalMassG * v / sum));
}
// e.g. allocatePortion(410, [0.30, 0.15]) => [273, 137]

// ============================================================
// Thermal capacity and power cut
// ============================================================
export function thermalCapacity(items: FoodItem[]): number {
  // J/°C
  const cabinetCap = CABINET.massKg * 1000 * CABINET.specificHeat / 1000; // approximate
  const foodCap = items.reduce((sum, item) => {
    const sh = SPECIFIC_HEAT[item.category] || 3.5;
    return sum + (item.massGross / 1000) * sh * 1000;
  }, 0);
  return cabinetCap + foodCap;
}

export function preCoolingDepth(
  capacityJ: number,
  outageDurationH: number,
  ambientTemp: number,
  setPoint: number
): { preCoolSetPoint: number; preCoolStartBeforeH: number } {
  // How far to pre-cool and how early to start
  // Thermal leak rate (illustrative): 0.8 W/°C
  const leakRate = 0.8; // W/°C
  const leakW = leakRate * (ambientTemp - setPoint);
  // Energy stored per degree of pre-cooling
  const energyPerDegreeJ = capacityJ;
  // During outage, temperature rises at dT/dt = leakRate * (ambient - T) / cap
  // Simple: preCool to reduce starting temp so it stays below 8°C
  const safeLimit = 8;
  const maxRise = safeLimit - setPoint; // 4°C rise allowed
  const outageEnergyJ = leakW * outageDurationH * 3600;
  const preCoolDepth = Math.min(3, outageEnergyJ / energyPerDegreeJ);
  const preCoolSetPoint = Math.max(1, setPoint - preCoolDepth);
  const preCoolStartBeforeH = Math.min(3, preCoolDepth * capacityJ / (leakW * 3600));
  return { preCoolSetPoint, preCoolStartBeforeH };
}

export function cabinetTempDuringOutage(
  elapsed: number, // seconds into outage
  startTemp: number,
  ambientTemp: number,
  capacityJ: number
): number {
  // Simple exponential rise toward ambient
  const tau = capacityJ / 800; // 800 W/°C approximated
  return ambientTemp - (ambientTemp - startTemp) * Math.exp(-elapsed / tau);
}

// ============================================================
// Energy / compressor
// ============================================================
// Illustrative daily kWh consumption
export const DAILY_KWH = 1.2; // base

export function compressorRunTime(simSec: number): {
  isRunning: boolean;
  nextCycleIn: number; // seconds
  runBlocksToday: Array<{ startH: number; endH: number }>;
} {
  const hour = hourOfDay(simSec);
  // Shifted schedule: prefer off-peak (0-6h and 22-24h)
  // Normal unshifted: every ~2h, 20 min run
  const shiftedBlocks = [
    { startH: 0, endH: 1.5 },
    { startH: 2, endH: 3.5 },
    { startH: 4, endH: 5.5 },
    { startH: 22, endH: 23 },
    { startH: 23, endH: 24 },
  ];
  const isRunning = shiftedBlocks.some(b => hour >= b.startH && hour < b.endH);
  return { isRunning, nextCycleIn: 3600, runBlocksToday: shiftedBlocks };
}

// ============================================================
// Simulation state
// ============================================================
export interface SimState {
  simSec: number;        // current sim time in seconds from start
  cabinetTemp: number;   // °C
  doorOpen: boolean;
  doorOpenDuration: number; // seconds door has been open in current session
  items: FoodItem[];
  powerCut: boolean;
  powerCutStartSec: number;
  powerCutDurationH: number;
  preCooling: boolean;
  removedItem: string | null; // item id being lifted
  removedMass: number;        // grams removed
  returnedMass: number;       // grams returned
  hotFoodAdded: boolean;
  hotFoodAddedAt: number;
  medicineExcursion: boolean;
  medicineExcursionStart: number;
  medicineExcursionEnd: number;
}

export const INITIAL_STATE: SimState = {
  simSec: 0,
  cabinetTemp: 4.0,
  doorOpen: false,
  doorOpenDuration: 0,
  powerCut: false,
  powerCutStartSec: 0,
  powerCutDurationH: 3,
  preCooling: false,
  removedItem: null,
  removedMass: 0,
  returnedMass: 0,
  hotFoodAdded: false,
  hotFoodAddedAt: 0,
  items: SEED_ITEMS,
  medicineExcursion: false,
  medicineExcursionStart: 0,
  medicineExcursionEnd: 0,
};

// Advance simulation
export function advanceSim(state: SimState, deltaSec: number): SimState {
  let cabinetTemp = state.cabinetTemp;
  const newSec = state.simSec + deltaSec;

  if (state.powerCut) {
    const elapsed = newSec - state.powerCutStartSec;
    const cap = thermalCapacity(state.items);
    cabinetTemp = cabinetTempDuringOutage(elapsed, 4.0, CABINET.ambientTemp, cap);

    // Medicine excursion: if cabinet > 8 for > 10 min
    if (cabinetTemp > 8 && !state.medicineExcursion) {
      return {
        ...state,
        simSec: newSec,
        cabinetTemp,
        medicineExcursion: true,
        medicineExcursionStart: newSec,
      };
    }
  } else if (state.preCooling) {
    // Drive toward pre-cool setpoint
    const target = 2.0;
    cabinetTemp = cabinetTemp + (target - cabinetTemp) * Math.min(1, deltaSec / 1800);
  } else {
    // Normal: maintain setpoint with slight variation
    const target = 4.0;
    const noise = Math.sin(newSec / 600) * 0.15;
    cabinetTemp = target + noise;
    // Door open warming
    if (state.doorOpen) {
      cabinetTemp += Math.min(2, state.doorOpenDuration / 120);
    }
  }

  // Update medicine excursion end if temp back in range
  let medExcEnd = state.medicineExcursionEnd;
  if (state.medicineExcursion && cabinetTemp <= 8 && medExcEnd === 0) {
    medExcEnd = newSec;
  }

  return {
    ...state,
    simSec: newSec,
    cabinetTemp: Math.max(cabinetTemp, state.powerCut ? cabinetTemp : 2.0),
    doorOpenDuration: state.doorOpen ? state.doorOpenDuration + deltaSec : 0,
    medicineExcursionEnd: medExcEnd,
  };
}
