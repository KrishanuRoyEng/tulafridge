// Mobile app shell — phone frame + tab navigation
import React, { useState, useEffect } from 'react';
import { TodayScreen } from './TodayScreen';
import { FridgeListScreen } from './FridgeListScreen';
import { MealsMobileScreen } from './MealsMobileScreen';
import { ReportsScreen } from './ReportsScreen';
import { MedicinesMobileScreen } from './MedicinesMobileScreen';
import { SettingsScreen } from './SettingsScreen';
import { useLocation } from 'react-router-dom';
import { useTour } from '../sim/tourContext';
import './MobileApp.css';

export type MobileTab = 'today' | 'fridge' | 'meals' | 'reports' | 'medicines';

const TABS: { id: MobileTab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'fridge', label: 'Fridge' },
  { id: 'meals', label: 'Meals' },
  { id: 'reports', label: 'Reports' },
  { id: 'medicines', label: 'Medicines' },
];

interface MobileAppProps {
  onNavigateToFridge: () => void;
}

export function MobileApp({ onNavigateToFridge }: MobileAppProps) {
  const location = useLocation();
  const searchTab = new URLSearchParams(location.search).get('tab') as MobileTab | null;
  const [activeTab, setActiveTab] = useState<MobileTab>(searchTab && TABS.some(t => t.id === searchTab) ? searchTab : 'today');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isWide, setIsWide] = useState(typeof window !== 'undefined' && window.innerWidth > 700);
  const { calloutsActive, toggleCallouts, tourActive, currentStep } = useTour();

  React.useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth > 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync tab with URL search param or walkthrough step 12
  useEffect(() => {
    const p = new URLSearchParams(location.search).get('tab') as MobileTab | null;
    if (p && TABS.some(t => t.id === p)) {
      setActiveTab(p);
    }
  }, [location.search]);

  useEffect(() => {
    if (tourActive && currentStep === 12) {
      setActiveTab('reports');
      setSettingsOpen(false);
    }
  }, [tourActive, currentStep]);

  const appContent = (
    <div className="mobile-app">
      {/* Top header */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Tula</div>
          <button
            className={`btn-text ${calloutsActive ? 'btn-text--active' : ''}`}
            onClick={toggleCallouts}
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 3,
              background: calloutsActive ? 'var(--tint-info)' : 'transparent',
              color: calloutsActive ? 'var(--col-info)' : 'var(--mid)',
              border: calloutsActive ? '1px solid var(--col-info)' : '1px solid var(--hairline)',
              cursor: 'pointer',
            }}
          >
            Callouts
          </button>
        </div>
        <button className="btn-text" onClick={() => setSettingsOpen(true)} style={{ fontSize: 13 }}>
          Settings
        </button>
      </header>

      {/* Content */}
      <main className="mobile-content">
        {settingsOpen ? (
          <SettingsScreen onClose={() => setSettingsOpen(false)} />
        ) : (
          <>
            {activeTab === 'today' && <TodayScreen onNavigateToFridge={onNavigateToFridge} />}
            {activeTab === 'fridge' && <FridgeListScreen />}
            {activeTab === 'meals' && <MealsMobileScreen />}
            {activeTab === 'reports' && <ReportsScreen />}
            {activeTab === 'medicines' && <MedicinesMobileScreen />}
          </>
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="mobile-tabbar" aria-label="Main navigation">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`mobile-tab ${activeTab === tab.id && !settingsOpen ? 'mobile-tab--active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setSettingsOpen(false); }}
            aria-selected={activeTab === tab.id && !settingsOpen}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="mobile-footer">Simulated data</div>
    </div>
  );

  if (isWide) {
    return (
      <div className="phone-frame-container">
        <div className="phone-frame">
          <div className="phone-frame__body">
            {appContent}
          </div>
        </div>
      </div>
    );
  }

  return appContent;
}
