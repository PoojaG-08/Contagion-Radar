import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, GitBranch } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { Business, SupplyEdge } from '../types/contagion';
import { ErrorBlock, LoadingBlock, PageIntro, RiskStatusText } from '../components/RiskUI';
import { SupplyChainGraphCanvas } from '../components/SupplyChainGraphCanvas';

export default function NetworkGraphPage() {
  const { selectedBusinessId, setSelectedBusinessId, dataVersion } = useApp();
  const [nodes, setNodes] = useState<Business[]>([]);
  const [edges, setEdges] = useState<SupplyEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGraph();
      setNodes(res.nodes);
      setEdges(res.edges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load supply-chain graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [dataVersion]);

  const selectedBusiness = useMemo(
    () => nodes.find((n) => n.id === selectedBusinessId) ?? nodes[0] ?? null,
    [nodes, selectedBusinessId]
  );

  const connectedBuyers = useMemo(() => {
    if (!selectedBusiness) return [];
    return edges
      .filter((e) => e.toBusinessId === selectedBusiness.id)
      .map((e) => ({
        edge: e,
        business: nodes.find((n) => n.id === e.fromBusinessId),
      }))
      .filter((x) => x.business);
  }, [selectedBusiness, edges, nodes]);

  const connectedSuppliers = useMemo(() => {
    if (!selectedBusiness) return [];
    return edges
      .filter((e) => e.fromBusinessId === selectedBusiness.id)
      .map((e) => ({
        edge: e,
        business: nodes.find((n) => n.id === e.toBusinessId),
      }))
      .filter((x) => x.business);
  }, [selectedBusiness, edges, nodes]);

  if (loading) return <LoadingBlock rows={4} />;
  if (error) return <ErrorBlock message={error} onRetry={loadGraph} />;

  return (
    <div className="space-y-6">
      <PageIntro
        title="Multi-Tier Supply Chain Network Graph"
        subtitle="Inspect directed financial dependencies across Tier-1 OEMs, MSME manufacturers, Tier-2 job shops, and Tier-3 raw material suppliers."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <SupplyChainGraphCanvas
            nodes={nodes}
            edges={edges}
            selectedId={selectedBusiness?.id ?? null}
            onSelectNode={(b) => setSelectedBusinessId(b.id)}
          />
        </div>

        {/* Selected Business Inspector */}
        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5 xl:col-span-4">
          {selectedBusiness ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <p className="text-xs font-medium text-cyan-300">{selectedBusiness.tier}</p>
                <h2 className="mt-1 font-display text-lg font-bold text-white">
                  {selectedBusiness.name}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedBusiness.businessType} · {selectedBusiness.location}
                </p>
                <div className="mt-3">
                  <RiskStatusText risk={selectedBusiness.riskLevel} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-800 bg-[#060A13] p-3">
                  <p className="text-slate-400">Health Score</p>
                  <p className="mt-1 font-mono text-lg font-bold text-emerald-400 tabular-nums">
                    {selectedBusiness.healthScore}/100
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#060A13] p-3">
                  <p className="text-slate-400">Financial Exposure</p>
                  <p className="mt-1 font-mono text-lg font-bold text-cyan-300 tabular-nums">
                    ₹{selectedBusiness.receivablesWaitingLakhs.toFixed(2)}L
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#060A13] p-3">
                  <p className="text-slate-400">Cash Buffer</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-100 tabular-nums">
                    ₹{selectedBusiness.cashBufferLakhs.toFixed(2)}L
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#060A13] p-3">
                  <p className="text-slate-400">Overdue Amount</p>
                  <p className="mt-1 font-mono text-lg font-bold text-red-400 tabular-nums">
                    ₹{selectedBusiness.overdueAmountLakhs.toFixed(2)}L
                  </p>
                </div>
              </div>

              {/* Connected Buyers */}
              <div>
                <h3 className="text-xs font-semibold text-slate-200">
                  Connected Buyers ({connectedBuyers.length})
                </h3>
                {connectedBuyers.length === 0 ? (
                  <p className="mt-1.5 text-xs text-slate-500">Top-level Tier-1 anchor entity.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {connectedBuyers.map(({ edge, business }) => (
                      <li
                        key={edge.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-[#060A13] px-3 py-2 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => business && setSelectedBusinessId(business.id)}
                          className="truncate text-left font-medium text-slate-200 hover:text-cyan-300"
                        >
                          {business?.name}
                        </button>
                        <span className="ml-2 font-mono text-cyan-300 tabular-nums shrink-0">
                          ₹{edge.exposureLakhs.toFixed(1)}L ({edge.dependencyWeightPct}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Connected Suppliers */}
              <div>
                <h3 className="text-xs font-semibold text-slate-200">
                  Connected Downstream Suppliers ({connectedSuppliers.length})
                </h3>
                {connectedSuppliers.length === 0 ? (
                  <p className="mt-1.5 text-xs text-slate-500">Terminal Tier-3 raw material supplier.</p>
                ) : (
                  <ul className="mt-2 max-h-44 space-y-1.5 overflow-y-auto pr-1">
                    {connectedSuppliers.map(({ edge, business }) => (
                      <li
                        key={edge.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-[#060A13] px-3 py-2 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => business && setSelectedBusinessId(business.id)}
                          className="truncate text-left font-medium text-slate-200 hover:text-cyan-300"
                        >
                          {business?.name}
                        </button>
                        <span className="ml-2 font-mono text-amber-300 tabular-nums shrink-0">
                          ₹{edge.exposureLakhs.toFixed(1)}L ({edge.dependencyWeightPct}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  to="/contagion"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  Analyze Contagion
                </Link>
                <Link
                  to="/ai-explanation"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 whitespace-nowrap"
                >
                  <Bot className="h-3.5 w-3.5 text-cyan-300" />
                  Explain Risk
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Select a node on the graph to inspect details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
