// Seed data: items, profiles, plates, food nutrition table

export type Shelf = 'shelf1' | 'shelf2' | 'shelf3' | 'door' | 'crisper' | 'medicine';
export type Category = 'cooked' | 'dairy' | 'raw' | 'egg' | 'produce' | 'medicine' | 'hot';

export interface FoodItem {
  id: string;
  name: string;
  label: string; // display label for UI
  shelf: Shelf;
  x: number; // cm from left on 60cm wide shelf
  y: number; // cm from front on 40cm deep shelf
  massGross: number; // grams including container
  containerMass: number; // grams of container alone
  category: Category;
  kcalPer100g: number;
  proteinPer100g: number; // grams
  fatPer100g: number;
  carbsPer100g: number;
  fibrePer100g: number;
  isSteel: boolean; // steel dabba
  spoilageHours: number; // hours until spoiled at 4C
  tempBehaviour: 'stable' | 'cooling' | 'fermenting' | 'spoiling';
  initialTemp: number; // C
  addedAt: number; // sim seconds from epoch
  notes?: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  initial: string; // for avatar
  color: string;
  tint: string;
  kcalTarget: number;
  proteinTarget: number; // g
  fatTarget: number; // g
  carbsTarget: number; // g
  fibreTarget: number; // g
  ironTarget: number; // mg
  calciumTarget: number; // mg
  b12Target: number; // mcg
  waterTarget: number; // ml
}

export interface Plate {
  id: string;
  name: string;
  diameterCm: number;
  type: 'plate' | 'bowl';
}

export const CATEGORY_COLORS: Record<string, { label: string; color: string; borderClass: string }> = {
  cooked: { label: 'Cooked dishes', color: '#B5483A', borderClass: 'cat-border-cooked' },
  dairy: { label: 'Dairy', color: '#5C7A8C', borderClass: 'cat-border-dairy' },
  produce: { label: 'Produce', color: '#2F6F5E', borderClass: 'cat-border-produce' },
  eggs: { label: 'Eggs', color: '#B7791F', borderClass: 'cat-border-eggs' },
  egg: { label: 'Eggs', color: '#B7791F', borderClass: 'cat-border-eggs' },
  ferment: { label: 'Batter / ferment', color: '#8A6D2F', borderClass: 'cat-border-ferment' },
  medicine: { label: 'Medicine', color: '#6E4A5B', borderClass: 'cat-border-medicine' },
  raw: { label: 'Raw ingredients', color: '#5A8A4A', borderClass: 'cat-border-produce' },
  hot: { label: 'Hot food', color: '#B5483A', borderClass: 'cat-border-cooked' },
};

export const ZONE_META: Record<Shelf, { label: string; color: string; tint: string; border: string; tempTarget: string }> = {
  shelf3: { label: 'Shelf 3', color: '#5C7A8C', tint: '#DCE5EA', border: '#5C7A8C', tempTarget: '3.5–4.5 °C' },
  shelf2: { label: 'Shelf 2', color: '#1F5F6B', tint: '#D6E6E9', border: '#1F5F6B', tempTarget: '4.0–5.0 °C' },
  shelf1: { label: 'Shelf 1', color: '#8A6D2F', tint: '#EBE1C6', border: '#8A6D2F', tempTarget: '4.5–5.5 °C' },
  door: { label: 'Door bin', color: '#B7791F', tint: '#F5E7C8', border: '#B7791F', tempTarget: '5.0–7.0 °C' },
  crisper: { label: 'Crisper drawer', color: '#2F6F5E', tint: '#DDEBE5', border: '#2F6F5E', tempTarget: '3.0–4.0 °C' },
  medicine: { label: 'Medicine zone', color: '#6E4A5B', tint: '#E7DCE2', border: '#6E4A5B', tempTarget: '2.0–8.0 °C' },
};

// SIM_START: Thursday 6:40 pm = 18*3600 + 40*60 = 67200 sec since midnight
export const SIM_START_EPOCH = 67200; // seconds from midnight Thursday

