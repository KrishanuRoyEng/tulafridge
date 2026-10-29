import React, { useState } from 'react';
import { useSimStore, useSimControls, SimSpeed } from '../sim/store';
import { simTimeToDisplay, simDayDate, computeRemainingLife, batterReady } from '../sim/engine';
import { PROFILES } from '../data/items';
import { useTour } from '../sim/tourContext';
import { Tip } from '../components/Tip';
import { InsideScreen } from './InsideScreen';
import { ThermalScreen } from './ThermalScreen';
import { ShelfScreen } from './ShelfScreen';
import { FoodSafetyScreen } from './FoodSafetyScreen';
import { PowerScreen } from './PowerScreen';
import { EnergyScreen } from './EnergyScreen';
import { MealsScreen } from './MealsScreen';
import { MedicinesScreen } from './MedicinesScreen';
import { DemoControls } from './DemoControls';
import './DoorScreen.css';

export type ScreenTab = 'inside' | 'thermal' | 'shelf' | 'safety' | 'power' | 'energy' | 'meals' | 'medicines';

const TABS: { id: ScreenTab; label: string; tip: string }[] = [
  { id: 'inside', label: 'Inside', tip: 'Camera view, inventory list, shelf-life and nutritional sheets' },
  { id: 'thermal', label: 'Thermal', tip: 'Internal thermal camera canvas and point temperature inspection' },
  { id: 'shelf', label: 'Shelf', tip: 'Four-point load cell plan view, centroid calculation and mass tracking' },
  { id: 'safety', label: 'Food safety', tip: 'Temperature histories, hot food cooling and fermentation tracking' },
  { id: 'power', label: 'Power', tip: 'Outage simulation, thermal capacity and pre-cooling protection' },
  { id: 'energy', label: 'Energy', tip: '24-hour tariff band scheduling and compressor run shifting' },
  { id: 'meals', label: 'Meals', tip: 'Mass-constrained nutrition allocation using meal photographs' },
  { id: 'medicines', label: 'Medicines', tip: 'Medicine zone 2-8°C corridor tracking and CSV records' },
];

interface DoorScreenProps {
  onBack?: () => void;
}

