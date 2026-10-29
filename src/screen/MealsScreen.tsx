// MealsScreen — mass-constrained nutrition, plate outlines in profile colours, confidence chips, callouts
import React, { useState } from 'react';
import { useSimStore } from '../sim/store';
import { allocatePortion } from '../sim/engine';
import { PROFILES, SEED_ITEMS } from '../data/items';
import { TopDownPlate } from '../art/FoodItems';
import { Tip } from '../components/Tip';
import { CalloutMarker } from '../components/CalloutMarker';
import { useTour } from '../sim/tourContext';

interface MealsScreenProps {
  activeProfile: string;
}

type PlatePhase = 'before' | 'after';

const MEAL_MEMBERS = ['anita', 'ravi'];
const MEMBER_VOLUMES = [0.30, 0.15]; // litres for anita and ravi

export function MealsScreen({ activeProfile }: MealsScreenProps) {
  const { sim } = useSimStore();
  const { temporaryHighlight } = useTour();
  const [phase, setPhase] = useState<PlatePhase>('before');
  const [recognisedDish, setRecognisedDish] = useState<string | null>('Dal');
  const [confirmed, setConfirmed] = useState(true);
  const [showOilPaneer, setShowOilPaneer] = useState(false);

  const dal = SEED_ITEMS.find(it => it.id === 'dal')!;
  const consumedMass = 410; // grams of dal removed and not returned

  const allocations = allocatePortion(consumedMass, MEMBER_VOLUMES); // [273, 137] g

  // Per-member nutrients from dal
  const nutrients = allocations.map(mass => ({
    kcal: Math.round(mass * dal.kcalPer100g / 100),
    protein: Math.round(mass * dal.proteinPer100g / 100 * 10) / 10,
    fat: Math.round(mass * dal.fatPer100g / 100 * 10) / 10,
    carbs: Math.round(mass * dal.carbsPer100g / 100),
  }));

  // Photo only estimate (approximate vision model) vs fridge weight
  const photoOnlyEstimate = { kcal: [220, 110], protein: [5.2, 2.6] };
  const fridgeWeightEstimate = { kcal: nutrients.map(n => n.kcal), protein: nutrients.map(n => n.protein) };

  const paneer = SEED_ITEMS.find(it => it.id === 'paneer')!;
  const oilKcal = showOilPaneer ? 40 : 0;

  return (
    <div>
      <div className="card-header">
        <span>Mass-Constrained Meal Nutrition</span>
        <span style={{ fontSize: 10, color: 'var(--mid)' }}>Integrated load cell + plate volume allocation</span>
      </div>

      {/* Hero consumed mass card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
        <div className="card" id="target-meals-consumed">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="metric-hero-label">Removed dish mass</div>
            <CalloutMarker num={1} label="Consumed mass" targetId="target-meals-consumed" position="left" />
          </div>
          <Tip content="Removed 820 g, returned 410 g = 410 g net consumed from Shelf 2">
            <div className="metric-hero">
              {consumedMass} <span className="metric-hero-unit">g</span>
            </div>
          </Tip>
          <div style={{ fontSize: 11, color: 'var(--col-info)', fontWeight: 500, marginTop: 4 }}>
            Steel container: Dal (cooked)
          </div>
        </div>

        <div className="card">
          <div className="metric-hero-label">Anita allocated</div>
          <div className="metric-hero" style={{ color: 'var(--profile-anita)' }}>
            {allocations[0]} <span className="metric-hero-unit">g</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
            66.7% share (0.30 L plate volume)
          </div>
        </div>

        <div className="card">
          <div className="metric-hero-label">Ravi allocated</div>
          <div className="metric-hero" style={{ color: 'var(--profile-ravi)' }}>
            {allocations[1]} <span className="metric-hero-unit">g</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
            33.3% share (0.15 L plate volume)
          </div>
        </div>
      </div>

      {/* Plate capture flow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)', marginBottom: 'var(--s4)' }}>
        {MEAL_MEMBERS.map((memberId, i) => {
          const profile = PROFILES.find(p => p.id === memberId)!;
          return (
            <div
              key={memberId}
              className="card"
              style={{
                borderLeft: `4px solid ${profile.color}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
                  <div
                    className="profile-avatar profile-avatar--active"
                    style={{ background: profile.tint, color: profile.color, borderColor: profile.color }}
                  >
                    {profile.initial}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{profile.name}</span>
                    <div style={{ fontSize: 11, color: 'var(--mid)' }}>Plate {i + 1} (Steel 26 cm)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--s1)' }}>
                  <button
                    className={`btn-outline ${phase === 'before' ? 'btn-solid' : ''}`}
                    style={phase === 'before' ? { background: 'var(--ink)', color: 'var(--bg)' } : {}}
                    onClick={() => setPhase('before')}
                  >
                    Before
                  </button>
                  <button
                    className={`btn-outline ${phase === 'after' ? 'btn-solid' : ''}`}
                    style={phase === 'after' ? { background: 'var(--ink)', color: 'var(--bg)' } : {}}
                    onClick={() => setPhase('after')}
                  >
                    After
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
                {/* Plate illustration with profile outline */}
                <div
                  style={{
                    padding: 4,
                    borderRadius: '50%',
                    border: `2px solid ${profile.color}`,
                    background: profile.tint,
                    display: 'inline-flex',
                  }}
                >
                  <TopDownPlate size={76} variant="dal-rice" phase={phase} />
                </div>

                <div style={{ flex: 1 }}>
                  {!recognisedDish ? (
                    <button className="btn-accent" onClick={() => setRecognisedDish('Dal')}>
                      Analyse plate
                    </button>
                  ) : !confirmed ? (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 2 }}>Recognised:</div>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>{recognisedDish}</div>
                      <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                        <button className="btn-accent" onClick={() => setConfirmed(true)} style={{ fontSize: 12, padding: '3px 8px' }}>Confirm</button>
                        <button className="btn-outline" onClick={() => setRecognisedDish('Mixed veg curry')} style={{ fontSize: 12, padding: '3px 8px' }}>Change</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--mid)' }}>Recognised: Dal (Confirmed)</div>
                      <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: profile.color, marginTop: 2 }}>
                        {allocations[i]} g
                      </div>
                      <Tip content={`Volume estimated from plate camera: ${MEMBER_VOLUMES[i]} L`}>
                        <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 2 }}>
                          Estimated volume: {(MEMBER_VOLUMES[i] * 1000).toFixed(0)} mL
                        </div>
                      </Tip>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Allocation arithmetic banner */}
      <div
        id="target-meals-allocation"
        className={`card ${temporaryHighlight === 'target-meals-allocation' ? 'tour-highlight' : ''}`}
        style={{ marginBottom: 'var(--s4)', background: 'var(--tint-info)', borderColor: 'rgba(31,95,107,0.3)' }}
      >
        <div className="card-header" style={{ borderColor: 'rgba(31,95,107,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--col-info)' }}>Deterministic Portion Allocation</span>
            <CalloutMarker num={2} label="Plate volume" targetId="target-meals-allocation" />
            <CalloutMarker num={3} label="Allocated grams" targetId="target-meals-allocation" />
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--col-info)' }}>m_i = M_total × (V_i / ΣV)</span>
        </div>

        <Tip content="Allocation: 410 g shared by estimated plate volume, 0.30 L and 0.15 L.">
          <div style={{ fontSize: 12, color: 'var(--ink)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
            <div>Anita: {consumedMass} g × 0.30 L / (0.30 + 0.15) L = <strong>{allocations[0]} g</strong> (66.7%)</div>
            <div>Ravi:  {consumedMass} g × 0.15 L / (0.30 + 0.15) L = <strong>{allocations[1]} g</strong> (33.3%)</div>
          </div>
        </Tip>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s3)', marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(31,95,107,0.2)' }}>
          {MEAL_MEMBERS.map((memberId, i) => {
            const profile = PROFILES.find(p => p.id === memberId)!;
            const n = nutrients[i];
            return (
              <div key={memberId}>
                <div style={{ fontSize: 12, fontWeight: 600, color: profile.color, marginBottom: 4 }}>{profile.name} Nutrients</div>
                <div className="detail-row"><span className="detail-row__label">Energy</span><span className="detail-row__value mono">{n.kcal + oilKcal} kcal</span></div>
                <div className="detail-row"><span className="detail-row__label">Protein</span><span className="detail-row__value mono">{n.protein} g</span></div>
                <div className="detail-row"><span className="detail-row__label">Carbs</span><span className="detail-row__value mono">{n.carbs} g</span></div>
                <div className="detail-row"><span className="detail-row__label">Fat</span><span className="detail-row__value mono">{n.fat} g</span></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison card: Photo only in grey, With fridge weight in green, Measured in ink */}
      <div
        id="target-meals-compare"
        className={`card ${temporaryHighlight === 'target-meals-compare' ? 'tour-highlight' : ''}`}
        style={{ marginBottom: 'var(--s4)' }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Accuracy Comparison — Anita (0.30 L serving)</span>
            <CalloutMarker num={4} label="Comparison card" targetId="target-meals-compare" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--s3)', fontSize: 12 }}>
          {/* 1. Photo only in grey */}
          <div style={{ padding: '8px 10px', background: 'var(--bg)', border: 'var(--border)', borderRadius: 3 }}>
            <div style={{ color: 'var(--mid)', fontWeight: 600, marginBottom: 4 }}>Photo only</div>
            <div className="mono" style={{ fontSize: 16, color: 'var(--mid)', fontWeight: 500 }}>
              ~{photoOnlyEstimate.kcal[0]} <span style={{ fontSize: 11 }}>kcal</span>
            </div>
            <div className="mono" style={{ color: 'var(--mid)', fontSize: 12, marginTop: 2 }}>
              ~{photoOnlyEstimate.protein[0]} g protein
            </div>
            <div style={{ marginTop: 6 }}>
              <Tip content="Low confidence: density and volume inferred solely from 2D camera pixels">
                <span className="chip chip--warn" style={{ fontSize: 10 }}>Confidence: Low</span>
              </Tip>
            </div>
          </div>

          {/* 2. With fridge weight in green */}
          <div style={{ padding: '8px 10px', background: 'var(--tint-safe)', border: '1px solid rgba(47,111,94,0.3)', borderRadius: 3 }}>
            <div style={{ color: 'var(--col-safe)', fontWeight: 600, marginBottom: 4 }}>With fridge weight</div>
            <div className="mono" style={{ fontSize: 16, color: 'var(--col-safe)', fontWeight: 600 }}>
              {fridgeWeightEstimate.kcal[0]} <span style={{ fontSize: 11 }}>kcal</span>
            </div>
            <div className="mono" style={{ color: 'var(--col-safe)', fontSize: 12, marginTop: 2 }}>
              {fridgeWeightEstimate.protein[0]} g protein
            </div>
            <div style={{ marginTop: 6 }}>
              <Tip content="High: based on measured tare weight from shelf load cells">
                <span className="chip chip--in-range" style={{ fontSize: 10 }}>Confidence: High</span>
              </Tip>
            </div>
          </div>

          {/* 3. Measured in ink */}
          <div style={{ padding: '8px 10px', background: 'var(--bg)', border: 'var(--border)', borderRadius: 3 }}>
            <div style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>Measured</div>
            <div className="mono" style={{ fontSize: 16, color: 'var(--ink)', fontWeight: 600 }}>
              {allocations[0]} <span style={{ fontSize: 11 }}>g net</span>
            </div>
            <div className="mono" style={{ color: 'var(--ink)', fontSize: 12, marginTop: 2 }}>
              ±2 g load cell accuracy
            </div>
            <div style={{ marginTop: 6 }}>
              <span className="chip chip--selected" style={{ fontSize: 10 }}>Hardware verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invisible ingredients toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontSize: 13, cursor: 'pointer', marginBottom: 'var(--s3)' }}>
        <input type="checkbox" checked={showOilPaneer} onChange={e => setShowOilPaneer(e.target.checked)} />
        <span>Include cooking ingredients removed earlier (oil 5 g, paneer 50 g)</span>
      </label>
      {showOilPaneer && (
        <div style={{ fontSize: 12, color: 'var(--ink)', padding: 'var(--s2) var(--s3)', background: 'var(--tint-caution)', border: '1px solid rgba(183,121,31,0.25)', borderRadius: 3, marginBottom: 'var(--s3)' }}>
          Cooking additions reconciled: Oil +{oilKcal} kcal · Paneer +{Math.round(50 * paneer.kcalPer100g / 100)} kcal allocated per member.
        </div>
      )}
    </div>
  );
}
