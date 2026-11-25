import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  getSeededAlerts,
  getSeededBusinesses,
  getSeededEdges,
  getSeededInvoices,
} from './server/seedData.ts';
import {
  type AppDataState,
  buildDashboardSummary,
  buildDeterministicRiskExplanation,
  buildPreventiveActions,
  recomputeStateMetrics,
  runContagionAnalysis,
  runShockSimulation,
} from './server/riskEngine.ts';
import type {
  Invoice,
  InvoiceStatus,
  ShockSimulationInput,
} from './src/types/contagion.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);

function createInitialState(): AppDataState {
  return recomputeStateMetrics({
    businesses: getSeededBusinesses(),
    invoices: getSeededInvoices(),
    edges: getSeededEdges(),
    alerts: getSeededAlerts(),
  });
}

let appState: AppDataState = createInitialState();

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim().length < 10) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Contagion Radar Risk Engine',
      aiConfigured: Boolean(getGeminiClient()),
      businessCount: appState.businesses.length,
      invoiceCount: appState.invoices.length,
    });
  });

  // Dashboard Summary
  app.get('/api/dashboard', (req, res) => {
    const businessId =
      typeof req.query.businessId === 'string' && req.query.businessId.trim()
        ? req.query.businessId.trim()
        : 'bus-kaveri';
    const summary = buildDashboardSummary(businessId, appState);
    res.json(summary);
  });

  // Businesses List & Detail
  app.get('/api/businesses', (_req, res) => {
    res.json({ businesses: appState.businesses });
  });

  app.get('/api/businesses/:id', (req, res) => {
    const business = appState.businesses.find((b) => b.id === req.params.id);
    if (!business) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }
    res.json({ business });
  });

  // Supply Chain Graph
  app.get('/api/graph', (_req, res) => {
    res.json({
      nodes: appState.businesses,
      edges: appState.edges,
    });
  });

  // Invoices CRUD
  app.get('/api/invoices', (req, res) => {
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : 'All';
    const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase() : '';
    const minOverdue =
      typeof req.query.minOverdue === 'string' ? Number(req.query.minOverdue) : 0;

    const filtered = appState.invoices.filter((inv) => {
      if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
      if (Number.isFinite(minOverdue) && minOverdue > 0 && inv.daysOverdue < minOverdue) {
        return false;
      }
      if (search) {
        const hay = `${inv.invoiceNumber} ${inv.buyerName} ${inv.supplierName}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    res.json({ invoices: filtered });
  });

  app.post('/api/invoices', (req, res) => {
    const body = req.body ?? {};
    const buyerName = String(body.buyerName ?? '').trim();
    const supplierName = String(body.supplierName ?? 'Kaveri Precision Auto Components').trim();
    const amountLakhs = Number(body.amountLakhs);
    const invoiceNumber =
      String(body.invoiceNumber ?? '').trim() ||
      `INV-KP-2026-${Math.floor(2000 + Math.random() * 7999)}`;
    const invoiceDate = String(body.invoiceDate ?? '2026-11-24').trim();
    const dueDate = String(body.dueDate ?? '2026-12-24').trim();
    const status = (['Paid', 'Pending', 'Overdue', 'Partially Paid'].includes(body.status)
      ? body.status
      : 'Pending') as InvoiceStatus;
    const daysOverdue = Math.max(0, Math.round(Number(body.daysOverdue ?? 0)));
    const paidAmountLakhs =
      status === 'Paid'
        ? amountLakhs
        : Math.max(0, Math.min(amountLakhs, Number(body.paidAmountLakhs ?? 0)));

    if (!buyerName || !Number.isFinite(amountLakhs) || amountLakhs <= 0) {
      res.status(400).json({ error: 'Valid buyer name and positive invoice amount are required.' });
      return;
    }

    const buyerMatch = appState.businesses.find(
      (b) => b.id === body.buyerId || b.name.toLowerCase() === buyerName.toLowerCase()
    );
    const supplierMatch = appState.businesses.find(
      (b) => b.id === body.supplierId || b.name.toLowerCase() === supplierName.toLowerCase()
    );

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      buyerId: buyerMatch?.id ?? 'bus-varroc',
      buyerName: buyerMatch?.name ?? buyerName,
      supplierId: supplierMatch?.id ?? 'bus-kaveri',
      supplierName: supplierMatch?.name ?? supplierName,
      amountLakhs: Math.round(amountLakhs * 100) / 100,
      paidAmountLakhs: Math.round(paidAmountLakhs * 100) / 100,
      invoiceDate,
      dueDate,
      status,
      daysOverdue: status === 'Paid' ? 0 : daysOverdue,
      notes: typeof body.notes === 'string' ? body.notes.trim() : undefined,
    };

    appState = recomputeStateMetrics({
      ...appState,
      invoices: [newInvoice, ...appState.invoices],
    });

    res.status(201).json({ invoice: newInvoice });
  });

  app.put('/api/invoices/:id', (req, res) => {
    const idx = appState.invoices.findIndex((inv) => inv.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const existing = appState.invoices[idx];
    const body = req.body ?? {};
    const nextAmount =
      body.amountLakhs !== undefined ? Number(body.amountLakhs) : existing.amountLakhs;
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      res.status(400).json({ error: 'Invoice amount must be greater than zero.' });
      return;
    }

    const nextStatus = (['Paid', 'Pending', 'Overdue', 'Partially Paid'].includes(body.status)
      ? body.status
      : existing.status) as InvoiceStatus;

    const nextPaid =
      nextStatus === 'Paid'
        ? nextAmount
        : body.paidAmountLakhs !== undefined
        ? Math.max(0, Math.min(nextAmount, Number(body.paidAmountLakhs)))
        : existing.paidAmountLakhs;

    const nextDaysOverdue =
      nextStatus === 'Paid'
        ? 0
        : body.daysOverdue !== undefined
        ? Math.max(0, Math.round(Number(body.daysOverdue)))
        : existing.daysOverdue;

    const updated: Invoice = {
      ...existing,
      invoiceNumber:
        typeof body.invoiceNumber === 'string' && body.invoiceNumber.trim()
          ? body.invoiceNumber.trim()
          : existing.invoiceNumber,
      buyerName:
        typeof body.buyerName === 'string' && body.buyerName.trim()
          ? body.buyerName.trim()
          : existing.buyerName,
      supplierName:
        typeof body.supplierName === 'string' && body.supplierName.trim()
          ? body.supplierName.trim()
          : existing.supplierName,
      amountLakhs: Math.round(nextAmount * 100) / 100,
      paidAmountLakhs: Math.round(nextPaid * 100) / 100,
      invoiceDate: typeof body.invoiceDate === 'string' ? body.invoiceDate : existing.invoiceDate,
      dueDate: typeof body.dueDate === 'string' ? body.dueDate : existing.dueDate,
      status: nextStatus,
      daysOverdue: nextDaysOverdue,
      notes: typeof body.notes === 'string' ? body.notes : existing.notes,
    };

    const nextInvoices = [...appState.invoices];
    nextInvoices[idx] = updated;
    appState = recomputeStateMetrics({
      ...appState,
      invoices: nextInvoices,
    });

    res.json({ invoice: updated });
  });

  app.delete('/api/invoices/:id', (req, res) => {
    const exists = appState.invoices.some((inv) => inv.id === req.params.id);
    if (!exists) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    appState = recomputeStateMetrics({
      ...appState,
      invoices: appState.invoices.filter((inv) => inv.id !== req.params.id),
    });
    res.json({ deleted: true, id: req.params.id });
  });

  // Financial Contagion Analysis
  app.get('/api/contagion/:businessId', (req, res) => {
    const result = runContagionAnalysis(req.params.businessId, appState);
    res.json(result);
  });

  // Payment Shock Simulation
  app.post('/api/simulate-shock', (req, res) => {
    const body = req.body ?? {};
    const input: ShockSimulationInput = {
      targetBuyerId:
        typeof body.targetBuyerId === 'string' && body.targetBuyerId.trim()
          ? body.targetBuyerId.trim()
          : 'bus-varroc',
      delayDays: Math.max(15, Math.min(180, Number(body.delayDays ?? 30))),
      initialPaymentAmountLakhs: Math.max(1, Number(body.initialPaymentAmountLakhs ?? 48.3)),
      buyerDefault: Boolean(body.buyerDefault ?? false),
      supplierCashBufferLakhs: Math.max(0.5, Number(body.supplierCashBufferLakhs ?? 12.0)),
      dailyOpexLakhs: Math.max(0.1, Number(body.dailyOpexLakhs ?? 0.8)),
    };

    const result = runShockSimulation(input, appState);
    res.json(result);
  });

  // Early Warning Alerts
  app.get('/api/alerts', (_req, res) => {
    res.json({ alerts: appState.alerts });
  });

  app.patch('/api/alerts/:id/review', (req, res) => {
    const idx = appState.alerts.findIndex((a) => a.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    const nextAlerts = [...appState.alerts];
    nextAlerts[idx] = {
      ...nextAlerts[idx],
      reviewed: bodyBoolean(req.body?.reviewed, !nextAlerts[idx].reviewed),
    };
    appState = { ...appState, alerts: nextAlerts };
    res.json({ alert: nextAlerts[idx] });
  });

  // Recommended Preventive Actions
  app.get('/api/actions', (req, res) => {
    const businessId =
      typeof req.query.businessId === 'string' && req.query.businessId.trim()
        ? req.query.businessId.trim()
        : 'bus-kaveri';
    const actions = buildPreventiveActions(businessId, appState);
    res.json(actions);
  });

  // AI-Assisted Risk Explanation (Gemini with Deterministic Fallback)
  app.post('/api/explain-risk', async (req, res) => {
    const businessId =
      typeof req.body?.businessId === 'string' && req.body.businessId.trim()
        ? req.body.businessId.trim()
        : 'bus-kaveri';

    const deterministic = buildDeterministicRiskExplanation(businessId, appState);
    const summaryData = buildDashboardSummary(businessId, appState);
    const contagionData = runContagionAnalysis(businessId, appState);
    const ai = getGeminiClient();

    if (!ai) {
      res.json(deterministic);
      return;
    }

    try {
      const prompt = `You are a senior Indian MSME & supply-chain credit risk analyst for Contagion Radar.
Analyze this live business snapshot and return a concise, factual JSON risk explanation in plain financial English (use ₹ Lakh values accurately, never fabricate numbers).

Business: ${summaryData.business.name} (${summaryData.business.tier}, ${summaryData.business.location}, ${summaryData.business.udyamId})
Metrics:
- Health Score: ${summaryData.metrics.healthScore}/100
- Money Waiting to Be Received: ₹${summaryData.metrics.moneyWaitingLakhs.toFixed(2)} Lakh
- Overdue Payment Amount: ₹${summaryData.metrics.overdueAmountLakhs.toFixed(2)} Lakh
- Max Days Overdue: ${summaryData.metrics.daysOverdue} Days
- Cash Buffer: ₹${summaryData.business.cashBufferLakhs.toFixed(2)} Lakh
- Daily Operating Expense: ₹${summaryData.business.dailyOpexLakhs.toFixed(2)} Lakh/day
- Operating Expense Runway: ${summaryData.metrics.operatingRunwayDays} Days
- Largest Buyer Concentration: ${summaryData.metrics.buyerConcentrationPct}%
- Supplier Dependency: ${summaryData.metrics.supplierDependencyCount} Vendors
- Top Overdue Alert: ${summaryData.earlyWarningBanner.message}
- Directly Affected Downstream Vendors: ${contagionData.directlyAffected.map((b) => b.name).join(', ')}
- Estimated Downstream Network Exposure: ₹${contagionData.totalNetworkExposureLakhs.toFixed(2)} Lakh over ${contagionData.propagationWindowDays} days.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Provide crisp, practical, non-alarmist financial risk guidance grounded strictly in the provided metrics. Clearly treat projections as simulated risk analysis.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              mainRiskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
              downstreamEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['summary', 'mainRiskFactors', 'downstreamEffects', 'recommendedActions'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        ...deterministic,
        source: 'gemini-ai',
        modelUsed: 'Gemini 4 Hydrogen (Server-Side Risk Synthesis)',
        summary: parsed.summary || deterministic.summary,
        mainRiskFactors:
          Array.isArray(parsed.mainRiskFactors) && parsed.mainRiskFactors.length > 0
            ? parsed.mainRiskFactors
            : deterministic.mainRiskFactors,
        downstreamEffects:
          Array.isArray(parsed.downstreamEffects) && parsed.downstreamEffects.length > 0
            ? parsed.downstreamEffects
            : deterministic.downstreamEffects,
        recommendedActions:
          Array.isArray(parsed.recommendedActions) && parsed.recommendedActions.length > 0
            ? parsed.recommendedActions
            : deterministic.recommendedActions,
        generatedAt: new Date().toISOString(),
      });
    } catch {
      // Fallback cleanly to deterministic explainable rule-based engine
      res.json(deterministic);
    }
  });

  // Reset Demo Data
  app.post('/api/demo/reset', (_req, res) => {
    appState = createInitialState();
    res.json({ reset: true, message: 'Demo state restored to baseline scenario.' });
  });

  // Vite / Static Frontend Serving
  const distPath = path.resolve(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distPath);

  if (isProd) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Contagion Radar server running on http://0.0.0.0:${PORT}`);
  });
}

function bodyBoolean(val: unknown, fallback: boolean): boolean {
  return typeof val === 'boolean' ? val : fallback;
}

startServer().catch((err) => {
  console.error('Failed to start Contagion Radar server:', err);
  process.exit(1);
});
