// DemoControls — sim clock controls
import React from 'react';
import { SimState } from '../sim/engine';
import { SimSpeed } from '../sim/store';
import { SEED_ITEMS } from '../data/items';
import { Tip } from '../components/Tip';

interface DemoControlsProps {
  playing: boolean;
  speed: SimSpeed;
  onPlay: () => void;
  onPause: () => void;
  onSpeed: (s: SimSpeed) => void;
  onReset: () => void;
  onUpdateSim: (fn: (s: SimState) => SimState) => void;
}

const SPEEDS: SimSpeed[] = [1, 60, 600];
const SPEED_LABELS: Record<SimSpeed, string> = { 1: '1×', 60: '60×', 600: '600×' };
const SPEED_TIPS: Record<SimSpeed, string> = {
  1: 'Real-time clock: 1 real second = 1 simulation second.',
  60: '60× speed: 1 real second = 1 simulation minute.',
  600: '600× speed: 1 real second = 10 simulation minutes.',
};

export function DemoControls({ playing, speed, onPlay, onPause, onSpeed, onReset, onUpdateSim }: DemoControlsProps) {
  return (
    <div style={{ padding: 'var(--s3) var(--s4)', borderTop: 'var(--border)', display: 'flex', flexWrap: 'wrap', gap: 'var(--s4)', alignItems: 'center', background: 'rgba(29,31,30,0.02)' }}>
      {/* Play / pause */}
      <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
        <Tip content={playing ? 'Pause simulation clock.' : 'Resume simulation clock.'}>
          <button
            className="btn-outline"
            onClick={playing ? onPause : onPlay}
            aria-label={playing ? 'Pause simulation' : 'Play simulation'}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {playing ? (
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="1" y="1" width="4" height="10" rx="1" fill="currentColor" />
                <rect x="7" y="1" width="4" height="10" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12">
                <polygon points="1,1 11,6 1,11" fill="currentColor" />
              </svg>
            )}
            {playing ? 'Pause' : 'Play'}
          </button>
        </Tip>

        {/* Speed */}
        <div style={{ display: 'flex', gap: 2 }}>
          {SPEEDS.map(s => (
            <Tip key={s} content={SPEED_TIPS[s]}>
              <button
                className={`btn-outline ${speed === s ? 'btn-solid' : ''}`}
                onClick={() => onSpeed(s)}
                style={speed === s ? { background: 'var(--ink)', color: 'var(--bg)', padding: '4px 8px', fontSize: 12 } : { padding: '4px 8px', fontSize: 12 }}
              >
                {SPEED_LABELS[s]}
              </button>
            </Tip>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap' }}>
        <Tip content="Places warm chicken stew (68 C) on Shelf 2 to observe cooling curve.">
          <button
            className="btn-outline"
            style={{ fontSize: 12 }}
            onClick={() => onUpdateSim(s => ({
              ...s,
              items: s.items.some(it => it.id === 'chicken') ? s.items : [
                ...s.items,
                {
                  ...SEED_ITEMS.find(it => it.id === 'chicken')!,
                  addedAt: s.simSec,
                  initialTemp: 68,
                }
              ],
              hotFoodAdded: true,
              hotFoodAddedAt: s.simSec,
            }))}
          >
            Add hot food
          </button>
        </Tip>

        <Tip content="Simulates door open event for 60 seconds; causes cavity air temperature spike.">
          <button
            className="btn-outline"
            style={{ fontSize: 12 }}
            onClick={() => onUpdateSim(s => ({ ...s, doorOpen: true }))}
          >
            Open door 60 s
          </button>
        </Tip>

        <Tip content="Simulates grid failure. Compressor shuts off; passive thermal storage maintains temperature.">
          <button
            className="btn-outline"
            style={{ fontSize: 12, color: 'var(--col-alert)', borderColor: 'var(--col-alert)' }}
            onClick={() => onUpdateSim(s => ({
              ...s,
              powerCut: !s.powerCut,
              powerCutStartSec: s.simSec,
            }))}
          >
            Power cut
          </button>
        </Tip>

        <Tip content="Removes items to drop stored thermal mass and observe reduced protection duration.">
          <button
            className="btn-outline"
            style={{ fontSize: 12 }}
            onClick={() => onUpdateSim(s => ({
              ...s,
              items: s.items.slice(0, Math.max(2, s.items.length - 4)),
            }))}
          >
            Remove 4 kg
          </button>
        </Tip>

        <Tip content="Reset simulation clock, temperature history, and seed inventory.">
          <button
            className="btn-outline"
            style={{ fontSize: 12 }}
            onClick={onReset}
          >
            Reset
          </button>
        </Tip>
      </div>
    </div>
  );
}
