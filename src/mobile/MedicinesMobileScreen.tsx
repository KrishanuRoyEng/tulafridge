// MedicinesMobileScreen — medicine zone for mobile
import React, { useCallback } from 'react';
import { useSimStore } from '../sim/store';
import { simTimeToDisplay } from '../sim/engine';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

const SAFE_MIN = 2;
const SAFE_MAX = 8;

export function MedicinesMobileScreen() {
  const { sim } = useSimStore();
  const { calloutsActive } = useTour();
  const medItems = sim.items.filter(it => it.shelf === 'medicine');
  const medTemp = sim.cabinetTemp - 0.5;
  const inRange = medTemp >= SAFE_MIN && medTemp <= SAFE_MAX;

  const history = Array.from({ length: 25 }, (_, i) => {
    const h = i;
    const sec = sim.simSec - (24 - h) * 3600;
    let temp = sim.cabinetTemp - 0.5 + Math.sin(sec / 1800) * 0.2;
    if (sim.medicineExcursion) {
      const excMidSec = (sim.medicineExcursionStart + (sim.medicineExcursionEnd > 0 ? sim.medicineExcursionEnd : sim.medicineExcursionStart + 2400)) / 2;
      const excDur = sim.medicineExcursionEnd > 0 ? sim.medicineExcursionEnd - sim.medicineExcursionStart : 2400;
      const distSec = Math.abs(sec - excMidSec);
      if (distSec < excDur) {
        temp += (8 - temp) * Math.exp(-distSec / 600) * 1.5;
      }
    }
    const label = `${String(Math.floor(((67200 + sec) % 86400) / 3600)).padStart(2, '0')}:00`;
    return { h, temp: Math.max(1, temp), label };
  });

  const exportCSV = useCallback(() => {
    const rows = [
      ['Timestamp', 'Temperature (C)', 'Status', 'Regulatory Range'],
      ...history.map(h => [h.label, h.temp.toFixed(2), h.temp >= SAFE_MIN && h.temp <= SAFE_MAX ? 'In range' : 'Excursion', '2-8 C']),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tula-medicine-audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  const W = 280, H = 100;
  const minT = 0, maxT = 14;
  const toX = (i: number) => 20 + (i / (history.length - 1)) * (W - 30);
  const toY = (t: number) => H - 15 - ((t - minT) / (maxT - minT)) * (H - 25);
  const safeMinY = toY(SAFE_MIN);
  const safeMaxY = toY(SAFE_MAX);
  const d = history.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(pt.temp)}`).join(' ');

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--s3)' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Medicine monitoring</div>
        <span className="label-xs" style={{ color: 'var(--col-medicine)', background: 'var(--tint-medicine)', padding: '2px 6px', borderRadius: 2 }}>
          Dedicated zone
        </span>
      </div>

      {/* Hero primary number */}
      <div style={{ marginBottom: 'var(--s3)', padding: 'var(--s2) 0', position: 'relative' }}>
        {calloutsActive && (
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <CalloutMarker number={1} label="Permitted band" placement="left" />
          </div>
        )}
        <div className="card-header">Current zone temperature</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <Tip content={`Current medicine compartment temperature. Permitted corridor: ${SAFE_MIN} to ${SAFE_MAX} C.`}>
            <span className="metric-hero" style={{ color: inRange ? 'var(--col-medicine)' : 'var(--col-alert)' }}>
              {medTemp.toFixed(1)}°C
            </span>
          </Tip>
          <span className={`chip ${inRange ? 'chip--in-range' : 'chip--excursion'}`}>
            {inRange ? 'In range' : 'Excursion'}
          </span>
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 'var(--s3)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--s2)' }}>Stored pharmaceuticals</div>
        {medItems.map(item => (
          <div key={item.id} style={{ padding: 'var(--s2) 0', borderBottom: 'var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: 'var(--mid)' }}>{item.notes}</div>
            </div>
            <Tip content={`${item.label}: Storage requirement 2-8 C. Currently ${inRange ? 'In range' : 'Excursion'}.`}>
              <span className={`chip ${inRange ? 'chip--in-range' : 'chip--excursion'}`}>
                {inRange ? 'In range' : 'Check'}
              </span>
            </Tip>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', marginBottom: 'var(--s3)' }}>
        {calloutsActive && (
          <div style={{ position: 'absolute', top: -4, right: 0 }}>
            <CalloutMarker number={2} label="Excursion check" placement="left" />
          </div>
        )}
        <div className="card-header" style={{ marginBottom: 'var(--s2)' }}>24 h temperature corridor</div>
        <svg width={W} height={H} style={{ display: 'block', border: 'var(--border)', borderRadius: 3, background: 'var(--bg)', maxWidth: '100%', marginBottom: 'var(--s3)' }}>
          {/* Permitted band in plum-brown tint */}
          <rect x={20} y={safeMaxY} width={W - 30} height={safeMinY - safeMaxY} fill="var(--tint-medicine)" opacity={0.6} />
          <line x1={20} y1={safeMinY} x2={W - 10} y2={safeMinY} stroke="var(--col-medicine)" strokeWidth="0.75" strokeDasharray="3,2" />
          <line x1={20} y1={safeMaxY} x2={W - 10} y2={safeMaxY} stroke="var(--col-medicine)" strokeWidth="0.75" strokeDasharray="3,2" />
          <path d={d} fill="none" stroke="var(--col-medicine)" strokeWidth="1.5" />
          {history.map((pt, i) => {
            if (pt.temp > SAFE_MAX || pt.temp < SAFE_MIN) {
              return <circle key={i} cx={toX(i)} cy={toY(pt.temp)} r={3} fill="var(--col-alert)" stroke="#F4F1EA" strokeWidth="1" />;
            }
            return null;
          })}
          <text x={W - 12} y={safeMinY + 3} fontSize="7" fontFamily="var(--font-mono)" fill="var(--col-medicine)">{SAFE_MIN}°C</text>
          <text x={W - 12} y={safeMaxY - 2} fontSize="7" fontFamily="var(--font-mono)" fill="var(--col-medicine)">{SAFE_MAX}°C</text>
        </svg>
      </div>

      {/* Excursion alert if present */}
      {sim.medicineExcursion && (
        <div style={{ padding: 'var(--s3)', background: 'var(--tint-alert)', borderRadius: 3, border: '1px solid var(--col-alert)', marginBottom: 'var(--s3)' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--col-alert)' }}>Excursion detected</div>
          <div style={{ fontSize: 12, color: 'var(--ink)', marginTop: 4 }}>
            {simTimeToDisplay(sim.medicineExcursionStart)} — temperature exceeded 8.0 °C. Review storage log.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap', position: 'relative' }}>
        {calloutsActive && (
          <div style={{ position: 'absolute', top: -20, left: 100 }}>
            <CalloutMarker number={3} label="Audit export" placement="top" />
          </div>
        )}
        <Tip content="Downloads 24-hour temperature records formatted for pharmaceutical audit.">
          <button className="btn-solid" style={{ background: 'var(--col-medicine)', color: '#F4F1EA', border: 'none', padding: '6px 12px', fontSize: 12, borderRadius: 3, cursor: 'pointer' }} onClick={exportCSV}>
            Export audit log (CSV)
          </button>
        </Tip>
      </div>
    </div>
  );
}
