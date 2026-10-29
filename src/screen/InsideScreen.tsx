// InsideScreen — camera view with item list, semantic colors, and callouts
import React, { useState } from 'react';
import { useSimStore } from '../sim/store';
import { computeRemainingLife, remainingLifeLabel, itemStatus, batterFillFraction } from '../sim/engine';
import { FoodItem, CATEGORY_COLORS, ZONE_META, Shelf } from '../data/items';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';
import {
  SteelDabba,
  MilkCarton,
  CurdBowl,
  BatterContainer,
  EggTray,
  GreensBag,
  TomatoOnion,
  CookedChicken,
  InsulinPen,
} from '../art/FoodItems';

interface InsideScreenProps {
  activeProfile: string;
}

type ShelfGroup = { label: string; shelf: Shelf; items: FoodItem[] };

function groupByShelf(items: FoodItem[]): ShelfGroup[] {
  const order: Shelf[] = ['shelf3', 'shelf2', 'shelf1', 'door', 'crisper', 'medicine'];
  const labels: Record<Shelf, string> = {
    shelf3: 'Shelf 3', shelf2: 'Shelf 2', shelf1: 'Shelf 1',
    door: 'Door bin', crisper: 'Crisper drawer', medicine: 'Medicine zone',
  };
  const map = new Map<Shelf, FoodItem[]>();
  items.forEach(it => {
    if (!map.has(it.shelf)) map.set(it.shelf, []);
    map.get(it.shelf)!.push(it);
  });
  return order
    .filter(s => map.has(s))
    .map(s => ({ label: labels[s], shelf: s, items: map.get(s)! }));
}

