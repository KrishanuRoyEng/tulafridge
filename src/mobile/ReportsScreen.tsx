// ReportsScreen — daily/weekly/monthly with 30-day seeded data
import React, { useState } from 'react';
import { PROFILES, generateHistoricalData } from '../data/items';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

type Period = 'daily' | 'weekly' | 'monthly';

const NUTRIENT_LABELS = ['Energy', 'Protein', 'Fat', 'Carbs', 'Fibre', 'Iron', 'Calcium', 'B12', 'Water'];
const NUTRIENT_UNITS = ['kcal', 'g', 'g', 'g', 'g', 'mg', 'mg', 'mcg', 'mL'];

const ADVICE: Record<string, string> = {
  anita: 'Protein is below range on 4 of 7 days. Add an egg or a serving of dal.',
  ravi: 'Calcium intake is low this week. Include more dairy or fortified foods.',
  meera: 'Iron is below target on most days. Leafy greens and legumes can help.',
  dadu: 'Water intake is consistently below target. Aim for an extra glass per meal.',
};

export function ReportsScreen() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [selectedProfile, setSelectedProfile] = useState('anita');
  const [hideCalories, setHideCalories] = useState(false);
  const { calloutsActive } = useTour();

  const profile = PROFILES.find(p => p.id === selectedProfile)!;
  const history = generateHistoricalData(selectedProfile);

  // Aggregate based on period
  const daysToShow = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
  const recentData = history.slice(-daysToShow);
  const avgData = recentData[0].map((_, col) =>
    Math.round(recentData.reduce((sum, row) => sum + row[col], 0) / recentData.length * 10) / 10
  );

  const targets = [
    profile.kcalTarget,
    profile.proteinTarget,
    profile.fatTarget,
    profile.carbsTarget,
    profile.fibreTarget,
    profile.ironTarget,
    profile.calciumTarget,
    profile.b12Target,
    profile.waterTarget,
  ];

  // Energy bars for last 7 days
  const barData = history.slice(-7).map((day, i) => ({
    label: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i],
    kcal: day[0],
    protein: day[1],
  }));

  const avgKcal = Math.round(avgData[0]);

  return (
    <div id="target-mobile-reports" style={{ position: 'relative' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', gap: 'var(--s2)', marginBottom: 'var(--s3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 2, border: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                background: period === p ? 'var(--ink)' : 'none',
                color: period === p ? 'var(--bg)' : 'var(--mid)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                textTransform: 'capitalize',
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--s2)', marginLeft: 'auto', alignItems: 'center' }}>
          {PROFILES.slice(0, 4).map(p => (
            <Tip key={p.id} content={`${p.name}: target ${p.kcalTarget} kcal, ${p.proteinTarget} g protein.`}>
              <button
                className="profile-avatar"
                onClick={() => setSelectedProfile(p.id)}
                style={{
                  width: 26,
                  height: 26,
                  fontSize: 10,
                  background: selectedProfile === p.id ? p.color : p.tint,
                  color: selectedProfile === p.id ? '#F4F1EA' : p.color,
                  border: `1.5px solid ${p.color}`,
                  cursor: 'pointer',
                }}
              >
                {p.initial}
              </button>
            </Tip>
          ))}
        </div>
      </div>

      {/* Hero primary number */}
      <div style={{ marginBottom: 'var(--s3)', padding: 'var(--s2) 0' }}>
        <div className="card-header">Average daily intake</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <div className="metric-hero" style={{ color: profile.color }}>
            {avgKcal}
          </div>
          <span style={{ fontSize: 13, color: 'var(--mid)' }}>kcal / day</span>
          <span style={{ fontSize: 11, color: 'var(--mid)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
            Target: {profile.kcalTarget}
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ marginBottom: 'var(--s4)', position: 'relative' }}>
        {calloutsActive && (
          <div style={{ position: 'absolute', top: -6, right: 0 }}>
            <CalloutMarker number={1} label="7-day intake" targetSelector="#target-mobile-reports" placement="left" />
          </div>
        )}
        <div className="card-header" style={{ marginBottom: 'var(--s2)' }}>Daily energy — last 7 days</div>
        <EnergyBarChart bars={barData} target={profile.kcalTarget} hideCalories={hideCalories} profileColor={profile.color} />
      </div>

      {/* Nutrient breakdown */}
      <div style={{ marginBottom: 'var(--s4)', position: 'relative' }}>
        {calloutsActive && (
          <div style={{ position: 'absolute', top: -6, right: 0 }}>
            <CalloutMarker number={2} label="Deficit vs target" targetSelector="#target-mobile-reports" placement="left" />
          </div>
        )}
        <div className="card-header" style={{ marginBottom: 'var(--s2)' }}>
          {period === 'daily' ? 'Today' : period === 'weekly' ? 'Weekly avg.' : 'Monthly avg.'} vs target
        </div>
        {NUTRIENT_LABELS.map((label, i) => {
          if (label === 'Energy' && hideCalories) return null;
          const val = avgData[i];
          const tgt = targets[i];
          const frac = Math.min(1.2, val / tgt);
          const isDeficit = frac < 0.8;
          const isSurplus = frac > 1.1;
          const statusText = isDeficit ? 'Deficit: below 80% target' : isSurplus ? 'Surplus: above 110% target' : 'Within target range';
          return (
            <Tip key={label} content={`${label}: ${val} ${NUTRIENT_UNITS[i]} (Target: ${tgt} ${NUTRIENT_UNITS[i]}). ${statusText}.`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginBottom: 6, cursor: 'default' }}>
                <div style={{ width: 50, fontSize: 11, color: 'var(--mid)' }}>{label}</div>
                <div style={{ flex: 1, height: 8, background: 'var(--hairline)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${Math.min(100, frac * 100)}%`,
                    height: '100%',
                    background: isSurplus ? 'var(--col-alert)' : isDeficit ? 'var(--col-caution)' : 'var(--col-safe)',
                    borderRadius: 4,
                    transition: 'width 200ms',
                  }} />
                </div>
                <div className="mono" style={{ fontSize: 11, width: 70, textAlign: 'right', color: isDeficit ? 'var(--col-caution)' : isSurplus ? 'var(--col-alert)' : 'var(--col-safe)' }}>
                  {val}{NUTRIENT_UNITS[i]}
                </div>
              </div>
            </Tip>
          );
        })}
      </div>

      {/* Settings toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontSize: 12, cursor: 'pointer', marginBottom: 'var(--s4)' }}>
        <input type="checkbox" checked={hideCalories} onChange={e => setHideCalories(e.target.checked)} />
        Hide calories
      </label>

      {/* Advice */}
      <div style={{ position: 'relative', padding: 'var(--s3)', border: 'var(--border)', borderRadius: 'var(--radius)', marginBottom: 'var(--s3)', fontSize: 13, background: 'var(--tint-info)' }}>
        {calloutsActive && (
          <div style={{ position: 'absolute', top: 6, right: 8 }}>
            <CalloutMarker number={3} label="Diet balance" targetSelector="#target-mobile-reports" placement="left" />
          </div>
        )}
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--col-info)', fontWeight: 600, marginBottom: 4 }}>
          Guidance for {profile.name}
        </div>
        <div style={{ color: 'var(--ink)', lineHeight: 1.4 }}>
          {ADVICE[selectedProfile] || ADVICE.anita}
        </div>
      </div>

      {/* Meal timing strip */}
      <div style={{ marginBottom: 'var(--s3)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--s2)' }}>Meal timing — today</div>
        <MealTimingStrip />
      </div>

      {/* Disclaimer */}
      <div style={{ fontSize: 11, color: 'var(--mid)', borderTop: 'var(--border)', paddingTop: 'var(--s3)', lineHeight: 1.5 }}>
        Wellness guidance. For medical conditions, consult a doctor or dietitian.
      </div>
    </div>
  );
}

