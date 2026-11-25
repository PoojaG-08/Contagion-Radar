import React from 'react';
import { AlertTriangle, CheckCircle2, Rocket } from 'lucide-react';
import { PageIntro } from '../components/RiskUI';

export default function FeasibilityPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Project Feasibility & Scope"
        subtitle="Transparent boundary between working hackathon capabilities, modeling assumptions, and production roadmap milestones."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="font-display text-base font-bold text-white">
              IN-SCOPE HACKATHON FEATURES
            </h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-300">
            <li className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              Invoice and payment link ingestion with full CRUD and voice-assisted entry.
            </li>
            <li className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              Graph-based risk calculations modeling multi-tier buyer-supplier exposure.
            </li>
            <li className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              AI-assisted contagion prediction prototype with explainable rule-based fallback.
            </li>
            <li className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              Prototype impact dashboard with dual MSME Simplified & Command Center views.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
          <div className="flex items-center gap-2.5 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-display text-base font-bold text-white">
              RISKS & MITIGATIONS
            </h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-300">
            <li className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              Simulated network data is used for prototype testing; all screens clearly label outputs as simulated estimates.
            </li>
            <li className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              Financial model assumptions (burn rates, delay multipliers) are exposed and configurable for transparent sensitivity checks.
            </li>
            <li className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              Model calibration and validation against real-world anonymized TReDS transaction datasets remain a key Phase 2 requirement.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Rocket className="h-5 w-5" />
            <h2 className="font-display text-base font-bold text-white">
              ROADMAP NEXT STEPS
            </h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-300">
            <li className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              Direct TReDS API integration for automated invoice factoring eligibility checks.
            </li>
            <li className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              Real-time banking & Account Aggregator telemetry for verified cash-buffer updates.
            </li>
            <li className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              Automated early liquidity intervention workflows and dynamic reserve matching.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
