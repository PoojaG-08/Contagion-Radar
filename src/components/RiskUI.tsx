import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { RiskLevel } from '../types/contagion';

export function getRiskColorTokens(risk: RiskLevel) {
  switch (risk) {
    case 'Low':
      return {
        label: 'Healthy · Low Risk',
        short: 'Healthy',
        text: 'text-emerald-400',
        stroke: '#10B981',
        fill: 'rgba(16, 185, 129, 0.14)',
        border: 'border-emerald-500/30',
      };
    case 'Moderate':
      return {
        label: 'Warning · Moderate Risk',
        short: 'Warning',
        text: 'text-amber-400',
        stroke: '#F59E0B',
        fill: 'rgba(245, 158, 11, 0.14)',
        border: 'border-amber-500/30',
      };
    case 'High':
      return {
        label: 'High Risk',
        short: 'High Risk',
        text: 'text-orange-400',
        stroke: '#F97316',
        fill: 'rgba(249, 115, 22, 0.16)',
        border: 'border-orange-500/35',
      };
    case 'Critical':
      return {
        label: 'Critical Risk',
        short: 'Critical',
        text: 'text-red-400',
        stroke: '#EF4444',
        fill: 'rgba(239, 68, 68, 0.18)',
        border: 'border-red-500/40',
      };
  }
}

export function RiskStatusText({
  risk,
  compact = false,
}: {
  risk: RiskLevel;
  compact?: boolean;
}) {
  const tokens = getRiskColorTokens(risk);
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${tokens.text}`}>
      <span
        className="inline-block h-2 w-2 rounded-sm shrink-0"
        style={{ backgroundColor: tokens.stroke }}
        aria-hidden="true"
      />
      <span>{compact ? tokens.short : tokens.label}</span>
    </span>
  );
}

export function MetricCard({
  label,
  value,
  subtext,
  tone = 'default',
}: {
  label: string;
  value: string;
  subtext?: string;
  tone?: 'default' | 'primary' | 'healthy' | 'warning' | 'critical';
}) {
  const valueTone =
    tone === 'primary'
      ? 'text-cyan-300'
      : tone === 'healthy'
      ? 'text-emerald-400'
      : tone === 'warning'
      ? 'text-amber-300'
      : tone === 'critical'
      ? 'text-red-400'
      : 'text-slate-100';

  return (
    <div className="rounded-xl border border-slate-800/90 bg-[#0C1322] p-5 transition-colors hover:border-slate-700/90">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-bold tracking-tight tabular-nums ${valueTone}`}>
        {value}
      </p>
      {subtext && <p className="mt-1.5 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}

export function PageIntro({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{subtitle}</p>
      </div>
      {action && <div className="flex flex-wrap items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}

export function LoadingBlock({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading financial analytics">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-slate-800/80 bg-[#0C1322]"
          />
        ))}
      </div>
      <div className="space-y-2.5 rounded-xl border border-slate-800/80 bg-[#0C1322] p-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-800/60" />
        ))}
      </div>
    </div>
  );
}

export function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-red-500/30 bg-red-950/20 p-5 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
        <div>
          <h3 className="text-sm font-semibold text-red-200">Unable to Load Module Data</h3>
          <p className="mt-1 text-xs text-red-300/90">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-100 transition-colors hover:bg-red-500/25 whitespace-nowrap shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
