// tourContext.tsx — Shared state for Callouts mode and 12-step guided walkthrough
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSimControls } from './store';

export interface TourStep {
  step: number;
  route: string;
  tab?: string;
  targetId: string;
  title: string;
  description: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    route: '/',
    targetId: 'target-fridge-screen',
    title: '1. Fridge and door screen',
    description: 'The flush door screen displays internal temperature and status without opening the door.',
  },
  {
    step: 2,
    route: '/',
    targetId: 'target-interior-items',
    title: '2. Open door and select an item',
    description: 'The door swings open 100° revealing interior shelves, crisper drawer, and medicine zone.',
  },
  {
    step: 3,
    route: '/',
    targetId: 'target-door-screen-stage',
    title: '3. Zoom into the screen',
    description: 'Selecting the door screen smoothly zooms the camera into the 16:10 appliance interface.',
  },
  {
    step: 4,
    route: '/',
    tab: 'inside',
    targetId: 'target-inside-list',
    title: '4. Inside view and statuses',
    description: 'Items are grouped by zone with freshness status chips. Items near end-of-life sort to Use first.',
  },
  {
    step: 5,
    route: '/',
    tab: 'shelf',
    targetId: 'target-shelf-plan',
    title: '5. Shelf: lift the dal container',
    description: 'The container leaves the shelf. The four cell readings change and the position is computed from them.',
  },
  {
    step: 6,
    route: '/',
    tab: 'shelf',
    targetId: 'target-consumed-card',
    title: '6. Shelf: return it and read consumed mass',
    description: 'Returning the container re-identifies it by location and tare mass, logging 410 g consumed.',
  },
  {
    step: 7,
    route: '/',
    tab: 'thermal',
    targetId: 'target-thermal-canvas',
    title: '7. Thermal view',
    description: 'The thermal canvas maps heat distribution. The 8 °C safety contour demarcates the safe storage zone.',
  },
  {
    step: 8,
    route: '/',
    tab: 'power',
    targetId: 'target-power-chart',
    title: '8. Power: simulate the cut',
    description: 'Thermal capacity computed from 9.2 kg stored food allows pre-cooling so items stay safely below 8 °C.',
  },
  {
    step: 9,
    route: '/',
    tab: 'energy',
    targetId: 'target-energy-schedule',
    title: '9. Energy: tariff shift',
    description: 'Compressor cycles shift into cheaper off-peak tariff bands while maintaining thermal safety.',
  },
  {
    step: 10,
    route: '/',
    tab: 'meals',
    targetId: 'target-meals-allocation',
    title: '10. Meals: allocation',
    description: 'The 410 g consumed dal is proportionally divided between Anita (273 g) and Ravi (137 g) from meal photos.',
  },
  {
    step: 11,
    route: '/',
    tab: 'medicines',
    targetId: 'target-medicines-band',
    title: '11. Medicines: record and export',
    description: 'The medicine zone records temperatures within the strict 2–8 °C corridor with one-click CSV export.',
  },
  {
    step: 12,
    route: '/app',
    tab: 'reports',
    targetId: 'target-mobile-reports',
    title: '12. Mobile app: Reports',
    description: 'The companion app aggregates 30 days of consistent nutrition telemetry with profile breakdowns.',
  },
];

interface TourContextValue {
  calloutsActive: boolean;
  toggleCallouts: () => void;
  tourActive: boolean;
  currentStep: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  doorOpen: boolean;
  setDoorOpen: (open: boolean | ((v: boolean) => boolean)) => void;
  sceneState: 'landing' | 'zooming-in' | 'screen' | 'zooming-out';
  setSceneState: (s: 'landing' | 'zooming-in' | 'screen' | 'zooming-out') => void;
  temporaryHighlight: string | null;
  triggerHighlight: (id: string) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [calloutsActive, setCalloutsActive] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('inside');
  const [doorOpen, setDoorOpen] = useState(false);
  const [sceneState, setSceneState] = useState<'landing' | 'zooming-in' | 'screen' | 'zooming-out'>('landing');
  const [temporaryHighlight, setTemporaryHighlight] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const controls = useSimControls();

  const toggleCallouts = useCallback(() => {
    setCalloutsActive(v => !v);
  }, []);

  const triggerHighlight = useCallback((id: string) => {
    setTemporaryHighlight(id);
    setTimeout(() => {
      setTemporaryHighlight(h => (h === id ? null : h));
    }, 2000);
  }, []);