export const PROFILES: Profile[] = [
  {
    id: 'anita',
    name: 'Anita',
    age: 45,
    initial: 'A',
    color: '#1F5F6B',
    tint: '#D6E6E9',
    kcalTarget: 1800,
    proteinTarget: 55,
    fatTarget: 60,
    carbsTarget: 250,
    fibreTarget: 25,
    ironTarget: 18,
    calciumTarget: 1000,
    b12Target: 2.4,
    waterTarget: 2000,
  },
  {
    id: 'ravi',
    name: 'Ravi',
    age: 50,
    initial: 'R',
    color: '#3A5675',
    tint: '#D8E2EC',
    kcalTarget: 2000,
    proteinTarget: 65,
    fatTarget: 65,
    carbsTarget: 280,
    fibreTarget: 30,
    ironTarget: 8,
    calciumTarget: 1000,
    b12Target: 2.4,
    waterTarget: 2500,
  },
  {
    id: 'meera',
    name: 'Meera',
    age: 14,
    initial: 'M',
    color: '#926C15',
    tint: '#F2E7CD',
    kcalTarget: 2000,
    proteinTarget: 58,
    fatTarget: 65,
    carbsTarget: 290,
    fibreTarget: 26,
    ironTarget: 15,
    calciumTarget: 1300,
    b12Target: 2.4,
    waterTarget: 2300,
  },
  {
    id: 'dadu',
    name: 'Dadu',
    age: 72,
    initial: 'D',
    color: '#6E4A5B',
    tint: '#E7DCE2',
    kcalTarget: 1700,
    proteinTarget: 60,
    fatTarget: 55,
    carbsTarget: 230,
    fibreTarget: 21,
    ironTarget: 8,
    calciumTarget: 1200,
    b12Target: 2.4,
    waterTarget: 2000,
  },
];

export const PLATES: Plate[] = [
  { id: 'plate1', name: 'Steel plate 1', diameterCm: 26, type: 'plate' },
  { id: 'plate2', name: 'Steel plate 2', diameterCm: 26, type: 'plate' },
  { id: 'bowl1', name: 'Steel bowl 1', diameterCm: 18, type: 'bowl' },
  { id: 'bowl2', name: 'Steel bowl 2', diameterCm: 18, type: 'bowl' },
];

