// ShelfScreen — load cell plan view with item interaction, relative cell shading, and callouts
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSimStore } from '../sim/store';
import { itemLoadCells, computeCentroid } from '../sim/engine';
import { SEED_ITEMS } from '../data/items';
import { simTimeToDisplay } from '../sim/engine';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

interface ShelfLog {
  time: string;
  itemId: string;
  name: string;
  changeG: number;
  action: 'removed' | 'returned' | 'refill';
}

const SCALE = 6; // px per cm (60x40 cm -> 360x240 px)

// Flat steps for cell load shading: white to blue-grey (no gradient)
function getCellShading(val: number, maxVal: number): string {
  if (maxVal <= 0 || val <= 0) return '#FFFFFF';
  const ratio = val / maxVal;
  if (ratio < 0.25) return '#F7FAFC';
  if (ratio < 0.5) return '#DCE5EA';
  if (ratio < 0.75) return '#B8CBD6';
  return '#8EAAB9';
}

export function ShelfScreen() {
  const { sim } = useSimStore();
  const { temporaryHighlight } = useTour();
  const [selectedId, setSelectedId] = useState<string | null>('dal');
  const [lifted, setLifted] = useState<Set<string>>(new Set());
  const [itemMasses, setItemMasses] = useState<Record<string, number>>(() =>
    Object.fromEntries(SEED_ITEMS.map(it => [it.id, it.massGross]))
  );
  const [logs, setLogs] = useState<ShelfLog[]>([
    { time: '6:40 pm', itemId: 'dal', name: 'Dal', changeG: -410, action: 'returned' },
  ]);
  const [lastDelta, setLastDelta] = useState<number | null>(-410);
  const [flashActive, setFlashActive] = useState(false);

  const shelfItems = SEED_ITEMS.filter(it => it.shelf === 'shelf2');

  // Compute aggregate load cells for all non-lifted items on shelf 2
  const totalCells = shelfItems
    .filter(it => !lifted.has(it.id))
    .reduce(
      (acc, item) => {
        const mass = itemMasses[item.id] ?? item.massGross;
        const cells = itemLoadCells({ ...item, massGross: mass });
        return {
          tl: acc.tl + cells.tl,
          tr: acc.tr + cells.tr,
          bl: acc.bl + cells.bl,
          br: acc.br + cells.br,
        };
      },
      { tl: 0, tr: 0, bl: 0, br: 0 }
    );

  const maxCell = Math.max(1, totalCells.tl, totalCells.tr, totalCells.bl, totalCells.br);
  const centroid = computeCentroid(totalCells);

  const triggerDeltaFlash = (delta: number) => {
    setLastDelta(delta);
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 450);
  };

  const handleLift = useCallback((id: string) => {
    const item = SEED_ITEMS.find(it => it.id === id);
    if (!item) return;
    const mass = itemMasses[id] ?? item.massGross;
    setLifted(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setLogs(prev => [{
      time: simTimeToDisplay(sim.simSec),
      itemId: id,
      name: item.name,
      changeG: -mass,
      action: 'removed',
    }, ...prev.slice(0, 19)]);
    setSelectedId(id);
    triggerDeltaFlash(-mass);
  }, [itemMasses, sim.simSec]);

  const handleReturn = useCallback((id: string) => {
    const item = SEED_ITEMS.find(it => it.id === id);
    if (!item) return;
    const removedMass = itemMasses[id] ?? item.massGross;
    // Simulate: returned with 410g consumed for dal, 80% for others
    const returnMass = id === 'dal' ? Math.max(0, removedMass - 410) : Math.round(removedMass * 0.8);
    const consumed = removedMass - returnMass;
    setItemMasses(prev => ({ ...prev, [id]: returnMass }));
    setLifted(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setLogs(prev => [{
      time: simTimeToDisplay(sim.simSec),
      itemId: id,
      name: item.name,
      changeG: -consumed,
      action: 'returned',
    }, ...prev.slice(0, 19)]);
    triggerDeltaFlash(-consumed);
  }, [itemMasses, sim.simSec]);

  const handleRefill = useCallback((id: string) => {
    const item = SEED_ITEMS.find(it => it.id === id);
    if (!item) return;
    const diff = item.massGross - (itemMasses[id] ?? item.massGross);
    setItemMasses(prev => ({ ...prev, [id]: item.massGross }));
    setLogs(prev => [{
      time: simTimeToDisplay(sim.simSec),
      itemId: id,
      name: item.name,
      changeG: diff,
      action: 'refill',
    }, ...prev.slice(0, 19)]);
    triggerDeltaFlash(diff);
  }, [itemMasses, sim.simSec]);

  const selectedItem = selectedId ? SEED_ITEMS.find(it => it.id === selectedId) : null;
  const isLifted = selectedId ? lifted.has(selectedId) : false;

  const currentGross = selectedItem ? (itemMasses[selectedItem.id] ?? selectedItem.massGross) : 0;
  const originalGross = selectedItem ? selectedItem.massGross : 0;
  const consumedG = selectedItem ? Math.max(0, originalGross - currentGross) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 'var(--s4)' }}>
      <div>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Shelf 2 — Load cell plan view</span>
            <CalloutMarker num={1} label="Load cell reading" targetId="target-shelf-cell" />
          </div>
          <span style={{ fontSize: 10, color: 'var(--mid)' }}>4 corner strain gauges</span>
        </div>

        {/* Plan view SVG Stage */}
        <div
          id="target-shelf-plan"
          className={temporaryHighlight === 'target-shelf-plan' ? 'tour-highlight' : ''}
          style={{
            position: 'relative',
            display: 'inline-block',
            border: 'var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            background: '#E8E5E0',
          }}
        >
          <svg
            width={60 * SCALE}
            height={40 * SCALE}
            viewBox={`0 0 ${60 * SCALE} ${40 * SCALE}`}
            aria-label="Shelf 2 load cell plan view"
          >
            {/* Grid */}
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`vg${i}`} x1={(i * 10) * SCALE} y1={0} x2={(i * 10) * SCALE} y2={40 * SCALE}
                stroke="#D9D5CB" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`hg${i}`} x1={0} y1={(i * 10) * SCALE} x2={60 * SCALE} y2={(i * 10) * SCALE}
                stroke="#D9D5CB" strokeWidth="0.5" />
            ))}

            {/* Load cell zones at 4 corners with flat relative shading */}
            {/* TL: Front-Left */}
            <rect x={0} y={0} width={12 * SCALE} height={8 * SCALE} fill={getCellShading(totalCells.tl, maxCell)} stroke="var(--hairline)" strokeWidth="0.5" />
            {/* TR: Front-Right */}
            <rect x={48 * SCALE} y={0} width={12 * SCALE} height={8 * SCALE} fill={getCellShading(totalCells.tr, maxCell)} stroke="var(--hairline)" strokeWidth="0.5" />
            {/* BL: Rear-Left */}
            <rect x={0} y={32 * SCALE} width={12 * SCALE} height={8 * SCALE} fill={getCellShading(totalCells.bl, maxCell)} stroke="var(--hairline)" strokeWidth="0.5" />
            {/* BR: Rear-Right */}
            <rect x={48 * SCALE} y={32 * SCALE} width={12 * SCALE} height={8 * SCALE} fill={getCellShading(totalCells.br, maxCell)} stroke="var(--hairline)" strokeWidth="0.5" />

            {/* Load cell dots and text at corners */}
            {[
              { id: 'cell-tl', x: 0, y: 0, val: totalCells.tl, label: `${Math.round(totalCells.tl)} g`, corner: '1 of 4 (Front-Left)' },
              { id: 'cell-tr', x: 60, y: 0, val: totalCells.tr, label: `${Math.round(totalCells.tr)} g`, corner: '2 of 4 (Front-Right)' },
              { id: 'cell-bl', x: 0, y: 40, val: totalCells.bl, label: `${Math.round(totalCells.bl)} g`, corner: '3 of 4 (Rear-Left)' },
              { id: 'cell-br', x: 60, y: 40, val: totalCells.br, label: `${Math.round(totalCells.br)} g`, corner: '4 of 4 (Rear-Right)' },
            ].map((c) => (
              <g key={c.id}>
                <circle
                  cx={c.x === 0 ? 12 : (60 * SCALE - 12)}
                  cy={c.y === 0 ? 12 : (40 * SCALE - 12)}
                  r={8}
                  fill="#FFFFFF"
                  stroke="var(--col-cold)"
                  strokeWidth="1.5"
                />
                <circle
                  cx={c.x === 0 ? 12 : (60 * SCALE - 12)}
                  cy={c.y === 0 ? 12 : (40 * SCALE - 12)}
                  r={3}
                  fill="var(--col-cold)"
                />
                <text
                  x={c.x === 0 ? 24 : (60 * SCALE - 24)}
                  y={c.y === 0 ? 16 : (40 * SCALE - 8)}
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                  fill="var(--ink)"
                  textAnchor={c.x === 0 ? 'start' : 'end'}
                >
                  {c.label}
                </text>
              </g>
            ))}

            {/* Items placed on shelf */}
            {shelfItems.map(item => {
              const cx = item.x * SCALE;
              const cy = item.y * SCALE;
              const isLiftedItem = lifted.has(item.id);
              const isSelected = selectedId === item.id;
              const currentItemMass = Math.round(itemMasses[item.id] ?? item.massGross);

              return (
                <g
                  key={item.id}
                  onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={isLiftedItem ? 0.25 : 1}
                >
                  {/* Container shadow / outline */}
                  <rect
                    x={cx - 20}
                    y={cy - 16}
                    width={40}
                    height={32}
                    rx={4}
                    fill={item.id === 'dal' ? '#B5834A' : item.id === 'rice' ? '#EDE3C8' : '#C4973A'}
                    stroke={isSelected ? 'var(--col-info)' : '#1D1F1E'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  {isSelected && (
                    <rect
                      x={cx - 23}
                      y={cy - 19}
                      width={46}
                      height={38}
                      rx={6}
                      fill="none"
                      stroke="var(--col-info)"
                      strokeWidth={1.5}
                    />
                  )}
                  <text x={cx} y={cy + 1} textAnchor="middle" fontSize="8" fontFamily="var(--font-ui)" fontWeight="600" fill="#1D1F1E">
                    {item.name.slice(0, 5)}
                  </text>
                  <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="#1D1F1E">
                    {currentItemMass} g
                  </text>
                </g>
              );
            })}

            {/* Centroid Cross in terracotta & Analysed Region in dashed teal */}
            {shelfItems.some(it => !lifted.has(it.id)) && (
              <g id="target-shelf-centroid">
                {/* 3. Analysed bounding region (dashed teal) */}
                <rect
                  id="target-shelf-region"
                  x={(centroid.x - 14) * SCALE}
                  y={(centroid.y - 12) * SCALE}
                  width={28 * SCALE}
                  height={24 * SCALE}
                  fill="var(--tint-info)"
                  fillOpacity="0.25"
                  stroke="var(--col-info)"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />

                {/* 2. Centroid Cross in terracotta */}
                <line
                  x1={(centroid.x - 10) * SCALE}
                  y1={centroid.y * SCALE}
                  x2={(centroid.x + 10) * SCALE}
                  y2={centroid.y * SCALE}
                  stroke="var(--col-warm)"
                  strokeWidth="2"
                />
                <line
                  x1={centroid.x * SCALE}
                  y1={(centroid.y - 10) * SCALE}
                  x2={centroid.x * SCALE}
                  y2={(centroid.y + 10) * SCALE}
                  stroke="var(--col-warm)"
                  strokeWidth="2"
                />
                <circle cx={centroid.x * SCALE} cy={centroid.y * SCALE} r={3} fill="var(--col-warm)" />
              </g>
            )}

            {/* 10 cm dimension rule */}
            <line x1="8" y1={38 * SCALE} x2={10 * SCALE + 8} y2={38 * SCALE} stroke="#6B6F6C" strokeWidth="1" />
            <text x={5 * SCALE + 8} y={38 * SCALE - 3} textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="#6B6F6C">10 cm</text>
          </svg>
        </div>

        {/* Callout markers for centroid & region */}
        <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
          <CalloutMarker num={2} label="Computed position cross" targetId="target-shelf-centroid" />
          <CalloutMarker num={3} label="Analysed region" targetId="target-shelf-region" />
        </div>

        {/* Four-corner cell tiles */}
        <div id="target-shelf-cell" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s2)', marginTop: 'var(--s3)' }}>
          {[
            { label: 'Cell 1 · Front-left', val: totalCells.tl },
            { label: 'Cell 2 · Front-right', val: totalCells.tr },
            { label: 'Cell 3 · Rear-left', val: totalCells.bl },
            { label: 'Cell 4 · Rear-right', val: totalCells.br },
          ].map((c) => (
            <Tip key={c.label} content={`${c.label}: ${Math.round(c.val)} g load`}>
              <div
                style={{
                  border: 'var(--border)',
                  borderRadius: 3,
                  padding: 'var(--s2) var(--s3)',
                  background: getCellShading(c.val, maxCell),
                }}
              >
                <div className="label-xs" style={{ color: 'var(--ink)' }}>{c.label}</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 500, marginTop: 2, color: 'var(--ink)' }}>
                  {Math.round(c.val)} g
                </div>
              </div>
            </Tip>
          ))}
        </div>

        {/* Action log */}
        <div style={{ marginTop: 'var(--s4)' }}>
          <div className="card-header">
            <span>Activity log</span>
            <span style={{ fontSize: 10, color: 'var(--mid)' }}>Shelf 2 events</span>
          </div>
          {logs.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--mid)' }}>Select an item and lift it to log an action.</div>
          )}
          {logs.slice(0, 5).map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--s3)', padding: '5px 0', borderBottom: 'var(--border)', fontSize: 12, alignItems: 'center' }}>
              <span className="mono" style={{ color: 'var(--mid)', flexShrink: 0, fontSize: 11 }}>{log.time}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{log.name}</span>
              <span className="mono" style={{ color: log.changeG < 0 ? 'var(--col-alert)' : 'var(--col-safe)', fontWeight: 600 }}>
                {log.changeG > 0 ? '+' : ''}{Math.round(log.changeG)} g
              </span>
              <span className={`chip ${log.action === 'returned' ? 'chip--in-range' : log.action === 'removed' ? 'chip--use-first' : 'chip--info'}`} style={{ fontSize: 10 }}>
                {log.action}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Hero consumed mass & container re-identification */}
      <div>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Container telemetry</span>
            <CalloutMarker num={4} label="Consumed mass card" targetId="target-consumed-card" />
          </div>
        </div>

        {selectedItem ? (
          <div
            id="target-consumed-card"
            className={`detail-sheet ${temporaryHighlight === 'target-consumed-card' ? 'tour-highlight' : ''}`}
            style={{
              borderLeft: '4px solid var(--col-info)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="detail-sheet__name">{selectedItem.name}</div>
              <span className="chip chip--selected" style={{ fontSize: 10 }}>Steel dabba</span>
            </div>

            {/* Primary Hero Numeral: Consumed Grams with Delta Flash */}
            <div
              className={flashActive ? 'delta-flash' : ''}
              style={{
                background: 'var(--bg)',
                border: 'var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                marginTop: 8,
                marginBottom: 12,
              }}
            >
              <div className="metric-hero-label">Net consumed today</div>
              <div className="metric-hero">
                {consumedG} <span className="metric-hero-unit">g</span>
                {lastDelta !== null && (
                  <span className="delta-badge">
                    {lastDelta > 0 ? `+${lastDelta}g` : `${lastDelta}g`}
                  </span>
                )}
              </div>
            </div>

            <div className="detail-row">
              <span className="detail-row__label">Initial gross</span>
              <span className="detail-row__value mono">{originalGross} g</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Current gross</span>
              <span className="detail-row__value mono" style={{ fontWeight: 600 }}>{currentGross} g</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Tare container</span>
              <span className="detail-row__value mono">{selectedItem.containerMass} g</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Net remaining</span>
              <span className="detail-row__value mono" style={{ color: 'var(--col-safe)', fontWeight: 600 }}>
                {Math.max(0, currentGross - selectedItem.containerMass)} g
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              {!isLifted ? (
                <Tip content="Simulate lifting container off Shelf 2">
                  <button
                    className="btn-solid"
                    onClick={() => handleLift(selectedItem.id)}
                    style={{ width: '100%', background: 'var(--col-info)', borderColor: 'var(--col-info)' }}
                  >
                    Lift container
                  </button>
                </Tip>
              ) : (
                <Tip content="Simulate returning container with 410 g consumed">
                  <button
                    className="btn-solid"
                    onClick={() => handleReturn(selectedItem.id)}
                    style={{ width: '100%', background: 'var(--col-safe)', borderColor: 'var(--col-safe)' }}
                  >
                    Return container (-410 g)
                  </button>
                </Tip>
              )}

              <Tip content="Restore initial gross mass to container">
                <button
                  className="btn-outline"
                  onClick={() => handleRefill(selectedItem.id)}
                  style={{ width: '100%' }}
                >
                  Refill container
                </button>
              </Tip>
            </div>

            {/* Container Re-identification Note */}
            <div style={{ marginTop: 14, padding: 8, background: 'var(--tint-info)', borderRadius: 3, border: '1px solid rgba(31,95,107,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--col-info)', fontWeight: 600, marginBottom: 2 }}>
                Re-identification verified
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink)', lineHeight: 1.35 }}>
                Matched position (x: {selectedItem.x}cm, y: {selectedItem.y}cm) and tare {selectedItem.containerMass}g.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ border: 'var(--border)', borderRadius: 'var(--radius)', padding: 'var(--s4)', color: 'var(--mid)', fontSize: 13, background: 'var(--bg)' }}>
            Click an item on the shelf plan view to test lift, return, and re-identification.
          </div>
        )}
      </div>
    </div>
  );
}