  const goToStep = useCallback((stepNum: number) => {
    const s = TOUR_STEPS[stepNum - 1];
    if (!s) return;
    setCurrentStep(stepNum);

    // Apply scene/route/tab state for this step
    if (s.route !== location.pathname) {
      navigate(s.route);
    }

    if (stepNum === 1) {
      setSceneState('landing');
      setDoorOpen(false);
    } else if (stepNum === 2) {
      setSceneState('landing');
      setDoorOpen(true);
    } else if (stepNum === 3) {
      setDoorOpen(false);
      setSceneState('screen');
      setActiveTab('inside');
    } else if (s.tab) {
      setSceneState('screen');
      setActiveTab(s.tab);
    }

    triggerHighlight(s.targetId);
  }, [location.pathname, navigate, triggerHighlight]);

  // Read URL params on mount or location change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const calloutsParam = params.get('callouts');
    const stepParam = params.get('step');
    const doorParam = params.get('door');
    const screenParam = params.get('screen');

    if (calloutsParam === '1' || calloutsParam === 'true') {
      setCalloutsActive(true);
    }
    if (doorParam === '1' || doorParam === 'true') {
      setDoorOpen(true);
    }
    if (tabParam) {
      setSceneState('screen');
      setActiveTab(tabParam);
    } else if (screenParam === '1' || screenParam === 'true') {
      setSceneState('screen');
    }
    if (stepParam) {
      const stepNum = parseInt(stepParam, 10);
      if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 12) {
        setTourActive(true);
        goToStep(stepNum);
      }
    }
  }, [location.search, goToStep]);

  const startTour = useCallback(() => {
    setTourActive(true);
    goToStep(1);
  }, [goToStep]);

  const endTour = useCallback(() => {
    setTourActive(false);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 12) {
      goToStep(currentStep + 1);
    } else {
      endTour();
    }
  }, [currentStep, goToStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // Keyboard navigation for walkthrough
  useEffect(() => {
    if (!tourActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        endTour();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tourActive, nextStep, prevStep, endTour]);

  const stepData = tourActive ? TOUR_STEPS[currentStep - 1] : null;

  return (
    <TourContext.Provider
      value={{
        calloutsActive,
        toggleCallouts,
        tourActive,
        currentStep,
        activeTab,
        setActiveTab,
        startTour,
        endTour,
        nextStep,
        prevStep,
        doorOpen,
        setDoorOpen,
        sceneState,
        setSceneState,
        temporaryHighlight,
        triggerHighlight,
      }}
    >
      {children}

      {/* Guided Walkthrough Docked Card (bottom-left) */}
      {tourActive && stepData && (
        <aside
          role="dialog"
          aria-label="Walkthrough guide"
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 9999,
            background: '#F4F1EA',
            border: '1px solid var(--hairline)',
            borderRadius: 6,
            padding: '12px 16px',
            maxWidth: 340,
            boxShadow: '0 8px 24px rgba(29,31,30,0.12)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--col-info)', fontWeight: 600 }}>
              Step {stepData.step} of 12
            </span>
            <button
              onClick={endTour}
              style={{ fontSize: 11, color: 'var(--mid)', background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label="Close walkthrough"
            >
              Close (Esc)
            </button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
            {stepData.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--mid)', lineHeight: 1.4, marginBottom: 12 }}>
            {stepData.description}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                fontSize: 12,
                color: currentStep === 1 ? 'var(--hairline)' : 'var(--ink)',
                cursor: currentStep === 1 ? 'default' : 'pointer',
                background: 'none',
                border: '1px solid var(--hairline)',
                padding: '4px 10px',
                borderRadius: 3,
              }}
            >
              Back
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {currentStep === 12 && (
                <button
                  onClick={() => { controls.reset(); endTour(); }}
                  style={{
                    fontSize: 12,
                    color: 'var(--col-caution)',
                    background: 'var(--tint-caution)',
                    border: '1px solid rgba(183,121,31,0.3)',
                    padding: '4px 10px',
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                >
                  Reset sim
                </button>
              )}
              <button
                onClick={nextStep}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#F4F1EA',
                  background: 'var(--col-info)',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: 3,
                  cursor: 'pointer',
                }}
              >
                {currentStep === 12 ? 'Finish' : 'Next →'}
              </button>
            </div>
          </div>
        </aside>
      )}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
