import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Compass,
  GitBranch,
  Landmark,
  Layers,
  Radar,
  ShieldAlert,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { JUDGE_TOUR_STEPS, useApp } from '../context/AppContext';

interface ShockNode {
  id: string;
  label: string;
  tier: string;
  x: number;
  y: number;
  stage: number;
  amount: string;
}

const HERO_NODES: ShockNode[] = [
  { id: 't1', label: 'Varroc Systems (Tier-1)', tier: 'Tier-1 Buyer', x: 95, y: 165, stage: 0, amount: '₹37.67L' },
  { id: 'msme1', label: 'Kaveri Precision Auto', tier: 'Core MSME', x: 295, y: 95, stage: 1, amount: '₹24.80L Overdue' },
  { id: 'msme2', label: 'Deccan Toolings', tier: 'MSME', x: 295, y: 235, stage: 1, amount: '₹14.20L Overdue' },
  { id: 't2a', label: 'Ramesh Metal Alloys', tier: 'Tier-2 Supplier', x: 495, y: 55, stage: 2, amount: '8.7d Runway' },
  { id: 't2b', label: 'National Springs', tier: 'Tier-2 Supplier', x: 495, y: 165, stage: 2, amount: '9.3d Runway' },
  { id: 't2c', label: 'Karthik Packaging', tier: 'Tier-2 Supplier', x: 495, y: 275, stage: 2, amount: '15d Runway' },
  { id: 't3a', label: 'Konkan Steels', tier: 'Tier-3 Mill', x: 675, y: 105, stage: 3, amount: 'High Stress' },
  { id: 't3b', label: 'Nashik Wire Co.', tier: 'Tier-3 Mill', x: 675, y: 225, stage: 3, amount: 'Critical Risk' },
];

