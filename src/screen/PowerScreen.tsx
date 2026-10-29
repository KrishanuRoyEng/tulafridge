// PowerScreen — outage logic, pre-cooling, thermal capacity with semantic colors and callouts
import React, { useState } from 'react';
import { useSimStore, useSimControls } from '../sim/store';
import { thermalCapacity, preCoolingDepth, cabinetTempDuringOutage } from '../sim/engine';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

export function PowerScreen() {
  const { sim } = useSimStore();
  const controls = useSimControls();
  const { temporaryHighlight } = useTour();
  const [removedFoodKg, setRemovedFoodKg] = useState(0);

  const items = removedFoodKg > 0
    ? sim.items.filter(it => it.category !== 'medicine').slice(0, Math.max(0, sim.items.length - Math.round(removedFoodKg * 2)))
    : sim.items;

  const cap = thermalCapacity(items); // J/°C
  const totalMassKg = items.reduce((s, it) => s + it.massGross / 1000, 0);
  const { preCoolSetPoint, preCoolStartBeforeH } = preCoolingDepth(cap, 3, 28, 4);

  // Generate temperature curves over 8h: before/after outage (3h starting at t=2h)
  const W = 480, H = 170;
  const totalH = 8;
  const outageStartH = 2;
  const outageDurH = 3;
  const safeLimit = 8;

  const steps = 80;
  const withoutPrecool = Array.from({ length: steps + 1 }, (_, i) => {
    const h = (i / steps) * totalH;
    if (h < outageStartH) return 4.0;
    if (h < outageStartH + outageDurH) {
      return cabinetTempDuringOutage((h - outageStartH) * 3600, 4.0, 28, cap);
    }
    return 4.0 + (cabinetTempDuringOutage(outageDurH * 3600, 4.0, 28, cap) - 4.0) * Math.exp(-(h - outageStartH - outageDurH) * 0.3);
  });

  const withPrecool = Array.from({ length: steps + 1 }, (_, i) => {
    const h = (i / steps) * totalH;
    if (h < outageStartH - preCoolStartBeforeH) return 4.0;
    if (h < outageStartH) {
      const precoolElapsed = h - (outageStartH - preCoolStartBeforeH);
      return 4.0 - (4.0 - preCoolSetPoint) * (precoolElapsed / preCoolStartBeforeH);
    }
    if (h < outageStartH + outageDurH) {
      return cabinetTempDuringOutage((h - outageStartH) * 3600, preCoolSetPoint, 28, cap);
    }
    return 4.0 + (cabinetTempDuringOutage(outageDurH * 3600, preCoolSetPoint, 28, cap) - 4.0) * Math.exp(-(h - outageStartH - outageDurH) * 0.3);
  });

  const minT = 1, maxT = 18;
  const toY = (t: number) => H - 24 - ((t - minT) / (maxT - minT)) * (H - 36);
  const toX = (i: number) => 40 + (i / steps) * (W - 60);
  const safeLimitY = toY(safeLimit);

  const withoutPath = withoutPrecool.map((t, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(t)}`).join(' ');
  const withPath = withPrecool.map((t, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(t)}`).join(' ');

  // Outage band x coords (blue-grey fill)
  const outageX1 = toX((outageStartH / totalH) * steps);
  const outageX2 = toX(((outageStartH + outageDurH) / totalH) * steps);

  const precoolX1 = toX(Math.max(0, (outageStartH - preCoolStartBeforeH) / totalH) * steps);
  const precoolX2 = outageX1;

  const yTicks = [2, 4, 8, 12, 16];

  const maxTempWithout = Math.max(...withoutPrecool.slice(
    Math.round((outageStartH / totalH) * steps),
    Math.round(((outageStartH + outageDurH) / totalH) * steps)
  ));

  return (
    <div>
      <div className="card-header">
        <span>Power & Outage Management</span>
        <span style={{ fontSize: 10, color: 'var(--mid)' }}>Predictive thermal storage</span>
      </div>

      {/* Hero row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
        <div className="card">
          <div className="metric-hero-label">Safe outage buffer</div>
          <div className="metric-hero" style={{ color: 'var(--col-safe)' }}>
            3.0 <span className="metric-hero-unit">hours</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
            Pre-cooling preserves contents &lt; 8 °C
          </div>
        </div>

        <div className="card" id="target-power-cap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="metric-hero-label">Thermal capacity</div>
            <CalloutMarker num={4} label="Thermal capacity sum" targetId="target-power-cap" position="left" />
          </div>
          <Tip content="Thermal capacity sum: Sum of items x mass x specific heat capacity + cabinet inertia">
            <div className="metric-hero">
              {Math.round(cap / 1000)} <span className="metric-hero-unit">kJ/°C</span>
            </div>
          </Tip>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
            {totalMassKg.toFixed(1)} kg stored mass acting as cold sink
          </div>
        </div>

        <div className="card">
          <div className="metric-hero-label">Mains & battery status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span className={`chip ${sim.powerCut ? 'chip--alert' : 'chip--in-range'}`} style={{ fontSize: 12 }}>
              {sim.powerCut ? 'Power cut active' : 'Mains online'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 8 }}>
            Battery backup: 98% (controller & display)
          </div>
        </div>
      </div>

      {/* Pre-cooling schedule banner */}
      <div
        id="target-power-precool"
        style={{
          marginBottom: 'var(--s4)',
          padding: '10px 14px',
          border: 'var(--border)',
          borderRadius: 'var(--radius)',
          background: 'var(--tint-cold)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--col-cold)' }}>
            3 h Outage scheduled: Load-shedding notice
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink)', marginTop: 2 }}>
            Set-point lowered to <span className="mono" style={{ fontWeight: 600 }}>{preCoolSetPoint.toFixed(1)} °C</span> starting{' '}
            <span className="mono" style={{ fontWeight: 600 }}>{preCoolStartBeforeH.toFixed(1)} h</span> before cut.
          </div>
        </div>
        <CalloutMarker num={2} label="Pre-cooling start" targetId="target-power-precool" />
      </div>

      {/* Temperature chart */}
      <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Outage thermal simulation curve</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <CalloutMarker num={1} label="Outage band" targetId="target-power-chart" />
          <CalloutMarker num={3} label="Without vs with lines" targetId="target-power-chart" />
        </div>
      </div>

      <svg
        id="target-power-chart"
        className={temporaryHighlight === 'target-power-chart' ? 'tour-highlight' : ''}
        width={W}
        height={H}
        style={{ display: 'block', border: 'var(--border)', borderRadius: 'var(--radius)', background: '#F8F5EE', marginBottom: 'var(--s3)', maxWidth: '100%' }}
      >
        {/* Pre-cooling segment (blue-grey tint) */}
        {preCoolStartBeforeH > 0 && (
          <rect
            x={precoolX1}
            y={0}
            width={precoolX2 - precoolX1}
            height={H - 20}
            fill="var(--tint-cold)"
            opacity="0.6"
          />
        )}

        {/* 1. Outage band (blue-grey tint #DCE5EA) */}
        <rect
          x={outageX1}
          y={0}
          width={outageX2 - outageX1}
          height={H - 20}
          fill="var(--col-cold)"
          fillOpacity="0.18"
        />
        <text
          x={(outageX1 + outageX2) / 2}
          y={16}
          textAnchor="middle"
          fontSize="9"
          fontFamily="var(--font-mono)"
          fontWeight="600"
          fill="var(--col-cold)"
        >
          3 h Outage band
        </text>

        {/* Ink 8°C safety line labelled in text */}
        <line
          x1={38}
          y1={safeLimitY}
          x2={W - 20}
          y2={safeLimitY}
          stroke="#1D1F1E"
          strokeWidth="1.2"
          strokeDasharray="4,3"
        />
        <text
          x={W - 22}
          y={safeLimitY - 4}
          textAnchor="end"
          fontSize="8"
          fontFamily="var(--font-mono)"
          fontWeight="600"
          fill="#1D1F1E"
        >
          8 °C Food safety limit
        </text>

        {/* Y-axis Ticks */}
        {yTicks.map(t => (
          <g key={t}>
            <line x1={36} y1={toY(t)} x2={40} y2={toY(t)} stroke="#9E9C98" strokeWidth="0.75" />
            <text x={34} y={toY(t) + 3} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="#6B6F6C">{t}</text>
          </g>
        ))}

        {/* 3. Terracotta for "without" curve */}
        <path d={withoutPath} fill="none" stroke="var(--col-warm)" strokeWidth="2" />

        {/* 3. Green for "with" pre-cooling curve */}
        <path d={withPath} fill="none" stroke="var(--col-safe)" strokeWidth="2" />

        {/* Legend */}
        <line x1={W - 140} y1={H - 12} x2={W - 120} y2={H - 12} stroke="var(--col-warm)" strokeWidth="2" />
        <text x={W - 116} y={H - 9} fontSize="8" fontFamily="var(--font-mono)" fill="var(--col-warm)" fontWeight="600">Without pre-cool</text>

        <line x1={W - 65} y1={H - 12} x2={W - 45} y2={H - 12} stroke="var(--col-safe)" strokeWidth="2" />
        <text x={W - 41} y={H - 9} fontSize="8" fontFamily="var(--font-mono)" fill="var(--col-safe)" fontWeight="600">Pre-cooled</text>

        {/* X-axis hour labels */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(h => (
          <text key={h} x={toX((h / totalH) * steps)} y={H - 4} textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="#6B6F6C">{h}h</text>
        ))}
      </svg>

      {/* Controls & Scenarios */}
      <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center', marginBottom: 'var(--s4)', flexWrap: 'wrap' }}>
        <button
          className={sim.powerCut ? 'btn-outline' : 'btn-solid'}
          style={!sim.powerCut ? { background: 'var(--col-alert)', borderColor: 'var(--col-alert)' } : {}}
          onClick={() => controls.updateSim(s => ({
            ...s,
            powerCut: !s.powerCut,
            powerCutStartSec: s.simSec,
            preCooling: false,
          }))}
        >
          {sim.powerCut ? 'Restore mains power' : 'Simulate 3 h outage'}
        </button>

        <button
          className="btn-outline"
          onClick={() => {
            setRemovedFoodKg(prev => Math.min(6, prev + 2));
          }}
        >
          Remove 4 kg of food
        </button>

        {removedFoodKg > 0 && (
          <span style={{ fontSize: 12, color: 'var(--col-caution)' }}>
            {removedFoodKg} kg removed — thermal capacity drops, pre-cool starts later
          </span>
        )}

        {removedFoodKg > 0 && (
          <button className="btn-text" onClick={() => setRemovedFoodKg(0)}>Reset food</button>
        )}
      </div>

      {/* Post-outage verdicts */}
      <div className="card">
        <div className="card-header">
          <span>Post-outage food safety verdicts</span>
          <span style={{ fontSize: 10, color: 'var(--mid)' }}>3 h exposure model</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px 16px' }}>
          {sim.items.filter(it => it.category !== 'medicine').slice(0, 6).map(it => {
            const verdict = sim.preCooling || !sim.powerCut ? 'Safe' : maxTempWithout <= 8 ? 'Safe' : 'Check';
            const chipClass = verdict === 'Safe' ? 'chip--in-range' : 'chip--use-first';
            return (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: 'var(--border)', fontSize: 12, alignItems: 'center' }}>
                <span>{it.name}</span>
                <span className={`chip ${chipClass}`} style={{ fontSize: 10 }}>{verdict}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
