import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Copy,
  FileText,
  Mic,
  MicOff,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
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
import type {
  Business,
  DashboardSummary,
  InvoiceStatus,
  RiskExplanationResult,
} from '../types/contagion';
import { ErrorBlock, LoadingBlock, MetricCard, PageIntro, RiskStatusText } from '../components/RiskUI';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export default function DashboardPage() {
  const { selectedBusinessId, setSelectedBusinessId, t, dataVersion, bumpDataVersion, showToast, language } =
    useApp();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Action Bar States
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [quickInv, setQuickInv] = useState({
    invoiceNumber: '',
    buyerId: 'bus-varroc',
    buyerName: 'Varroc Systems & Assemblies Pvt Ltd',
    amountLakhs: '6.5',
    status: 'Pending' as InvoiceStatus,
    daysOverdue: '0',
    notes: '',
  });
  const [savingInv, setSavingInv] = useState(false);

  const [explainOpen, setExplainOpen] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explanation, setExplanation] = useState<RiskExplanationResult | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderInvId, setReminderInvId] = useState<string>('');

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
      if (dashRes.overdueInvoices[0]) {
        setReminderInvId(dashRes.overdueInvoices[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedBusinessId, dataVersion]);

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      language === 'hi'
        ? 'hi-IN'
        : language === 'mr'
        ? 'mr-IN'
        : language === 'ta'
        ? 'ta-IN'
        : 'en-IN';
    utterance.rate = 0.98;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInvoiceClick = () => {
    const newNumber = `INV-KP-2026-${Math.floor(2300 + Math.random() * 600)}`;
    setQuickInv((prev) => ({ ...prev, invoiceNumber: newNumber }));
    setVoiceModalOpen(true);

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceNote(
        'Browser speech recognition is unavailable here. Complete the quick invoice fields manually below.'
      );
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setListening(true);
      setVoiceNote('Listening… Try saying: "Invoice for Varroc 8.5 lakh overdue 30 days"');

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript ?? '';
        setVoiceNote(`Voice captured: "${transcript}"`);
        const amountMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)?/i);
        const daysMatch = transcript.match(/(\d+)\s*days?/i);
        const matchedBuyer = businesses.find((b) =>
          transcript.toLowerCase().includes(b.name.split(' ')[0].toLowerCase())
        );

        setQuickInv((prev) => ({
          ...prev,
          buyerId: matchedBuyer?.id ?? prev.buyerId,
          buyerName: matchedBuyer?.name ?? prev.buyerName,
          amountLakhs: amountMatch ? amountMatch[1] : prev.amountLakhs,
          status: daysMatch && Number(daysMatch[1]) > 0 ? 'Overdue' : 'Pending',
          daysOverdue: daysMatch ? daysMatch[1] : '0',
          notes: `Voice entry: "${transcript}"`,
        }));
        setListening(false);
      };

      recognition.onerror = () => {
        setListening(false);
        setVoiceNote('Speech capture ended. You can review or edit fields manually below.');
      };

      recognition.onend = () => setListening(false);
      recognition.start();
    } catch {
      setListening(false);
      setVoiceNote('Voice capture unavailable. Complete the quick invoice form below.');
    }
  };

  const handleSaveQuickInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(quickInv.amountLakhs);
    if (!Number.isFinite(amount) || amount <= 0) return;

    setSavingInv(true);
    try {
      await api.createInvoice({
        invoiceNumber: quickInv.invoiceNumber,
        buyerId: quickInv.buyerId,
        buyerName: quickInv.buyerName,
        supplierId: summary?.business.id ?? 'bus-kaveri',
        supplierName: summary?.business.name ?? 'Kaveri Precision Auto Components',
        amountLakhs: amount,
        invoiceDate: '2026-11-24',
        dueDate: '2026-12-24',
        status: quickInv.status,
        daysOverdue: Number(quickInv.daysOverdue) || 0,
        notes: quickInv.notes,
      });
      setVoiceModalOpen(false);
      bumpDataVersion();
      showToast(`Added invoice ${quickInv.invoiceNumber} and recalculated risk KPIs.`);
    } finally {
      setSavingInv(false);
    }
  };

  const handleExplainRiskVoice = async () => {
    setExplainOpen(true);
    setExplainLoading(true);
    stopSpeech();
    try {
      const res = await api.explainRisk(selectedBusinessId);
      setExplanation(res);
      speakText(`${res.summary} Primary recommendation: ${res.recommendedActions[0] ?? ''}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to generate risk explanation');
    } finally {
      setExplainLoading(false);
    }
  };

  if (loading) return <LoadingBlock rows={5} />;
  if (error || !summary) return <ErrorBlock message={error ?? 'No data'} onRetry={loadData} />;

  const { business, metrics, earlyWarningBanner, overdueInvoices, supplierDependencyBreakdown, riskTrendSeries } =
    summary;

  const selectedReminderInv =
    overdueInvoices.find((i) => i.id === reminderInvId) ?? overdueInvoices[0] ?? null;

  const reminderDraft = selectedReminderInv
    ? `Subject: Payment Reminder — Invoice ${selectedReminderInv.invoiceNumber} (${selectedReminderInv.daysOverdue} Days Overdue)\n\nDear ${selectedReminderInv.buyerName} Accounts Payable Team,\n\nThis is a formal reminder regarding Invoice ${selectedReminderInv.invoiceNumber} dated ${selectedReminderInv.invoiceDate} (Due Date: ${selectedReminderInv.dueDate}) for ₹${(selectedReminderInv.amountLakhs - selectedReminderInv.paidAmountLakhs).toFixed(2)} Lakh payable to ${selectedReminderInv.supplierName}.\n\nAs this invoice is currently ${selectedReminderInv.daysOverdue} days past due, please share your NEFT/RTGS settlement date or approve TReDS factoring at the earliest.\n\nRegards,\n${selectedReminderInv.supplierName}\nUDYAM ID: ${business.udyamId}`
    : `No overdue invoices are currently pending for ${business.name}.`;

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
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0C1322] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 whitespace-nowrap shrink-0"
            >
              <Bot className="h-3.5 w-3.5 text-cyan-300" />
              Full AI Analysis
            </Link>
          </div>
        }
      />

      {/* MSME Quick Action Toolbar (Voice Entry · Explain My Risk Voice/AI · Payment Reminder) */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800/90 bg-[#0A101D] p-4">
        <button
          type="button"
          onClick={handleVoiceInvoiceClick}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-[#0D1424] px-4 py-2.5 text-xs font-semibold text-cyan-400 transition-colors hover:border-cyan-500/50 hover:bg-[#111B30] whitespace-nowrap shrink-0"
        >
          <Mic className="h-4 w-4 text-cyan-400" />
          Voice Invoice Entry
        </button>

        <button
          type="button"
          onClick={handleExplainRiskVoice}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1D63ED] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500 whitespace-nowrap shrink-0"
        >
          <Volume2 className="h-4 w-4 text-white" />
          Explain My Risk (Voice / AI)
        </button>

        <button
          type="button"
          onClick={() => setReminderOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-[#0D1424] px-4 py-2.5 text-xs font-semibold text-slate-100 transition-colors hover:border-amber-500/50 hover:bg-[#111B30] whitespace-nowrap shrink-0"
        >
          <FileText className="h-4 w-4 text-amber-400" />
          Generate Payment Reminder
        </button>
      </div>

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

      {/* Modal 1: Voice Invoice Entry */}
      {voiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#0B1120] p-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {listening ? (
                  <MicOff className="h-4 w-4 text-red-400" />
                ) : (
                  <Mic className="h-4 w-4 text-cyan-400" />
                )}
                <h3 className="font-display text-base font-bold text-white">
                  Voice Invoice Entry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVoiceModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {voiceNote && (
              <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-950/25 p-3 text-cyan-200">
                {voiceNote}
              </div>
            )}

            <form onSubmit={handleSaveQuickInvoice} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300">Invoice #</label>
                  <input
                    type="text"
                    value={quickInv.invoiceNumber}
                    onChange={(e) => setQuickInv({ ...quickInv, invoiceNumber: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300">Amount (₹ Lakh)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={quickInv.amountLakhs}
                    onChange={(e) => setQuickInv({ ...quickInv, amountLakhs: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300">Buyer</label>
                <select
                  value={quickInv.buyerId}
                  onChange={(e) => {
                    const b = businesses.find((x) => x.id === e.target.value);
                    setQuickInv({
                      ...quickInv,
                      buyerId: e.target.value,
                      buyerName: b?.name ?? quickInv.buyerName,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 text-slate-100"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300">Status</label>
                  <select
                    value={quickInv.status}
                    onChange={(e) =>
                      setQuickInv({ ...quickInv, status: e.target.value as InvoiceStatus })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 text-slate-100"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300">Days Overdue</label>
                  <input
                    type="number"
                    min="0"
                    value={quickInv.daysOverdue}
                    onChange={(e) => setQuickInv({ ...quickInv, daysOverdue: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInv}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {savingInv ? 'Saving...' : 'Save Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Explain My Risk (Voice / AI) */}
      {explainOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-[#0B1120] p-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-blue-400" />
                <h3 className="font-display text-base font-bold text-white">
                  Explain My Risk (Voice / AI) · {business.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setExplainOpen(false);
                }}
                className="rounded p-1 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {explainLoading ? (
              <div className="py-10 text-center text-slate-400">
                Generating voice & AI financial risk briefing...
              </div>
            ) : explanation ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-slate-400">
                    Engine: {explanation.modelUsed}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      speaking
                        ? stopSpeech()
                        : speakText(
                            `${explanation.summary} Primary recommendation: ${explanation.recommendedActions[0] ?? ''}`
                          )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-[11px] font-semibold text-blue-200 hover:bg-blue-500/20"
                  >
                    {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    {speaking ? 'Stop Voice' : 'Listen Again'}
                  </button>
                </div>

                <p className="rounded-lg border border-slate-800 bg-[#060A13] p-4 text-sm leading-relaxed text-slate-100">
                  {explanation.summary}
                </p>

                <div>
                  <p className="font-semibold text-slate-200">Key Preventive Steps</p>
                  <ul className="mt-2 space-y-1.5 text-emerald-200">
                    {explanation.recommendedActions.slice(0, 3).map((act, idx) => (
                      <li key={idx} className="rounded-lg border border-slate-800 bg-[#060A13] p-2.5">
                        {idx + 1}. {act}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Link
                    to="/ai-explanation"
                    onClick={stopSpeech}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
                  >
                    Open Detailed Risk Briefing
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal 3: Generate Payment Reminder */}
      {reminderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0B1120] p-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                <h3 className="font-display text-base font-bold text-white">
                  Generate Payment Reminder
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReminderOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {overdueInvoices.length > 0 && (
              <div className="mt-3">
                <label className="block font-medium text-slate-300">Select Overdue Invoice</label>
                <select
                  value={selectedReminderInv?.id ?? ''}
                  onChange={(e) => setReminderInvId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 text-slate-100"
                >
                  {overdueInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} · {inv.buyerName} (₹
                      {(inv.amountLakhs - inv.paidAmountLakhs).toFixed(2)}L · {inv.daysOverdue}d)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-800 bg-[#060A13] p-4 font-sans text-xs leading-relaxed text-slate-200">
              {reminderDraft}
            </pre>

            <div className="mt-4 flex justify-end gap-2">
              <Link
                to="/preventive-actions"
                className="rounded-lg border border-slate-700 px-3.5 py-2 font-semibold text-slate-200 hover:border-slate-500"
              >
                MSMED Sec 16 Notice
              </Link>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(reminderDraft);
                  showToast('Payment reminder copied to clipboard.');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