export const SEED_ITEMS: FoodItem[] = [
  {
    id: 'dal',
    name: 'Dal',
    label: 'Dal, steel container',
    shelf: 'shelf2',
    x: 12,
    y: 20,
    massGross: 820,
    containerMass: 250,
    category: 'cooked',
    kcalPer100g: 100,
    proteinPer100g: 7,
    fatPer100g: 3,
    carbsPer100g: 15,
    fibrePer100g: 2.5,
    isSteel: true,
    spoilageHours: 72,
    tempBehaviour: 'stable',
    initialTemp: 4.2,
    addedAt: 0,
    notes: 'Toor dal, cooked',
  },
  {
    id: 'rice',
    name: 'Rice',
    label: 'Rice (cooked), steel container',
    shelf: 'shelf2',
    x: 32,
    y: 20,
    massGross: 640,
    containerMass: 200,
    category: 'cooked',
    kcalPer100g: 130,
    proteinPer100g: 2.7,
    fatPer100g: 0.3,
    carbsPer100g: 28,
    fibrePer100g: 0.4,
    isSteel: true,
    spoilageHours: 48,
    tempBehaviour: 'stable',
    initialTemp: 4.0,
    addedAt: 0,
  },
  {
    id: 'curry',
    name: 'Mixed veg curry',
    label: 'Mixed veg curry, steel container',
    shelf: 'shelf2',
    x: 48,
    y: 15,
    massGross: 510,
    containerMass: 200,
    category: 'cooked',
    kcalPer100g: 90,
    proteinPer100g: 2.5,
    fatPer100g: 5,
    carbsPer100g: 10,
    fibrePer100g: 2,
    isSteel: true,
    spoilageHours: 60,
    tempBehaviour: 'stable',
    initialTemp: 4.1,
    addedAt: 0,
  },
  {
    id: 'paneer',
    name: 'Paneer',
    label: 'Paneer, steel container',
    shelf: 'shelf3',
    x: 20,
    y: 18,
    massGross: 300,
    containerMass: 150,
    category: 'dairy',
    kcalPer100g: 265,
    proteinPer100g: 18.3,
    fatPer100g: 20,
    carbsPer100g: 3,
    fibrePer100g: 0,
    isSteel: true,
    spoilageHours: 96,
    tempBehaviour: 'stable',
    initialTemp: 3.8,
    addedAt: 0,
  },
  {
    id: 'milk',
    name: 'Milk',
    label: 'Milk, 1 L carton',
    shelf: 'door',
    x: 10,
    y: 10,
    massGross: 1060,
    containerMass: 60,
    category: 'dairy',
    kcalPer100g: 60,
    proteinPer100g: 3.2,
    fatPer100g: 3.5,
    carbsPer100g: 4.7,
    fibrePer100g: 0,
    isSteel: false,
    spoilageHours: 120,
    tempBehaviour: 'spoiling',
    initialTemp: 5.5, // door is warmer
    addedAt: 0,
  },
  {
    id: 'curd',
    name: 'Curd',
    label: 'Curd, bowl',
    shelf: 'shelf1',
    x: 14,
    y: 20,
    massGross: 450,
    containerMass: 80,
    category: 'dairy',
    kcalPer100g: 60,
    proteinPer100g: 3.5,
    fatPer100g: 3.2,
    carbsPer100g: 4.7,
    fibrePer100g: 0,
    isSteel: false,
    spoilageHours: 144,
    tempBehaviour: 'fermenting',
    initialTemp: 4.0,
    addedAt: -7200, // added 2h before sim start
  },
  {
    id: 'batter',
    name: 'Idli batter',
    label: 'Idli batter, tall container',
    shelf: 'shelf1',
    x: 36,
    y: 18,
    massGross: 1200,
    containerMass: 150,
    category: 'cooked',
    kcalPer100g: 68,
    proteinPer100g: 2.2,
    fatPer100g: 0.4,
    carbsPer100g: 14,
    fibrePer100g: 0.5,
    isSteel: false,
    spoilageHours: 36, // ferments, then should be used
    tempBehaviour: 'fermenting',
    initialTemp: 4.2,
    addedAt: -18000, // added 5h before sim start (fermenting)
  },
  {
    id: 'eggs',
    name: 'Eggs',
    label: 'Eggs, tray of 12',
    shelf: 'door',
    x: 30,
    y: 10,
    massGross: 720,
    containerMass: 80,
    category: 'egg',
    kcalPer100g: 143,
    proteinPer100g: 12.6,
    fatPer100g: 9.5,
    carbsPer100g: 0.7,
    fibrePer100g: 0,
    isSteel: false,
    spoilageHours: 720, // 30 days
    tempBehaviour: 'stable',
    initialTemp: 5.2,
    addedAt: -172800, // 2 days old
  },
  {
    id: 'greens',
    name: 'Leafy greens',
    label: 'Leafy greens, bag',
    shelf: 'crisper',
    x: 15,
    y: 20,
    massGross: 280,
    containerMass: 10,
    category: 'produce',
    kcalPer100g: 23,
    proteinPer100g: 2.9,
    fatPer100g: 0.4,
    carbsPer100g: 3.4,
    fibrePer100g: 2.1,
    isSteel: false,
    spoilageHours: 72,
    tempBehaviour: 'spoiling',
    initialTemp: 3.5,
    addedAt: -86400, // 1 day old
  },
  {
    id: 'tomatoes',
    name: 'Tomatoes and onions',
    label: 'Tomatoes, onions',
    shelf: 'crisper',
    x: 40,
    y: 20,
    massGross: 900,
    containerMass: 0,
    category: 'produce',
    kcalPer100g: 30, // average
    proteinPer100g: 0.9,
    fatPer100g: 0.2,
    carbsPer100g: 6,
    fibrePer100g: 1.2,
    isSteel: false,
    spoilageHours: 168,
    tempBehaviour: 'stable',
    initialTemp: 3.8,
    addedAt: -43200,
  },
  {
    id: 'chicken',
    name: 'Cooked chicken',
    label: 'Cooked chicken (hot)',
    shelf: 'shelf3',
    x: 42,
    y: 20,
    massGross: 480,
    containerMass: 120,
    category: 'hot',
    kcalPer100g: 165,
    proteinPer100g: 31,
    fatPer100g: 3.6,
    carbsPer100g: 0,
    fibrePer100g: 0,
    isSteel: false,
    spoilageHours: 96,
    tempBehaviour: 'cooling',
    initialTemp: 62,
    addedAt: 0, // placed at sim start
  },
  {
    id: 'insulin1',
    name: 'Insulin pens',
    label: 'Insulin pens ×2',
    shelf: 'medicine',
    x: 10,
    y: 10,
    massGross: 40,
    containerMass: 0,
    category: 'medicine',
    kcalPer100g: 0,
    proteinPer100g: 0,
    fatPer100g: 0,
    carbsPer100g: 0,
    fibrePer100g: 0,
    isSteel: false,
    spoilageHours: 8760, // year
    tempBehaviour: 'stable',
    initialTemp: 4.0,
    addedAt: -604800,
    notes: 'Permitted range 2–8 °C',
  },
  {
    id: 'insulin2',
    name: 'Insulin vial',
    label: 'Insulin vial',
    shelf: 'medicine',
    x: 25,
    y: 10,
    massGross: 15,
    containerMass: 0,
    category: 'medicine',
    kcalPer100g: 0,
    proteinPer100g: 0,
    fatPer100g: 0,
    carbsPer100g: 0,
    fibrePer100g: 0,
    isSteel: false,
    spoilageHours: 8760,
    tempBehaviour: 'stable',
    initialTemp: 3.8,
    addedAt: -604800,
    notes: 'Permitted range 2–8 °C',
  },
];

