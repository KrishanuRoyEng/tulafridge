// SettingsScreen — setup flow, consent, optional services
import React, { useState } from 'react';
import { RetrofitKit } from '../art/FoodItems';
import { useSimControls } from '../sim/store';

const SETUP_STEPS = [
  {
    step: 1,
    title: 'Place load cells',
    desc: 'Place the four load cell supports under each shelf you want to monitor.',
    parts: ['4× load cell supports'],
  },
  {
    step: 2,
    title: 'Mount camera',
    desc: 'Attach the camera unit to the top interior wall. Align with the shelf below.',
    parts: ['1× camera unit', '1× mounting bracket'],
  },
  {
    step: 3,
    title: 'Add temperature sensor',
    desc: 'Place the temperature sensor in the medicine zone or coldest shelf.',
    parts: ['1× sensor probe', '1× adhesive mount'],
  },
  {
    step: 4,
    title: 'Register plates',
    desc: 'Place each plate or bowl on shelf 2 and tap "Register". The load cells measure its tare.',
    parts: ['Your plates and bowls'],
  },
  {
    step: 5,
    title: 'Pair profiles',
    desc: 'Add family members. Only initials are stored. No photos required.',
    parts: ['Family member names and ages'],
  },
];

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const [activeSection, setActiveSection] = useState<'main' | 'setup' | 'consent' | 'shopping' | 'surplus'>('main');
  const [setupStep, setSetupStep] = useState(0);
  const controls = useSimControls();

  if (activeSection === 'setup') {
    const step = SETUP_STEPS[setupStep];
    return (
      <div>
        <button className="btn-text" onClick={() => { setActiveSection('main'); setSetupStep(0); }}
          style={{ marginBottom: 'var(--s3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Settings
        </button>

        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--s1)' }}>Set up retrofit kit</div>
        <div className="label-xs" style={{ marginBottom: 'var(--s4)' }}>Step {setupStep + 1} of {SETUP_STEPS.length}</div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--s4)' }}>
          {SETUP_STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= setupStep ? 'var(--accent)' : 'var(--hairline)' }} />
          ))}
        </div>

        {/* Kit illustration */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s4)' }}>
          <RetrofitKit size={220} />
        </div>

        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--s2)' }}>{step.title}</div>
        <div style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 'var(--s3)', lineHeight: 1.6 }}>{step.desc}</div>

        <div style={{ marginBottom: 'var(--s4)' }}>
          <div className="label-xs" style={{ marginBottom: 'var(--s1)' }}>Parts needed</div>
          {step.parts.map((p, i) => (
            <div key={i} style={{ fontSize: 13, padding: '4px 0', borderBottom: 'var(--border)' }}>{p}</div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--s2)' }}>
          {setupStep > 0 && (
            <button className="btn-outline" onClick={() => setSetupStep(s => s - 1)}>Back</button>
          )}
          {setupStep < SETUP_STEPS.length - 1 ? (
            <button className="btn-accent" onClick={() => setSetupStep(s => s + 1)}>Continue</button>
          ) : (
            <button className="btn-accent" onClick={() => { setActiveSection('main'); setSetupStep(0); }}>Done</button>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === 'consent') {
    return (
      <div>
        <button className="btn-text" onClick={() => setActiveSection('main')}
          style={{ marginBottom: 'var(--s3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Settings
        </button>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--s4)' }}>Privacy</div>

        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--ink)', marginBottom: 'var(--s4)' }}>
          <p style={{ marginBottom: 'var(--s3)' }}>Photos are processed on this device. No image data leaves your home network.</p>
          <p style={{ marginBottom: 'var(--s3)' }}>Profiles are identified by initials only. No names, photos, or biometrics are stored.</p>
          <p>Weight and temperature data are stored locally and used only for the functions you see in this app.</p>
        </div>

        <div style={{ padding: 'var(--s3)', border: 'var(--border)', borderRadius: 'var(--radius)', marginBottom: 'var(--s4)' }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 'var(--s2)' }}>Data permissions</div>
          {['Weight sensing', 'Camera (on-device only)', 'Temperature logging', 'Meal photo analysis'].map(p => (
            <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: 'var(--border)' }}>
              <span>{p}</span>
              <span style={{ color: 'var(--accent)' }}>Allowed</span>
            </div>
          ))}
        </div>

        <button
          className="btn-outline"
          style={{ color: 'var(--alert)', borderColor: 'var(--alert)' }}
          onClick={() => {
            controls.reset();
            alert('All local data cleared.');
          }}
        >
          Delete all my data
        </button>
        <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
          Resets the simulation and clears all stored state.
        </div>
      </div>
    );
  }

  if (activeSection === 'shopping') {
    const items = [
      { name: 'Toor dal', qty: '500 g', reason: 'Low stock' },
      { name: 'Milk', qty: '2 L', reason: 'Expiring soon' },
      { name: 'Leafy greens', qty: '300 g', reason: 'Nearly done' },
    ];
    return (
      <div>
        <button className="btn-text" onClick={() => setActiveSection('main')}
          style={{ marginBottom: 'var(--s3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Settings
        </button>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--s3)' }}>Shopping list</div>
        <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 'var(--s4)' }}>Built from current stock and consumption patterns.</div>
        {items.map(item => (
          <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--s2) 0', borderBottom: 'var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--mid)' }}>{item.reason}</div>
            </div>
            <span className="mono" style={{ fontSize: 13 }}>{item.qty}</span>
          </div>
        ))}
      </div>
    );
  }

  if (activeSection === 'surplus') {
    return (
      <div>
        <button className="btn-text" onClick={() => setActiveSection('main')}
          style={{ marginBottom: 'var(--s3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Settings
        </button>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--s3)' }}>Offer surplus</div>
        <div style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 'var(--s4)' }}>Items nearing end of life that could be offered to a community fridge.</div>
        {[
          { name: 'Leafy greens', qty: '270 g', by: 'Tonight 10 pm' },
          { name: 'Milk', qty: '500 mL', by: 'Fri 6 pm' },
        ].map(item => (
          <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--s2) 0', borderBottom: 'var(--border)' }}>
            <div>
              <div style={{ fontSize: 13 }}>{item.name} — {item.qty}</div>
              <div style={{ fontSize: 11, color: 'var(--mid)' }}>Use by {item.by}</div>
            </div>
            <button className="btn-outline" style={{ fontSize: 11 }}>Offer</button>
          </div>
        ))}
      </div>
    );
  }

  // Main settings
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s5)' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Settings</div>
        <button className="btn-text" onClick={onClose} style={{ fontSize: 12 }}>Done</button>
      </div>

      {/* Sections */}
      {[
        { label: 'Set up retrofit kit', sub: '5-step installation guide', action: () => setActiveSection('setup') },
        { label: 'Privacy & consent', sub: 'Data permissions, delete all data', action: () => setActiveSection('consent') },
        { label: 'Shopping list', sub: 'Items to buy based on stock', action: () => setActiveSection('shopping') },
        { label: 'Offer surplus', sub: 'Share expiring food', action: () => setActiveSection('surplus') },
      ].map(item => (
        <button key={item.label} onClick={item.action}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 'var(--s3) 0', background: 'none', border: 'none', borderBottom: 'var(--border)', cursor: 'pointer', textAlign: 'left' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{item.label}</div>
            <div style={{ fontSize: 11, color: 'var(--mid)' }}>{item.sub}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 2L9 7L4 12" stroke="var(--mid)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      ))}

      <div style={{ marginTop: 'var(--s5)', fontSize: 11, color: 'var(--mid)' }}>
        Simulated data. v0.1.0
      </div>
    </div>
  );
}