function InteriorCameraView({
  items,
  selectedId,
  onSelect,
  simSec,
  cabinetTemp,
}: {
  items: FoodItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  simSec: number;
  cabinetTemp: number;
}) {
  const { temporaryHighlight } = useTour();
  const batterItem = items.find(it => it.id === 'batter');
  const batterFraction = batterItem ? batterFillFraction(batterItem, simSec) : 0.6;
  const greensItem = items.find(it => it.id === 'greens');
  const greensLife = greensItem ? computeRemainingLife(greensItem, simSec, cabinetTemp) : { fractionUsed: 0 };
  const milkItem = items.find(it => it.id === 'milk');
  const milkLife = milkItem ? computeRemainingLife(milkItem, simSec, cabinetTemp) : { fractionUsed: 0 };
  const milkStatus = itemStatus(milkLife.fractionUsed);

  return (
    <div className="camera-view-container">
      <div className="camera-view-header">
        <span>CAM 1 · 1080P · WIDE</span>
        <Tip content="Continuous cabinet temperature reading">
          <span className="mono" style={{ color: 'var(--col-cold)', fontWeight: 500 }}>{cabinetTemp.toFixed(1)}°C</span>
        </Tip>
      </div>
      <div className="camera-view-stage">
        {/* Shelf dividers with zone tint slices */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 88, background: 'var(--zone-shelf3-tint)', opacity: 0.35, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 88, height: 4, background: 'var(--zone-shelf3)' }} />

        <div style={{ position: 'absolute', left: 0, right: 0, top: 92, height: 88, background: 'var(--zone-shelf2-tint)', opacity: 0.35, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 180, height: 4, background: 'var(--zone-shelf2)' }} />

        <div style={{ position: 'absolute', left: 0, right: 0, top: 184, height: 88, background: 'var(--zone-shelf1-tint)', opacity: 0.35, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 272, height: 4, background: 'var(--zone-shelf1)' }} />

        {/* Shelf labels */}
        <span style={{ position: 'absolute', left: 8, top: 6, fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--zone-shelf3)' }}>SHELF 3 (COLD)</span>
        <span style={{ position: 'absolute', left: 8, top: 96, fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--zone-shelf2)' }}>SHELF 2 (LOAD CELLS)</span>
        <span style={{ position: 'absolute', left: 8, top: 188, fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--zone-shelf1)' }}>SHELF 1 (FERMENT)</span>
        <span style={{ position: 'absolute', left: 8, top: 280, fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--zone-crisper)' }}>CRISPER (PRODUCE)</span>

        {/* Medicine zone */}
        <div
          id="target-inside-medzone"
          className={temporaryHighlight === 'target-inside-medzone' ? 'tour-highlight' : ''}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            width: 86,
            height: 74,
            border: '1px dashed var(--col-med)',
            borderRadius: 3,
            background: 'var(--zone-medicine-tint)',
            padding: 4,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--col-med)', fontWeight: 600 }}>MED (2-8°C)</span>
            <CalloutMarker num={3} label="Medicine zone" targetId="target-inside-medzone" position="left" style={{ transform: 'scale(0.85)' }} />
          </div>
        </div>

        {/* Door bin */}
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: 92,
            width: 86,
            height: 174,
            border: '1px solid var(--zone-door)',
            borderRadius: 3,
            background: 'var(--zone-door-tint)',
            padding: 4,
          }}
        >
          <span style={{ fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--zone-door)', fontWeight: 600 }}>DOOR BIN</span>
        </div>

        {/* Crisper drawer outline */}
        <div
          style={{
            position: 'absolute',
            left: 6,
            right: 6,
            bottom: 6,
            height: 120,
            border: '1px solid var(--zone-crisper)',
            borderRadius: 3,
            background: 'var(--zone-crisper-tint)',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />

        {/* Food Items */}
        {/* Shelf 3 */}
        <Tip content="Paneer · Dairy · 300 g gross">
          <div
            className={`camera-item-node ${selectedId === 'paneer' ? 'camera-item-node--selected' : ''}`}
            style={{ left: 24, top: 24 }}
            onClick={() => onSelect('paneer')}
          >
            <SteelDabba variant="paneer" size={36} />
            <span className="camera-item-badge">Paneer</span>
          </div>
        </Tip>

        <Tip content="Cooked chicken · 62°C cooling curve">
          <div
            className={`camera-item-node ${selectedId === 'chicken' ? 'camera-item-node--selected' : ''}`}
            style={{ left: 104, top: 22 }}
            onClick={() => onSelect('chicken')}
          >
            <CookedChicken size={42} />
            <span className="camera-item-badge">Chicken</span>
          </div>
        </Tip>

        {/* Medicine Zone items */}
        <Tip content="Insulin pens x2 + vial · 2-8°C corridor">
          <div
            className={`camera-item-node ${selectedId === 'insulin1' ? 'camera-item-node--selected' : ''}`}
            style={{ right: 16, top: 24 }}
            onClick={() => onSelect('insulin1')}
          >
            <InsulinPen size={44} />
            <span className="camera-item-badge">Insulin</span>
          </div>
        </Tip>

        {/* Shelf 2 */}
        <Tip content="Dal (cooked) · Steel container · 820 g gross">
          <div
            className={`camera-item-node ${selectedId === 'dal' ? 'camera-item-node--selected' : ''}`}
            style={{ left: 16, top: 114 }}
            onClick={() => onSelect('dal')}
          >
            <SteelDabba variant="dal" size={38} />
            <span className="camera-item-badge">Dal 820g</span>
          </div>
        </Tip>

        <Tip content="Cooked rice · Steel container · 640 g gross">
          <div
            className={`camera-item-node ${selectedId === 'rice' ? 'camera-item-node--selected' : ''}`}
            style={{ left: 82, top: 114 }}
            onClick={() => onSelect('rice')}
          >
            <SteelDabba variant="rice" size={38} />
            <span className="camera-item-badge">Rice 640g</span>
          </div>
        </Tip>

        <Tip content="Mixed veg curry · Steel container · 510 g gross">
          <div
            className={`camera-item-node ${selectedId === 'curry' ? 'camera-item-node--selected' : ''}`}
            style={{ left: 148, top: 114 }}
            onClick={() => onSelect('curry')}
          >
            <SteelDabba variant="curry" size={38} />
            <span className="camera-item-badge">Curry 510g</span>
          </div>
        </Tip>

        {/* Shelf 1 */}
        <Tip content="Curd bowl · 450 g · Fermenting">
          <div
            className={`camera-item-node ${selectedId === 'curd' ? 'camera-item-node--selected' : ''}`}
            style={{ left: 24, top: 206 }}
            onClick={() => onSelect('curd')}
          >
            <CurdBowl size={40} />
            <span className="camera-item-badge">Curd</span>
          </div>
        </Tip>

        <Tip content={`Idli batter · Fill height ${(batterFraction * 100).toFixed(0)}%`}>
          <div
            className={`camera-item-node ${selectedId === 'batter' ? 'camera-item-node--selected' : ''}`}
            style={{ left: 104, top: 192 }}
            onClick={() => onSelect('batter')}
          >
            <BatterContainer size={36} fillFraction={batterFraction} />
            <span className="camera-item-badge">Batter</span>
          </div>
        </Tip>

        {/* Door bin */}
        <div
          id="target-inside-freshness"
          className={`camera-item-node ${selectedId === 'milk' ? 'camera-item-node--selected' : ''} ${temporaryHighlight === 'target-inside-freshness' ? 'tour-highlight' : ''}`}
          style={{ right: 26, top: 102 }}
          onClick={() => onSelect('milk')}
        >
          <Tip content={`Milk 1 L · Freshness: ${Math.round(Math.max(0, 1 - milkLife.fractionUsed) * 100)}% remaining`}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <MilkCarton size={30} />
              <div style={{ width: 28, height: 4, background: 'var(--hairline)', borderRadius: 2, marginTop: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.round(Math.max(0, (1 - milkLife.fractionUsed)) * 100)}%`,
                    height: '100%',
                    background: milkStatus === 'In range' ? 'var(--col-safe)' : 'var(--col-caution)',
                  }}
                />
              </div>
              <span className="camera-item-badge">Milk</span>
            </div>
          </Tip>
        </div>

        <Tip content="Eggs tray · 12 eggs · 720 g gross">
          <div
            className={`camera-item-node ${selectedId === 'eggs' ? 'camera-item-node--selected' : ''}`}
            style={{ right: 18, top: 188 }}
            onClick={() => onSelect('eggs')}
          >
            <EggTray size={42} />
            <span className="camera-item-badge">Eggs</span>
          </div>
        </Tip>

        {/* Crisper */}
        <Tip content={`Greens bag · Browning overlay: ${(greensLife.fractionUsed * 100).toFixed(0)}%`}>
          <div
            className={`camera-item-node ${selectedId === 'greens' ? 'camera-item-node--selected' : ''}`}
            style={{ left: 22, top: 298 }}
            onClick={() => onSelect('greens')}
          >
            <GreensBag size={38} browning={greensLife.fractionUsed} />
            <span className="camera-item-badge">Greens</span>
          </div>
        </Tip>

        <Tip content="Tomatoes & onions · 900 g gross">
          <div
            className={`camera-item-node ${selectedId === 'tomatoes' ? 'camera-item-node--selected' : ''}`}
            style={{ left: 100, top: 304 }}
            onClick={() => onSelect('tomatoes')}
          >
            <TomatoOnion size={44} />
            <span className="camera-item-badge">Tomatoes</span>
          </div>
        </Tip>
      </div>
    </div>
  );
}

export function InsideScreen({ activeProfile }: InsideScreenProps) {
  const { sim } = useSimStore();
  const { temporaryHighlight } = useTour();
  const [selectedId, setSelectedId] = useState<string | null>('dal');
  const items = sim.items;
  const groups = groupByShelf(items);
  const selectedItem = items.find(it => it.id === selectedId);

  const totalFoodMassKg = (items.reduce((sum, it) => sum + (it.massGross - it.containerMass), 0) / 1000).toFixed(1);

  const usefirstItems = items.filter(it => {
    const { fractionUsed } = computeRemainingLife(it, sim.simSec, sim.cabinetTemp);
    return itemStatus(fractionUsed) === 'Use first';
  });

  return (
    <div className="screen-three-panel">
      {/* 1. Interior camera view */}
      <div>
        <div className="card-header">
          <span>Interior camera</span>
          <span style={{ fontSize: 10, color: 'var(--mid)' }}>Live optical feed</span>
        </div>
        <InteriorCameraView
          items={items}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
          simSec={sim.simSec}
          cabinetTemp={sim.cabinetTemp}
        />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CalloutMarker num={2} label="Item freshness bar" targetId="target-inside-freshness" />
        </div>
      </div>

      {/* 2. Live item list grouped by shelf */}
      <div
        id="target-inside-list"
        className={temporaryHighlight === 'target-inside-list' ? 'tour-highlight' : ''}
        style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)', paddingRight: 4 }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Inventory ({items.length})</span>
            <CalloutMarker num={1} label="Zone label and colour" targetId="target-inside-zone" />
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--mid)' }}>{totalFoodMassKg} kg stored</span>
        </div>

        {/* Hero stored contents metric */}
        <div style={{ padding: '6px 10px', background: 'var(--bg)', border: 'var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>
          <div className="metric-hero-label">Net stored contents</div>
          <div className="metric-hero">
            {totalFoodMassKg} <span className="metric-hero-unit">kg</span>
            <span style={{ fontSize: 11, color: 'var(--mid)', fontWeight: 400, marginLeft: 8 }}>across 6 zones</span>
          </div>
        </div>

        {usefirstItems.length > 0 && (
          <div style={{ marginBottom: 'var(--s3)' }}>
            <div style={{ fontSize: 11, color: 'var(--col-caution)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--col-caution)' }} />
              Use first ({usefirstItems.length})
            </div>
            {usefirstItems.map(it => (
              <ItemRow
                key={it.id}
                item={it}
                simSec={sim.simSec}
                cabinetTemp={sim.cabinetTemp}
                selected={selectedId === it.id}
                onSelect={() => setSelectedId(selectedId === it.id ? null : it.id)}
                warn
              />
            ))}
          </div>
        )}

        <div style={{ fontSize: 11, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>
          All zones
        </div>

        {groups.map(g => {
          const zone = ZONE_META[g.shelf];
          return (
            <div key={g.shelf} style={{ marginBottom: 8 }} id={g.shelf === 'shelf2' ? 'target-inside-zone' : undefined}>
              <div
                style={{
                  borderLeft: `4px solid ${zone?.color || 'var(--mid)'}`,
                  background: zone?.tint || 'transparent',
                  padding: '4px 8px',
                  borderRadius: '0 3px 3px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--ink)',
                }}
              >
                <span>{g.label.toUpperCase()}</span>
                <span style={{ fontSize: 10, color: 'var(--mid)', fontWeight: 400 }}>{g.items.length} items</span>
              </div>
              {g.items.map(it => (
                <ItemRow
                  key={it.id}
                  item={it}
                  simSec={sim.simSec}
                  cabinetTemp={sim.cabinetTemp}
                  selected={selectedId === it.id}
                  onSelect={() => setSelectedId(selectedId === it.id ? null : it.id)}
                />
              ))}
            </div>
          );
        })}

        {/* Category color legend at foot of list */}
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: 'var(--border)', display: 'flex', flexWrap: 'wrap', gap: '6px 10px', fontSize: 10, color: 'var(--mid)' }}>
          {Object.entries(CATEGORY_COLORS)
            .filter(([k]) => ['cooked', 'dairy', 'produce', 'eggs', 'ferment', 'medicine'].includes(k))
            .map(([k, c]) => (
              <div key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: 1, background: c.color }} />
                <span>{c.label}</span>
              </div>
            ))}
        </div>
      </div>

      {/* 3. Detail sheet */}
      <div>
        <div className="card-header">
          <span>Item details</span>
          {selectedItem && <span className="mono" style={{ fontSize: 11, color: 'var(--mid)' }}>{selectedItem.shelf}</span>}
        </div>
        {selectedItem ? (
          <ItemDetailSheet
            item={selectedItem}
            simSec={sim.simSec}
            cabinetTemp={sim.cabinetTemp}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div style={{ border: 'var(--border)', borderRadius: 'var(--radius)', padding: 'var(--s4)', color: 'var(--mid)', fontSize: 13, background: 'var(--bg)' }}>
            Select an item from the camera view or list to view mass, macros, freshness, and temperature history.
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  simSec,
  cabinetTemp,
  selected,
  onSelect,
  warn = false,
}: {
  item: FoodItem;
  simSec: number;
  cabinetTemp: number;
  selected: boolean;
  onSelect: () => void;
  warn?: boolean;
}) {
  const { fractionUsed } = computeRemainingLife(item, simSec, cabinetTemp);
  const status = itemStatus(fractionUsed);
  const netMass = item.massGross - item.containerMass;
  const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.cooked;

  const chipClass =
    status === 'In range' ? 'chip--in-range' :
    status === 'Use first' ? 'chip--use-first' :
    'chip--discard';

  return (
    <div
      className={`item-row ${selected ? 'item-row--selected' : ''}`}
      style={{
        borderLeft: `3px solid ${cat.color}`,
        background: selected ? 'var(--tint-info)' : undefined,
        borderColor: selected ? 'var(--col-info)' : undefined,
      }}
      onClick={onSelect}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-label={item.label}
    >
      <div className="item-row__info">
        <div className="item-row__name">{item.name}</div>
        <div className="item-row__sub">
          {item.isSteel ? 'Steel container' : item.category}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="item-row__mass">{netMass} g</div>
        <Tip content={`${status}: ${(fractionUsed * 100).toFixed(0)}% storage life used`}>
          <span className={`chip ${chipClass}`} style={{ fontSize: 10 }}>
            {status}
          </span>
        </Tip>
      </div>
    </div>
  );
}

export function ItemDetailSheet({
  item,
  simSec,
  cabinetTemp,
  onClose,
}: {
  item: FoodItem;
  simSec: number;
  cabinetTemp: number;
  onClose?: () => void;
}) {
  const { fractionUsed, hoursRemaining } = computeRemainingLife(item, simSec, cabinetTemp);
  const lifeLabel = remainingLifeLabel(item, simSec, cabinetTemp);
  const status = itemStatus(fractionUsed);
  const netMass = item.massGross - item.containerMass;
  const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.cooked;
  const zone = ZONE_META[item.shelf];

  const tempOffset: Record<string, number> = {
    shelf1: 0.2, shelf2: -0.1, shelf3: 0.3, door: 1.5, crisper: -0.3, medicine: -0.5,
  };
  const itemTempC = cabinetTemp + (tempOffset[item.shelf] ?? 0);
  const kcalTotal = Math.round(netMass * item.kcalPer100g / 100);
  const proteinTotal = Math.round(netMass * item.proteinPer100g / 100 * 10) / 10;

  const chipClass =
    status === 'In range' ? 'chip--in-range' :
    status === 'Use first' ? 'chip--use-first' :
    'chip--discard';

  return (
    <div
      className="detail-sheet"
      style={{
        borderLeft: `4px solid ${cat.color}`,
        borderTop: 'var(--border)',
        borderRight: 'var(--border)',
        borderBottom: 'var(--border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: 1, background: cat.color }} />
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--mid)', textTransform: 'uppercase' }}>
              {cat.label} · {zone?.label || item.shelf}
            </span>
          </div>
          <div className="detail-sheet__name">{item.label}</div>
          {item.notes && <div className="detail-sheet__label">{item.notes}</div>}
        </div>
        {onClose && (
          <button className="btn-text" onClick={onClose} aria-label="Close" style={{ color: 'var(--mid)', fontSize: 11 }}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" />
              <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        )}
      </div>

      <div style={{ marginBottom: 'var(--s3)', display: 'flex', gap: 6, alignItems: 'center' }}>
        <Tip content={`Shelf status: ${status} based on integrated temperature history`}>
          <span className={`chip ${chipClass}`}>{status}</span>
        </Tip>
        {item.tempBehaviour === 'cooling' && (
          <Tip content="Item cooling curve actively monitored">
            <span className="chip chip--cooling">Cooling</span>
          </Tip>
        )}
        {item.tempBehaviour === 'fermenting' && (
          <Tip content="Fermentation stage tracked by fill height & temperature">
            <span className="chip chip--fermenting">Fermenting</span>
          </Tip>
        )}
      </div>

      <div className="detail-row">
        <span className="detail-row__label">Gross mass</span>
        <span className="detail-row__value mono">{item.massGross} g</span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">Net contents</span>
        <span className="detail-row__value mono" style={{ fontWeight: 600, color: 'var(--ink)' }}>{netMass} g</span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">Temperature at location</span>
        <span className="detail-row__value mono" style={{ color: 'var(--col-cold)', fontWeight: 500 }}>{itemTempC.toFixed(1)} °C</span>
      </div>

      <div style={{ marginTop: 'var(--s3)', marginBottom: 'var(--s1)' }}>
        <div className="card-header" style={{ marginBottom: 4 }}>
          <span>Values per 100 g</span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Energy</span>
          <span className="detail-row__value mono">{item.kcalPer100g} kcal</span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Protein</span>
          <span className="detail-row__value mono">{item.proteinPer100g} g</span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Fat</span>
          <span className="detail-row__value mono">{item.fatPer100g} g</span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Carbs</span>
          <span className="detail-row__value mono">{item.carbsPer100g} g</span>
        </div>
      </div>

      <div style={{ marginTop: 'var(--s3)', marginBottom: 'var(--s1)' }}>
        <div className="card-header" style={{ marginBottom: 4 }}>
          <span>For contents ({netMass} g)</span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Energy</span>
          <span className="detail-row__value mono" style={{ fontWeight: 600 }}>{kcalTotal} kcal</span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Protein</span>
          <span className="detail-row__value mono" style={{ fontWeight: 600 }}>{proteinTotal} g</span>
        </div>
      </div>

      <div style={{ marginTop: 'var(--s3)' }}>
        <div style={{ fontSize: 12, marginBottom: 4, fontWeight: 500, color: status === 'Discard' ? 'var(--col-alert)' : 'var(--ink)' }}>
          {lifeLabel}
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar__fill"
            style={{
              width: `${Math.min(100, Math.round(fractionUsed * 100))}%`,
              background: status === 'In range' ? 'var(--col-safe)' : status === 'Use first' ? 'var(--col-caution)' : 'var(--col-alert)',
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
          {Math.round(hoursRemaining)} h remaining
        </div>
      </div>

      {/* Spoilage visual for greens */}
      {item.id === 'greens' && (
        <div style={{ marginTop: 'var(--s3)', padding: 'var(--s2)', background: 'var(--tint-alert)', border: '1px solid rgba(200,87,27,0.2)', borderRadius: 3 }}>
          <div style={{ fontSize: 12, color: 'var(--col-alert)', fontWeight: 500 }}>Browning spots visible. Use promptly.</div>
        </div>
      )}

      {/* Fermentation status */}
      {item.id === 'batter' && (
        <div style={{ marginTop: 'var(--s3)', padding: 'var(--s2)', background: 'var(--tint-ferment)', border: '1px solid rgba(138,109,47,0.2)', borderRadius: 3 }}>
          <div style={{ fontSize: 12, color: 'var(--col-ferment)', fontWeight: 500 }}>Fermenting. Fill level line rising.</div>
        </div>
      )}
    </div>
  );
}
