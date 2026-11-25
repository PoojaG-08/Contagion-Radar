import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { Business, DashboardSummary } from '../types/contagion';
import { ErrorBlock, LoadingBlock, MetricCard, PageIntro, RiskStatusText } from '../components/RiskUI';

export default function DashboardPage() {
  const { selectedBusinessId, setSelectedBusinessId, t, dataVersion } = useApp();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, busRes] = await Promise.all([
        api.getDashboard(selectedBusinessId),
        api.getBusinesses(),
      ]);
      setSummary(dashRes);
      setBusinesses(busRes.businesses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBusinessId, dataVersion]);

  if (loading) return <LoadingBlock rows={5} />;
  if (error || !summary) return <ErrorBlock message={error ?? 'No data'} onRetry={loadData} />;

  const { business, metrics, earlyWarningBanner, overdueInvoices, supplierDependencyBreakdown, riskTrendSeries } =
    summary;

  return (
    <div className="space-y-6">
      <PageIntro
        title={business.name}
        subtitle={`${business.businessType} · ${business.location} · UDYAM ID: ${business.udyamId}`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              aria-label="Select business profile"
              className="rounded-lg border border-slate-700 bg-[#0C1322] px-3 py-2 text-xs font-medium text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.tier})
                </option>
              ))}
            </select>
            <Link
              to="/ai-explanation"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0"
            >
              <Bot className="h-3.5 w-3.5" />
              {t.actions.explainRisk}
            </Link>
          </div>
        }
      />

      {/* Prominent Early-Warning Panel */}
      <div
        className={`flex flex-col justify-between gap-4 rounded-xl border p-5 sm:flex-row sm:items-center ${
          earlyWarningBanner.active
            ? 'border-red-500/40 bg-red-950/25'
            : 'border-emerald-500/35 bg-emerald-950/20'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <AlertTriangle
            className={`mt-0.5 h-5 w-5 shrink-0 ${
              earlyWarningBanner.active ? 'text-red-400' : 'text-emerald-400'
            }`}
          />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wide text-red-300">
                {earlyWarningBanner.active ? 'Early Warning Alert' : 'Nominal Status'}
              </span>
              <RiskStatusText risk={business.riskLevel} compact />
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-100">
              {earlyWarningBanner.message}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/preventive-actions"
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/90 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-500 whitespace-nowrap"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Take Preventive Action
          </Link>
          <Link
            to="/shock-simulation"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0C1322] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 whitespace-nowrap"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-300" />
            Run Shock Test
          </Link>
        </div>
      </div>

      {/* 7 Required Core Financial Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={t.kpis.healthScore}
          value={`${metrics.healthScore}/100`}
          subtext="Composite solvency & dependency resilience"
          tone="healthy"
        />
        <MetricCard
          label={t.kpis.moneyWaiting}
          value={`₹${metrics.moneyWaitingLakhs.toFixed(2)} Lakh`}
          subtext="Total unpaid customer receivables"
          tone="primary"
        />
        <MetricCard
          label={t.kpis.overdueAmount}
          value={`₹${metrics.overdueAmountLakhs.toFixed(2)} Lakh`}
          subtext={`Longest overdue: ${metrics.daysOverdue} Days`}
          tone={metrics.overdueAmountLakhs > 0 ? 'critical' : 'healthy'}
        />
        <MetricCard
          label={t.kpis.daysOverdue}
          value={`${metrics.daysOverdue} Days`}
          subtext="Peak receivable delay beyond due date"
          tone={metrics.daysOverdue >= 45 ? 'critical' : 'warning'}
        />
        <MetricCard
          label={t.kpis.opexRunway}
          value={`${metrics.operatingRunwayDays} Days`}
          subtext={`Cash buffer ₹${business.cashBufferLakhs.toFixed(2)}L · Burn ₹${business.dailyOpexLakhs.toFixed(2)}L/day`}
          tone={metrics.operatingRunwayDays <= 15 ? 'warning' : 'healthy'}
        />
        <MetricCard
          label={t.kpis.buyerConcentration}
          value={`${metrics.buyerConcentrationPct}%`}
          subtext="Share of inflows from largest buyer"
          tone={metrics.buyerConcentrationPct >= 65 ? 'warning' : 'default'}
        />
        <MetricCard
          label={t.kpis.supplierDependency}
          value={`${metrics.supplierDependencyCount} Vendors`}
          subtext="Downstream suppliers relying on payouts"
          tone="default"
        />
        <div className="flex flex-col justify-between rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
          <div>
            <p className="text-xs font-medium text-slate-400">Network Risk Standing</p>
            <div className="mt-2">
              <RiskStatusText risk={business.riskLevel} />
            </div>
          </div>
          <Link
            to="/network-graph"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Inspect Supply Graph
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-white">
                Supplier Dependency Exposure (₹ Lakh)
              </h2>
              <p className="text-xs text-slate-400">
                Downstream Tier-2 & Tier-3 vendors exposed to payout delays
              </p>
            </div>
            <Link to="/contagion" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
              View Cascade →
            </Link>
          </div>
          <div className="mt-4 h-64 w-full">
            {supplierDependencyBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={supplierDependencyBreakdown.map((d) => ({
                    ...d,
                    shortName: d.name.split(' ').slice(0, 2).join(' '),
                  }))}
                  margin={{ top: 8, right: 16, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#060A13',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="exposureLakhs" name="Exposure (₹ Lakh)" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                No downstream supplier dependencies recorded for this entity.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5 lg:col-span-5">
          <div>
            <h2 className="font-display text-base font-bold text-white">
              Overdue Arrears vs. Cash Runway Trend
            </h2>
            <p className="text-xs text-slate-400">
              6-month simulated working capital compression curve
            </p>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendSeries} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#060A13',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="overdueLakhs"
                  name="Overdue (₹L)"
                  stroke="#EF4444"
                  fill="rgba(239,68,68,0.18)"
                />
                <Area
                  type="monotone"
                  dataKey="runwayDays"
                  name="Runway (Days)"
                  stroke="#10B981"
                  fill="rgba(16,185,129,0.14)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Overdue Invoice Summary Table */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-white">
              Overdue Invoice Summary
            </h2>
            <p className="text-xs text-slate-400">
              Live receivables impacting working capital — manage or record payments in Invoice Ledger
            </p>
          </div>
          <Link
            to="/invoices"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500"
          >
            <FileText className="h-3.5 w-3.5" />
            Manage All Invoices
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {overdueInvoices.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-[#060A13] p-6 text-center text-xs text-slate-400">
              No overdue invoices currently pending for {business.name}.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 pr-4 font-medium">Invoice #</th>
                  <th className="py-2.5 pr-4 font-medium">Buyer</th>
                  <th className="py-2.5 pr-4 font-medium">Due Date</th>
                  <th className="py-2.5 pr-4 text-right font-medium">Outstanding</th>
                  <th className="py-2.5 pr-4 text-right font-medium">Days Overdue</th>
                  <th className="py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {overdueInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30">
                    <td className="py-3 pr-4 font-mono font-medium text-slate-200">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 pr-4 text-slate-200">{inv.buyerName}</td>
                    <td className="py-3 pr-4 font-mono text-slate-400">{inv.dueDate}</td>
                    <td className="py-3 pr-4 text-right font-mono font-semibold text-red-300 tabular-nums">
                      ₹{(inv.amountLakhs - inv.paidAmountLakhs).toFixed(2)} Lakh
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-amber-300 tabular-nums">
                      {inv.daysOverdue} d
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-semibold text-red-400">{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
