// EnergyScreen — tariff bands, compressor schedule, daily units, semantic tints, and callouts
import React from 'react';
import { useSimStore } from '../sim/store';
import { TARIFF_BANDS } from '../data/items';
import { hourOfDay, compressorRunTime, DAILY_KWH } from '../sim/engine';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

export function EnergyScreen() {
  const { sim } = useSimStore();
  const { temporaryHighlight } = useTour();
  const curHour = hourOfDay(sim.simSec);
  const { runBlocksToday, isRunning } = compressorRunTime(sim.simSec);

  const W = 480, H = 80;
  const toX = (h: number) => (h / 24) * (W - 40) + 20;

  // Unshifted blocks (every 2h, 20 min each)
  const unshiftedBlocks = Array.from({ length: 12 }, (_, i) => ({
    startH: i * 2,
    endH: i * 2 + 0.33,
  }));

  const totalMassKg = sim.items.reduce((s, it) => s + it.massGross / 1000, 0);
  const shiftWindowMin = Math.round(Math.min(90, totalMassKg * 10));
  const estKwh = DAILY_KWH;
  const unshiftedKwh = DAILY_KWH * 1.25; // 25% higher cost/units unshifted
  const kwhSaved = (unshiftedKwh - estKwh).toFixed(2);

  // Defrost cycle scheduled at 3:00 am - 3:30 am
  const defrostStartH = 3;
  const defrostEndH = 3.5;

  return (
    <div>
      <div className="card-header">
        <span>Energy & Tariff Optimization</span>
        <span style={{ fontSize: 10, color: 'var(--mid)' }}>Automated grid-tariff shifting</span>
      </div>

      {/* Hero row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
        <div className="card">
          <div className="metric-hero-label">Daily electricity savings</div>
          <div className="metric-hero" style={{ color: 'var(--col-safe)' }}>
            {kwhSaved} <span className="metric-hero-unit">kWh</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
            vs unshifted cooling schedule
          </div>
        </div>

        <div className="card">
          <div className="metric-hero-label">Estimated usage today</div>
          <div className="metric-hero">
            {estKwh.toFixed(2)} <span className="metric-hero-unit">kWh</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
            Unshifted: {unshiftedKwh.toFixed(2)} kWh
          </div>
        </div>

        <div className="card">
          <div className="metric-hero-label">Tariff shift allowance</div>
          <div className="metric-hero" style={{ color: 'var(--col-info)' }}>
            {shiftWindowMin} <span className="metric-hero-unit">min</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
            Backed by {totalMassKg.toFixed(1)} kg stored mass
          </div>
        </div>

        <div className="card">
          <div className="metric-hero-label">Compressor state</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span className={`chip ${isRunning ? 'chip--in-range' : 'chip--cold'}`} style={{ fontSize: 12 }}>
              {isRunning ? 'Compressor active' : 'Compressor idle'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 6 }}>
            {isRunning ? 'Running in off-peak window' : 'Compressor idle until 11 pm'}
          </div>
        </div>
      </div>

      {/* 24-Hour Schedule Chart */}
      <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>24-Hour schedule: Tariff bands & compressor cycles</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <CalloutMarker num={1} label="Cheap tariff band" targetId="target-energy-schedule" />
          <CalloutMarker num={2} label="Shifted compressor run" targetId="target-energy-schedule" />
          <CalloutMarker num={3} label="Defrost cycle" targetId="target-energy-schedule" />
        </div>
      </div>

      <svg
        id="target-energy-schedule"
        className={temporaryHighlight === 'target-energy-schedule' ? 'tour-highlight' : ''}
        width={W}
        height={H + 70}
        style={{ display: 'block', border: 'var(--border)', borderRadius: 'var(--radius)', background: '#F8F5EE', marginBottom: 'var(--s3)', maxWidth: '100%' }}
      >
        {/* 1. Tariff Bands with distinct tints:
            Cheap = green tint (#DDEBE5)
            Normal = neutral (#F4F1EA)
            Peak = amber tint (#F5E7C8) */}
        {TARIFF_BANDS.map((band, i) => {
          const isCheap = band.label.toLowerCase().includes('off-peak') || band.label.toLowerCase().includes('cheap');
          const isPeak = band.label.toLowerCase().includes('peak');
          const fillTint = isCheap ? 'var(--tint-safe)' : isPeak ? 'var(--tint-caution)' : '#F4F1EA';

          return (
            <rect
              key={i}
              x={toX(band.start)}
              y={6}
              width={toX(band.end) - toX(band.start)}
              height={44}
              fill={fillTint}
              stroke="var(--hairline)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Tariff band labels */}
        {TARIFF_BANDS.map((band, i) => {
          const isCheap = band.label.toLowerCase().includes('off-peak') || band.label.toLowerCase().includes('cheap');
          const isPeak = band.label.toLowerCase().includes('peak');
          const textColor = isCheap ? 'var(--col-safe)' : isPeak ? 'var(--col-caution)' : 'var(--mid)';

          return (
            <text
              key={`lbl-${i}`}
              x={toX((band.start + band.end) / 2)}
              y={20}
              textAnchor="middle"
              fontSize="8"
              fontFamily="var(--font-mono)"
              fontWeight="600"
              fill={textColor}
            >
              {band.label.toUpperCase()}
            </text>
          );
        })}

        {/* Unshifted baseline runs (faint outline) */}
        {unshiftedBlocks.map((block, i) => (
          <rect
            key={`un-${i}`}
            x={toX(block.startH)}
            y={28}
            width={Math.max(2, toX(block.endH) - toX(block.startH))}
            height={8}
            fill="#B8B6B0"
            opacity="0.35"
          />
        ))}

        {/* 2. Shifted active compressor runs in solid teal */}
        {runBlocksToday.map((block, i) => (
          <rect
            key={`run-${i}`}
            x={toX(block.startH)}
            y={28}
            width={Math.max(3, toX(block.endH) - toX(block.startH))}
            height={16}
            rx={2}
            fill="var(--col-info)"
          />
        ))}

        {/* 3. Defrost cycle (plum/medicine tone at 3-3.5h) */}
        <rect
          x={toX(defrostStartH)}
          y={28}
          width={toX(defrostEndH) - toX(defrostStartH)}
          height={16}
          rx={2}
          fill="var(--col-med)"
        />
        <text
          x={toX((defrostStartH + defrostEndH) / 2)}
          y={40}
          textAnchor="middle"
          fontSize="7"
          fontFamily="var(--font-mono)"
          fill="#F4F1EA"
          fontWeight="600"
        >
          DEFROST
        </text>

        {/* Current hour line */}
        <line
          x1={toX(curHour)}
          y1={6}
          x2={toX(curHour)}
          y2={H + 34}
          stroke="var(--ink)"
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />
        <text x={toX(curHour)} y={H + 46} textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="var(--ink)" fontWeight="600">
          NOW ({curHour}h)
        </text>

        {/* Legend */}
        <rect x={20} y={H + 20} width={12} height={8} rx={1} fill="var(--col-info)" />
        <text x={36} y={H + 27} fontSize="8" fontFamily="var(--font-mono)" fill="var(--ink)">Shifted run</text>

        <rect x={110} y={H + 20} width={12} height={8} rx={1} fill="#B8B6B0" opacity="0.4" />
        <text x={126} y={H + 27} fontSize="8" fontFamily="var(--font-mono)" fill="var(--mid)">Unshifted run</text>

        <rect x={210} y={H + 20} width={12} height={8} rx={1} fill="var(--col-med)" />
        <text x={226} y={H + 27} fontSize="8" fontFamily="var(--font-mono)" fill="var(--ink)">Defrost</text>

        {/* X-axis 24h Ticks */}
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => (
          <text key={h} x={toX(h)} y={H + 10} textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="#6B6F6C">
            {h}h
          </text>
        ))}
      </svg>

      <div style={{ padding: '8px 12px', background: 'var(--tint-safe)', border: '1px solid rgba(47,111,94,0.25)', borderRadius: 3, fontSize: 12, color: 'var(--ink)' }}>
        <span style={{ fontWeight: 600, color: 'var(--col-safe)' }}>Thermal storage shifting enabled: </span>
        Compressor cycles pre-cool the cabinet during off-peak windows and idle during peak hours (5 pm - 9 pm), reducing peak tariff load without compromising internal food safety.
      </div>
    </div>
  );
}
