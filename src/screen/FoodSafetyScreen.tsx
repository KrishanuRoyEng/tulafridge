// FoodSafetyScreen — temperature history, fermentation, hot food, relocate with semantic styling
import React from 'react';
import { useSimStore } from '../sim/store';
import { computeRemainingLife, remainingLifeLabel, itemStatus, batterFillFraction, batterReadyTime, computeItemTemp } from '../sim/engine';
import { SEED_ITEMS, CATEGORY_COLORS } from '../data/items';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

export function FoodSafetyScreen() {
  const { sim } = useSimStore();
  const { temporaryHighlight } = useTour();
  const items = sim.items;

  const chicken = items.find(it => it.id === 'chicken')!;
  const batter = items.find(it => it.id === 'batter')!;
  const curd = items.find(it => it.id === 'curd')!;
  const milk = items.find(it => it.id === 'milk')!;

  const chickenTemp = computeItemTemp(chicken, sim.simSec, sim.cabinetTemp, 0);
  const chickenSafe = chickenTemp <= 5;
  const timeToSafeH = chickenSafe ? 0 : Math.max(0, Math.log((chickenTemp - sim.cabinetTemp) / (5 - sim.cabinetTemp)) / (-1 / 4500) / 3600);

  const batterFill = batterFillFraction(batter, sim.simSec);
  const batterReadyH = batterReadyTime(batter, sim.simSec);

  return (
    <div>
      <div className="card-header">
        <span>Food safety telemetry</span>
        <span style={{ fontSize: 10, color: 'var(--mid)' }}>Continuous microbiological bounds</span>
      </div>

      {/* Per-item status list */}
      <div style={{ marginBottom: 'var(--s5)' }}>
        {items.filter(it => it.category !== 'medicine').map(item => {
          const { fractionUsed, hoursRemaining } = computeRemainingLife(item, sim.simSec, sim.cabinetTemp);
          const status = itemStatus(fractionUsed);
          const iTemp = computeItemTemp(item, sim.simSec, sim.cabinetTemp, 0);
          const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.cooked;

          const chipClass =
            status === 'In range' ? 'chip--in-range' :
            status === 'Use first' ? 'chip--use-first' :
            'chip--discard';

          return (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 90px 90px 100px',
                gap: 'var(--s2)',
                padding: '6px 8px',
                borderBottom: 'var(--border)',
                borderLeft: `3px solid ${cat.color}`,
                alignItems: 'center',
                fontSize: 13,
                marginBottom: 2,
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                <SparklineTemp itemId={item.id} simSec={sim.simSec} cabinetTemp={sim.cabinetTemp} />
              </div>
              <Tip content={`Current local sensor reading: ${iTemp.toFixed(1)} °C`}>
                <div className="mono" style={{ fontSize: 12, color: 'var(--col-cold)' }}>{iTemp.toFixed(1)} °C</div>
              </Tip>
              <div>
                <div className="progress-bar" style={{ marginBottom: 2 }}>
                  <div
                    className="progress-bar__fill"
                    style={{
                      width: `${Math.min(100, Math.round(fractionUsed * 100))}%`,
                      background: status === 'In range' ? 'var(--col-safe)' : 'var(--col-caution)',
                    }}
                  />
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--mid)' }}>{Math.round(hoursRemaining)} h left</div>
              </div>
              <Tip content={`Storage verdict: ${status}`}>
                <span className={`chip ${chipClass}`} style={{ fontSize: 10 }}>{status}</span>
              </Tip>
            </div>
          );
        })}
      </div>

      {/* Scenario cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--s4)' }}>

        {/* Hot food cooling */}
        <div
          id="target-safety-cooling"
          className={`card ${temporaryHighlight === 'target-safety-cooling' ? 'tour-highlight' : ''}`}
          style={{ borderLeft: '4px solid var(--col-warm)' }}
        >
          <div className="card-header">
            <span>Hot food — cooked chicken</span>
            <CalloutMarker num={1} label="Cooling curve" targetId="target-safety-cooling" />
          </div>

          <div style={{ padding: '6px 0 10px' }}>
            <div className="metric-hero-label">Core temperature</div>
            <div className="metric-hero">
              {chickenTemp.toFixed(1)} <span className="metric-hero-unit">°C</span>
              <span className="chip chip--cooling" style={{ marginLeft: 8, fontSize: 11 }}>
                {chickenSafe ? 'Safe (5 °C)' : 'Cooling'}
              </span>
            </div>
          </div>

          {!chickenSafe && (
            <div className="detail-row">
              <span className="detail-row__label">Time to safe (5 °C)</span>
              <span className="detail-row__value mono">{timeToSafeH.toFixed(1)} h</span>
            </div>
          )}

          {/* Cooling curve chart */}
          <CoolingCurve
            startTemp={chicken.initialTemp}
            cabinetTemp={sim.cabinetTemp}
            currentSec={sim.simSec - chicken.addedAt}
            tau={4500}
          />

          <div style={{ fontSize: 11, color: 'var(--col-warm)', marginTop: 'var(--s2)', borderTop: 'var(--border)', paddingTop: 'var(--s2)', lineHeight: 1.35 }}>
            Divide into shallow containers to accelerate heat dissipation. Zone airflow increased.
          </div>
        </div>

        {/* Fermentation */}
        <div
          id="target-safety-ferment"
          className={`card ${temporaryHighlight === 'target-safety-ferment' ? 'tour-highlight' : ''}`}
          style={{ borderLeft: '4px solid var(--col-ferment)' }}
        >
          <div className="card-header">
            <span>Fermentation zone</span>
            <CalloutMarker num={2} label="Fermentation fill line" targetId="target-safety-ferment" />
          </div>

          <div style={{ padding: '6px 0 10px' }}>
            <div className="metric-hero-label">Batter fill expansion</div>
            <div className="metric-hero">
              {Math.round(batterFill * 100)} <span className="metric-hero-unit">%</span>
              <span className={`chip ${batterReadyH <= 0 ? 'chip--ready' : 'chip--fermenting'}`} style={{ marginLeft: 8, fontSize: 11 }}>
                {batterReadyH <= 0 ? 'Ready' : 'Rising'}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--s3)' }}>
            {/* Fill height visual */}
            <div style={{ width: '100%', height: 14, background: 'var(--tint-ferment)', borderRadius: 2, overflow: 'hidden', position: 'relative', border: '1px solid var(--hairline)' }}>
              <div style={{
                position: 'absolute',
                left: '72%',
                top: 0,
                bottom: 0,
                width: 2,
                background: 'var(--col-safe)',
                zIndex: 2,
              }} />
              <div style={{
                width: `${Math.round(batterFill * 100)}%`,
                height: '100%',
                background: 'var(--col-ferment)',
                transition: 'width 300ms',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              {batterReadyH <= 0 ? 'Target fill (72%) reached — cool zone engaged' : `Target fill reached in ${batterReadyH.toFixed(1)} h`}
            </div>
          </div>

          <div style={{ borderTop: 'var(--border)', paddingTop: 'var(--s2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Curd state</span>
            <span className="chip chip--ready">Set (solid)</span>
          </div>
        </div>

        {/* Relocate suggestion */}
        <div
          id="target-safety-relocate"
          className={`card ${temporaryHighlight === 'target-safety-relocate' ? 'tour-highlight' : ''}`}
          style={{ borderLeft: '4px solid var(--col-info)' }}
        >
          <div className="card-header">
            <span>Thermal relocation</span>
            <CalloutMarker num={3} label="Relocate suggestion" targetId="target-safety-relocate" />
          </div>

          <div style={{ padding: '6px 0 10px' }}>
            <div className="metric-hero-label">Potential shelf-life gain</div>
            <div className="metric-hero" style={{ color: 'var(--col-safe)' }}>
              +14 <span className="metric-hero-unit">h</span>
            </div>
          </div>

          <div style={{ fontSize: 12, marginBottom: 'var(--s2)', lineHeight: 1.35 }}>
            Move milk from door bin to rear of Shelf 1 to reduce temperature exposure by 1.3 °C.
          </div>

          <div className="detail-row">
            <span className="detail-row__label">Door bin temp</span>
            <span className="detail-row__value mono" style={{ color: 'var(--col-caution)' }}>{(sim.cabinetTemp + 1.5).toFixed(1)} °C</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Shelf 1 rear temp</span>
            <span className="detail-row__value mono" style={{ color: 'var(--col-cold)' }}>{(sim.cabinetTemp + 0.2).toFixed(1)} °C</span>
          </div>

          <div style={{ marginTop: 'var(--s2)', fontSize: 11, color: 'var(--mid)' }}>
            {remainingLifeLabel(milk, sim.simSec, sim.cabinetTemp)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sparkline showing temperature trend
function SparklineTemp({ itemId, simSec, cabinetTemp }: { itemId: string; simSec: number; cabinetTemp: number }) {
  const item = SEED_ITEMS.find(it => it.id === itemId);
  if (!item) return null;

  const W = 60, H = 16;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const sec = simSec - (9 - i) * 600;
    return computeItemTemp(item, sec, cabinetTemp, 0);
  });
  const min = Math.min(...pts);
  const max = Math.max(...pts) + 0.1;
  const points = pts.map((t, i) => ({
    x: 2 + i * ((W - 4) / 9),
    y: H - 2 - ((t - min) / (max - min)) * (H - 4),
  }));
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg width={W} height={H} style={{ display: 'block', marginTop: 2 }}>
      <path d={d} fill="none" stroke="var(--col-cold)" strokeWidth="1" />
    </svg>
  );
}

// Cooling curve mini-chart
function CoolingCurve({ startTemp, cabinetTemp, currentSec, tau }: {
  startTemp: number;
  cabinetTemp: number;
  currentSec: number;
  tau: number;
}) {
  const W = 220, H = 70;
  const totalSec = 14400; // 4h
  const safeTemp = 5;
  const steps = 40;
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * totalSec;
    const temp = cabinetTemp + (startTemp - cabinetTemp) * Math.exp(-t / tau);
    return {
      x: 8 + (i / steps) * (W - 16),
      y: 8 + (1 - (temp - cabinetTemp) / (startTemp - cabinetTemp)) * (H - 16),
      temp,
    };
  });

  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const safeY = 8 + (1 - (safeTemp - cabinetTemp) / (startTemp - cabinetTemp)) * (H - 16);

  return (
    <svg width={W} height={H} style={{ display: 'block', margin: 'var(--s2) 0', border: 'var(--border)', borderRadius: 3, background: 'var(--tint-warm)' }}>
      {/* Safe 5°C line */}
      <line x1="8" y1={safeY} x2={W - 8} y2={safeY} stroke="var(--col-safe)" strokeWidth="1" strokeDasharray="3,2" />
      <text x={W - 10} y={safeY - 3} textAnchor="end" fontSize="7" fontFamily="var(--font-mono)" fill="var(--col-safe)">5 °C Safe limit</text>

      {/* Cooling curve in terracotta */}
      <path d={d} fill="none" stroke="var(--col-warm)" strokeWidth="1.5" />

      {/* Axis Labels */}
      <text x="10" y={H - 3} fontSize="7" fontFamily="var(--font-mono)" fill="#6B6F6C">0 h (62 °C)</text>
      <text x={W - 10} y={H - 3} textAnchor="end" fontSize="7" fontFamily="var(--font-mono)" fill="#6B6F6C">4 h</text>
    </svg>
  );
}
