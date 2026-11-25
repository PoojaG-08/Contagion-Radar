import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  Mail,
  Mic,
  MicOff,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { Business, Invoice, InvoiceStatus } from '../types/contagion';
import { ErrorBlock, LoadingBlock, MetricCard, PageIntro } from '../components/RiskUI';

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

const EMPTY_FORM = {
  invoiceNumber: '',
  buyerId: 'bus-varroc',
  buyerName: 'Varroc Systems & Assemblies Pvt Ltd',
  supplierId: 'bus-kaveri',
  supplierName: 'Kaveri Precision Auto Components',
  amountLakhs: '5.5',
  invoiceDate: '2026-11-10',
  dueDate: '2026-12-10',
  status: 'Pending' as InvoiceStatus,
  daysOverdue: '0',
  paidAmountLakhs: '0',
  notes: '',
};

export default function InvoicesPage() {
  const { bumpDataVersion, showToast, dataVersion, t } = useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [overdueFilter, setOverdueFilter] = useState<number>(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [reminderInvoice, setReminderInvoice] = useState<Invoice | null>(null);

  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, busRes] = await Promise.all([
        api.getInvoices({ status: statusFilter, search, minOverdue: overdueFilter }),
        api.getBusinesses(),
      ]);
      setInvoices(invRes.invoices);
      setBusinesses(busRes.businesses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, overdueFilter, dataVersion]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInvoices();
  };

  const openNewForm = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      invoiceNumber: `INV-KP-2026-${Math.floor(2100 + Math.random() * 800)}`,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (inv: Invoice) => {
    setEditingId(inv.id);
    setForm({
      invoiceNumber: inv.invoiceNumber,
      buyerId: inv.buyerId,
      buyerName: inv.buyerName,
      supplierId: inv.supplierId,
      supplierName: inv.supplierName,
      amountLakhs: String(inv.amountLakhs),
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      status: inv.status,
      daysOverdue: String(inv.daysOverdue),
      paidAmountLakhs: String(inv.paidAmountLakhs),
      notes: inv.notes ?? '',
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const amount = Number(form.amountLakhs);
    if (!form.buyerName.trim() || !Number.isFinite(amount) || amount <= 0) {
      setFormError('Please enter a valid buyer name and positive amount (in ₹ Lakh).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        invoiceNumber: form.invoiceNumber.trim(),
        buyerId: form.buyerId,
        buyerName: form.buyerName.trim(),
        supplierId: form.supplierId,
        supplierName: form.supplierName.trim(),
        amountLakhs: amount,
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate,
        status: form.status,
        daysOverdue: Number(form.daysOverdue) || 0,
        paidAmountLakhs: Number(form.paidAmountLakhs) || 0,
        notes: form.notes.trim(),
      };

      if (editingId) {
        await api.updateInvoice(editingId, payload);
        showToast(`Updated invoice ${payload.invoiceNumber}`);
      } else {
        await api.createInvoice(payload);
        showToast(`Added invoice ${payload.invoiceNumber}`);
      }
      setFormOpen(false);
      bumpDataVersion();
      await loadInvoices();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (inv: Invoice) => {
    try {
      await api.updateInvoice(inv.id, {
        status: 'Paid',
        paidAmountLakhs: inv.amountLakhs,
        daysOverdue: 0,
      });
      bumpDataVersion();
      showToast(`Recorded full payment for ${inv.invoiceNumber}`);
      await loadInvoices();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update payment status');
    }
  };

  const handleDelete = async (inv: Invoice) => {
    try {
      await api.deleteInvoice(inv.id);
      bumpDataVersion();
      showToast(`Removed invoice ${inv.invoiceNumber}`);
      await loadInvoices();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete invoice');
    }
  };

  const handleVoiceEntry = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceNote(
        'Browser speech recognition is unavailable in this browser. Opening standard manual invoice form.'
      );
      openNewForm();
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setListening(true);
      setVoiceNote('Listening… Try saying: "Invoice for Varroc 7.5 lakh overdue 30 days"');

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript ?? '';
        setVoiceNote(`Captured voice input: "${transcript}"`);
        const amountMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)?/i);
        const daysMatch = transcript.match(/(\d+)\s*days?/i);
        const matchedBuyer = businesses.find((b) =>
          transcript.toLowerCase().includes(b.name.split(' ')[0].toLowerCase())
        );

        setEditingId(null);
        setForm({
          ...EMPTY_FORM,
          invoiceNumber: `INV-KP-2026-${Math.floor(2200 + Math.random() * 700)}`,
          buyerId: matchedBuyer?.id ?? 'bus-varroc',
          buyerName: matchedBuyer?.name ?? 'Varroc Systems & Assemblies Pvt Ltd',
          amountLakhs: amountMatch ? amountMatch[1] : '6.0',
          status: daysMatch && Number(daysMatch[1]) > 0 ? 'Overdue' : 'Pending',
          daysOverdue: daysMatch ? daysMatch[1] : '0',
          notes: `Voice dictated: "${transcript}"`,
        });
        setFormOpen(true);
        setListening(false);
      };

      recognition.onerror = () => {
        setListening(false);
        setVoiceNote('Speech capture ended without audio match. Use manual entry below.');
        openNewForm();
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch {
      setListening(false);
      setVoiceNote('Voice capture could not initialize. Use manual invoice entry.');
      openNewForm();
    }
  };

  const totalOutstanding = invoices
    .filter((i) => i.status !== 'Paid')
    .reduce((acc, i) => acc + Math.max(0, i.amountLakhs - i.paidAmountLakhs), 0);
  const totalOverdue = invoices
    .filter((i) => i.status === 'Overdue' || i.daysOverdue > 0)
    .reduce((acc, i) => acc + Math.max(0, i.amountLakhs - i.paidAmountLakhs), 0);

  const buildReminderText = (inv: Invoice) =>
    `Subject: Payment Reminder — Invoice ${inv.invoiceNumber} (${inv.daysOverdue} Days Overdue)\n\nDear ${inv.buyerName} Accounts Payable Team,\n\nThis is a formal reminder regarding Invoice ${inv.invoiceNumber} dated ${inv.invoiceDate} (Due Date: ${inv.dueDate}) for ₹${(inv.amountLakhs - inv.paidAmountLakhs).toFixed(2)} Lakh payable to ${inv.supplierName}.\n\nAs the balance is currently ${inv.daysOverdue} days past due, please share your NEFT/RTGS settlement date or TReDS factoring approval at the earliest.\n\nRegards,\n${inv.supplierName}`;

  return (
    <div className="space-y-6">
      <PageIntro
        title="Invoice Management & Receivables Ledger"
        subtitle="Create, edit, track, and collect supply-chain invoices. Any change dynamically recalculates MSME cash runway and network risk."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleVoiceEntry}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                listening
                  ? 'border-red-500 bg-red-600/20 text-red-200'
                  : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
              }`}
            >
              {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {listening ? 'Listening...' : 'Voice Invoice Entry'}
            </button>
            <button
              type="button"
              onClick={openNewForm}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.actions.addInvoice}
            </button>
          </div>
        }
      />

      {voiceNote && (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/25 px-4 py-2.5 text-xs text-cyan-200">
          {voiceNote}
        </div>
      )}

      {/* Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Visible Invoices"
          value={String(invoices.length)}
          subtext="Matching active ledger filters"
        />
        <MetricCard
          label="Total Outstanding Balance"
          value={`₹${totalOutstanding.toFixed(2)} Lakh`}
          subtext="Unpaid amount across listed invoices"
          tone="primary"
        />
        <MetricCard
          label="Overdue Exposure"
          value={`₹${totalOverdue.toFixed(2)} Lakh`}
          subtext="Past contractual settlement date"
          tone={totalOverdue > 0 ? 'critical' : 'healthy'}
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/90 bg-[#0C1322] p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice #, buyer, supplier..."
              className="w-64 rounded-lg border border-slate-700 bg-[#060A13] py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-slate-700 bg-[#060A13] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-500"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#060A13] p-1">
            {['All', 'Overdue', 'Pending', 'Partially Paid', 'Paid'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={overdueFilter}
            onChange={(e) => setOverdueFilter(Number(e.target.value))}
            aria-label="Filter by overdue days"
            className="rounded-lg border border-slate-700 bg-[#060A13] px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value={0}>Any Overdue Duration</option>
            <option value={15}>15+ Days Overdue</option>
            <option value={30}>30+ Days Overdue</option>
            <option value={45}>45+ Days Overdue (MSMED Trigger)</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <LoadingBlock rows={6} />
      ) : error ? (
        <ErrorBlock message={error} onRetry={loadInvoices} />
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0C1322] p-10 text-center">
          <p className="text-sm font-medium text-slate-300">No invoices match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('All');
              setOverdueFilter(0);
              setSearch('');
              loadInvoices();
            }}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Reset Ledger Filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800/90 bg-[#0C1322]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-[#080E1B] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice #</th>
                  <th className="px-4 py-3 font-medium">Buyer</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium">Outstanding</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 text-right font-medium">Overdue</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {invoices.map((inv) => {
                  const outstanding = Math.max(0, inv.amountLakhs - inv.paidAmountLakhs);
                  const statusColor =
                    inv.status === 'Paid'
                      ? 'text-emerald-400'
                      : inv.status === 'Overdue'
                      ? 'text-red-400'
                      : inv.status === 'Partially Paid'
                      ? 'text-amber-300'
                      : 'text-cyan-300';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-100 whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-200">{inv.buyerName}</td>
                      <td className="px-4 py-3 text-slate-300">{inv.supplierName}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">
                        ₹{inv.amountLakhs.toFixed(2)}L
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-white tabular-nums whitespace-nowrap">
                        ₹{outstanding.toFixed(2)}L
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                        {inv.dueDate}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-300 tabular-nums whitespace-nowrap">
                        {inv.daysOverdue}d
                      </td>
                      <td className={`px-4 py-3 font-semibold whitespace-nowrap ${statusColor}`}>
                        {inv.status}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailInvoice(inv)}
                            title="View details"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditForm(inv)}
                            title="Edit invoice"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {inv.status !== 'Paid' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setReminderInvoice(inv)}
                                title="Generate payment reminder"
                                className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMarkPaid(inv)}
                                title="Record full payment"
                                className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(inv)}
                            title="Delete invoice"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Invoice Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0B1120] p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-display text-lg font-bold text-white">
                {editingId ? 'Edit Invoice Record' : 'Add Supply-Chain Invoice'}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-medium text-slate-300">Invoice Number</label>
                  <input
                    type="text"
                    value={form.invoiceNumber}
                    onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
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
                    value={form.amountLakhs}
                    onChange={(e) => setForm({ ...form, amountLakhs: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-medium text-slate-300">Buyer</label>
                  <select
                    value={form.buyerId}
                    onChange={(e) => {
                      const b = businesses.find((x) => x.id === e.target.value);
                      setForm({
                        ...form,
                        buyerId: e.target.value,
                        buyerName: b?.name ?? form.buyerName,
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
                <div>
                  <label className="block font-medium text-slate-300">Supplier</label>
                  <select
                    value={form.supplierId}
                    onChange={(e) => {
                      const s = businesses.find((x) => x.id === e.target.value);
                      setForm({
                        ...form,
                        supplierId: e.target.value,
                        supplierName: s?.name ?? form.supplierName,
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
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block font-medium text-slate-300">Invoice Date</label>
                  <input
                    type="date"
                    value={form.invoiceDate}
                    onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-2.5 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-2.5 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-2.5 py-2 text-slate-100"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300">Days Overdue</label>
                  <input
                    type="number"
                    min="0"
                    value={form.daysOverdue}
                    onChange={(e) => setForm({ ...form, daysOverdue: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-2.5 py-2 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional batch or payment terms"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#0B1120] p-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display text-base font-bold text-white">
                {detailInvoice.invoiceNumber}
              </h3>
              <button
                type="button"
                onClick={() => setDetailInvoice(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-4 space-y-2.5">
              <div className="flex justify-between">
                <dt className="text-slate-400">Buyer</dt>
                <dd className="font-semibold text-slate-100">{detailInvoice.buyerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Supplier</dt>
                <dd className="font-semibold text-slate-100">{detailInvoice.supplierName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Total Amount</dt>
                <dd className="font-mono text-slate-100">₹{detailInvoice.amountLakhs.toFixed(2)} Lakh</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Paid to Date</dt>
                <dd className="font-mono text-emerald-400">₹{detailInvoice.paidAmountLakhs.toFixed(2)} Lakh</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Invoice / Due Date</dt>
                <dd className="font-mono text-slate-300">
                  {detailInvoice.invoiceDate} → {detailInvoice.dueDate}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Status / Overdue</dt>
                <dd className="font-semibold text-amber-300">
                  {detailInvoice.status} ({detailInvoice.daysOverdue} days)
                </dd>
              </div>
              {detailInvoice.notes && (
                <div className="border-t border-slate-800 pt-2">
                  <dt className="text-slate-400">Notes</dt>
                  <dd className="mt-1 text-slate-200">{detailInvoice.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Payment Reminder Modal */}
      {reminderInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0B1120] p-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display text-base font-bold text-white">
                Payment Reminder Draft · {reminderInvoice.invoiceNumber}
              </h3>
              <button
                type="button"
                onClick={() => setReminderInvoice(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-800 bg-[#060A13] p-4 font-sans text-xs leading-relaxed text-slate-200">
              {buildReminderText(reminderInvoice)}
            </pre>
            <p className="mt-2 text-[11px] text-slate-400">
              Decision-support draft only. No external email or legal notice is dispatched automatically.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(buildReminderText(reminderInvoice));
                  showToast('Payment reminder copied to clipboard.');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Reminder Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
