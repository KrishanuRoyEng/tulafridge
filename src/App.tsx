// App.tsx — routing
import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { FridgeScene } from './scene/FridgeScene';
import { MobileApp } from './mobile/MobileApp';
import { TourProvider, useTour } from './sim/tourContext';

function PageNav({ rightLinkText, onRightLinkClick }: { rightLinkText: string; onRightLinkClick: () => void }) {
  const { calloutsActive, toggleCallouts, startTour } = useTour();

  return (
    <nav className="page-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
        <span className="page-nav__brand">Tula</span>
        <button
          className="page-nav__link"
          onClick={toggleCallouts}
          style={{
            background: calloutsActive ? 'var(--tint-info)' : 'none',
            color: calloutsActive ? 'var(--col-info)' : 'var(--mid)',
            fontWeight: calloutsActive ? 500 : 400,
          }}
          aria-pressed={calloutsActive}
        >
          {calloutsActive ? 'Callouts on' : 'Callouts'}
        </button>
        <button
          className="page-nav__link"
          onClick={startTour}
          style={{ color: 'var(--col-info)', fontWeight: 500 }}
        >
          Walkthrough
        </button>
      </div>
      <button className="page-nav__link" onClick={onRightLinkClick}>
        {rightLinkText}
      </button>
    </nav>
  );
}

function FridgePage() {
  const navigate = useNavigate();
  return (
    <>
      <PageNav rightLinkText="Mobile app" onRightLinkClick={() => navigate('/app')} />
      <FridgeScene onNavigateToApp={() => navigate('/app')} />
      <footer className="page-footer">Simulated data</footer>
    </>
  );
}

function AppPage() {
  const navigate = useNavigate();
  return (
    <>
      <PageNav rightLinkText="Fridge screen" onRightLinkClick={() => navigate('/')} />
      <div style={{ paddingTop: 40 }}>
        <MobileApp onNavigateToFridge={() => navigate('/')} />
      </div>
      <footer className="page-footer">Simulated data</footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TourProvider>
        <Routes>
          <Route path="/" element={<FridgePage />} />
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </TourProvider>
    </BrowserRouter>
  );
}
