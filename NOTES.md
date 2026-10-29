# Tula — Smart Refrigerator & Companion Mobile App

Interactive, front-end-only production demo of Tula, an intelligent appliance tracking items through load cells, internal computer vision, thermal mapping, power outage pre-cooling, and companion mobile telemetry.

## How to Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
- Switch between **Fridge screen** and **Mobile app** via the header link or navigate directly to `/app`.

## Project Structure

```
src/
├── main.tsx, App.tsx         # Routing (/ for fridge scene, /app for mobile app)
├── styles/
│   ├── tokens.css            # 8px grid tokens, colors (#F4F1EA, #1D1F1E, #2F6F5E, #C8571B, #5C7A8C), typography
│   └── global.css            # Base styles, IBM Plex Mono & Schibsted Grotesk font setup
├── data/
│   └── items.ts              # Seed items (12 items across 6 zones), user profiles, plates, 30-day nutrition history
├── sim/
│   ├── engine.ts             # Pure physics/simulation models (centroid, cooling curves, fermentation, thermal capacity)
│   └── store.ts              # Synchronized reactive sim store with external store listeners
├── art/
│   ├── Fridge.tsx            # Hand-drawn flat SVG exterior and interior
│   └── FoodItems.tsx         # Flat vector illustrations (steel dabbas, milk, curd, batter, greens, chicken, insulin, plates, retrofit kit)
├── scene/
│   ├── FridgeScene.tsx       # Landing page with 3D door hinge rotation and 900ms smooth camera zoom
│   └── FridgeScene.css       # Perspective transforms, floor shadow, appliance styling
├── screen/                   # Door screen (16:10 appliance UI)
│   ├── DoorScreen.tsx/css    # Shell with top bar, tab rail, simulated status badges
│   ├── InsideScreen.tsx      # Interior camera view + live item list + nutritional & freshness detail sheet
│   ├── ThermalScreen.tsx     # Canvas-rendered real-time thermal gradient with pointer temperature readout
│   ├── ShelfScreen.tsx       # 4-corner load cell plan view, interactive lift/return, centroid cross calculation
│   ├── FoodSafetyScreen.tsx  # Temperature sparklines, hot food cooling curve, idli batter fermentation, relocate card
│   ├── PowerScreen.tsx       # 3h outage simulation, thermal mass calculation, pre-cooling comparison curves
│   ├── EnergyScreen.tsx      # 24h tariff bands, compressor cycle scheduling, shifting logic
│   ├── MealsScreen.tsx       # Mass-constrained portion allocation (Dal 410g -> 273g / 137g), before/after plate analysis
│   ├── MedicinesScreen.tsx   # Medicine zone monitor (2-8°C permitted range), excursion alerts, client-side CSV export
│   └── DemoControls.tsx      # Simulation clock controls (play/pause/1x/60x/600x), scenario triggers
└── mobile/                   # Companion mobile application
    ├── MobileApp.tsx/css     # Desktop phone frame & mobile full-bleed wrapper
    ├── TodayScreen.tsx       # Attention items, compressor shift, mains status, daily intake progress bars
    ├── FridgeListScreen.tsx  # Shelf-by-shelf inventory with thermal view toggle
    ├── MealsMobileScreen.tsx # 3-step meal camera capture flow and portion verification
    ├── ReportsScreen.tsx     # Daily/Weekly/Monthly segmented nutrition analysis, 30-day consistent telemetry, diet quality score
    ├── MedicinesMobileScreen.tsx # Mobile medicine temperature tracking and CSV export
    └── SettingsScreen.tsx    # 5-step retrofit kit installation flow, data privacy / local wipe, surplus & shopping lists
```

## What Each Tier Delivered

### Tier 1: Core Foundation & Scene
- **Design system & tokens:** Warm off-white `#F4F1EA`, ink `#1D1F1E`, muted green `#2F6F5E`, alert orange `#C8571B`, cold blue-grey `#5C7A8C`, Google Fonts `Schibsted Grotesk` and `IBM Plex Mono` with tabular numerals.
- **Fridge Landing View:** Two-door brushed steel refrigerator with live door screen displaying clock, cabinet temperature, and operational status.
- **Camera Zoom Animation:** 900ms transform zooming from the door screen to a 16:10 appliance interface using `cubic-bezier(.65, 0, .25, 1)`.
- **Door Screen Shell:** Persistent top bar with live clock, internal cabinet temperature, profile switcher, left rail tabs, and footer.
- **Inside (Camera View):** Real-time interior camera view showing food placements across 3 shelves, crisper, door bin, and medicine zone, live item list grouped by shelf, and comprehensive item detail sheet (gross/net mass, macros per 100g, remaining shelf life, spoilage and fermentation status).
- **Simulation Engine & Store:** Clock starting at Thu 6:40 pm with controllable speed (1x, 60x, 600x), deterministic models for shelf-life, zone temperatures, and storage state.

