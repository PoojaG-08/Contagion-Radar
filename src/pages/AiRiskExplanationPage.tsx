import React, { useEffect, useState } from 'react';
import { Bot, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { Business, RiskExplanationResult } from '../types/contagion';
import { ErrorBlock, PageIntro } from '../components/RiskUI';

export default function AiRiskExplanationPage() {
  const { selectedBusinessId, setSelectedBusinessId, t, language } = useApp();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [explanation, setExplanation] = useState<RiskExplanationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    api
      .getBusinesses()
      .then((res) => setBusinesses(res.businesses))
      .catch(() => {});
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !explanation) {
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${explanation.summary} Key recommendation: ${explanation.recommendedActions[0] ?? ''}`
    );
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

  const handleExplain = async () => {
    setLoading(true);
    setError(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
    try {
      const res = await api.explainRisk(selectedBusinessId);
      setExplanation(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate explanation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleExplain();
  }, [selectedBusinessId]);

  return (
    <div className="space-y-6">
      <PageIntro
        title="AI-Assisted Financial Risk Explanation"
        subtitle="Generate plain-language diagnostics grounded in live invoices, cash runway, buyer concentration, and multi-tier network dependencies."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              aria-label="Select business to explain"
              className="rounded-lg border border-slate-700 bg-[#0C1322] px-3 py-2 text-xs font-medium text-slate-100"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.tier})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={toggleVoice}
              disabled={!explanation}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0C1322] px-4 py-2.5 text-xs font-semibold text-slate-100 hover:border-slate-500 disabled:opacity-40 whitespace-nowrap"
            >
              {speaking ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-cyan-300" />}
              {speaking ? 'Stop Voice' : 'Listen (Voice)'}
            </button>
            <button
              type="button"
              onClick={handleExplain}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold tracking-wide text-white hover:bg-blue-500 disabled:opacity-50 whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? 'ANALYZING...' : t.actions.explainRisk}
            </button>
          </div>
        }
      />

      {error && <ErrorBlock message={error} onRetry={handleExplain} />}

      {explanation && (
        <div className="space-y-6">
          {/* Risk Summary Card */}
          <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Bot className="h-5 w-5 text-cyan-400" />
                <h2 className="font-display text-lg font-bold text-white">
                  Risk Summary · {explanation.businessName}
                </h2>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                Engine: {explanation.modelUsed}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-100">
              {explanation.summary}
            </p>
          </div>

          {/* Indicator Explanations */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {explanation.indicatorExplanations.map((ind) => (
              <div
                key={ind.indicator}
                className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5"
              >
                <p className="text-xs font-medium text-slate-400">{ind.indicator}</p>
                <p className="mt-1.5 font-mono text-xl font-bold text-cyan-300 tabular-nums">
                  {ind.value}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{ind.meaning}</p>
              </div>
            ))}
          </div>

          {/* Main Risk Factors & Downstream Effects */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
              <h3 className="font-display text-base font-bold text-white">
                Primary Risk Drivers
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-300">
                {explanation.mainRiskFactors.map((f, i) => (
                  <li key={i} className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
              <h3 className="font-display text-base font-bold text-white">
                Potential Downstream Effects
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-300">
                {explanation.downstreamEffects.map((d, i) => (
                  <li key={i} className="rounded-lg border border-slate-800 bg-[#060A13] p-3.5">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Preventive Actions */}
          <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-6">
            <h3 className="font-display text-base font-bold text-white">
              Recommended Preventive Actions
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {explanation.recommendedActions.map((act, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-[#060A13] p-4 text-xs leading-relaxed text-emerald-200"
                >
                  {idx + 1}. {act}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
