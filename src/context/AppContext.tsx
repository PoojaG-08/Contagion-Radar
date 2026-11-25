import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { TRANSLATIONS, type TranslationPack } from '../i18n/translations';
import type { AppMode, LanguageCode, RiskAlert } from '../types/contagion';

export interface TourStepDef {
  step: number;
  title: string;
  route: string;
  summary: string;
  focusPoint: string;
}

export const JUDGE_TOUR_STEPS: TourStepDef[] = [
  {
    step: 1,
    title: 'MSME Financial Health Dashboard',
    route: '/dashboard',
    summary:
      'Review Kaveri Precision Auto Components: 87/100 Health Score, ₹48.30 Lakh receivables waiting, ₹24.80 Lakh overdue, and a 15-day working capital runway.',
    focusPoint: 'Notice the immediate ₹10,00,000 / 60-day overdue warning from Varroc Systems.',
  },
  {
    step: 2,
    title: 'Early Warning Risk Intelligence',
    route: '/early-warning',
    summary:
      'Inspect tiered risk classifications across all 18 networked businesses and triage live early-warning alerts with one-click review tracking.',
    focusPoint: 'Alerts link upstream payment delays directly to downstream Tier-2/Tier-3 cash compression.',
  },
  {
    step: 3,
    title: 'Multi-Tier Supply Chain Graph',
    route: '/network-graph',
    summary:
      'Explore the directed dependency network spanning Tier-1 OEMs, MSMEs, Tier-2 suppliers, and Tier-3 raw material mills.',
    focusPoint: 'Click Varroc or Kaveri to highlight downstream exposure and inspect dependency weights.',
  },
  {
    step: 4,
    title: 'Financial Contagion Propagation',
    route: '/contagion',
    summary:
      'Run the multi-stage cascade player to watch how a single Tier-1 settlement delay propagates across 3 supplier tiers over time.',
    focusPoint: 'Stage 0 to Stage 3 reveals hidden 2-hop and 3-hop exposure missed by single-invoice scoring.',
  },
  {
    step: 5,
    title: 'Payment Shock Stress Testing',
    route: '/shock-simulation',
    summary:
      'Stress-test the PPT reference scenario (30-day delay → ₹2.4 Crore exposure, 17 businesses, 121-day window) or adjust delay, buffer, and default parameters.',
    focusPoint: 'Compare baseline vs. post-shock exposure and identify vulnerable Tier-2 vendors.',
  },
  {
    step: 6,
    title: 'Recommended Preventive Actions',
    route: '/preventive-actions',
    summary:
      'Evaluate decision-support playbooks: TReDS invoice discounting simulation, MSMED Act Section 16 notice drafts, and supplier liquidity protection.',
    focusPoint: 'Simulated actions translate early warnings into concrete working capital relief.',
  },
  {
    step: 7,
    title: 'Network Impact & Coverage Benchmark',
    route: '/risk-metrics',
    summary:
      'Compare Traditional Invoice Scoring (35% prototype risk coverage) against the Contagion Radar Network Engine (92% prototype risk coverage).',
    focusPoint: 'Built for TReDS platforms, NBFCs, Large Buyers, and India’s MSME suppliers.',
  },
];

interface AppContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationPack;
  selectedBusinessId: string;
  setSelectedBusinessId: (id: string) => void;
  alerts: RiskAlert[];
  refreshAlerts: () => Promise<void>;
  toggleAlertReviewed: (id: string, reviewed: boolean) => Promise<void>;
  tourIndex: number | null;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  closeTour: () => void;
  dataVersion: number;
  bumpDataVersion: () => void;
  resetDemo: () => Promise<void>;
  isResetting: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>('msme');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('bus-kaveri');
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [dataVersion, setDataVersion] = useState<number>(0);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const refreshAlerts = useCallback(async () => {
    try {
      const res = await api.getAlerts();
      setAlerts(res.alerts);
    } catch {
      // handled in UI views
    }
  }, []);

  useEffect(() => {
    refreshAlerts();
  }, [refreshAlerts, dataVersion]);

  const toggleAlertReviewed = useCallback(async (id: string, reviewed: boolean) => {
    const res = await api.reviewAlert(id, reviewed);
    setAlerts((prev) => prev.map((a) => (a.id === id ? res.alert : a)));
  }, []);

  const bumpDataVersion = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  const resetDemo = useCallback(async () => {
    setIsResetting(true);
    try {
      await api.resetDemo();
      setSelectedBusinessId('bus-kaveri');
      setDataVersion((v) => v + 1);
      showToast('Demo data restored to baseline scenario.');
    } finally {
      setIsResetting(false);
    }
  }, [showToast]);

  const startTour = useCallback(() => setTourIndex(0), []);
  const nextTourStep = useCallback(() => {
    setTourIndex((prev) =>
      prev === null ? null : prev + 1 < JUDGE_TOUR_STEPS.length ? prev + 1 : null
    );
  }, []);
  const prevTourStep = useCallback(() => {
    setTourIndex((prev) => (prev === null ? null : Math.max(0, prev - 1)));
  }, []);
  const closeTour = useCallback(() => setTourIndex(null), []);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        selectedBusinessId,
        setSelectedBusinessId,
        alerts,
        refreshAlerts,
        toggleAlertReviewed,
        tourIndex,
        startTour,
        nextTourStep,
        prevTourStep,
        closeTour,
        dataVersion,
        bumpDataVersion,
        resetDemo,
        isResetting,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