export function DoorScreen({ onBack }: DoorScreenProps) {
  const { activeTab, setActiveTab, calloutsActive, toggleCallouts, startTour, temporaryHighlight } = useTour();
  const [activeProfile, setActiveProfile] = useState('anita');
  const [controlsOpen, setControlsOpen] = useState(false);
  const { sim, speed, playing } = useSimStore();
  const controls = useSimControls();

  const displayTime = simTimeToDisplay(sim.simSec);
  const displayDate = simDayDate(sim.simSec);

  // Compute live alerts per tab
  const insideAlerts = sim.items.filter(it => {
    const { fractionUsed } = computeRemainingLife(it, sim.simSec, sim.cabinetTemp);
    return fractionUsed >= 0.75;
  }).length;
  const safetyAlerts = (sim.hotFoodAdded ? 1 : 0) + (sim.items.some(it => it.id === 'batter' && batterReady(it, sim.simSec)) ? 1 : 0);
  const powerAlerts = sim.powerCut || sim.preCooling ? 1 : 0;
  const medAlerts = sim.cabinetTemp < 2 || sim.cabinetTemp > 8 ? 1 : 0;

  const TAB_ALERTS: Partial<Record<ScreenTab, { count: number; severity: 'amber' | 'red' }>> = {
    inside: insideAlerts > 0 ? { count: insideAlerts, severity: 'amber' } : undefined,
    safety: safetyAlerts > 0 ? { count: safetyAlerts, severity: 'amber' } : undefined,
    power: powerAlerts > 0 ? { count: powerAlerts, severity: 'red' } : undefined,
    medicines: medAlerts > 0 ? { count: medAlerts, severity: 'red' } : undefined,
  };

  return (
    <div
      id="target-door-screen-stage"
      className={`door-screen ${temporaryHighlight === 'target-door-screen-stage' ? 'tour-highlight' : ''}`}
    >
      {/* Top bar */}
      <header className="door-screen__topbar">
        <div className="door-screen__topbar-left">
          <Tip content="Simulation clock: starts Thu 6:40 pm">
            <span className="mono door-screen__clock">{displayTime}</span>
          </Tip>
          <span className="door-screen__date">{displayDate}</span>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                fontSize: 12,
                color: 'var(--mid)',
                background: 'none',
                border: '1px solid var(--hairline)',
                padding: '2px 8px',
                borderRadius: 3,
                marginLeft: 8,
                cursor: 'pointer',
              }}
            >
              ← Fridge
            </button>
          )}
        </div>

        <div className="door-screen__topbar-center" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tip content="Internal average cabinet temperature. Range 2-8°C.">
            <span className="mono door-screen__temp" style={{ color: 'var(--col-cold)' }}>
              {sim.cabinetTemp.toFixed(1)}°C
            </span>
          </Tip>
          {sim.powerCut && (
            <Tip content="Load-shedding active: running on thermal storage.">
              <span className="chip chip--alert" style={{ fontSize: 11 }}>Power cut</span>
            </Tip>
          )}
          {sim.preCooling && (
            <Tip content="Set-point lowered for 2 h before outage, sized by 9.2 kg stored.">
              <span className="chip chip--cold" style={{ fontSize: 11 }}>Pre-cooling</span>
            </Tip>
          )}
        </div>

        <div className="door-screen__topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Callouts Mode Toggle */}
          <Tip content="Toggle numbered callout pins explaining UI components">
            <button
              className="btn-outline"
              onClick={toggleCallouts}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                color: calloutsActive ? 'var(--col-info)' : 'var(--mid)',
                background: calloutsActive ? 'var(--tint-info)' : 'none',
                borderColor: calloutsActive ? 'var(--col-info)' : 'var(--hairline)',
              }}
              aria-pressed={calloutsActive}
            >
              {calloutsActive ? 'Callouts on' : 'Callouts'}
            </button>
          </Tip>

          {/* Guided Walkthrough Button */}
          <Tip content="Start 12-step guided walkthrough of the system">
            <button
              className="btn-outline"
              onClick={startTour}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                color: 'var(--col-info)',
                borderColor: 'var(--col-info)',
                fontWeight: 500,
              }}
            >
              Walkthrough
            </button>
          </Tip>

          <div style={{ width: 1, height: 16, background: 'var(--hairline)', margin: '0 4px' }} />

          {/* Profile Switcher */}
          {PROFILES.map(p => (
            <Tip key={p.id} content={`${p.name} (${p.age}) · Target ${p.kcalTarget} kcal, ${p.proteinTarget}g protein`}>
              <button
                className={`profile-avatar ${activeProfile === p.id ? 'profile-avatar--active' : ''}`}
                onClick={() => setActiveProfile(p.id)}
                aria-label={`Switch to ${p.name}`}
                style={{
                  background: activeProfile === p.id ? p.tint : 'var(--hairline)',
                  color: p.color,
                  borderColor: activeProfile === p.id ? p.color : 'transparent',
                }}
              >
                {p.initial}
              </button>
            </Tip>
          ))}
        </div>
      </header>

      <div className="door-screen__body">
        {/* Left rail navigation */}
        <nav className="door-screen__nav" aria-label="Screen sections">
          {TABS.map(tab => {
            const alert = TAB_ALERTS[tab.id];
            const isActive = activeTab === tab.id;
            return (
              <Tip key={tab.id} content={tab.tip} position="right">
                <button
                  className={`door-screen__nav-tab ${isActive ? 'door-screen__nav-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-selected={isActive}
                  role="tab"
                >
                  <span>{tab.label}</span>
                  {alert && (
                    <span className="tab-alert-badge">
                      <span className={`tab-alert-dot tab-alert-dot--${alert.severity}`} />
                      <span>{alert.count}</span>
                    </span>
                  )}
                </button>
              </Tip>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="door-screen__content" role="tabpanel">
          {activeTab === 'inside' && <InsideScreen activeProfile={activeProfile} />}
          {activeTab === 'thermal' && <ThermalScreen />}
          {activeTab === 'shelf' && <ShelfScreen />}
          {activeTab === 'safety' && <FoodSafetyScreen />}
          {activeTab === 'power' && <PowerScreen />}
          {activeTab === 'energy' && <EnergyScreen />}
          {activeTab === 'meals' && <MealsScreen activeProfile={activeProfile} />}
          {activeTab === 'medicines' && <MedicinesScreen />}
        </main>
      </div>

      {/* Demo controls drawer */}
      <div className={`demo-controls-drawer ${controlsOpen ? 'demo-controls-drawer--open' : ''}`}>
        <button
          className="demo-controls-drawer__tab"
          onClick={() => setControlsOpen(v => !v)}
          aria-expanded={controlsOpen}
        >
          Demo controls
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginLeft: 4, transform: controlsOpen ? 'rotate(180deg)' : 'none' }}>
            <path d="M2 6L5 3L8 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </button>
        {controlsOpen && (
          <DemoControls
            playing={playing}
            speed={speed}
            onPlay={() => controls.play()}
            onPause={() => controls.pause()}
            onSpeed={(s: SimSpeed) => controls.setSpeed(s)}
            onReset={() => controls.reset()}
            onUpdateSim={controls.updateSim}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="door-screen__footer">
        <span>Simulated data</span>
      </footer>
    </div>
  );
}
