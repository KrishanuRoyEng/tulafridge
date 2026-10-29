// TodayScreen — Today tab on mobile
import React from 'react';
import { useSimStore } from '../sim/store';
import { computeRemainingLife, itemStatus, compressorRunTime, simDayDate } from '../sim/engine';
import { PROFILES } from '../data/items';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

interface TodayScreenProps {
  onNavigateToFridge: () => void;
}

export function TodayScreen({ onNavigateToFridge }: TodayScreenProps) {
  const { sim } = useSimStore();
  const date = simDayDate(sim.simSec);
  const { isRunning } = compressorRunTime(sim.simSec);
  const { calloutsActive } = useTour();

  // Attention items
  const attentionItems = sim.items
    .map(item => {
      const { fractionUsed, hoursRemaining } = computeRemainingLife(item, sim.simSec, sim.cabinetTemp);
      return { item, fractionUsed, hoursRemaining, status: itemStatus(fractionUsed) };
    })
    .filter(x => x.status !== 'In range' || x.hoursRemaining < 24)
    .slice(0, 4);

  // Today's intake per profile (simulated)
  const intakeData = PROFILES.slice(0, 4).map(p => ({
    profile: p,
    kcalFraction: 0.72 + Math.sin(p.age) * 0.1,
    proteinFraction: 0.65 + Math.sin(p.age * 2) * 0.08,
  }));

  return (
    <div style={{ position: 'relative' }}>
      {/* Date header & Primary Hero */}
      <div style={{ marginBottom: 'var(--s3)', position: 'relative' }}>
        {calloutsActive && (
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <CalloutMarker number={1} label="Internal temp" placement="left" />
          </div>
        )}
        <div style={{ fontSize: 13, color: 'var(--mid)', fontWeight: 500 }}>{date}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <Tip content="Main cavity air temperature, sampled by multi-point sensors.">
            <span className="metric-hero" style={{ color: sim.cabinetTemp <= 5 ? 'var(--col-safe)' : 'var(--col-caution)' }}>
              {sim.cabinetTemp.toFixed(1)}°C
            </span>
          </Tip>
          <span style={{ fontSize: 12, color: 'var(--mid)' }}>cabinet air</span>
        </div>
      </div>

      {/* Attention items */}
      <div style={{ marginBottom: 'var(--s4)', position: 'relative' }}>
        {calloutsActive && (
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <CalloutMarker number={2} label="Freshness state" placement="left" />
          </div>
        )}
        <div className="card-header" style={{ marginBottom: 'var(--s2)' }}>
          Needs attention
        </div>
        {attentionItems.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--mid)', padding: 'var(--s2) 0' }}>All items within range.</div>
        )}
        {attentionItems.map(({ item, status, hoursRemaining }) => (
          <div key={item.id} className="alert-item">
            <div
              className="alert-item__dot"
              style={{
                background: status === 'Discard' ? 'var(--col-alert)' : status === 'Use first' ? 'var(--col-caution)' : 'var(--col-safe)',
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--mid)' }}>{Math.round(hoursRemaining)} h remaining</div>
            </div>
            <Tip content={`${item.name}: ${status}. ${Math.round(hoursRemaining)} h left.`}>
              <span
                className={`chip ${status === 'In range' ? 'chip--in-range' : status === 'Use first' ? 'chip--use-first' : 'chip--discard'}`}
                style={{ fontSize: 10 }}
              >
                {status}
              </span>
            </Tip>
          </div>
        ))}
      </div>

      {/* Compressor status */}
      <div className="mobile-card" style={{ position: 'relative' }}>
        {calloutsActive && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <CalloutMarker number={3} label="Tariff mode" placement="left" />
          </div>
        )}
        <div className="card-header" style={{ marginBottom: 'var(--s2)' }}>
          System status
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span>Mains</span>
          <Tip content={sim.powerCut ? 'Grid outage in progress. Pre-cooling thermal mass active.' : 'Grid power normal.'}>
            <span
              className={`chip ${sim.powerCut ? 'chip--discard' : 'chip--in-range'}`}
              style={{ fontSize: 10 }}
            >
              {sim.powerCut ? 'Power cut' : 'Normal'}
            </span>
          </Tip>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span>Compressor</span>
          <Tip content={isRunning ? 'Active cooling cycle in cheaper off-peak tariff.' : 'Idle: delaying until off-peak 23:00.'}>
            <span
              className={`chip ${isRunning ? 'chip--cooling' : 'chip--in-range'}`}
              style={{ fontSize: 10 }}
            >
              {isRunning ? 'Running' : 'Idle until 23:00'}
            </span>
          </Tip>
        </div>
      </div>

      {/* Daily intake per member */}
      <div style={{ marginBottom: 'var(--s4)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--s2)' }}>
          Today's intake
        </div>
        {intakeData.map(({ profile, kcalFraction, proteinFraction }) => (
          <div key={profile.id} style={{ marginBottom: 'var(--s3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginBottom: 4 }}>
              <Tip content={`${profile.name}: target ${profile.kcalTarget} kcal, ${profile.proteinTarget} g protein.`}>
                <div
                  className="profile-avatar"
                  style={{
                    width: 22,
                    height: 22,
                    fontSize: 9,
                    background: profile.tint,
                    color: profile.color,
                    border: `1.5px solid ${profile.color}`,
                  }}
                >
                  {profile.initial}
                </div>
              </Tip>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{profile.name}</span>
            </div>
            <div className="intake-bar-row">
              <span className="intake-bar-row__label">Energy</span>
              <div className="intake-bar-row__bar">
                <div className="intake-bar-row__fill" style={{ width: `${Math.round(kcalFraction * 100)}%`, background: profile.color }} />
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--mid)', flexShrink: 0 }}>{Math.round(kcalFraction * 100)}%</span>
            </div>
            <div className="intake-bar-row">
              <span className="intake-bar-row__label">Protein</span>
              <div className="intake-bar-row__bar">
                <div className="intake-bar-row__fill" style={{ width: `${Math.round(proteinFraction * 100)}%`, background: profile.color }} />
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--mid)', flexShrink: 0 }}>{Math.round(proteinFraction * 100)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fridge link */}
      <button className="btn-text" onClick={onNavigateToFridge} style={{ fontSize: 13 }}>
        View fridge screen
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ marginLeft: 4 }}>
          <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      </button>
    </div>
  );
}
