import React from 'react';
import { Building2, Factory, Landmark, TrendingUp } from 'lucide-react';
import { PageIntro } from '../components/RiskUI';

const STAKEHOLDERS = [
  {
    title: 'Banks & NBFCs',
    icon: Landmark,
    role: 'Institutional Credit & Working Capital Lenders',
    points: [
      'Identify hidden correlated default risks across MSME invoice portfolios.',
      'Support multi-tier network-level exposure analysis beyond single-borrower scoring.',
      'Improve underwriting risk assessment with forward-looking cash-runway stress signals.',
    ],
  },
  {
    title: 'TReDS Platforms',
    icon: TrendingUp,
    role: 'RBI-Licensed Invoice Factoring Exchanges',
    points: [
      'Extend individual invoice discounting with network-level supplier risk intelligence.',
      'Explore connected Tier-2 and Tier-3 vendor risks prior to auction pricing.',
      'Prioritize early liquidity allocation toward bottlenecks with high multiplier impact.',
    ],
  },
  {
    title: 'Large Buyers',
    icon: Building2,
    role: 'Tier-1 Corporate & Automotive OEMs',
    points: [
      'Identify financial pressure affecting critical Tier-2 and Tier-3 sub-suppliers.',
      'Support supply-chain continuity by resolving delayed invoice bottlenecks early.',
      'Prevent unexpected component shortages caused by downstream vendor liquidity freezes.',
    ],
  },
  {
    title: 'SME Suppliers',
    icon: Factory,
    role: 'MSME Precision Manufacturers & Job Shops',
    points: [
      'Understand delayed payment risks and buyer concentration in plain language.',
      'Receive early-warning insights weeks before operating cash runway expires.',
      'Explore simulated preventive actions including TReDS factoring and MSMED notices.',
    ],
  },
];

export default function StakeholdersPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Stakeholder Value Ecosystem"
        subtitle="How Contagion Radar creates shared financial resilience across lenders, TReDS exchanges, corporate buyers, and India's MSMEs."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {STAKEHOLDERS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">{s.title}</h2>
                  <p className="text-xs text-slate-400">{s.role}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5 text-xs leading-relaxed text-slate-300">
                {s.points.map((pt) => (
                  <li key={pt} className="rounded-lg border border-slate-800/80 bg-[#060A13] p-3">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