// Specific heat by category (J/g·°C approx)
export const SPECIFIC_HEAT: Record<Category, number> = {
  cooked: 3.5,
  dairy: 3.9,
  raw: 3.6,
  egg: 3.3,
  produce: 3.9,
  medicine: 3.5,
  hot: 3.5,
};

// Tariff bands (hour, end exclusive)
export interface TariffBand {
  start: number; // hour of day 0-23
  end: number;
  label: string;
  ratePerUnit: number; // INR/kWh (illustrative)
  colour: string;
}

export const TARIFF_BANDS: TariffBand[] = [
  { start: 0, end: 6, label: 'Off-peak', ratePerUnit: 3.5, colour: '#5C7A8C' },
  { start: 6, end: 10, label: 'Peak', ratePerUnit: 7.2, colour: '#C8571B' },
  { start: 10, end: 17, label: 'Mid', ratePerUnit: 5.0, colour: '#B5834A' },
  { start: 17, end: 22, label: 'Peak', ratePerUnit: 7.2, colour: '#C8571B' },
  { start: 22, end: 24, label: 'Off-peak', ratePerUnit: 3.5, colour: '#5C7A8C' },
];

// 30-day historical intake seed (per profile, per day)
// Day 0 = 30 days ago, day 29 = yesterday
export function generateHistoricalData(profileId: string, days = 30) {
  const seed: Record<string, number[][]> = {
    anita: Array.from({ length: days }, (_, i) => [
      1650 + Math.sin(i * 0.7) * 120,  // kcal
      48 + Math.sin(i * 0.5) * 6,       // protein g
      55 + Math.sin(i * 0.4) * 8,       // fat g
      230 + Math.sin(i * 0.6) * 20,     // carbs g
      22 + Math.sin(i * 0.3) * 4,       // fibre g
      16 + Math.sin(i * 0.2) * 2,       // iron mg
      850 + Math.sin(i * 0.8) * 100,    // calcium mg
      1.8 + Math.sin(i * 0.6) * 0.5,   // B12 mcg
      1600 + Math.sin(i * 0.4) * 200,  // water ml
    ]),
    ravi: Array.from({ length: days }, (_, i) => [
      1950 + Math.sin(i * 0.6) * 150,
      60 + Math.sin(i * 0.7) * 8,
      62 + Math.sin(i * 0.5) * 10,
      270 + Math.sin(i * 0.4) * 25,
      27 + Math.sin(i * 0.3) * 5,
      7 + Math.sin(i * 0.2) * 1,
      900 + Math.sin(i * 0.9) * 120,
      2.0 + Math.sin(i * 0.5) * 0.4,
      2200 + Math.sin(i * 0.6) * 300,
    ]),
    meera: Array.from({ length: days }, (_, i) => [
      1850 + Math.sin(i * 0.8) * 130,
      52 + Math.sin(i * 0.6) * 7,
      60 + Math.sin(i * 0.4) * 9,
      265 + Math.sin(i * 0.5) * 22,
      24 + Math.sin(i * 0.3) * 4,
      13 + Math.sin(i * 0.2) * 2,
      1100 + Math.sin(i * 0.7) * 150,
      1.9 + Math.sin(i * 0.4) * 0.4,
      2000 + Math.sin(i * 0.5) * 250,
    ]),
    dadu: Array.from({ length: days }, (_, i) => [
      1600 + Math.sin(i * 0.5) * 100,
      55 + Math.sin(i * 0.4) * 7,
      50 + Math.sin(i * 0.3) * 8,
      215 + Math.sin(i * 0.6) * 18,
      19 + Math.sin(i * 0.2) * 3,
      7 + Math.sin(i * 0.1) * 1,
      1050 + Math.sin(i * 0.8) * 130,
      1.7 + Math.sin(i * 0.5) * 0.6,
      1700 + Math.sin(i * 0.4) * 200,
    ]),
  };
  return seed[profileId] || seed['anita'];
}
