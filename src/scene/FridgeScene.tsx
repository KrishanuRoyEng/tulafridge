// FridgeScene — landing view with zoom animation and door open
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSimStore } from '../sim/store';
import { simTimeToDisplay, simDayDate, computeRemainingLife, remainingLifeLabel, itemStatus } from '../sim/engine';
import { SEED_ITEMS } from '../data/items';
import { DoorScreen } from '../screen/DoorScreen';
import { useTour } from '../sim/tourContext';
import './FridgeScene.css';

// Interior items placed as absolute positioned elements
const INTERIOR_ITEMS = [
  { id: 'dal', label: 'Dal', x: 18, y: 100, color: '#B5834A', w: 36, h: 28 },
  { id: 'rice', label: 'Rice', x: 70, y: 104, color: '#EDE3C8', w: 36, h: 28 },
  { id: 'curry', label: 'Curry', x: 122, y: 98, color: '#C4973A', w: 36, h: 28 },
  { id: 'paneer', label: 'Paneer', x: 18, y: 22, color: '#F0E6C0', w: 34, h: 24 },
  { id: 'chicken', label: 'Chicken', x: 120, y: 18, color: '#C8A070', w: 40, h: 26 },
  { id: 'curd', label: 'Curd', x: 18, y: 200, color: '#F0EEE8', w: 36, h: 22 },
  { id: 'batter', label: 'Batter', x: 80, y: 192, color: '#D4C8A8', w: 28, h: 38 },
  { id: 'greens', label: 'Greens', x: 20, y: 302, color: '#5A8A4A', w: 44, h: 26 },
  { id: 'tomatoes', label: 'Tomatoes', x: 90, y: 306, color: '#C04535', w: 50, h: 24 },
  { id: 'milk', label: 'Milk', x: 180, y: 108, color: '#F8F5EE', w: 24, h: 40 },
  { id: 'eggs', label: 'Eggs', x: 180, y: 160, color: '#F4F0E0', w: 38, h: 26 },
  { id: 'insulin1', label: 'Insulin', x: 210, y: 22, color: '#E0EBF0', w: 30, h: 20 },
];

interface FridgeSceneProps {
  onNavigateToApp: () => void;
}