### Tier 2: Interactive Door Screen Modules
- **Shelf Load Cells:** Shelf 2 plan view with 4 corner load cells. Lifting an item animates it off the shelf, recalculates the weighted centroid position `(x = Σ(Δf·x)/ΣΔf)`, draws the centroid cross with analysis bounding box, and records the event in the interactive log. Returning the item computes consumed mass. Refill and unreturned alerts are supported.
- **Thermal Canvas:** 2D canvas computing real-time temperature heatmaps using a thermal ramp (black -> purple -> red -> orange -> yellow -> white) with pointer temperature hover inspection, item heat blobs, and scenario toggles ("Now", "Door open 60s", "Power cut 2h").
- **Food Safety:** Item temperature histories, hot food cooling curve (62°C chicken cooling exponentially to 5°C), idli batter fermentation tracking with fill line, and relocation suggestions.
- **Power Outage Pre-Cooling:** Thermal capacity calculated from item mass and specific heat capacities `(Σ m·c)`. Evaluates pre-cooling depth and shows with vs. without pre-cooling curves during a 3-hour power outage.
- **Energy Tariff Scheduling:** 24-hour tariff band visualization and intelligent compressor schedule shift into off-peak windows.
- **Mass-Constrained Meals:** Portion allocation dividing measured removal mass (410g dal) proportionally by estimated plate volumes (0.30L / 0.15L -> 273g / 137g). Side-by-side comparison of "Photo only" vs. "With fridge weight".
- **Medicine Zone:** Insulin pen & vial tracking within strict 2-8°C limits, excursion tracking during outages, and live browser CSV download.
- **Demo Controls Drawer:** Retractable bottom tray with clock controls, instant scenario injections, and simulation reset.

### Tier 3: 3D Door Open, Mobile Companion, and Setup Flow
- **3D Door Hinge Animation:** "Open door" button rotates the upper door 100 degrees on a CSS 3D hinge (700ms), revealing the interior cabinet and items. Hovering or clicking items opens their detail sheet.
- **Companion Mobile App:** Mobile phone frame on desktop screens and responsive full-bleed on mobile viewports.
  - **Today:** Overview of items needing attention, compressor schedule, intake progress bars.
  - **Fridge:** Shelf-by-shelf inventory with item illustrations and thermal heatmap overlay toggle.
  - **Meals:** Interactive meal capture flow with before/after plate states and volume allocation.
  - **Reports:** 30 days of seeded, internally consistent nutrition telemetry across Daily/Weekly/Monthly periods, deficit/surplus breakdown, macro targets, and "Hide calories" mode.
  - **Medicines:** Mobile medicine tracking with CSV export.
  - **Retrofit Kit Setup Flow:** 5-step guided installation flow (load cells, camera, temperature sensor, plate registration, profiles) with flat SVG component diagrams.
  - **Privacy & Optional Services:** Local data wipe ("Delete all my data"), surplus food sharing, and shopping list generation.

## Deviations & Notes
- **Zero Icon Libraries / Emojis:** All glyphs (back arrows, chevrons, close icons) are hand-crafted 1.5px inline SVGs. Zero emoji characters or third-party icon libraries are present.
- **Zero "AI" / "Smart" Badging:** All interface copy is strictly factual, appliance-grade, and deterministic ("Recognised: Dal", "Compressor idle until 11 pm", "410 g removed").
- **Gradients:** Gradients are strictly avoided throughout the UI, with the sole exception of the thermal canvas heatmap and subtle two-stop brushed steel fills on the fridge doors.
- **Keyboard Navigation:** Full Tab, Enter, and Escape keyboard navigation support with high-contrast 2px accent focus indicators.

## Illustrative Simulation Values
- Initial total food mass: ~9.2 kg across 12 items.
- Specific heat capacities: Water/Dal/Curd (4.0 kJ/kg·K), Cooked Rice/Chicken (3.0 kJ/kg·K), Vegetables/Greens (3.8 kJ/kg·K), Empty Cabinet (15.0 kJ/K).
- Base compressor power: 1.2 kWh / unshifted day vs. 0.85 kWh with off-peak tariff shifting.
- Plate allocation reference: 410 g Dal consumed -> 273 g Anita (0.30 L) + 137 g Ravi (0.15 L).

## Colour system, tooltips and walkthrough

