import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { Business, ContagionAnalysisResult, SupplyEdge } from '../types/contagion';
import { ErrorBlock, LoadingBlock, MetricCard, PageIntro, RiskStatusText } from '../components/RiskUI';
import { SupplyChainGraphCanvas } from '../components/SupplyChainGraphCanvas';

export default function ContagionAnalysisPage() {
  const { dataVersion } = useApp();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [edges, setEdges] = useState<SupplyEdge[]>([]);
  const [originId, setOriginId] = useState<string>('bus-varroc');
  const [analysis, setAnalysis] = useState<ContagionAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const loadData = async (targetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [graphRes, contagionRes] = await Promise.all([
        api.getGraph(),
        api.getContagionAnalysis(targetId),
      ]);
      setBusinesses(graphRes.nodes);
      setEdges(graphRes.edges);
      setAnalysis(contagionRes);
      setActiveStageIdx(contagionRes.stages.length - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to compute contagion propagation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(originId);
  }, [originId, dataVersion]);

  useEffect(() => {
    if (!isPlaying || !analysis) return;
    const timer = window.setInterval(() => {
      setActiveStageIdx((prev) => {
        if (prev + 1 >= analysis.stages.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1400);
    return () => window.clearInterval(timer);
  }, [isPlaying, analysis]);

  const handlePlayCascade = () => {
    setActiveStageIdx(0);
    setIsPlaying(true);
  };

  if (loading) return <LoadingBlock rows={5} />;
  if (error || !analysis) return <ErrorBlock message={error ?? 'No analysis available'} onRetry={() => loadData(originId)} />;

  const activeStage = analysis.stages[activeStageIdx] ?? analysis.stages[0];
  const cumulativeStageNodeIds = analysis.stages
    .slice(0, activeStageIdx + 1)
    .flatMap((s) => s.affectedBusinesses.map((b) => b.id));

  return (
    <div className="space-y-6">
      <PageIntro
        title="Financial Contagion Propagation Analysis"
        subtitle="Trace how an initial buyer settlement delay cascades through Tier-1 MSMEs, Tier-2 component suppliers, and Tier-3 raw material vendors."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={originId}
              onChange={(e) => {
                setIsPlaying(false);
                setOriginId(e.target.value);
              }}
              aria-label="Select contagion origin business"
              className="rounded-lg border border-slate-700 bg-[#0C1322] px-3 py-2 text-xs font-medium text-slate-100"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  Origin: {b.name} ({b.tier})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={isPlaying ? () => setIsPlaying(false) : handlePlayCascade}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? 'Pause Cascade' : 'Play Cascade Animation'}
            </button>
          </div>
        }
      />

      {/* Simulated Result Distinction Notice */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-4 py-3 text-xs text-cyan-200">
        <span className="font-semibold">Simulated Graph Propagation Model:</span> Downstream stage timings and cash-buffer compressions represent simulated network stress estimates, not guaranteed verified defaults.
      </div>

      {/* Contagion KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Initial Shock Origin"
          value={analysis.originBusiness.name.split(' ').slice(0, 2).join(' ')}
          subtext={`${analysis.originBusiness.tier} · ₹${analysis.originBusiness.overdueAmountLakhs.toFixed(2)}L overdue`}
          tone="warning"
        />
        <MetricCard
          label="Directly Affected (1-Hop)"
          value={`${analysis.directlyAffected.length} Businesses`}
          subtext="Immediate suppliers awaiting payment"
          tone="critical"
        />
        <MetricCard
          label="Indirectly Affected (Tier 2–3)"
          value={`${analysis.indirectlyAffected.length} Businesses`}
          subtext="Secondary & tertiary supply chain exposure"
          tone="warning"
        />
        <MetricCard
          label="Total Network Exposure"
          value={`₹${analysis.totalNetworkExposureLakhs.toFixed(2)} Lakh`}
          subtext={`${analysis.propagationWindowDays}-day cascade · ${analysis.earlyWarningLeadDays}d lead warning`}
          tone="primary"
        />
      </div>

      {/* Stage Stepper + Live Graph */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#0C1322] p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {analysis.stages.map((st, idx) => (
                <button
                  key={st.stage}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStageIdx(idx);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    idx === activeStageIdx
                      ? 'bg-red-600 text-white'
                      : idx < activeStageIdx
                      ? 'bg-red-950/40 text-red-300 border border-red-500/30'
                      : 'bg-[#060A13] text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Stage {st.stage} (Day {st.dayOffset})
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setActiveStageIdx(analysis.stages.length - 1);
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              Show Full Cascade
            </button>
          </div>

          <SupplyChainGraphCanvas
            nodes={businesses}
            edges={edges}
            selectedId={originId}
            onSelectNode={(b) => {
              setIsPlaying(false);
              setOriginId(b.id);
            }}
            activeCascadeEdgeIds={analysis.cascadeEdgeIds}
            activeCascadeNodeIds={cumulativeStageNodeIds}
            highlightedWaveIds={activeStage.affectedBusinesses.map((b) => b.id)}
            heightClass="h-[500px]"
            compactToolbar
          />
        </div>

        {/* Stage Breakdown Panel */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800/90 bg-[#0C1322] p-5 xl:col-span-4">
          <div>
            <p className="font-mono text-xs font-semibold text-red-400">
              {activeStage.label} · Day +{activeStage.dayOffset}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Cumulative propagated exposure:{' '}
              <span className="font-mono font-semibold text-white tabular-nums">
                ₹{activeStage.cumulativeExposureLakhs.toFixed(2)} Lakh
              </span>
            </p>

            <div className="mt-4 max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
              {activeStage.affectedBusinesses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-800 bg-[#060A13] p-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-100">{item.name}</span>
                    <RiskStatusText risk={item.projectedRisk} compact />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-slate-400 tabular-nums">
                    <span>{item.tier}</span>
                    <span>Exposure: ₹{item.exposureLakhs.toFixed(2)}L</span>
                    <span>Runway: {item.remainingRunwayDays}d</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">{item.impactReason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-3">
            <p className="text-[11px] font-semibold text-slate-300">Model Assumptions</p>
            <ul className="mt-1.5 space-y-1 text-[11px] text-slate-400">
              {analysis.assumptions.map((a, idx) => (
                <li key={idx}>• {a}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
