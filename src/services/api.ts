import type {
  Business,
  ContagionAnalysisResult,
  DashboardSummary,
  Invoice,
  PreventiveActionsData,
  RiskAlert,
  RiskExplanationResult,
  ShockSimulationInput,
  ShockSimulationResult,
  SupplyEdge,
} from '../types/contagion';

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.error) message = String(errBody.error);
    } catch {
      // keep status message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const api = {
  getDashboard(businessId = 'bus-kaveri'): Promise<DashboardSummary> {
    return requestJson<DashboardSummary>(
      `/api/dashboard?businessId=${encodeURIComponent(businessId)}`
    );
  },

  getBusinesses(): Promise<{ businesses: Business[] }> {
    return requestJson<{ businesses: Business[] }>('/api/businesses');
  },

  getGraph(): Promise<{ nodes: Business[]; edges: SupplyEdge[] }> {
    return requestJson<{ nodes: Business[]; edges: SupplyEdge[] }>('/api/graph');
  },

  getInvoices(params?: {
    status?: string;
    search?: string;
    minOverdue?: number;
  }): Promise<{ invoices: Invoice[] }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.minOverdue && params.minOverdue > 0) {
      query.set('minOverdue', String(params.minOverdue));
    }
    const qs = query.toString();
    return requestJson<{ invoices: Invoice[] }>(`/api/invoices${qs ? `?${qs}` : ''}`);
  },

  createInvoice(payload: Partial<Invoice>): Promise<{ invoice: Invoice }> {
    return requestJson<{ invoice: Invoice }>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateInvoice(id: string, payload: Partial<Invoice>): Promise<{ invoice: Invoice }> {
    return requestJson<{ invoice: Invoice }>(`/api/invoices/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteInvoice(id: string): Promise<{ deleted: boolean; id: string }> {
    return requestJson<{ deleted: boolean; id: string }>(
      `/api/invoices/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
  },

  getContagionAnalysis(businessId: string): Promise<ContagionAnalysisResult> {
    return requestJson<ContagionAnalysisResult>(
      `/api/contagion/${encodeURIComponent(businessId)}`
    );
  },

  simulateShock(input: ShockSimulationInput): Promise<ShockSimulationResult> {
    return requestJson<ShockSimulationResult>('/api/simulate-shock', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  getAlerts(): Promise<{ alerts: RiskAlert[] }> {
    return requestJson<{ alerts: RiskAlert[] }>('/api/alerts');
  },

  reviewAlert(id: string, reviewed: boolean): Promise<{ alert: RiskAlert }> {
    return requestJson<{ alert: RiskAlert }>(
      `/api/alerts/${encodeURIComponent(id)}/review`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reviewed }),
      }
    );
  },

  getPreventiveActions(businessId = 'bus-kaveri'): Promise<PreventiveActionsData> {
    return requestJson<PreventiveActionsData>(
      `/api/actions?businessId=${encodeURIComponent(businessId)}`
    );
  },

  explainRisk(businessId = 'bus-kaveri'): Promise<RiskExplanationResult> {
    return requestJson<RiskExplanationResult>('/api/explain-risk', {
      method: 'POST',
      body: JSON.stringify({ businessId }),
    });
  },

  resetDemo(): Promise<{ reset: boolean; message: string }> {
    return requestJson<{ reset: boolean; message: string }>('/api/demo/reset', {
      method: 'POST',
    });
  },
};
