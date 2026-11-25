import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Bot,
  Compass,
  FileText,
  GitBranch,
  Globe,
  Layers,
  LayoutDashboard,
  Menu,
  Network,
  Radar,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { JUDGE_TOUR_STEPS, useApp } from '../context/AppContext';
import { LANGUAGE_NAMES } from '../i18n/translations';
import type { LanguageCode } from '../types/contagion';
import { RiskStatusText } from './RiskUI';

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    mode,
    setMode,
    language,
    setLanguage,
    t,
    alerts,
    toggleAlertReviewed,
    tourIndex,
    startTour,
    nextTourStep,
    prevTourStep,
    closeTour,
    resetDemo,
    isResetting,
    toastMessage,
  } = useApp();

  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreviewedCount = alerts.filter((a) => !a.reviewed).length;

  const navGroups = [
    {
      heading: 'Core Operations',
      items: [
        { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
        { to: '/invoices', label: t.nav.invoices, icon: FileText },
        { to: '/early-warning', label: t.nav.earlyWarning, icon: AlertTriangle },
        { to: '/ai-explanation', label: t.nav.aiExplanation, icon: Bot },
      ],
    },
    {
      heading: 'Network & Stress Testing',
      items: [
        { to: '/network-graph', label: t.nav.networkGraph, icon: Network },
        { to: '/contagion', label: t.nav.contagion, icon: GitBranch },
        { to: '/shock-simulation', label: t.nav.shockSim, icon: Zap },
        { to: '/preventive-actions', label: t.nav.preventiveActions, icon: ShieldCheck },
        { to: '/command-center', label: t.nav.commandView, icon: Sliders },
      ],
    },
    {
      heading: 'Platform Blueprint',
      items: [
        { to: '/architecture', label: t.nav.architecture, icon: Layers },
        { to: '/stakeholders', label: t.nav.stakeholders, icon: Users },
        { to: '/feasibility', label: t.nav.feasibility, icon: Target },
        { to: '/risk-metrics', label: t.nav.riskMetrics, icon: TrendingUp },
        { to: '/roadmap', label: t.nav.roadmap, icon: Compass },
      ],
    },
  ];

  const handleModeSwitch = (nextMode: 'msme' | 'command') => {
    setMode(nextMode);
    if (nextMode === 'command') {
      navigate('/command-center');
    } else {
      navigate('/dashboard');
    }
  };

  const handleStartTour = () => {
    startTour();
    navigate(JUDGE_TOUR_STEPS[0].route);
  };

  const handleTourNext = () => {
    if (tourIndex === null) return;
    if (tourIndex + 1 < JUDGE_TOUR_STEPS.length) {
      const next = JUDGE_TOUR_STEPS[tourIndex + 1];
      nextTourStep();
      navigate(next.route);
    } else {
      closeTour();
    }
  };

  const handleTourPrev = () => {
    if (tourIndex === null || tourIndex === 0) return;
    const prev = JUDGE_TOUR_STEPS[tourIndex - 1];
    prevTourStep();
    navigate(prev.route);
  };

  const currentTourStep = tourIndex !== null ? JUDGE_TOUR_STEPS[tourIndex] : null;

  return (
    <div className="flex min-h-screen bg-[#060A13] text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] shrink-0 flex-col border-r border-slate-800/80 bg-[#080E1B] transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            <Radar className="h-5 w-5 text-cyan-400" />
            <span>{t.brand}</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Primary Workspace">
          {navGroups.map((group) => (
            <div key={group.heading}>
              <p className="px-3 text-[11px] font-semibold text-slate-500">
                {group.heading}
              </p>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap ${
                          isActive
                            ? 'bg-blue-600/15 text-cyan-300 border border-blue-500/30'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800/80 p-4 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Team AETHERGRID</p>
          <p className="mt-0.5 text-[11px] text-slate-500">TReDS & NBFC Risk Prototype</p>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Workspace Header */}
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-[#080E1B]/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 text-slate-300 hover:bg-slate-800 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <span className="hidden items-center gap-1.5 text-xs font-medium text-cyan-300 sm:inline-flex whitespace-nowrap">
              <Activity className="h-3.5 w-3.5" />
              {t.liveDemoLabel}
            </span>

            {/* MSME / Command Center Mode Switch */}
            <div className="flex items-center rounded-lg border border-slate-800 bg-[#060A13] p-0.5">
              <button
                type="button"
                onClick={() => handleModeSwitch('msme')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'msme'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.msmeMode}
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('command')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'command'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.commandCenter}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleStartTour}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/20 whitespace-nowrap shrink-0"
            >
              <Compass className="h-3.5 w-3.5" />
              {t.judgeTour}
            </button>

            <div className="relative inline-flex items-center">
              <Globe className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                aria-label="Select display language"
                className="rounded-lg border border-slate-700/80 bg-[#060A13] py-1.5 pl-8 pr-3 text-xs font-medium text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                {(Object.keys(LANGUAGE_NAMES) as LanguageCode[]).map((code) => (
                  <option key={code} value={code}>
                    {LANGUAGE_NAMES[code]}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-label="Open risk notifications"
              className="relative inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#060A13] px-2.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600"
            >
              <Bell className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-mono tabular-nums text-amber-300">{unreviewedCount}</span>
            </button>

            <button
              type="button"
              onClick={resetDemo}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#060A13] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              {t.resetDemo}
            </button>
          </div>
        </header>

        {/* Simulated Output Notice Strip */}
        <div className="border-b border-amber-500/20 bg-amber-950/20 px-4 py-2 text-[11px] text-amber-200/90 sm:px-6">
          {t.simulatedBanner}
        </div>

        {/* Main Page Content */}
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Notification Slide-Over Panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setNotifOpen(false)}>
          <div
            className="flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-[#0B1120] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  Early-Warning Notifications
                </h2>
                <p className="text-xs text-slate-400">
                  {unreviewedCount} unreviewed risk signals across network
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 ${
                    alert.reviewed
                      ? 'border-slate-800/80 bg-[#080E1B] opacity-70'
                      : 'border-slate-700/80 bg-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <RiskStatusText risk={alert.riskLevel} compact />
                    <span className="font-mono text-[11px] text-slate-500">{alert.date}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-100">
                    {alert.businessName}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {alert.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">{alert.category}</span>
                    <button
                      type="button"
                      onClick={() => toggleAlertReviewed(alert.id, !alert.reviewed)}
                      className="rounded-md border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
                    >
                      {alert.reviewed ? 'Mark Unreviewed' : 'Mark Reviewed'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(false);
                  navigate('/early-warning');
                }}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Open Full Early Warning Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guided 7-Step Judge Demo Tour Overlay */}
      {currentTourStep && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(420px,calc(100vw-2rem))] rounded-xl border border-cyan-500/40 bg-[#0B1325] p-5 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold text-cyan-300">
              Judge Demo Tour · Step {currentTourStep.step} of {JUDGE_TOUR_STEPS.length}
            </span>
            <button
              type="button"
              onClick={closeTour}
              aria-label="Close Judge Demo Tour"
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="mt-2 font-display text-base font-bold text-white">
            {currentTourStep.title}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
            {currentTourStep.summary}
          </p>
          <p className="mt-2 rounded-lg border border-slate-800 bg-[#060A13] p-2.5 text-[11px] text-cyan-200">
            {currentTourStep.focusPoint}
          </p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleTourPrev}
              disabled={tourIndex === 0}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleTourNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              {tourIndex !== null && tourIndex + 1 === JUDGE_TOUR_STEPS.length
                ? 'Finish Tour'
                : 'Next Step'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 left-5 z-50 rounded-lg border border-emerald-500/40 bg-[#0C1829] px-4 py-2.5 text-xs font-medium text-emerald-200 shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
