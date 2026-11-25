import React, { useEffect, useState } from 'react';
import { RotateCcw, Zap } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { Business, ShockSimulationInput, ShockSimulationResult } from '../types/contagion';
import { ErrorBlock, LoadingBlock, MetricCard, PageIntro, RiskStatusText } from '../components/RiskUI';

const DEFAULT_SHOCK_INPUT: ShockSimulationInput = {
  targetBuyerId: 'bus-varroc',
  delayDays: 30,
  initialPaymentAmountLakhs: 48.3,
  buyerDefault: false,
  supplierCashBufferLakhs: 12.0,
  dailyOpexLakhs: 0.8,
};

const DELAY_OPTIONS = [15, 30, 45, 60, 90];

export default function ShockSimulationPage() {
  const { t, showToast } = useApp();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [input, setInput] = useState<ShockSimulationInput>(DEFAULT_SHOCK_INPUT);
  const [result, setResult] = useState<ShockSimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (payload: ShockSimulationInput) => {
    setSimulating(true);
    setError(null);
    try {
      const res = await api.simulateShock(payload);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Shock simulation failed');
    } finally {
      setSimulating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .getBusinesses()
      .then((res) => setBusinesses(res.businesses))
      .catch(() => {});
    runSimulation(DEFAULT_SHOCK_INPUT);
  }, []);

  const handleReset = () => {
    setInput(DEFAULT_SHOCK_INPUT);
    runSimulation(DEFAULT_SHOCK_INPUT);
    showToast('Stress test restored to PPT reference scenario (30-day Varroc delay).');
  };

  if (loading) return <LoadingBlock rows={5} />;
  if (error || !result) {
    return <ErrorBlock message={error ?? 'No simulation data'} onRetry={() => runSimulation(input)} />;
  }

  return (
    <div className="space-y-6">
      <PageIntro
        title="Payment Shock Stress-Testing Simulator"
        subtitle="Configure payment delays, invoice exposure, buyer default scenarios, and cash-buffer thresholds to quantify supply-chain shockwaves."
        action={
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0C1322] px-4 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t.actions.resetSimulation}
          </button>
        }
      />

      {/* Simulation Controls + Reference Scenario Callout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-display text-base font-bold text-white">
              Stress Scenario Parameters
            </h2>
            {result.isReferenceScenario && (
              <span className="text-[11px] font-semibold text-cyan-300">
                PPT Reference Baseline Active
              </span>
            )}
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300">Primary Anchor Buyer</label>
              <select
                value={input.targetBuyerId}
                onChange={(e) => setInput({ ...input, targetBuyerId: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 text-slate-100"
              >
                {businesses
                  .filter((b) => b.tier === 'Tier-1 Buyer' || b.tier === 'MSME')
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.tier})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300">Payment Delay Duration</label>
              <div className="mt-1.5 grid grid-cols-5 gap-1.5">
                {DELAY_OPTIONS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setInput({ ...input, delayDays: days })}
                    className={`rounded-lg border py-2 font-mono font-semibold transition-colors ${
                      input.delayDays === days
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-700 bg-[#060A13] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block font-medium text-slate-300">
                  Initial Buyer Payment (₹ Lakh)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={input.initialPaymentAmountLakhs}
                  onChange={(e) =>
                    setInput({ ...input, initialPaymentAmountLakhs: Number(e.target.value) || 1 })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300">
                  Supplier Cash Buffer (₹ Lakh)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={input.supplierCashBufferLakhs}
                  onChange={(e) =>
                    setInput({ ...input, supplierCashBufferLakhs: Number(e.target.value) || 0.5 })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 font-mono text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block font-medium text-slate-300">
                  Daily Operating Burn (₹ Lakh/Day)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={input.dailyOpexLakhs}
                  onChange={(e) =>
                    setInput({ ...input, dailyOpexLakhs: Number(e.target.value) || 0.1 })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 font-mono text-slate-100"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2">
                  <input
                    type="checkbox"
                    checked={input.buyerDefault}
                    onChange={(e) => setInput({ ...input, buyerDefault: e.target.checked })}
                    className="h-4 w-4 accent-red-500"
                  />
                  <span className="font-medium text-slate-200">Simulate Buyer Default</span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => runSimulation(input)}
              disabled={simulating}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-xs font-bold tracking-wide text-white hover:bg-blue-500 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {simulating ? 'RUNNING STRESS ENGINE...' : t.actions.simulateShock}
            </button>
          </div>
        </div>

        {/* Simulation Outputs */}
        <div className="space-y-4 lg:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MetricCard
              label="Estimated Network Exposure"
              value={`₹${result.estimatedNetworkExposureCrores.toFixed(2)} Crore`}
              subtext={`Additional overdue capital: ₹${result.additionalOverdueLakhs.toFixed(2)} Lakh`}
              tone="critical"
            />
            <MetricCard
              label="Businesses Potentially Affected"
              value={`${result.businessesPotentiallyAffected} Entities`}
              subtext="Tier-1, MSME, Tier-2 & Tier-3 nodes impacted"
              tone="warning"
            />
            <MetricCard
              label="Contagion Propagation Window"
              value={`${result.contagionPropagationDays} Days`}
              subtext={`${result.earlyWarningOpportunityDays}+ day early-warning intervention lead`}
              tone="primary"
            />
            <MetricCard
              label="Cash-Buffer Depletion"
              value={`${result.cashBufferDepletionPct}% Depleted`}
              subtext={`Post-shock runway drops to ${result.postShockRunwayDays} Days`}
              tone={result.postShockRunwayDays <= 9 ? 'critical' : 'warning'}
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0C1322] p-4 text-xs">
            <p className="font-semibold text-slate-200">Configured Scenario Assumptions</p>
            <ul className="mt-1.5 space-y-1 text-slate-400">
              {result.assumptions.map((a, idx) => (
                <li key={idx}>• {a}</li>
              ))}
            </ul>
            <p className="mt-2.5 text-[11px] text-amber-300/90">{result.disclaimer}</p>
          </div>
        </div>
      </div>

      {/* Before vs After + Contagion Timeline Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
          <h3 className="font-display text-base font-bold text-white">
            Before vs. After Shock Comparison
          </h3>
          <p className="text-xs text-slate-400">Baseline exposure & liquidity vs. simulated stress</p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.beforeAfterComparison} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#060A13',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="before" name="Baseline" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" name="Post-Shock" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
          <h3 className="font-display text-base font-bold text-white">
            Contagion Propagation Timeline (₹ Lakh)
          </h3>
          <p className="text-xs text-slate-400">Accumulating network distress over 120-day horizon</p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.timelineSeries} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#060A13',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="shockedExposureLakhs"
                  name="Shocked Exposure (₹L)"
                  stroke="#EF4444"
                  strokeWidth={2.2}
                />
                <Line
                  type="monotone"
                  dataKey="baselineExposureLakhs"
                  name="Baseline Exposure (₹L)"
                  stroke="#38BDF8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Level Changes & Most Vulnerable Suppliers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
          <h3 className="font-display text-base font-bold text-white">
            Projected Risk Level Transitions
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2 pr-3 font-medium">Business</th>
                  <th className="py-2 pr-3 font-medium">Before</th>
                  <th className="py-2 pr-3 font-medium">After Shock</th>
                  <th className="py-2 text-right font-medium">Score Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {result.riskLevelChanges.map((row) => (
                  <tr key={row.businessId}>
                    <td className="py-2.5 pr-3 font-medium text-slate-200">{row.businessName}</td>
                    <td className="py-2.5 pr-3">
                      <RiskStatusText risk={row.beforeRisk} compact />
                    </td>
                    <td className="py-2.5 pr-3">
                      <RiskStatusText risk={row.afterRisk} compact />
                    </td>
                    <td className="py-2.5 text-right font-mono text-red-400 tabular-nums">
                      {row.beforeScore} → {row.afterScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
          <h3 className="font-display text-base font-bold text-white">
            Most Vulnerable Downstream Suppliers
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2 pr-3 font-medium">Supplier</th>
                  <th className="py-2 pr-3 text-right font-medium">Buffer</th>
                  <th className="py-2 pr-3 text-right font-medium">Post-Shock Runway</th>
                  <th className="py-2 font-medium">Projected Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {result.mostVulnerableSuppliers.map((sup) => (
                  <tr key={sup.id}>
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-slate-200">{sup.name}</p>
                      <p className="text-[11px] text-slate-500">{sup.tier}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono text-slate-300 tabular-nums">
                      ₹{sup.currentBufferLakhs.toFixed(1)}L
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono font-semibold text-red-300 tabular-nums">
                      {sup.postShockRunwayDays} Days
                    </td>
                    <td className="py-2.5">
                      <RiskStatusText risk={sup.riskLevel} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