const HERO_EDGES: Array<[string, string, number]> = [
  ['t1', 'msme1', 1],
  ['t1', 'msme2', 1],
  ['msme1', 't2a', 2],
  ['msme1', 't2b', 2],
  ['msme1', 't2c', 2],
  ['msme2', 't2b', 2],
  ['t2a', 't3a', 3],
  ['t2b', 't3b', 3],
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { startTour, setMode } = useApp();
  const [waveStage, setWaveStage] = useState<number>(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWaveStage((prev) => (prev + 1) % 4);
    }, 1700);
    return () => window.clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    setMode('msme');
    navigate('/dashboard');
  };

  const handleExploreDemo = () => {
    setMode('command');
    navigate('/command-center');
  };

  const handleJudgeTour = () => {
    startTour();
    navigate(JUDGE_TOUR_STEPS[0].route);
  };

  const getStageColor = (stage: number) => {
    if (stage > waveStage) return '#334155';
    if (stage === 0) return '#F97316';
    if (stage === 1) return '#EF4444';
    if (stage === 2) return '#EF4444';
    return '#F59E0B';
  };

  return (
    <div className="min-h-screen bg-[#060A13] text-slate-100">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#060A13]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            <Radar className="h-5 w-5 text-cyan-400" />
            <span>Contagion Radar</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex">
            <a href="#problem" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Problem
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#stakeholders" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Stakeholders
            </a>
            <a href="#impact" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Impact
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExploreDemo}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500 whitespace-nowrap shrink-0"
            >
              Explore Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Split */}
      <section className="mx-auto max-w-[1440px] px-6 py-14 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-wide text-cyan-400">
              Team AETHERGRID · TReDS & NBFC Supply-Chain Intelligence
            </p>
            <h1
              className="mt-3 font-display font-extrabold tracking-tight text-white"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)', lineHeight: 1.08, textWrap: 'balance' }}
            >
              CONTAGION RADAR
            </h1>
            <p className="mt-3 text-lg font-medium text-cyan-200 sm:text-xl">
              Predicting Financial Shockwaves Before They Hit India&apos;s SME Supply Chain.
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              India&apos;s MSMEs power Tier-1 automotive and industrial corridors, yet a single delayed
              OEM invoice silently drains cash buffers down three supplier tiers. Contagion Radar
              transforms isolated invoice evaluation into live network-level risk intelligence.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 whitespace-nowrap shrink-0"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleExploreDemo}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0C1322] px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-500 whitespace-nowrap shrink-0"
              >
                Explore Demo
              </button>
              <button
                type="button"
                onClick={handleJudgeTour}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/20 whitespace-nowrap shrink-0"
              >
                <Compass className="h-4 w-4" />
                Judge Demo Tour
              </button>
            </div>
          </div>

          {/* Animated Live Financial Shockwave Visualizer */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0B1120] p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-100">
                    Simulated Multi-Tier Contagion Propagation
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Stage {waveStage} of 3 · Watching a 30-day Tier-1 settlement delay ripple downstream
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-amber-300 tabular-nums">
                  {waveStage === 0
                    ? 'Day 0 · Trigger'
                    : waveStage === 1
                    ? 'Day 18 · Tier-1 Hit'
                    : waveStage === 2
                    ? 'Day 54 · Tier-2 Squeeze'
                    : 'Day 121 · Full Cascade'}
                </span>
              </div>

              <svg viewBox="0 0 800 330" className="mt-3 w-full">
                {HERO_EDGES.map(([fromId, toId, stage]) => {
                  const a = HERO_NODES.find((n) => n.id === fromId)!;
                  const b = HERO_NODES.find((n) => n.id === toId)!;
                  const active = stage <= waveStage;
                  return (
                    <line
                      key={`${fromId}-${toId}`}
                      x1={a.x + 64}
                      y1={a.y}
                      x2={b.x - 64}
                      y2={b.y}
                      stroke={active ? '#EF4444' : '#1E293B'}
                      strokeWidth={active ? 2.4 : 1.4}
                      strokeDasharray={active ? '6 4' : undefined}
                      className="transition-all duration-300"
                    />
                  );
                })}

                {HERO_NODES.map((node) => {
                  const active = node.stage <= waveStage;
                  const stroke = getStageColor(node.stage);
                  return (
                    <g key={node.id} transform={`translate(${node.x - 68}, ${node.y - 24})`}>
                      <rect
                        width="136"
                        height="48"
                        rx="8"
                        fill={active ? '#171E31' : '#0B1221'}
                        stroke={stroke}
                        strokeWidth={active ? 1.8 : 1}
                      />
                      <text
                        x="10"
                        y="19"
                        fill={active ? '#F8FAFC' : '#94A3B8'}
                        fontSize="10"
                        fontWeight="600"
                        fontFamily="Plus Jakarta Sans, sans-serif"
                      >
                        {node.label}
                      </text>
                      <text
                        x="10"
                        y="36"
                        fill={active ? '#FCA5A5' : '#64748B'}
                        fontSize="9.5"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {node.amount}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <p className="mt-2 text-[11px] text-slate-500">
                SIMULATED / MODEL OUTPUT – Illustrative propagation pattern based on configured MSME dependency assumptions.
              </p>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Proof Strip */}
        <div className="mt-12 grid grid-cols-1 gap-4 border-t border-slate-800/80 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
            <p className="text-xs text-slate-400">Prototype Network Coverage</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-cyan-300 tabular-nums">92% vs 35%</p>
            <p className="mt-1 text-xs text-slate-400">Contagion Radar vs isolated invoice scoring (illustrative)</p>
          </div>
          <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
            <p className="text-xs text-slate-400">Reference Scenario Exposure</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-amber-300 tabular-nums">₹2.40 Crore</p>
            <p className="mt-1 text-xs text-slate-400">Across 17 interconnected Tier-1/2/3 businesses</p>
          </div>
          <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
            <p className="text-xs text-slate-400">Early Intervention Window</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-emerald-400 tabular-nums">60+ Days</p>
            <p className="mt-1 text-xs text-slate-400">Lead time ahead of 121-day cascade propagation</p>
          </div>
          <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
            <p className="text-xs text-slate-400">Dual Workspace Modes</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-slate-100 tabular-nums">MSME + Analyst</p>
            <p className="mt-1 text-xs text-slate-400">Unified live data across 15 interactive modules</p>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section id="problem" className="border-t border-slate-800/80 bg-[#080E1B] py-16">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-[#0C1322] p-7">
              <div className="flex items-center gap-2.5 text-red-400">
                <ShieldAlert className="h-5 w-5" />
                <h2 className="font-display text-xl font-bold text-white">
                  The Financial Contagion Problem
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Traditional MSME credit evaluation inspects one invoice or balance sheet at a time.
                When a major Tier-1 buyer delays settlement by 30 to 60 days, an otherwise healthy
                MSME like Kaveri Precision Auto Components hits a 15-day working capital wall—forcing
                unpaid bills onto Tier-2 alloy suppliers and Tier-3 raw material mills.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0C1322] p-7">
              <div className="flex items-center gap-2.5 text-cyan-400">
                <GitBranch className="h-5 w-5" />
                <h2 className="font-display text-xl font-bold text-white">
                  The Network-Level Solution
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Contagion Radar maps invoice receivables, buyer concentration, and supplier
                dependencies into a unified multi-tier financial graph. By simulating cash-buffer
                depletion across connected tiers, TReDS platforms, NBFCs, and MSMEs see downstream
                default pressure weeks before cash runs out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-[1440px] px-6 py-16">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          How Contagion Radar Works
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Four connected intelligence stages turning raw MSME invoices into actionable early warnings.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: '01. Invoice & Ledger Ingestion',
              body: 'Capture GST invoices, overdue days, payment logs, and voice-dictated MSME entries.',
              icon: Layers,
            },
            {
              step: '02. Multi-Tier Graph Modeling',
              body: 'Link Tier-1 buyers, MSMEs, Tier-2 job shops, and Tier-3 mills with dependency weights.',
              icon: GitBranch,
            },
            {
              step: '03. Shockwave Stress Testing',
              body: 'Simulate 15–90 day payment delays or buyer defaults against daily operating burn.',
              icon: Zap,
            },
            {
              step: '04. Preventive Action Routing',
              body: 'Surface TReDS discounting eligibility, MSMED Section 16 notices, and AI explanations.',
              icon: TrendingUp,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="rounded-xl border border-slate-800 bg-[#0C1322] p-6"
              >
                <Icon className="h-5 w-5 text-blue-400" />
                <h3 className="mt-4 font-display text-base font-bold text-white">{item.step}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stakeholders & Impact */}
      <section id="stakeholders" className="border-t border-slate-800/80 bg-[#080E1B] py-16">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Built for India&apos;s MSME Credit Ecosystem
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Designed to connect TReDS exchanges, lenders, OEM buyers, and MSME suppliers.
              </p>
            </div>
            <Link
              to="/stakeholders"
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              View Full Stakeholder Ecosystem →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'TReDS Platforms',
                desc: 'Augment single-invoice factoring with network-wide supplier distress scoring.',
                icon: TrendingUp,
              },
              {
                title: 'Banks & NBFCs',
                desc: 'Detect hidden 2-hop and 3-hop correlated default exposure across loan books.',
                icon: Landmark,
              },
              {
                title: 'Large Tier-1 Buyers',
                desc: 'Spot liquidity stress at critical Tier-2 vendors before assembly lines stall.',
                icon: Building2,
              },
              {
                title: 'MSME Suppliers',
                desc: 'Track cash runway, log invoices by voice, and trigger early TReDS relief.',
                icon: ShieldAlert,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-xl border border-slate-800 bg-[#0C1322] p-6"
                >
                  <Icon className="h-5 w-5 text-cyan-400" />
                  <h3 className="mt-3 font-display text-base font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack & Team Footer */}
      <footer id="impact" className="border-t border-slate-800/80 py-12">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Contagion Radar · Team AETHERGRID
              </h3>
              <p className="mt-2 text-xs text-slate-400">
                Members: SANDHYA S · R POOJA · POOJA G · MONISHWARAN B
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Technology Stack: React, Vite, Tailwind CSS, Recharts, Interactive SVG Graph Engine,
                Node/Express REST APIs, Gemini AI with Deterministic Rule-Based Risk Engine.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
              <button
                type="button"
                onClick={handleGetStarted}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Open MSME Dashboard
              </button>
              <button
                type="button"
                onClick={handleExploreDemo}
                className="rounded-lg border border-slate-700 bg-[#0C1322] px-5 py-2.5 text-xs font-semibold text-slate-200 hover:border-slate-500"
              >
                Open Command Center
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