function EnergyBarChart({ bars, target, hideCalories, profileColor }: {
  bars: { label: string; kcal: number; protein: number }[];
  target: number;
  hideCalories: boolean;
  profileColor: string;
}) {
  const W = 300, H = 100;
  const barW = (W - 20) / bars.length - 4;
  const maxKcal = Math.max(target * 1.2, ...bars.map(b => b.kcal));
  const targetY = (1 - target / maxKcal) * (H - 20) + 5;

  return (
    <svg width={W} height={H} style={{ display: 'block', maxWidth: '100%' }}>
      {/* Target range band: hatched or outlined band */}
      {!hideCalories && (
        <g>
          <rect x={10} y={targetY - 4} width={W - 20} height={8} fill="none" stroke="var(--ink)" strokeWidth="0.75" strokeDasharray="3,3" />
          <line x1={10} y1={targetY} x2={W - 10} y2={targetY} stroke="var(--ink)" strokeWidth="0.75" strokeDasharray="4,2" />
          <text x={W - 8} y={targetY + 3} textAnchor="end" fontSize="7" fontFamily="var(--font-mono)" fill="var(--mid)">
            target
          </text>
        </g>
      )}
      {bars.map((bar, i) => {
        const x = 10 + i * ((W - 20) / bars.length);
        const barH = (bar.kcal / maxKcal) * (H - 20);
        const y = H - 20 - barH;
        return (
          <g key={i}>
            <rect
              x={x + 2}
              y={y}
              width={barW}
              height={barH}
              fill={profileColor}
              opacity={0.85}
              rx={1}
            />
            <text x={x + 2 + barW / 2} y={H - 8} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--mid)">
              {bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MealTimingStrip() {
  const meals = [
    { label: 'Breakfast', hour: 8.5, profile: 'A' },
    { label: 'Lunch', hour: 13.0, profile: 'A' },
    { label: 'Snack', hour: 16.5, profile: 'M' },
    { label: 'Dinner', hour: 20.0, profile: 'R' },
  ];
  const W = 280, H = 32;
  const toX = (h: number) => ((h - 6) / 18) * (W - 20) + 10;
  return (
    <svg width={W} height={H} style={{ display: 'block', maxWidth: '100%' }}>
      <line x1={10} y1={16} x2={W - 10} y2={16} stroke="var(--hairline)" strokeWidth="1" />
      {[6, 9, 12, 15, 18, 21, 24].map(h => (
        <g key={h}>
          <line x1={toX(h)} y1={13} x2={toX(h)} y2={19} stroke="var(--hairline)" strokeWidth="0.75" />
          <text x={toX(h)} y={28} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#9E9C98">
            {h > 12 ? h - 12 : h}{h >= 12 ? 'p' : 'a'}
          </text>
        </g>
      ))}
      {meals.map(meal => (
        <g key={meal.label}>
          <circle cx={toX(meal.hour)} cy={16} r={5} fill="var(--accent)" />
          <text x={toX(meal.hour)} y={10} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="var(--accent)">
            {meal.profile}
          </text>
        </g>
      ))}
    </svg>
  );
}
