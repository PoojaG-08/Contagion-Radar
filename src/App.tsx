import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/AppShell';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import NetworkGraphPage from './pages/NetworkGraphPage';
import ContagionAnalysisPage from './pages/ContagionAnalysisPage';
import ShockSimulationPage from './pages/ShockSimulationPage';
import EarlyWarningPage from './pages/EarlyWarningPage';
import PreventiveActionsPage from './pages/PreventiveActionsPage';
import AiRiskExplanationPage from './pages/AiRiskExplanationPage';
import CommandCenterPage from './pages/CommandCenterPage';
import SystemArchitecturePage from './pages/SystemArchitecturePage';
import StakeholdersPage from './pages/StakeholdersPage';
import FeasibilityPage from './pages/FeasibilityPage';
import RiskMetricsPage from './pages/RiskMetricsPage';
import RoadmapPage from './pages/RoadmapPage';

function WorkspaceRoute({ element }: { element: React.ReactNode }) {
  return <AppShell>{element}</AppShell>;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<WorkspaceRoute element={<DashboardPage />} />} />
          <Route path="/invoices" element={<WorkspaceRoute element={<InvoicesPage />} />} />
          <Route path="/network-graph" element={<WorkspaceRoute element={<NetworkGraphPage />} />} />
          <Route path="/contagion" element={<WorkspaceRoute element={<ContagionAnalysisPage />} />} />
          <Route path="/shock-simulation" element={<WorkspaceRoute element={<ShockSimulationPage />} />} />
          <Route path="/early-warning" element={<WorkspaceRoute element={<EarlyWarningPage />} />} />
          <Route path="/preventive-actions" element={<WorkspaceRoute element={<PreventiveActionsPage />} />} />
          <Route path="/ai-explanation" element={<WorkspaceRoute element={<AiRiskExplanationPage />} />} />
          <Route path="/command-center" element={<WorkspaceRoute element={<CommandCenterPage />} />} />
          <Route path="/architecture" element={<WorkspaceRoute element={<SystemArchitecturePage />} />} />
          <Route path="/stakeholders" element={<WorkspaceRoute element={<StakeholdersPage />} />} />
          <Route path="/feasibility" element={<WorkspaceRoute element={<FeasibilityPage />} />} />
          <Route path="/risk-metrics" element={<WorkspaceRoute element={<RiskMetricsPage />} />} />
          <Route path="/roadmap" element={<WorkspaceRoute element={<RoadmapPage />} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
