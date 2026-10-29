// ThermalScreen — canvas-based thermal heatmap with 8°C contour, ticks, and callouts
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSimStore } from '../sim/store';
import { computeItemTemp } from '../sim/engine';
import { SEED_ITEMS } from '../data/items';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

type ThermalScenario = 'now' | 'door60' | 'powercut2h';

const SCENARIO_LABELS: Record<ThermalScenario, string> = {
  now: 'Now',
  door60: 'Door open 60 s',
  powercut2h: 'Power cut 2 h',
};

const THERMAL_GRADIENT = [
  [10, [20, 10, 40]],
  [40, [80, 20, 80]],
  [60, [160, 30, 40]],
  [75, [220, 90, 20]],
  [90, [240, 180, 30]],
  [100, [255, 250, 220]],
] as Array<[number, [number, number, number]]>;

function tempToColor(t: number, minT: number, maxT: number): [number, number, number] {
  const pct = Math.min(100, Math.max(0, ((t - minT) / (maxT - minT)) * 100));
  for (let i = 1; i < THERMAL_GRADIENT.length; i++) {
    const [p0, c0] = THERMAL_GRADIENT[i - 1];
    const [p1, c1] = THERMAL_GRADIENT[i];
    if (pct <= p1) {
      const f = (pct - p0) / (p1 - p0);
      return [
        Math.round(c0[0] + f * (c1[0] - c0[0])),
        Math.round(c0[1] + f * (c1[1] - c0[1])),
        Math.round(c0[2] + f * (c1[2] - c0[2])),
      ];
    }
  }
  return [255, 250, 220];
}

