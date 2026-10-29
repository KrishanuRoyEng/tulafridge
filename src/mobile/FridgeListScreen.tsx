// FridgeListScreen — shelf-by-shelf item list for mobile
import React, { useState } from 'react';
import { useSimStore } from '../sim/store';
import { computeRemainingLife, remainingLifeLabel, itemStatus } from '../sim/engine';
import { ItemDetailSheet } from '../screen/InsideScreen';
import { ZONE_META } from '../data/items';
import { Tip } from '../components/Tip';

const SHELF_ORDER = ['shelf3', 'shelf2', 'shelf1', 'door', 'crisper', 'medicine'] as const;
const SHELF_LABELS: Record<string, string> = {
  shelf3: 'Shelf 3', shelf2: 'Shelf 2', shelf1: 'Shelf 1',
  door: 'Door shelf', crisper: 'Crisper', medicine: 'Medicine zone',
};

export function FridgeListScreen() {
  const { sim } = useSimStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = selectedId ? sim.items.find(it => it.id === selectedId) : null;

  if (selectedItem) {
    return (
      <div>
        <button className="btn-text" onClick={() => setSelectedId(null)} style={{ marginBottom: 'var(--s3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Back
        </button>
        <ItemDetailSheet
          item={selectedItem}
          simSec={sim.simSec}
          cabinetTemp={sim.cabinetTemp}
          onClose={() => setSelectedId(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--s3)' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Fridge inventory</div>
        <span style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'var(--font-mono)' }}>
          {sim.items.length} items
        </span>
      </div>

      {SHELF_ORDER.map(shelfId => {
        const items = sim.items.filter(it => it.shelf === shelfId);
        if (items.length === 0) return null;
        const meta = ZONE_META[shelfId];
        return (
          <div key={shelfId} style={{ marginBottom: 'var(--s4)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 6px',
                background: meta?.tint || 'transparent',
                borderLeft: `4px solid ${meta?.border || 'var(--hairline)'}`,
                marginBottom: 'var(--s1)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink)' }}>
                {SHELF_LABELS[shelfId]}
              </span>
              <span style={{ fontSize: 10, color: 'var(--mid)', marginLeft: 'auto' }}>
                {meta?.tempTarget}
              </span>
            </div>
            {items.map(item => {
              const { fractionUsed } = computeRemainingLife(item, sim.simSec, sim.cabinetTemp);
              const status = itemStatus(fractionUsed);
              const netMass = item.massGross - item.containerMass;
              const lifeLabel = remainingLifeLabel(item, sim.simSec, sim.cabinetTemp);
              return (
                <Tip key={item.id} content={`${item.name} (${item.category}): ${netMass} g net. Status: ${status}.`}>
                  <div
                    className={`cat-border-${item.category}`}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--s2)',
                      padding: 'var(--s2) var(--s2)',
                      borderBottom: 'var(--border)',
                      cursor: 'pointer',
                      background: 'rgba(29,31,30,0.01)',
                      marginBottom: 2,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'var(--font-mono)' }}>
                        {lifeLabel}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="mono" style={{ fontSize: 12 }}>{netMass} g</div>
                      <span
                        className={`chip ${status === 'In range' ? 'chip--in-range' : status === 'Use first' ? 'chip--use-first' : 'chip--discard'}`}
                        style={{ fontSize: 9 }}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </Tip>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
