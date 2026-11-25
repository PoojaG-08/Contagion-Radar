# CONTAGION RADAR

**Predicting Financial Shockwaves Before They Hit India's SME Supply Chain**

Developed by **Team AETHERGRID** (`SANDHYA S`, `R POOJA`, `POOJA G`, `MONISHWARAN B`) for TReDS exchanges, NBFCs, Tier-1 corporate buyers, and MSME suppliers.

---

## Overview

Contagion Radar shifts SME credit evaluation from isolated invoice checks to multi-tier supply-chain network risk intelligence. Using a directed financial dependency graph spanning Tier-1 buyers, MSMEs, Tier-2 job shops, and Tier-3 raw material mills, the platform models how delayed invoice settlements deplete cash buffers and propagate across connected vendors.

> **Disclaimer:** All businesses, invoices, simulation numbers, and benchmark figures in the demo environment are simulated/model outputs for prototype demonstration and should not be interpreted as guaranteed financial forecasts.

---

## Core Modules (15 Pages)

1. **Landing Page** (`/`) — Animated multi-tier contagion visualization, problem/solution framing, and entry CTAs.
2. **MSME Simplified Dashboard** (`/dashboard`) — Centered on *Kaveri Precision Auto Components* (`UDYAM-MH-26-0078129`) with dynamic Health Score, Receivables Waiting, Overdue Amount, Runway, Buyer Concentration, and Supplier Dependency charts.
3. **Invoice Management** (`/invoices`) — Create, edit, delete, search, filter, record payments, generate reminder drafts, and dictate entries via browser Speech Recognition.
4. **Supply Chain Network Graph** (`/network-graph`) — Interactive draggable, zoomable 18-node multi-tier dependency graph with search, tier filters, and business inspector.
5. **Financial Contagion Analysis** (`/contagion`) — Stage-by-stage BFS cascade simulation and animated wave playback.
6. **Payment Shock Simulation** (`/shock-simulation`) — Configurable stress-tester (15–90 day delays, payment amount, default scenario, cash buffer, daily OpEx) seeded with the PPT reference scenario.
7. **Early Warning & Risk Analytics** (`/early-warning`) — Risk band distribution, concentration charts, and triageable early-warning alerts.
8. **Recommended Preventive Actions** (`/preventive-actions`) — TReDS invoice discounting estimator, MSMED Act Section 16 notice draft, critical supplier protection simulator, buyer diversification, and collection queue.
9. **AI Risk Explanation** (`/ai-explanation`) — Server-side Gemini AI explanation (`gemini-4-hydrogen`) with transparent deterministic rule-based fallback.
10. **Command Center – Advanced** (`/command-center`) — Institutional monitoring cockpit with network rankings, quick stress sensitivity, alert triage, and embedded graph.
11. **System Architecture & Data Flow** (`/architecture`) — Interactive 4-stage pipeline diagram.
12. **Stakeholder Value Ecosystem** (`/stakeholders`) — Value breakdown for Banks & NBFCs, TReDS, Large Buyers, and SME Suppliers.
13. **Project Feasibility & Scope** (`/feasibility`) — Hackathon scope, risks & mitigations, and next steps.
14. **Early Warning Risk Metrics** (`/risk-metrics`) — Illustrative prototype coverage benchmark (35% Traditional vs. 92% Contagion Radar Engine).
15. **Strategic Roadmap** (`/roadmap`) — 4-phase interactive horizontal roadmap.

---

## Setup & Local Development

### Prerequisites
- Node.js `>= 20` (tested on Node `v22+`)
- npm

### Environment Variables
Copy `.env.example` to `.env` if running outside AI Studio:

```bash
GEMINI_API_KEY="YOUR_GEMINI_API_KEY" # Optional: deterministic rule-based fallback activates automatically if unset
APP_URL="http://localhost:3000"
```

### Install & Run

```bash
npm install
npm run dev
```

The Express backend (`server.ts`) and Vite frontend run unified on `http://localhost:3000`.

### Production Build & Start

```bash
npm run build
NODE_ENV=production npm start
```

---

## REST API Endpoints

- `GET /api/health` — Server status and AI availability
- `GET /api/dashboard?businessId=bus-kaveri` — Dynamic KPIs, overdue banner, and trend series
- `GET /api/businesses` — All 18 networked businesses
- `GET /api/graph` — Graph nodes and directed dependency edges
- `GET /api/invoices` | `POST /api/invoices` | `PUT /api/invoices/:id` | `DELETE /api/invoices/:id` — Invoice CRUD with automatic metric recalculation
- `GET /api/contagion/:businessId` — Multi-stage downstream contagion propagation
- `POST /api/simulate-shock` — Payment shock stress-test simulation
- `GET /api/alerts` | `PATCH /api/alerts/:id/review` — Early-warning alert triage
- `GET /api/actions?businessId=bus-kaveri` — Simulated preventive action recommendations
- `POST /api/explain-risk` — Server-side Gemini AI risk explanation with deterministic fallback
- `POST /api/demo/reset` — Restores seeded baseline dataset
