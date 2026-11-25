import React, { useEffect, useState } from 'react';
import { Copy, FileCheck2, Landmark, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { PreventiveActionsData } from '../types/contagion';
import { ErrorBlock, LoadingBlock, PageIntro } from '../components/RiskUI';

export default function PreventiveActionsPage() {
  const { selectedBusinessId, dataVersion, showToast } = useApp();
  const [data, setData] = useState<PreventiveActionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTredsId, setSelectedTredsId] = useState<string>('');
  const [simulatedSupportPct, setSimulatedSupportPct] = useState<number>(100);

  const loadActions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPreventiveActions(selectedBusinessId);
      setData(res);
      if (res.tredsEligibleInvoices[0]) {
        setSelectedTredsId(res.tredsEligibleInvoices[0].invoiceId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load preventive recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, [selectedBusinessId, dataVersion]);

  if (loading) return <LoadingBlock rows={5} />;
  if (error || !data) return <ErrorBlock message={error ?? 'No actions'} onRetry={loadActions} />;

  const selectedTreds =
    data.tredsEligibleInvoices.find((i) => i.invoiceId === selectedTredsId) ??
    data.tredsEligibleInvoices[0];

  return (
    <div className="space-y-6">
      <PageIntro
        title="Recommended Preventive Actions"
        subtitle="Decision-support playbooks connecting early risk signals to simulated TReDS financing, MSMED Act Section 16 notices, and supplier liquidity protection."
      />

      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-200">
        <span className="font-semibold">Decision-Support Simulation Only:</span> Calculations and notice templates below are simulated recommendations. No live TReDS transactions, disbursements, or legal notices are executed from this portal.
      </div>

      {/* 1. Discount Unpaid Invoice on TReDS */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
        <div className="flex items-start gap-3">
          <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-white">
              01. Discount Unpaid Invoice on TReDS
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Trade Receivables Discounting System (TReDS) allows MSMEs to auction accepted Tier-1 corporate invoices to banks and NBFCs for immediate working capital without collateral.
            </p>

            {selectedTreds ? (
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="space-y-2 lg:col-span-5">
                  <label className="block text-xs font-medium text-slate-300">
                    Select Eligible Unpaid Invoice
                  </label>
                  <select
                    value={selectedTreds.invoiceId}
                    onChange={(e) => setSelectedTredsId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 text-xs text-slate-100"
                  >
                    {data.tredsEligibleInvoices.map((inv) => (
                      <option key={inv.invoiceId} value={inv.invoiceId}>
                        {inv.invoiceNumber} · {inv.buyerName} (₹{inv.amountLakhs.toFixed(2)}L)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-7">
                  <div className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
                    <p className="text-[11px] text-slate-400">Simulated Advance (90%)</p>
                    <p className="mt-1 font-mono text-lg font-bold text-emerald-400 tabular-nums">
                      ₹{selectedTreds.estimatedFinancingLakhs.toFixed(2)} Lakh
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
                    <p className="text-[11px] text-slate-400">Est. Discounting Fee</p>
                    <p className="mt-1 font-mono text-lg font-bold text-slate-200 tabular-nums">
                      ₹{selectedTreds.estimatedFeeLakhs.toFixed(2)} Lakh
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
                    <p className="text-[11px] text-slate-400">Simulated Runway Relief</p>
                    <p className="mt-1 font-mono text-lg font-bold text-cyan-300 tabular-nums">
                      +{selectedTreds.runwayGainDays} Days
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">No unpaid eligible invoices currently available.</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. MSMED Act Section 16 Formal Payment Notice */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                02. MSMED Act Section 16 Formal Payment Notice
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {data.msmedNoticeDraft.statutoryInterestNote}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(data.msmedNoticeDraft.noticeText);
              showToast('MSMED Section 16 notice template copied to clipboard.');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Notice Draft
          </button>
        </div>

        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-800 bg-[#060A13] p-4 font-sans text-xs leading-relaxed text-slate-200">
          {data.msmedNoticeDraft.noticeText}
        </pre>
      </div>

      {/* 3. Protect Critical Suppliers + 4. Buyer Diversification */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h2 className="font-display text-lg font-bold text-white">
                03. Protect Critical Suppliers
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Support Allocation: {simulatedSupportPct}%</span>
              <input
                type="range"
                min={25}
                max={150}
                step={25}
                value={simulatedSupportPct}
                onChange={(e) => setSimulatedSupportPct(Number(e.target.value))}
                className="accent-cyan-400"
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Simulated partial bridge-payment impact on Tier-2 suppliers with tight cash buffers.
          </p>

          <div className="mt-4 space-y-2.5">
            {data.vulnerableSuppliers.map((sup) => {
              const adjSupport = (sup.recommendedSupportLakhs * simulatedSupportPct) / 100;
              const gainDays = Math.round(
                (sup.projectedRunwayAfterSupport - sup.runwayDays) * (simulatedSupportPct / 100)
              );
              return (
                <div
                  key={sup.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#060A13] p-3.5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-100">{sup.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Current Buffer: ₹{sup.cashBufferLakhs.toFixed(2)}L · Runway:{' '}
                      <span className="font-mono text-red-300">{sup.runwayDays}d</span>
                    </p>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <p className="text-cyan-300">Suggested Bridge: ₹{adjSupport.toFixed(2)}L</p>
                    <p className="text-emerald-400">
                      Projected Runway: {sup.runwayDays + gainDays} Days (+{gainDays}d)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6 lg:col-span-5">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="font-display text-lg font-bold text-white">
              04. Buyer Diversification
            </h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              <p className="text-slate-400">Current Top-Buyer Share</p>
              <p className="mt-1 font-mono text-xl font-bold text-amber-300 tabular-nums">
                {data.buyerDiversification.concentrationPct}%
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
              <p className="text-slate-400">Recommended Ceiling</p>
              <p className="mt-1 font-mono text-xl font-bold text-emerald-400 tabular-nums">
                ≤{data.buyerDiversification.recommendedTargetPct}%
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-xs leading-relaxed text-slate-300">
            {data.buyerDiversification.recommendations.map((rec, i) => (
              <li key={i} className="rounded-lg border border-slate-800/70 bg-[#060A13] p-3">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Collection Prioritization */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
        <h2 className="font-display text-lg font-bold text-white">
          05. Collection Prioritization Queue
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Ranked by overdue duration and working capital impact
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 pr-4 font-medium">Priority</th>
                <th className="py-2.5 pr-4 font-medium">Invoice #</th>
                <th className="py-2.5 pr-4 font-medium">Buyer</th>
                <th className="py-2.5 pr-4 text-right font-medium">Amount</th>
                <th className="py-2.5 pr-4 text-right font-medium">Overdue</th>
                <th className="py-2.5 font-medium">Recommended Follow-Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {data.collectionPriorities.map((item) => (
                <tr key={item.invoiceId}>
                  <td className="py-2.5 pr-4 font-mono font-bold text-cyan-300 tabular-nums">
                    {item.priorityScore}/100
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-slate-200">{item.invoiceNumber}</td>
                  <td className="py-2.5 pr-4 text-slate-200">{item.buyerName}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-white tabular-nums">
                    ₹{item.amountLakhs.toFixed(2)}L
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-amber-300 tabular-nums">
                    {item.daysOverdue}d
                  </td>
                  <td className="py-2.5 text-slate-300">{item.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
