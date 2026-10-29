// MealsMobileScreen — plate capture flow for mobile
import React, { useState } from 'react';
import { PROFILES } from '../data/items';
import { allocatePortion } from '../sim/engine';
import { TopDownPlate } from '../art/FoodItems';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

type MealPhase = 'select' | 'before' | 'after' | 'result';

const CONSUMED_MASS = 410;
const VOLUMES = [0.30, 0.15];

export function MealsMobileScreen() {
  const [phase, setPhase] = useState<MealPhase>('select');
  const [selectedProfile, setSelectedProfile] = useState('anita');
  const [recognised, setRecognised] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const { calloutsActive } = useTour();

  const profile = PROFILES.find(p => p.id === selectedProfile) || PROFILES[0];
  const profileIdx = PROFILES.findIndex(p => p.id === selectedProfile);
  const myAlloc = allocatePortion(CONSUMED_MASS, VOLUMES)[Math.min(profileIdx, VOLUMES.length - 1)];
  const myVol = VOLUMES[Math.min(profileIdx, VOLUMES.length - 1)];

  return (
    <div style={{ position: 'relative' }}>
      {/* Profile switcher */}
      <div style={{ display: 'flex', gap: 'var(--s2)', marginBottom: 'var(--s3)', alignItems: 'center' }}>
        {PROFILES.slice(0, 4).map(p => (
          <Tip key={p.id} content={`${p.name}: plate color.`}>
            <button
              className="profile-avatar"
              onClick={() => setSelectedProfile(p.id)}
              style={{
                width: 28,
                height: 28,
                fontSize: 11,
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
        <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 4 }}>{profile.name}</span>
      </div>

      {phase === 'select' && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--s3)' }}>Capture a meal</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
            <button
              style={{
                border: `2px solid ${profile.color}`,
                borderRadius: 'var(--radius)',
                padding: 'var(--s3)',
                cursor: 'pointer',
                background: profile.tint,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--s2)',
              }}
              onClick={() => setPhase('before')}
            >
              <TopDownPlate size={60} variant="dal-rice" phase="before" />
              <span style={{ fontSize: 12, fontWeight: 500, color: profile.color }}>Before meal</span>
            </button>
            <button
              style={{
                border: 'var(--border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--s3)',
                cursor: 'pointer',
                background: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--s2)',
              }}
              onClick={() => setPhase('after')}
            >
              <TopDownPlate size={60} variant="dal-rice" phase="after" />
              <span style={{ fontSize: 12, color: 'var(--mid)' }}>After meal</span>
            </button>
          </div>
        </div>
      )}

      {(phase === 'before' || phase === 'after') && (
        <div>
          <div style={{ display: 'flex', gap: 'var(--s2)', marginBottom: 'var(--s3)' }}>
            <button className="btn-text" onClick={() => setPhase('select')}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{phase === 'before' ? 'Before photo' : 'After photo'}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s4)' }}>
            <div style={{ padding: 8, border: `2px solid ${profile.color}`, borderRadius: '50%', background: profile.tint }}>
              <TopDownPlate size={140} variant="dal-rice" phase={phase} />
            </div>
          </div>

          {!recognised ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s4)' }}>
              <button
                onClick={() => setRecognised('Dal')}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: '3px solid var(--ink)',
                  background: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Capture photo"
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)' }} />
              </button>
            </div>
          ) : !confirmed ? (
            <div className="mobile-card">
              <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 4 }}>Recognised food:</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--s3)' }}>{recognised}</div>
              <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                <button className="btn-solid" style={{ background: 'var(--col-info)', color: '#F4F1EA', padding: '6px 12px', fontSize: 12, borderRadius: 3, border: 'none', cursor: 'pointer' }} onClick={() => { setConfirmed(true); setPhase('result'); }}>
                  Confirm
                </button>
                <button className="btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setRecognised('Mixed veg curry')}>
                  Change
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {phase === 'result' && (
        <div>
          <button className="btn-text" onClick={() => { setPhase('select'); setRecognised(null); setConfirmed(false); }}
            style={{ marginBottom: 'var(--s3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Back
          </button>

          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--s3)' }}>Portion — {recognised}</div>

          {/* Primary Hero */}
          <div style={{ marginBottom: 'var(--s3)', padding: 'var(--s2) 0' }}>
            <div className="card-header">Allocated intake</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span className="metric-hero" style={{ color: 'var(--col-safe)' }}>
                {myAlloc} g
              </span>
              <span style={{ fontSize: 12, color: 'var(--mid)' }}>from fridge delta</span>
            </div>
          </div>

          <div className="mobile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: 'var(--border)', fontSize: 12 }}>
              <span style={{ color: 'var(--mid)' }}>Photo only</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono" style={{ color: 'var(--mid)' }}>240 g</span>
                <span className="chip chip--use-first" style={{ fontSize: 9 }}>Low</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: 'var(--border)', fontSize: 12 }}>
              <span style={{ color: 'var(--col-safe)', fontWeight: 500 }}>With fridge weight</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono" style={{ color: 'var(--col-safe)', fontWeight: 600 }}>{myAlloc} g</span>
                <span className="chip chip--in-range" style={{ fontSize: 9 }}>High</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
              <span style={{ color: 'var(--ink)' }}>Measured tare</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono" style={{ color: 'var(--ink)' }}>410 g removed</span>
                <span className="chip chip--in-range" style={{ fontSize: 9 }}>Exact</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
