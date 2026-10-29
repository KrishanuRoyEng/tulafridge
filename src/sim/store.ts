// Simulation store — useSyncExternalStore pattern
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { SimState, INITIAL_STATE, advanceSim } from './engine';

// Speed multipliers
export type SimSpeed = 1 | 60 | 600;

interface StoreState {
  sim: SimState;
  speed: SimSpeed;
  playing: boolean;
}

type Listener = () => void;

class SimStore {
  private state: StoreState = {
    sim: INITIAL_STATE,
    speed: 1,
    playing: true,
  };
  private listeners = new Set<Listener>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastTick = Date.now();

  constructor() {
    this.startTick();
  }

  private startTick() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (!this.state.playing) return;
      const now = Date.now();
      const wallDelta = (now - this.lastTick) / 1000;
      this.lastTick = now;
      const simDelta = wallDelta * this.state.speed;
      this.state = {
        ...this.state,
        sim: advanceSim(this.state.sim, simDelta),
      };
      this.notify();
    }, 100); // 10 Hz
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  getSnapshot(): StoreState {
    return this.state;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setPlaying(playing: boolean) {
    this.lastTick = Date.now();
    this.state = { ...this.state, playing };
    this.notify();
  }

  setSpeed(speed: SimSpeed) {
    this.state = { ...this.state, speed };
    this.notify();
  }

  updateSim(updater: (s: SimState) => SimState) {
    this.state = { ...this.state, sim: updater(this.state.sim) };
    this.notify();
  }

  reset() {
    this.state = { sim: INITIAL_STATE, speed: 1, playing: true };
    this.lastTick = Date.now();
    this.notify();
  }
}

export const simStore = new SimStore();

export function useSimStore() {
  const snapshot = useSyncExternalStore(
    useCallback((l) => simStore.subscribe(l), []),
    () => simStore.getSnapshot()
  );
  return snapshot;
}

export function useSimControls() {
  return {
    play: () => simStore.setPlaying(true),
    pause: () => simStore.setPlaying(false),
    setSpeed: (s: SimSpeed) => simStore.setSpeed(s),
    reset: () => simStore.reset(),
    updateSim: (fn: (s: SimState) => SimState) => simStore.updateSim(fn),
  };
}
