import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { Business, RiskLevel } from '../types/contagion';
import { ErrorBlock, LoadingBlock, MetricCard, PageIntro, RiskStatusText } from '../components/RiskUI';

export default function EarlyWarningPage() {
  const { alerts, toggleAlertReviewed, dataVersion, showToast } = useApp();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBusinesses();
      setBusinesses(res.businesses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch risk analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dataVersion]);

  const distribution = useMemo(() => {
    const counts: Record<RiskLevel, number> = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
    for (const b of businesses) counts[b.riskLevel] += 1;
    return [
      { name: 'Low Risk', value: counts.Low, color: '#10B981' },
      { name: 'Moderate Risk', value: counts.Moderate, color: '#F59E0B' },
      { name: 'High Risk', value: counts.High, color: '#F97316' },
      { name: 'Critical Risk', value: counts.Critical, color: '#EF4444' },
    ];
  }, [businesses]);

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((a) => riskFilter === 'All' || a.riskLevel === riskFilter),
    [alerts, riskFilter]
  );

  const highRiskEntities = useMemo(
    () =>
      businesses
        .filter((b) => b.riskLevel === 'Critical' || b.riskLevel === 'High')
        .sort((a, b) => a.healthScore - b.healthScore),
    [businesses]
  );

  if (loading) return <LoadingBlock rows={5} />;
  if (error) return <ErrorBlock message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageIntro
        title="Early Warning & Network Risk Analytics"
        subtitle="Real-time risk distribution, liquidity runway telemetry, buyer concentration signals, and reviewable early-warning alerts."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Critical Risk Entities"
          value={String(businesses.filter((b) => b.riskLevel === 'Critical').length)}
          subtext="Immediate runway or default pressure"
          tone="critical"
        />
        <MetricCard
          label="High Risk Entities"
          value={String(businesses.filter((b) => b.riskLevel === 'High').length)}
          subtext="Elevated overdue or buyer concentration"
          tone="warning"
        />
        <MetricCard
          label="Unreviewed Alerts"
          value={String(alerts.filter((a) => !a.reviewed).length)}
          subtext={`Out of ${alerts.length} active network warnings`}
          tone="primary"
        />
        <MetricCard
          label="Avg Network Health"
          value={`${Math.round(
            businesses.reduce((s, b) => s + b.healthScore, 0) / Math.max(1, businesses.length)
          )}/100`}
          subtext="Weighted across 18 connected enterprises"
          tone="healthy"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5 lg:col-span-5">
          <h2 className="font-display text-base font-bold text-white">
            Financial Risk Distribution
          </h2>
          <p className="text-xs text-slate-400">Entities categorized across 4 risk bands</p>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={3}
                >
                  {distribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#060A13',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {distribution.map((d) => (
              <div key={d.name} className="flex items-center justify-between rounded-lg bg-[#060A13] px-3 py-1.5">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-mono font-semibold text-white tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5 lg:col-span-7">
          <h2 className="font-display text-base font-bold text-white">
            Buyer Concentration & Cash Buffer Exposure
          </h2>
          <p className="text-xs text-slate-400">Highest concentration businesses across Tier-1 to Tier-3</p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={businesses.slice(0, 10).map((b) => ({
                  name: b.name.split(' ')[0],
                  concentration: b.buyerConcentrationPct,
                  health: b.healthScore,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#060A13',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="concentration" name="Buyer Concentration %" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="health" name="Health Score" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Early Warning Alert List */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-white">
              Early-Warning Alert Feed
            </h2>
            <p className="text-xs text-slate-400">
              Actionable default & working capital signals — mark alerts as reviewed once triaged
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-[#060A13] p-1">
            {(['All', 'Critical', 'High', 'Moderate', 'Low'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setRiskFilter(lvl)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  riskFilter === lvl
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
                alert.reviewed
                  ? 'border-slate-800 bg-[#060A13]/60 opacity-75'
                  : 'border-slate-700/80 bg-[#060A13]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <RiskStatusText risk={alert.riskLevel} />
                  <span className="text-slate-500">·</span>
                  <span className="font-medium text-cyan-300">{alert.category}</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-mono text-slate-400">{alert.date}</span>
                </div>
                <p className="text-sm font-semibold text-white">{alert.businessName}</p>
                <p className="text-xs leading-relaxed text-slate-300">{alert.description}</p>
                <p className="text-xs text-emerald-300/90">
                  Suggested Action: {alert.suggestedAction}
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await toggleAlertReviewed(alert.id, !alert.reviewed);
                  showToast(
                    alert.reviewed ? 'Alert reopened for review.' : 'Alert marked as reviewed.'
                  );
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  alert.reviewed
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-700 bg-[#0C1322] text-slate-200 hover:border-slate-500'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {alert.reviewed ? 'Reviewed' : 'Mark as Reviewed'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* High-Risk Businesses Table */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
        <h2 className="font-display text-base font-bold text-white">
          High & Critical Risk Watchlist
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 pr-4 font-medium">Business</th>
                <th className="py-2.5 pr-4 font-medium">Tier</th>
                <th className="py-2.5 pr-4 text-right font-medium">Health Score</th>
                <th className="py-2.5 pr-4 text-right font-medium">Runway</th>
                <th className="py-2.5 pr-4 text-right font-medium">Overdue</th>
                <th className="py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {highRiskEntities.map((b) => {
                const runway = b.dailyOpexLakhs > 0 ? Math.round(b.cashBufferLakhs / b.dailyOpexLakhs) : 30;
                return (
                  <tr key={b.id}>
                    <td className="py-2.5 pr-4 font-medium text-slate-100">{b.name}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{b.tier}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-amber-300 tabular-nums">
                      {b.healthScore}/100
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-red-300 tabular-nums">
                      {runway} Days
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-slate-200 tabular-nums">
                      ₹{b.overdueAmountLakhs.toFixed(2)}L
                    </td>
                    <td className="py-2.5">
                      <RiskStatusText risk={b.riskLevel} compact />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
