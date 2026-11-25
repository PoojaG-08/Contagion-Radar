import React, { useState } from 'react';
import { ArrowRight, BellRing, Cpu, Database, FileSpreadsheet } from 'lucide-react';
import { PageIntro } from '../components/RiskUI';

const STAGES = [
  {
    step: 'STEP 1: DATA INGESTION',
    title: 'Multi-Source Invoice & Telemetry Ingestion',
    icon: FileSpreadsheet,
    summary:
      'Raw GST invoices, payment settlement logs, Udyam profiles, voice-captured ledger items, and supplier relationships enter the normalization pipeline.',
    inputs: ['Invoice amounts & due dates', 'Historical settlement lag days', 'Cash buffer & daily OpEx burn'],
    outputs: ['Validated normalized ledger schema', 'Buyer-supplier entity resolution'],
  },
  {
    step: 'STEP 2: UNIFIED GRAPH DATABASE',
    title: 'Multi-Tier Financial Dependency Graph',
    icon: Database,
    summary:
      'Connects Tier-1 corporate buyers, MSME manufacturers, Tier-2 job shops, and Tier-3 raw material vendors into a weighted directed dependency network.',
    inputs: ['Normalized invoice pairs', 'Concentration percentages', 'Tier classification metadata'],
    outputs: ['Directed dependency edges', 'Concentration & single-buyer bottlenecks'],
  },
  {
    step: 'STEP 3: AI RISK PROPAGATION ENGINE',
    title: 'Contagion & Liquidity Stress Simulation',
    icon: Cpu,
    summary:
      'Analyzes liquidity stress, payment delays, working capital depletion rates, and multi-hop default transfer windows across connected tiers.',
    inputs: ['Graph topology & edge weights', 'Configured delay / default scenarios', 'Burn rate thresholds'],
    outputs: ['Propagation stages (0 to 3)', 'Post-shock runway & exposure forecasts'],
  },
  {
    step: 'STEP 4: REAL-TIME EARLY WARNINGS',
    title: 'Actionable Alerts & Preventive Workflows',
    icon: BellRing,
    summary:
      'Generates risk scores, plain-language AI explanations, early-warning alerts, and decision-support recommendations for TReDS platforms, lenders, and MSMEs.',
    inputs: ['Threshold breaches (<15d runway, >45d overdue)', 'Risk rankings & explanations'],
    outputs: ['TReDS discounting candidates', 'MSMED Section 16 draft notices & NBFC signals'],
  },
];

export default function SystemArchitecturePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = STAGES[activeIdx];

  return (
    <div className="space-y-6">
      <PageIntro
        title="System Architecture & Data Flow"
        subtitle="Interactive 4-stage pipeline translating raw MSME invoices into network-level early warnings."
      />

      {/* Interactive Pipeline Diagram */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const active = idx === activeIdx;
          return (
            <div key={stage.step} className="relative flex items-stretch">
              <button
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`flex w-full flex-col justify-between rounded-xl border p-5 text-left transition-colors ${
                  active
                    ? 'border-cyan-400 bg-[#101C33]'
                    : 'border-slate-800 bg-[#0C1322] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${active ? 'text-cyan-400' : 'text-blue-400'}`} />
                    {idx < STAGES.length - 1 && (
                      <ArrowRight className="hidden h-4 w-4 text-slate-600 lg:block" />
                    )}
                  </div>
                  <p className="mt-4 font-mono text-[11px] font-semibold text-cyan-300">
                    {stage.step}
                  </p>
                  <h2 className="mt-1 font-display text-base font-bold text-white">
                    {stage.title}
                  </h2>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">{stage.summary}</p>
              </button>
            </div>
          );
        })}
      </div>

      {/* Stage Deep Dive Inspector */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
        <p className="font-mono text-xs font-semibold text-cyan-300">
          Selected Pipeline Stage · {current.step}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-white">{current.title}</h3>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">{current.summary}</p>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-[#060A13] p-5">
            <h4 className="text-xs font-semibold text-slate-200">Stage Inputs</h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              {current.inputs.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#060A13] p-5">
            <h4 className="text-xs font-semibold text-slate-200">Stage Outputs</h4>
            <ul className="mt-3 space-y-2 text-xs text-emerald-300">
              {current.outputs.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
