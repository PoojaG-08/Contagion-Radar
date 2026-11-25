import React, { useState } from 'react';
import { CheckCircle2, Compass } from 'lucide-react';
import { PageIntro } from '../components/RiskUI';

const PHASES = [
  {
    phase: 'PHASE 1 – PROTOTYPE',
    status: 'Completed in Hackathon',
    title: 'Graph Engine & Simulated Stress Tests',
    summary:
      'Multi-tier supply-chain dependency graph built, MSME Simplified Portal & Command Center unified, and simulated payment shock stress-tests validated on realistic Pune MIDC auto-cluster data.',
    deliverables: [
      'Directed supply-chain graph & BFS contagion cascade engine',
      'MSME invoice management with voice entry & MSMED notice templates',
      'AI-assisted risk explanation with deterministic fallback',
    ],
  },
  {
    phase: 'PHASE 2 – DATA VALIDATION',
    status: 'Next Milestone',
    title: 'TReDS Historical Backtesting',
    summary:
      'Integrate anonymized TReDS invoice datasets and GST e-invoice telemetry to backtest default transfer timing and calibrate sector-specific cash-buffer thresholds.',
    deliverables: [
      'Anonymized TReDS settlement-lag dataset ingestion',
      'Empirical calibration of delay-to-default propagation curves',
      'Independent validation of network risk coverage lift',
    ],
  },
  {
    phase: 'PHASE 3 – API INTEGRATION',
    status: 'Planned',
    title: 'Real-Time Risk Scoring APIs',
    summary:
      'Expose low-latency REST and webhook risk scoring APIs for NBFC underwriting desks, TReDS exchanges, and corporate ERP procurement systems.',
    deliverables: [
      'OAuth-secured lender & TReDS scoring endpoints',
      'Account Aggregator cash-flow consent integration',
      'Automated portfolio concentration & contagion alerts',
    ],
  },
  {
    phase: 'PHASE 4 – PRODUCTION SCALE',
    status: 'Vision',
    title: 'Automated Liquidity Reserve Matching',
    summary:
      'Enable automated early-warning notifications paired with dynamic working capital reserve matching to prevent MSME cascade defaults at national scale.',
    deliverables: [
      'Pre-approved TReDS bridge financing triggers',
      'Multi-cluster industrial corridor risk heatmaps',
      'Continuous supply-chain resilience monitoring across India',
    ],
  },
];

export default function RoadmapPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = PHASES[selectedIdx];

  return (
    <div className="space-y-6">
      <PageIntro
        title="Strategic Roadmap"
        subtitle="Four-phase execution path from hackathon prototype to national TReDS and NBFC risk infrastructure."
      />

      {/* Horizontal Interactive Timeline */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PHASES.map((p, idx) => {
          const active = idx === selectedIdx;
          return (
            <button
              key={p.phase}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-colors ${
                active
                  ? 'border-cyan-400 bg-[#101C33]'
                  : 'border-slate-800 bg-[#0C1322] hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-cyan-300">
                    {p.phase}
                  </span>
                  {idx === 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Compass className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                </div>
                <h2 className="mt-2 font-display text-base font-bold text-white">{p.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{p.summary}</p>
              </div>
              <p className="mt-4 text-[11px] font-semibold text-slate-300">{p.status}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Phase Detail */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
        <p className="font-mono text-xs font-semibold text-cyan-300">
          {current.phase} · {current.status}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-white">{current.title}</h3>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">{current.summary}</p>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {current.deliverables.map((d) => (
            <div
              key={d}
              className="rounded-lg border border-slate-800 bg-[#060A13] p-4 text-xs text-slate-200"
            >
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