### 1. Semantic Colour System Tokens (`tokens.css`)
Neutrals are strictly preserved (`#F4F1EA` background, `#1D1F1E` ink, `#6B6F6C` grey, `#D9D5CB` hairline). Every semantic colour is defined as a solid colour + pale tint pair meeting WCAG AA contrast standards:
- **Safe / in range:** `--col-safe: #2F6F5E;` | `--tint-safe: #DDEBE5;`
- **Use first / caution:** `--col-caution: #B7791F;` | `--tint-caution: #F5E7C8;`
- **Discard / alert:** `--col-alert: #C8571B;` | `--tint-alert: #F6DCCF;`
- **Cold / chilled zones:** `--col-cold: #5C7A8C;` | `--tint-cold: #DCE5EA;`
- **Warm / hot food:** `--col-warm: #B5483A;` | `--tint-warm: #F2D9D4;`
- **Information / selected:** `--col-info: #1F5F6B;` | `--tint-info: #D6E6E9;`
- **Fermentation:** `--col-ferment: #8A6D2F;` | `--tint-ferment: #EBE1C6;`
- **Medicine zone:** `--col-medicine: #6E4A5B;` | `--tint-medicine: #E7DCE2;`

Storage zone tints and borders:
- **Shelf 3:** `--zone-shelf3: #5C7A8C;` | `--zone-shelf3-tint: #DCE5EA;`
- **Shelf 2:** `--zone-shelf2: #1F5F6B;` | `--zone-shelf2-tint: #D6E6E9;`
- **Shelf 1:** `--zone-shelf1: #8A6D2F;` | `--zone-shelf1-tint: #EBE1C6;`
- **Door bin:** `--zone-door: #B7791F;` | `--zone-door-tint: #F5E7C8;`
- **Crisper:** `--zone-crisper: #2F6F5E;` | `--zone-crisper-tint: #DDEBE5;`
- **Medicine:** `--zone-medicine: #6E4A5B;` | `--zone-medicine-tint: #E7DCE2;`

Food category left borders (3px solid):
- **Cooked:** `--cat-cooked: #B5483A;`
- **Dairy:** `--cat-dairy: #5C7A8C;`
- **Produce:** `--cat-produce: #2F6F5E;`
- **Eggs:** `--cat-eggs: #B7791F;`
- **Batter / ferment:** `--cat-ferment: #8A6D2F;`
- **Medicine:** `--cat-medicine: #6E4A5B;`

Fixed member profile colors:
- **Anita:** `--profile-anita: #1F5F6B;` | `--profile-anita-tint: #D6E6E9;`
- **Ravi:** `--profile-ravi: #5C7A8C;` | `--profile-ravi-tint: #DCE5EA;`
- **Meera:** `--profile-meera: #8A6D2F;` | `--profile-meera-tint: #EBE1C6;`
- **Dadu:** `--profile-dadu: #6E4A5B;` | `--profile-dadu-tint: #E7DCE2;`

### 2. Distinction and Hierarchy
- **Hero Numerals:** Primary metric on each screen is formatted in IBM Plex Mono 28–36px with 11px uppercase letter-spaced card headers and hairline dividers.
- **Delta Indicators:** Weight / temperature changes trigger a 400ms amber-tint background pulse (`.delta-flash`) with small delta text (`-410g`).
- **Load Cell Shading:** Flat relative shading (white to blue-grey, no gradients), terracotta centroid cross, and dashed teal analysed region.
- **Status Chips:** Small rectangular chips with pale tint background and solid text (`In range`, `Use first`, `Check`, `Discard`, `Cooling`, `Fermenting`, `Ready`, `Excursion`).

### 3. Reusable Tooltip (`Tip.tsx`)
- Ink background `#1D1F1E`, off-white text, 12px font, 6px radius, 8px padding, 240px max width.
- 250ms hover delay, keyboard focus / Esc dismiss, touch tap-toggle. Auto-flips to avoid viewport clipping.
- Uses `role="tooltip"` and `aria-describedby`.
- Attached to all status chips, chart lines/markers, load cells, centroid, tariff bands, compressor states, profile avatars, and demo controls.

### 4. Callouts & Guided Walkthrough
- **Callouts Mode:** Toggled from door screen top bar or mobile header. Renders 2–4 numbered 20px teal badges with leader lines and factual labels. Clicking highlights the target element with a 2px teal outline for 2 seconds.
- **12-Step Walkthrough:** Drives live simulator state and navigation with a docked card at the bottom-left (`Step N of 12`, title, description, Back / Next / Close). Left/Right arrow keys and Escape supported. Step 12 provides a "Reset sim" control.
- Supported direct verification URLs via search parameters (`?tab=...&callouts=1`, `?step=...`, `?door=1`).