export function FridgeScene({ onNavigateToApp }: FridgeSceneProps) {
  const { sim } = useSimStore();
  const { sceneState, setSceneState, doorOpen, setDoorOpen, currentStep, tourActive } = useTour();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Auto-select dal on step 2 of walkthrough
  useEffect(() => {
    if (tourActive && currentStep === 2) {
      setSelectedItem('dal');
    }
  }, [tourActive, currentStep]);

  const handleScreenClick = useCallback(() => {
    if (sceneState === 'landing') {
      setSceneState('zooming-in');
      setTimeout(() => setSceneState('screen'), 900);
    }
  }, [sceneState, setSceneState]);

  const handleBack = useCallback(() => {
    if (sceneState === 'screen') {
      setSceneState('zooming-out');
      setTimeout(() => setSceneState('landing'), 900);
    }
  }, [sceneState, setSceneState]);

  const toggleDoor = useCallback(() => {
    setDoorOpen(v => !v);
    setSelectedItem(null);
  }, [setDoorOpen]);

  const displayTime = simTimeToDisplay(sim.simSec);
  const displayDate = simDayDate(sim.simSec);
  const cabinetTemp = sim.cabinetTemp;

  return (
    <div className="fridge-scene" ref={sceneRef}>
      {/* Scene overlay for zoom */}
      {(sceneState === 'screen' || sceneState === 'zooming-in' || sceneState === 'zooming-out') && (
        <div id="target-door-screen-stage" className={`fridge-scene__screen-overlay fridge-scene__screen-overlay--${sceneState}`}>
          <div className="fridge-scene__back-row">
            <button className="btn-text" onClick={handleBack} aria-label="Back to fridge view">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          </div>
          <DoorScreen onBack={handleBack} />
        </div>
      )}

      {/* Landing fridge view */}
      <div className={`fridge-scene__landing ${sceneState !== 'landing' && sceneState !== 'zooming-in' ? 'fridge-scene__landing--hidden' : ''}`}>
        <div className="fridge-wrapper">
          {/* The fridge body */}
          <div className={`fridge-body ${doorOpen ? 'fridge-body--open' : ''}`}>

            {/* Fridge SVG exterior */}
            <div className="fridge-exterior">
              {/* Main steel body */}
              <div className="fridge-steel-body">
                {/* Upper section */}
                <div className="fridge-upper-section">
                  {/* Stationary Interior Cavity */}
                  <div id="target-interior-items" className="fridge-interior-cavity">
                    {/* Shelves */}
                    <div className="shelf-line" style={{ top: '80px' }} />
                    <div className="shelf-line" style={{ top: '180px' }} />
                    <div className="shelf-line" style={{ top: '280px' }} />

                    {/* Medicine zone */}
                    <div className="medicine-zone">
                      <span className="label-xs">Med zone</span>
                    </div>

                    {/* Food items */}
                    {INTERIOR_ITEMS.map(item => (
                      <div
                        key={item.id}
                        className={`interior-item ${selectedItem === item.id ? 'interior-item--selected' : ''}`}
                        style={{
                          left: item.x,
                          top: item.y,
                          width: item.w,
                          height: item.h,
                          background: item.color,
                        }}
                        onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                        tabIndex={0}
                        role="button"
                        aria-label={item.label}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedItem(selectedItem === item.id ? null : item.id)}
                      >
                        <span className="interior-item__label">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Top door (3D hinge) */}
                  <div className={`fridge-top-door ${doorOpen ? 'fridge-top-door--open' : ''}`}>
                    <div className="fridge-door-face">
                      {/* Brand */}
                      <div className="fridge-brand">TULA</div>
                      {/* Handle */}
                      <div className="fridge-handle fridge-handle--top"></div>
                      {/* Screen on door */}
                      <div
                        id="target-fridge-screen"
                        className={`fridge-screen ${sceneState === 'zooming-in' ? 'fridge-screen--zooming' : ''}`}
                        ref={screenRef}
                        onClick={handleScreenClick}
                        onKeyDown={(e) => e.key === 'Enter' && handleScreenClick()}
                        tabIndex={0}
                        role="button"
                        aria-label="Open door screen"
                      >
                        <div className="fridge-screen__content">
                          <div className="fridge-screen__time mono">{displayTime}</div>
                          <div className="fridge-screen__temp mono">{cabinetTemp.toFixed(1)}°C</div>
                          <div className="fridge-screen__status">All items within range</div>
                        </div>
                      </div>
                    </div>

                    {/* Inner face of door when open */}
                    <div className="fridge-door-inner">
                      <div className="door-bin">
                        <span className="label-xs">Door bin</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hinge strip */}
                <div className="fridge-hinge-strip"></div>

                {/* Bottom door (freezer) */}
                <div className="fridge-bottom-door">
                  <div className="fridge-handle fridge-handle--bottom"></div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="fridge-controls">
              <button
                className="btn-outline"
                onClick={toggleDoor}
                aria-label={doorOpen ? 'Close door' : 'Open door'}
              >
                {doorOpen ? 'Close door' : 'Open door'}
              </button>
            </div>

            {/* Screen hint */}
            {!doorOpen && sceneState === 'landing' && (
              <div className="fridge-hint">Select the screen</div>
            )}
          </div>
        </div>

        {/* Item detail panel when open */}
        {doorOpen && selectedItem && (
          <div className="item-detail-panel">
            <button
              className="item-detail-panel__close"
              onClick={() => setSelectedItem(null)}
              aria-label="Close detail"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" />
                <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <ItemDetailPanel itemId={selectedItem} simSec={sim.simSec} cabinetTemp={sim.cabinetTemp} />
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal item detail panel for the landing view
function ItemDetailPanel({ itemId, simSec, cabinetTemp }: { itemId: string; simSec: number; cabinetTemp: number }) {
  const item = SEED_ITEMS.find((it) => it.id === itemId);
  if (!item) return null;

  const netMass = item.massGross - item.containerMass;
  const { fractionUsed } = computeRemainingLife(item, simSec, cabinetTemp);
  const lifeLabel = remainingLifeLabel(item, simSec, cabinetTemp);
  const status = itemStatus(fractionUsed);

  return (
    <div>
      <div className="label-xs" style={{ marginBottom: 4 }}>{item.shelf}</div>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{item.label}</h3>
      <div className="item-detail__row">
        <span>Gross mass</span>
        <span className="mono">{item.massGross} g</span>
      </div>
      <div className="item-detail__row">
        <span>Net contents</span>
        <span className="mono">{netMass} g</span>
      </div>
      <div className="item-detail__row">
        <span>Energy</span>
        <span className="mono">{item.kcalPer100g} kcal/100 g</span>
      </div>
      <div className="item-detail__row">
        <span>Protein</span>
        <span className="mono">{item.proteinPer100g} g/100 g</span>
      </div>
      <div className="item-detail__row" style={{ marginTop: 8 }}>
        <span>{lifeLabel}</span>
        <span className={`chip chip--${status === 'In range' ? 'ok' : 'warn'}`}>{status}</span>
      </div>
      <div className="progress-bar" style={{ marginTop: 6 }}>
        <div
          className={`progress-bar__fill progress-bar__fill--${status === 'In range' ? 'ok' : 'warn'}`}
          style={{ width: `${Math.round(fractionUsed * 100)}%` }}
        />
      </div>
    </div>
  );
}
