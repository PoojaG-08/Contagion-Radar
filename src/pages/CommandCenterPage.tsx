import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sliders, Zap } from 'lucide-react';
import {
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
import type {
  Business,
  RiskLevel,
  ShockSimulationResult,
  SupplyEdge,
  SupplyTier,
} from '../types/contagion';
import { ErrorBlock, LoadingBlock, MetricCard, PageIntro, RiskStatusText } from '../components/RiskUI';
import { SupplyChainGraphCanvas } from '../components/SupplyChainGraphCanvas';

export default function CommandCenterPage() {
  const {
    setMode,
    selectedBusinessId,
    setSelectedBusinessId,
    alerts,
    toggleAlertReviewed,
    dataVersion,
  } = useApp();
  const navigate = useNavigate();

  const [nodes, setNodes] = useState<Business[]>([]);
  const [edges, setEdges] = useState<SupplyEdge[]>([]);
  const [shockPreview, setShockPreview] = useState<ShockSimulationResult | null>(null);
  const [quickDelay, setQuickDelay] = useState<number>(30);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'All' | SupplyTier>('All');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [graphRes, shockRes] = await Promise.all([
        api.getGraph(),
        api.simulateShock({
          targetBuyerId: 'bus-varroc',
          delayDays: quickDelay,
          initialPaymentAmountLakhs: 48.3,
          buyerDefault: false,
          supplierCashBufferLakhs: 12.0,
          dailyOpexLakhs: 0.8,
        }),
      ]);
      setNodes(graphRes.nodes);
      setEdges(graphRes.edges);
      setShockPreview(shockRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Command Center');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [dataVersion]);

  const handleQuickShock = async (days: number) => {
    setQuickDelay(days);
    try {
      const shockRes = await api.simulateShock({
        targetBuyerId: 'bus-varroc',
        delayDays: days,
        initialPaymentAmountLakhs: 48.3,
        buyerDefault: false,
        supplierCashBufferLakhs: 12.0,
        dailyOpexLakhs: 0.8,
      });
      setShockPreview(shockRes);
    } catch {
      // keep existing
    }
  };

  const rankedBusinesses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...nodes]
      .filter((b) => {
        if (tierFilter !== 'All' && b.tier !== tierFilter) return false;
        if (riskFilter !== 'All' && b.riskLevel !== riskFilter) return false;
        if (q && !b.name.toLowerCase().includes(q) && !b.location.toLowerCase().includes(q)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.healthScore - b.healthScore);
  }, [nodes, search, tierFilter, riskFilter]);

  if (loading) return <LoadingBlock rows={6} />;
  if (error) return <ErrorBlock message={error} onRetry={loadAll} />;

  const totalExposureCrores =
    edges.reduce((acc, e) => acc + e.exposureLakhs, 0) / 100;
  const totalOverdueLakhs = edges.reduce((acc, e) => acc + e.overdueLakhs, 0);
  const criticalCount = nodes.filter((b) => b.riskLevel === 'Critical').length;

  return (
    <div className="space-y-6">
      <PageIntro
        title="Advanced Risk Intelligence Command Center"
        subtitle="Institutional network monitoring for TReDS exchanges, NBFC credit teams, and supply-chain risk analysts."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMode('msme');
                navigate('/dashboard');
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0C1322] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 whitespace-nowrap"
            >
              <Sliders className="h-3.5 w-3.5" />
              Switch to MSME Mode
            </button>
            <Link
              to="/shock-simulation"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5" />
              Full Stress Tester
            </Link>
          </div>
        }
      />

      {/* Network-Wide Exposure KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Tracked Network Entities"
          value={String(nodes.length)}
          subtext={`${edges.length} directed financial dependency links`}
        />
        <MetricCard
          label="Aggregate Network Exposure"
          value={`₹${totalExposureCrores.toFixed(2)} Crore`}
          subtext="Active invoice credit across all 4 tiers"
          tone="primary"
        />
        <MetricCard
          label="Network Overdue Arrears"
          value={`₹${totalOverdueLakhs.toFixed(2)} Lakh`}
          subtext={`${criticalCount} entities at Critical Risk`}
          tone="critical"
        />
        <MetricCard
          label={`Simulated ${quickDelay}d Shock Exposure`}
          value={`₹${(shockPreview?.estimatedNetworkExposureCrores ?? 2.4).toFixed(2)} Crore`}
          subtext={`${shockPreview?.businessesPotentiallyAffected ?? 17} entities · ${shockPreview?.contagionPropagationDays ?? 121}d window`}
          tone="warning"
        />
      </div>

      {/* Embedded Stress Controls + Ranking Table */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5 xl:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h2 className="font-display text-base font-bold text-white">
              Business Risk Ranking ({rankedBusinesses.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search entity..."
                  className="w-40 rounded-lg border border-slate-700 bg-[#060A13] py-1.5 pl-8 pr-2 text-xs text-slate-100"
                />
              </div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as 'All' | SupplyTier)}
                className="rounded-lg border border-slate-700 bg-[#060A13] px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="All">All Tiers</option>
                <option value="Tier-1 Buyer">Tier-1 Buyer</option>
                <option value="MSME">MSME</option>
                <option value="Tier-2 Supplier">Tier-2 Supplier</option>
                <option value="Tier-3 Supplier">Tier-3 Supplier</option>
              </select>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as 'All' | RiskLevel)}
                className="rounded-lg border border-slate-700 bg-[#060A13] px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="All">All Risk</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="mt-3 max-h-[360px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-slate-800 bg-[#0C1322] text-slate-400">
                <tr>
                  <th className="py-2 pr-3 font-medium">Business</th>
                  <th className="py-2 pr-3 font-medium">Tier</th>
                  <th className="py-2 pr-3 text-right font-medium">Score</th>
                  <th className="py-2 pr-3 text-right font-medium">Overdue</th>
                  <th className="py-2 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {rankedBusinesses.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBusinessId(b.id)}
                    className={`cursor-pointer transition-colors hover:bg-slate-800/40 ${
                      selectedBusinessId === b.id ? 'bg-blue-950/35' : ''
                    }`}
                  >
                    <td className="py-2.5 pr-3 font-medium text-slate-100">{b.name}</td>
                    <td className="py-2.5 pr-3 text-slate-400">{b.tier}</td>
                    <td className="py-2.5 pr-3 text-right font-mono text-slate-200 tabular-nums">
                      {b.healthScore}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono text-red-300 tabular-nums">
                      ₹{b.overdueAmountLakhs.toFixed(1)}L
                    </td>
                    <td className="py-2.5">
                      <RiskStatusText risk={b.riskLevel} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Stress Trigger + Propagation Chart */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800/90 bg-[#0C1322] p-5 xl:col-span-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-white">
                Quick Shock Stress Control
              </h2>
              <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#060A13] p-1">
                {[15, 30, 45, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleQuickShock(d)}
                    className={`rounded px-2 py-1 font-mono text-[11px] font-semibold ${
                      quickDelay === d
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Instant Varroc Tier-1 settlement delay sensitivity across network exposure
            </p>

            <div className="mt-4 h-56 w-full">
              {shockPreview && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shockPreview.timelineSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#060A13',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="shockedExposureLakhs"
                      name="Shocked Exposure (₹L)"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Compact Alert Triage */}
          <div className="mt-4 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Active Early Warnings</span>
              <Link to="/early-warning" className="text-cyan-300 hover:text-cyan-200">
                View All →
              </Link>
            </div>
            <div className="mt-2 space-y-2">
              {alerts.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#060A13] px-3 py-2 text-xs"
                >
                  <span className="truncate text-slate-200">{a.businessName}: {a.category}</span>
                  <button
                    type="button"
                    onClick={() => toggleAlertReviewed(a.id, !a.reviewed)}
                    className="shrink-0 text-[11px] font-semibold text-cyan-300 hover:underline"
                  >
                    {a.reviewed ? 'Reviewed' : 'Review'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Live Supply-Chain Network Graph */}
      <div>
        <h2 className="mb-3 font-display text-base font-bold text-white">
          Interactive Supply-Chain Dependency Graph
        </h2>
        <SupplyChainGraphCanvas
          nodes={nodes}
          edges={edges}
          selectedId={selectedBusinessId}
          onSelectNode={(b) => setSelectedBusinessId(b.id)}
          heightClass="h-[460px]"
        />
      </div>
    </div>
  );
}