export function ThermalScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { sim } = useSimStore();
  const { temporaryHighlight } = useTour();
  const [scenario, setScenario] = useState<ThermalScenario>('now');
  const [showOutlines, setShowOutlines] = useState(false);
  const [hoverTemp, setHoverTemp] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Scenario modifiers
  const doorOpenSec = scenario === 'door60' ? 60 : 0;
  const powerCutElapsed = scenario === 'powercut2h' ? 2 * 3600 : 0;

  const scenarioCabinetTemp = scenario === 'powercut2h'
    ? 4 + (28 - 4) * (1 - Math.exp(-powerCutElapsed / 18000))
    : sim.cabinetTemp;

  const minT = 2, maxT = scenario === 'powercut2h' ? 22 : 12;

  const drawThermal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    // Build temperature field
    const tempField: number[][] = [];

    for (let py = 0; py < H; py++) {
      tempField[py] = [];
      for (let px = 0; px < W; px++) {
        const depthFactor = px / W;
        const doorWarmth = doorOpenSec > 0 ? (1 - px / W) * 2.5 * Math.min(1, doorOpenSec / 30) : 0;
        let temp = scenarioCabinetTemp + (1 - depthFactor) * 1.5 + doorWarmth;

        // Add item heat blobs
        SEED_ITEMS.forEach(item => {
          const itemX = (item.x / 60) * W;
          const itemY = (item.y / 40) * H * 0.7 + (
            item.shelf === 'shelf3' ? 0.05 * H :
            item.shelf === 'shelf2' ? 0.3 * H :
            item.shelf === 'shelf1' ? 0.55 * H :
            item.shelf === 'crisper' ? 0.75 * H :
            item.shelf === 'door' ? 0.3 * H :
            0.05 * H
          );
          const dist = Math.sqrt((px - itemX) ** 2 + (py - itemY) ** 2);
          const radius = item.id === 'chicken' ? 38 : 28;
          if (dist < radius) {
            const itemTemp = computeItemTemp(item, sim.simSec, scenarioCabinetTemp, doorOpenSec);
            const contribution = (itemTemp - scenarioCabinetTemp) * Math.exp(-dist / (item.id === 'chicken' ? 16 : 12));
            temp += contribution;
          }
        });

        // Medicine zone cooler
        const medX = W * 0.85;
        const medDist = Math.sqrt((px - medX) ** 2 + py ** 2);
        temp -= Math.max(0, 0.8 - medDist / 60);

        tempField[py][px] = temp;
      }
    }

    // Render thermal colors
    const imageData = ctx.createImageData(W, H);
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const t = tempField[py][px];
        const [r, g, b] = tempToColor(t, minT, maxT);
        const idx = (py * W + px) * 4;
        imageData.data[idx] = r;
        imageData.data[idx + 1] = g;
        imageData.data[idx + 2] = b;
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw thin ink contour for 8°C safety line
    ctx.strokeStyle = '#1D1F1E';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);

    for (let py = 2; py < H - 2; py += 3) {
      for (let px = 2; px < W - 2; px += 3) {
        const t = tempField[py][px];
        const tRight = tempField[py][px + 2];
        const tDown = tempField[py + 2][px];
        // If boundary crosses 8°C
        if ((t <= 8 && (tRight > 8 || tDown > 8)) || (t > 8 && (tRight <= 8 || tDown <= 8))) {
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    }
    ctx.setLineDash([]); // Reset dash

    // Item outlines if toggled
    if (showOutlines) {
      ctx.strokeStyle = 'rgba(244,241,234,0.75)';
      ctx.lineWidth = 1;
      SEED_ITEMS.forEach(item => {
        const shelfY: Record<string, number> = {
          shelf3: 0.1 * H, shelf2: 0.35 * H, shelf1: 0.6 * H,
          crisper: 0.78 * H, door: 0.35 * H, medicine: 0.05 * H,
        };
        const cx = (item.x / 60) * W;
        const cy = shelfY[item.shelf] ?? 0.3 * H;
        ctx.beginPath();
        ctx.rect(cx - 16, cy - 10, 32, 20);
        ctx.stroke();

        ctx.fillStyle = '#F4F1EA';
        ctx.font = '8px monospace';
        ctx.fillText(item.name.slice(0, 6), cx - 14, cy + 4);
      });
    }

    // Shelf reference lines
    ctx.strokeStyle = 'rgba(200,198,192,0.45)';
    ctx.lineWidth = 0.75;
    [0.29 * H, 0.58 * H, 0.77 * H].forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    });

  }, [scenario, scenarioCabinetTemp, doorOpenSec, showOutlines, sim.simSec, minT, maxT]);

  useEffect(() => {
    drawThermal();
  }, [drawThermal]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const py = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

    const depthFactor = px / canvas.width;
    const doorWarmth = doorOpenSec > 0 ? (1 - px / canvas.width) * 2.5 * Math.min(1, doorOpenSec / 30) : 0;
    let temp = scenarioCabinetTemp + (1 - depthFactor) * 1.5 + doorWarmth;

    SEED_ITEMS.forEach(item => {
      const shelfY: Record<string, number> = {
        shelf3: 0.1 * canvas.height, shelf2: 0.35 * canvas.height, shelf1: 0.6 * canvas.height,
        crisper: 0.78 * canvas.height, door: 0.35 * canvas.height, medicine: 0.05 * canvas.height,
      };
      const itemX = (item.x / 60) * canvas.width;
      const itemY = shelfY[item.shelf] ?? 0.3 * canvas.height;
      const dist = Math.sqrt((px - itemX) ** 2 + (py - itemY) ** 2);
      const radius = item.id === 'chicken' ? 38 : 28;
      if (dist < radius) {
        const itemTemp = computeItemTemp(item, sim.simSec, scenarioCabinetTemp, doorOpenSec);
        temp += (itemTemp - scenarioCabinetTemp) * Math.exp(-dist / (item.id === 'chicken' ? 16 : 12));
      }
    });

    setHoverTemp(Math.round(temp * 10) / 10);
    setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [doorOpenSec, scenarioCabinetTemp, sim.simSec]);

  // Color code hover chip by status of temperature
  const getHoverChipStyle = (t: number) => {
    if (t <= 8) {
      return { background: 'var(--tint-safe)', color: 'var(--col-safe)', borderColor: 'rgba(47,111,94,0.3)' };
    } else if (t <= 12) {
      return { background: 'var(--tint-caution)', color: 'var(--col-caution)', borderColor: 'rgba(183,121,31,0.3)' };
    }
    return { background: 'var(--tint-alert)', color: 'var(--col-alert)', borderColor: 'rgba(200,87,27,0.3)' };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 'var(--s4)' }}>
      <div>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Interior thermal mapping</span>
            <CalloutMarker num={3} label="8 °C safety contour" targetId="target-thermal-contour" />
          </div>
          <span style={{ fontSize: 10, color: 'var(--mid)' }}>Calibrated 2–{maxT} °C ramp</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 'var(--s2)', marginBottom: 'var(--s3)', flexWrap: 'wrap', alignItems: 'center' }}>
          {(Object.keys(SCENARIO_LABELS) as ThermalScenario[]).map(s => (
            <Tip key={s} content={`Scenario: ${SCENARIO_LABELS[s]}`}>
              <button
                className={`btn-outline ${scenario === s ? 'btn-solid' : ''}`}
                onClick={() => setScenario(s)}
                style={scenario === s ? { background: 'var(--col-info)', color: 'var(--bg)', borderColor: 'var(--col-info)' } : {}}
              >
                {SCENARIO_LABELS[s]}
              </button>
            </Tip>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--mid)', marginLeft: 'auto', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showOutlines}
              onChange={e => setShowOutlines(e.target.checked)}
            />
            Item outlines
          </label>
        </div>

        {/* Canvas Stage */}
        <div
          id="target-thermal-canvas"
          className={temporaryHighlight === 'target-thermal-canvas' ? 'tour-highlight' : ''}
          style={{ position: 'relative', display: 'inline-block' }}
        >
          <canvas
            ref={canvasRef}
            width={480}
            height={300}
            style={{ display: 'block', borderRadius: 'var(--radius)', border: 'var(--border)', cursor: 'crosshair' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { setHoverTemp(null); setHoverPos(null); }}
            aria-label="Thermal heatmap of fridge interior"
          />

          {hoverTemp !== null && hoverPos && (
            <div
              style={{
                position: 'absolute',
                left: Math.min(380, hoverPos.x + 12),
                top: Math.max(10, hoverPos.y - 28),
                padding: '3px 7px',
                borderRadius: 3,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                border: '1px solid',
                boxShadow: '0 2px 6px rgba(29,31,30,0.15)',
                ...getHoverChipStyle(hoverTemp),
              }}
            >
              {hoverTemp} °C · {hoverTemp <= 8 ? 'In range' : hoverTemp <= 12 ? 'Caution' : 'Warm'}
            </div>
          )}

          {/* Callout markers pinned over canvas */}
          <div style={{ position: 'absolute', right: 14, top: 96 }}>
            <CalloutMarker num={1} label="Warm door shelf" targetId="target-thermal-canvas" position="left" />
          </div>
          <div style={{ position: 'absolute', left: 100, top: 28 }}>
            <CalloutMarker num={2} label="Hot food item" targetId="target-thermal-canvas" position="right" />
          </div>
        </div>

        {/* Legend with Ticks and 8°C Marker */}
        <div id="target-thermal-contour" style={{ marginTop: 'var(--s3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 220,
                height: 12,
                borderRadius: 2,
                background: 'linear-gradient(to right, #140a28, #501450, #a01e28, #dc5a14, #f0b41e, #fffadc)',
                border: '1px solid var(--hairline)',
                position: 'relative',
              }}
            >
              {/* 8°C safety line tick */}
              <div
                style={{
                  position: 'absolute',
                  left: `${((8 - minT) / (maxT - minT)) * 100}%`,
                  top: -3,
                  bottom: -3,
                  width: 2,
                  background: '#1D1F1E',
                }}
              />
            </div>
            <Tip content="Food safety limit, 8 °C. Temperatures above this promote microbial growth.">
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink)', fontWeight: 600 }}>
                8 °C safety contour (dashed ink)
              </span>
            </Tip>
          </div>

          {/* Labeled Ticks */}
          <div style={{ display: 'flex', width: 220, justifyContent: 'space-between', marginTop: 4 }}>
            {[minT, 4, 6, 8, 10, maxT].map(t => (
              <Tip key={t} content={`Temperature benchmark: ${t} °C`}>
                <span className="mono" style={{ fontSize: 9, color: t === 8 ? 'var(--ink)' : 'var(--mid)', fontWeight: t === 8 ? 600 : 400 }}>
                  {t}°
                </span>
              </Tip>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: Hero Mean Temp & Thermal Zones */}
      <div>
        <div className="card-header">
          <span>Cabinet thermal status</span>
        </div>

        <div style={{ padding: '8px 12px', background: 'var(--bg)', border: 'var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>
          <div className="metric-hero-label">Cabinet mean temperature</div>
          <div className="metric-hero">
            {scenarioCabinetTemp.toFixed(1)} <span className="metric-hero-unit">°C</span>
          </div>
          <div style={{ fontSize: 11, color: scenarioCabinetTemp <= 8 ? 'var(--col-safe)' : 'var(--col-alert)', marginTop: 4, fontWeight: 500 }}>
            {scenarioCabinetTemp <= 8 ? 'Within safe storage zone (< 8 °C)' : 'Safety threshold exceeded'}
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--s3)', marginBottom: 12 }}>
          <div className="card-header" style={{ marginBottom: 6 }}>
            <span>Observed Thermal Gradients</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mid)' }}>Rear wall (deepest):</span>
              <span className="mono" style={{ color: 'var(--col-cold)' }}>3.2 °C</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mid)' }}>Door bin (outer):</span>
              <span className="mono" style={{ color: 'var(--col-caution)' }}>5.8 °C</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mid)' }}>Hot chicken core:</span>
              <span className="mono" style={{ color: 'var(--col-warm)', fontWeight: 600 }}>
                {computeItemTemp(SEED_ITEMS.find(i => i.id === 'chicken')!, sim.simSec, scenarioCabinetTemp, doorOpenSec).toFixed(1)} °C
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mid)' }}>Medicine zone:</span>
              <span className="mono" style={{ color: 'var(--col-med)', fontWeight: 600 }}>3.6 °C</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--mid)', lineHeight: 1.4, padding: 8, background: 'var(--tint-cold)', borderRadius: 3, border: '1px solid rgba(92,122,140,0.2)' }}>
          {scenario === 'door60' && 'Door open 60 s creates an inward convective plume warming the front zone by ~2.5 °C.'}
          {scenario === 'powercut2h' && `Outage model: thermal inertia holds cabinet to ${scenarioCabinetTemp.toFixed(1)} °C.`}
          {scenario === 'now' && 'All storage zones remain safely insulated within target operating parameters.'}
        </div>
      </div>
    </div>
  );
}
