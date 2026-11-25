import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MetricCard, PageIntro } from '../components/RiskUI';

const COVERAGE_COMPARISON = [
  {
    category: 'Tier-1 Direct Delay',
    traditional: 65,
    contagionRadar: 96,
  },
  {
    category: 'Tier-2 Supplier Squeeze',
    traditional: 28,
    contagionRadar: 91,
  },
  {
    category: 'Tier-3 Raw Material Cascade',
    traditional: 12,
    contagionRadar: 89,
  },
  {
    category: 'Overall Network Coverage',
    traditional: 35,
    contagionRadar: 92,
  },
];

export default function RiskMetricsPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Early Warning Risk Metrics"
        subtitle="Illustrative comparison showing how multi-tier graph risk modeling uncovers hidden contagion missed by single-invoice scoring."
      />

      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-200">
        <span className="font-semibold">Prototype Presentation Metrics Notice:</span> The figures below (35% vs. 92% risk coverage) are illustrative prototype presentation benchmarks designed to demonstrate network-level detection concepts—not independently validated production performance measurements.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Traditional Invoice Scoring"
          value="35%"
          subtext="Prototype coverage benchmark (isolated checks)"
          tone="warning"
        />
        <MetricCard
          label="Contagion Radar Engine"
          value="92%"
          subtext="Prototype coverage benchmark (multi-tier graph)"
          tone="healthy"
        />
        <MetricCard
          label="Early Warning Lead Time"
          value="60+ Days"
          subtext="Illustrative intervention window before cascade"
          tone="primary"
        />
        <MetricCard
          label="Multi-Hop Visibility"
          value="3 Tiers"
          subtext="Tier-1 Buyers through Tier-3 raw material vendors"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6 lg:col-span-7">
          <h2 className="font-display text-base font-bold text-white">
            Prototype Risk Coverage Comparison (%)
          </h2>
          <p className="text-xs text-slate-400">
            Illustrative detection capability across supply-chain tiers (Prototype Benchmark)
          </p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COVERAGE_COMPARISON} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="category" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#060A13',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="traditional"
                  name="Traditional Scoring (%)"
                  fill="#64748B"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="contagionRadar"
                  name="Contagion Radar Engine (%)"
                  fill="#38BDF8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-800/90 bg-[#0C1322] p-6 lg:col-span-5">
          <h2 className="font-display text-base font-bold text-white">
            Why Isolated Invoice Scoring Misses Contagion
          </h2>
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="rounded-lg border border-slate-800 bg-[#060A13] p-4">
              <p className="font-semibold text-white">1. Blindness to Buyer Concentration</p>
              <p className="mt-1 text-slate-400">
                An MSME with an 87/100 historical credit score looks safe on paper, yet 78% concentration on one delayed Tier-1 buyer compresses operating runway to 15 days.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#060A13] p-4">
              <p className="font-semibold text-white">2. Hidden 2-Hop & 3-Hop Correlation</p>
              <p className="mt-1 text-slate-400">
                When Kaveri Precision waits on Varroc, Tier-2 vendors like Ramesh Metal Alloys and Tier-3 mills like Nashik Spring Wire suffer simultaneous liquidity squeeze.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#060A13] p-4">
              <p className="font-semibold text-white">3. Proactive TReDS & Bridge Liquidity</p>
              <p className="mt-1 text-slate-400">
                Mapping dependencies surfaces 60+ day early intervention opportunities before defaults lock up the entire regional industrial cluster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
