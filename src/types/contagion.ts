export type SupplyTier =
  | 'Tier-1 Buyer'
  | 'MSME'
  | 'Tier-2 Supplier'
  | 'Tier-3 Supplier';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta';

export type AppMode = 'msme' | 'command';

export interface Business {
  id: string;
  name: string;
  tier: SupplyTier;
  businessType: string;
  location: string;
  udyamId: string;
  healthScore: number;
  cashBufferLakhs: number;
  dailyOpexLakhs: number;
  buyerConcentrationPct: number;
  overdueAmountLakhs: number;
  receivablesWaitingLakhs: number;
  maxDaysOverdue: number;
  supplierDependencyCount: number;
  riskLevel: RiskLevel;
  x: number;
  y: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  buyerId: string;
  buyerName: string;
  supplierId: string;
  supplierName: string;
  amountLakhs: number;
  paidAmountLakhs: number;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  daysOverdue: number;
  notes?: string;
}

export interface SupplyEdge {
  id: string;
  fromBusinessId: string; // Buyer (money source) or upstream supplier
  toBusinessId: string;   // Supplier (money recipient)
  relationshipType: string;
  exposureLakhs: number;
  dependencyWeightPct: number;
  overdueLakhs: number;
}

export interface RiskAlert {
  id: string;
  businessId: string;
  businessName: string;
  category:
    | 'Payment Delay'
    | 'Liquidity Runway'
    | 'Buyer Concentration'
    | 'Contagion Cascade'
    | 'Supplier Distress';
  riskLevel: RiskLevel;
  description: string;
  suggestedAction: string;
  date: string;
  reviewed: boolean;
}

export interface DashboardSummary {
  business: Business;
  metrics: {
    healthScore: number;
    moneyWaitingLakhs: number;
    overdueAmountLakhs: number;
    daysOverdue: number;
    operatingRunwayDays: number;
    buyerConcentrationPct: number;
    supplierDependencyCount: number;
  };
  earlyWarningBanner: {
    active: boolean;
    overdueAmountInr: string;
    daysOverdue: number;
    buyerName: string;
    message: string;
  };
  overdueInvoices: Invoice[];
  supplierDependencyBreakdown: Array<{
    name: string;
    exposureLakhs: number;
    dependencyPct: number;
    runwayDays: number;
    riskLevel: RiskLevel;
  }>;
  riskTrendSeries: Array<{
    month: string;
    healthScore: number;
    overdueLakhs: number;
    runwayDays: number;
  }>;
  networkOverview: {
    totalBusinesses: number;
    totalExposureCrores: number;
    criticalBusinesses: number;
    highRiskBusinesses: number;
    unreviewedAlerts: number;
  };
}

export interface ContagionStage {
  stage: number;
  label: string;
  dayOffset: number;
  affectedBusinesses: Array<{
    id: string;
    name: string;
    tier: SupplyTier;
    exposureLakhs: number;
    remainingRunwayDays: number;
    projectedRisk: RiskLevel;
    impactReason: string;
  }>;
  cumulativeExposureLakhs: number;
}

export interface ContagionAnalysisResult {
  originBusiness: Business;
  directlyAffected: Business[];
  indirectlyAffected: Business[];
  totalNetworkExposureLakhs: number;
  propagationWindowDays: number;
  earlyWarningLeadDays: number;
  stages: ContagionStage[];
  cascadeEdgeIds: string[];
  cascadeNodeIds: string[];
  isSimulated: true;
  assumptions: string[];
}

export interface ShockSimulationInput {
  targetBuyerId: string;
  delayDays: number;
  initialPaymentAmountLakhs: number;
  buyerDefault: boolean;
  supplierCashBufferLakhs: number;
  dailyOpexLakhs: number;
}

export interface ShockSimulationResult {
  input: ShockSimulationInput;
  isReferenceScenario: boolean;
  businessesPotentiallyAffected: number;
  estimatedNetworkExposureCrores: number;
  additionalOverdueLakhs: number;
  cashBufferDepletionPct: number;
  postShockRunwayDays: number;
  contagionPropagationDays: number;
  earlyWarningOpportunityDays: number;
  riskLevelChanges: Array<{
    businessId: string;
    businessName: string;
    tier: SupplyTier;
    beforeRisk: RiskLevel;
    afterRisk: RiskLevel;
    beforeScore: number;
    afterScore: number;
  }>;
  mostVulnerableSuppliers: Array<{
    id: string;
    name: string;
    tier: SupplyTier;
    currentBufferLakhs: number;
    postShockRunwayDays: number;
    exposureLakhs: number;
    riskLevel: RiskLevel;
  }>;
  beforeAfterComparison: Array<{
    metric: string;
    before: number;
    after: number;
    unit: string;
  }>;
  timelineSeries: Array<{
    day: string;
    baselineExposureLakhs: number;
    shockedExposureLakhs: number;
    cashBufferLakhs: number;
  }>;
  assumptions: string[];
  disclaimer: string;
}

export interface PreventiveActionsData {
  tredsEligibleInvoices: Array<{
    invoiceId: string;
    invoiceNumber: string;
    buyerName: string;
    amountLakhs: number;
    estimatedFinancingLakhs: number;
    estimatedFeeLakhs: number;
    runwayGainDays: number;
    daysOverdue: number;
  }>;
  msmedNoticeDraft: {
    recipientName: string;
    senderName: string;
    udyamId: string;
    invoiceNumber: string;
    overdueAmountInr: string;
    daysOverdue: number;
    statutoryInterestNote: string;
    noticeText: string;
  };
  vulnerableSuppliers: Array<{
    id: string;
    name: string;
    tier: SupplyTier;
    cashBufferLakhs: number;
    runwayDays: number;
    recommendedSupportLakhs: number;
    projectedRunwayAfterSupport: number;
  }>;
  buyerDiversification: {
    businessName: string;
    topBuyerName: string;
    concentrationPct: number;
    recommendedTargetPct: number;
    recommendations: string[];
  };
  collectionPriorities: Array<{
    invoiceId: string;
    invoiceNumber: string;
    buyerName: string;
    amountLakhs: number;
    daysOverdue: number;
    priorityScore: number;
    recommendedAction: string;
  }>;
}

export interface RiskExplanationResult {
  businessId: string;
  businessName: string;
  source: 'gemini-ai' | 'deterministic-rule-engine';
  modelUsed: string;
  summary: string;
  mainRiskFactors: string[];
  indicatorExplanations: Array<{
    indicator: string;
    value: string;
    meaning: string;
  }>;
  downstreamEffects: string[];
  recommendedActions: string[];
  generatedAt: string;
}
