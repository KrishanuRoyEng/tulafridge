// MedicinesScreen — medicine zone monitoring with semantic colors, hero metric, and callouts
import React, { useCallback } from 'react';
import { useSimStore } from '../sim/store';
import { simTimeToDisplay } from '../sim/engine';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

const SAFE_MIN = 2;
const SAFE_MAX = 8;

export function MedicinesScreen() {
  const { sim } = useSimStore();
  const { temporaryHighlight } = useTour();
  const medItems = sim.items.filter(it => it.shelf === 'medicine');
  const medTemp = sim.cabinetTemp - 0.5;
  const inRange = medTemp >= SAFE_MIN && medTemp <= SAFE_MAX;

  // 24h temperature history
  const history = generateMedTempHistory(sim.simSec, sim.cabinetTemp, sim.medicineExcursion, sim.medicineExcursionStart, sim.medicineExcursionEnd);

  const exportCSV = useCallback(() => {
    const rows = [
      ['Timestamp', 'Temperature (°C)', 'Status', 'Zone'],
      ...history.map(h => [h.label, h.temp.toFixed(2), h.temp >= SAFE_MIN && h.temp <= SAFE_MAX ? 'In range' : 'Excursion', 'Medicine Zone']),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tula-medicine-temperature-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  return (
    <div>
      <div className="card-header">
        <span>Medicine Zone Storage</span>
        <span style={{ fontSize: 10, color: 'var(--col-med)' }}>Dedicated 2–8 °C biologics corridor</span>
      </div>

      {/* Hero row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--col-med)' }}>
          <div className="metric-hero-label">Current zone temp</div>
          <div className="metric-hero" style={{ color: inRange ? 'var(--col-safe)' : 'var(--col-alert)' }}>
            {medTemp.toFixed(1)} <span className="metric-hero-unit">°C</span>
            <span className={`chip ${inRange ? 'chip--in-range' : 'chip--excursion'}`} style={{ marginLeft: 8, fontSize: 11 }}>
              {inRange ? 'In range' : 'Excursion'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
            Permitted range: 2.0 °C to 8.0 °C
          </div>
        </div>

        <div className="card">
          <div className="metric-hero-label">Excursions (24 h)</div>
          <div className="metric-hero" style={{ color: sim.medicineExcursion ? 'var(--col-alert)' : 'var(--ink)' }}>
            {sim.medicineExcursion ? '1' : '0'} <span className="metric-hero-unit">logged</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
            {sim.medicineExcursion ? '40 min duration logged during power cut' : 'Zero temperature deviations detected'}
          </div>
        </div>

        <div className="card" id="target-medicines-export">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="metric-hero-label">Audit export</div>
            <CalloutMarker num={3} label="Export" targetId="target-medicines-export" position="left" />
          </div>
          <div style={{ marginTop: 6 }}>
            <Tip content="Download verified 24-hour temperature log as CSV for clinical audit">
              <button
                className="btn-solid"
                onClick={exportCSV}
                style={{ width: '100%', background: 'var(--col-med)', borderColor: 'var(--col-med)', fontSize: 12, padding: '6px 12px' }}
              >
                Export record (CSV)
              </button>
            </Tip>
          </div>
          <div style={{ fontSize: 10, color: 'var(--mid)', marginTop: 6 }}>
            CSV contains 24 hourly timestamps with status
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="card" style={{ marginBottom: 'var(--s4)' }}>
        <div className="card-header" style={{ marginBottom: 6 }}>
          <span>Registered Medications</span>
          <span style={{ fontSize: 10, color: 'var(--mid)' }}>3 items registered</span>
        </div>
        {medItems.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: 'var(--border)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{item.label}</div>
              <div style={{ fontSize: 11, color: 'var(--mid)' }}>{item.notes} · Registered range 2–8 °C</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: inRange ? 'var(--col-safe)' : 'var(--col-alert)', marginRight: 8 }}>
                {medTemp.toFixed(1)} °C
              </span>
              <Tip content={`Medicine storage status: ${inRange ? 'In range (2-8°C)' : 'Excursion (>8°C)'}`}>
                <span className={`chip ${inRange ? 'chip--in-range' : 'chip--excursion'}`} style={{ fontSize: 10 }}>
                  {inRange ? 'In range' : 'Excursion'}
                </span>
              </Tip>
            </div>
          </div>
        ))}
      </div>

      {/* 24-Hour Temperature Chart */}
      <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>24-Hour medicine zone telemetry</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <CalloutMarker num={1} label="Permitted band" targetId="target-medicines-band" />
          <CalloutMarker num={2} label="Excursion marker" targetId="target-medicines-excursion" />
        </div>
      </div>

      <div
        id="target-medicines-band"
        className={temporaryHighlight === 'target-medicines-band' ? 'tour-highlight' : ''}
      >
        <MedTempChart history={history} />
      </div>

      {/* Excursion log card */}
      {sim.medicineExcursion && (
        <div
          id="target-medicines-excursion"
          className={temporaryHighlight === 'target-medicines-excursion' ? 'tour-highlight' : ''}
          style={{
            marginTop: 'var(--s3)',
            padding: '10px 14px',
            background: 'var(--tint-alert)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(200,87,27,0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--col-alert)', marginBottom: 2 }}>
              Excursion logged: 40-minute deviation
            </div>
            <span className="chip chip--excursion" style={{ fontSize: 10 }}>Alert active</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.4 }}>
            Started: {simTimeToDisplay(sim.medicineExcursionStart)}
            {sim.medicineExcursionEnd > 0 && ` · Ended: ${simTimeToDisplay(sim.medicineExcursionEnd)}`}
            {' · Peak temperature: 8.8 °C.'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--col-alert)', marginTop: 4, fontWeight: 500 }}>
            Temperature remained within 48-hour tolerance. Consult pharmacist before use.
          </div>
        </div>
      )}
    </div>
  );
}

function generateMedTempHistory(simSec: number, cabinetTemp: number, hasExcursion: boolean, excStart: number, excEnd: number) {
  return Array.from({ length: 25 }, (_, i) => {
    const h = i;
    const sec = simSec - (24 - h) * 3600;
    let temp = cabinetTemp - 0.5 + Math.sin(sec / 1800) * 0.15;
    // Add excursion spike
    if (hasExcursion) {
      const excMidSec = (excStart + (excEnd > 0 ? excEnd : excStart + 2400)) / 2;
      const excDur = excEnd > 0 ? excEnd - excStart : 2400;
      const distSec = Math.abs(sec - excMidSec);
      if (distSec < excDur) {
        temp += (8.8 - temp) * Math.exp(-distSec / 700) * 1.5;
      }
    }
    const daySec = ((sec % 86400) + 86400) % 86400;
    const hour = Math.floor(daySec / 3600);
    const label = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'pm' : 'am'}`;
    return { hour, label, temp };
  });
}

function MedTempChart({ history }: { history: Array<{ hour: number; label: string; temp: number }> }) {
  const W = 480, H = 130;
  const minT = 0, maxT = 12;
  const toY = (t: number) => H - 20 - ((t - minT) / (maxT - minT)) * (H - 36);
  const toX = (i: number) => 36 + (i / 24) * (W - 56);

  const safeMinY = toY(SAFE_MIN);
  const safeMaxY = toY(SAFE_MAX);

  const path = history.map((h, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(h.temp)}`).join(' ');

  return (
    <svg width={W} height={H} style={{ display: 'block', border: 'var(--border)', borderRadius: 'var(--radius)', background: '#F8F5EE', maxWidth: '100%' }}>
      {/* 1. Permitted Safe Band in plum-brown tint (2-8°C) */}
      <rect
        x={36}
        y={safeMaxY}
        width={W - 56}
        height={safeMinY - safeMaxY}
        fill="var(--tint-med)"
        opacity="0.45"
      />

      {/* Safe Corridor Boundary Lines */}
      <line x1={36} y1={safeMaxY} x2={W - 20} y2={safeMaxY} stroke="var(--col-med)" strokeWidth="1" strokeDasharray="3,2" />
      <text x={W - 22} y={safeMaxY - 3} textAnchor="end" fontSize="7" fontFamily="var(--font-mono)" fill="var(--col-med)" fontWeight="600">8 °C Max</text>

      <line x1={36} y1={safeMinY} x2={W - 20} y2={safeMinY} stroke="var(--col-med)" strokeWidth="1" strokeDasharray="3,2" />
      <text x={W - 22} y={safeMinY + 9} textAnchor="end" fontSize="7" fontFamily="var(--font-mono)" fill="var(--col-med)" fontWeight="600">2 °C Min</text>

      {/* Temperature line */}
      <path d={path} fill="none" stroke="var(--col-med)" strokeWidth="2" />

      {/* Data points */}
      {history.map((h, i) => {
        const isExc = h.temp < SAFE_MIN || h.temp > SAFE_MAX;
        return (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(h.temp)}
            r={isExc ? 4 : 2}
            fill={isExc ? 'var(--col-alert)' : 'var(--col-med)'}
            stroke={isExc ? '#FFFFFF' : 'none'}
            strokeWidth={isExc ? 1.5 : 0}
          />
        );
      })}

      {/* X-axis labels */}
      {[0, 6, 12, 18, 24].map(i => (
        <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="#6B6F6C">
          {history[i]?.label}
        </text>
      ))}

      {/* Y-axis Ticks */}
      {[2, 4, 8, 10].map(t => (
        <text key={t} x={30} y={toY(t) + 3} textAnchor="end" fontSize="7" fontFamily="var(--font-mono)" fill="#6B6F6C">
          {t}°
        </text>
      ))}
    </svg>
  );
}
