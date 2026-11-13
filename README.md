# Cryo Enterprise 2.0 — Unified SCM, Sales, Production & Logistics ERP System

A full-stack enterprise web application built on the MERN stack (MongoDB, Express, React, Node.js) with vanilla JavaScript (`.jsx` / `.js`, **no TypeScript**). Features an obsidian dark precision design with vibrant cyan/amber/emerald accents and a pixel-perfect **4-tier tree-branch expandable accordion sidebar (`└→`)**.

---

## 1. System Architecture & Suites (41 Total Modules)

```
Cryo Enterprise 2.0
├── 📦 Supply Chain Management (10 Modules)
│   ├── Raw Material Master
│   ├── Suppliers
│   ├── Supplier Material Link
│   ├── Purchase Orders (PO)
│   ├── GRN – Goods Receipt
│   ├── QC Tests
│   ├── Raw Material Inventory
│   ├── Material Issue to Production
│   ├── Returns to Supplier
│   └── Inventory Report
│
├── 💼 Sales Management CRM (10 Modules)
│   ├── Dashboard
│   ├── Customer Enquiries
│   ├── Customers & Leads
│   ├── Follow-ups
│   ├── Quotations (V1/V2/V3 Negotiation Versioning)
│   ├── Proforma Invoices (PI)
│   ├── Customer Purchase Orders
│   ├── Payments
│   ├── Sales Orders (SO)
│   └── Sales Reports
│
├── 🏭 Production Management (12 Modules)
│   ├── Dashboard
│   ├── Production Planning (Work Orders)
│   ├── BOM – Bill of Materials
│   ├── Production Schedule
│   ├── Material Requests (Requisition to Company Store)
│   ├── Material Issue (Store Verification & Stock Ledger Audit)
│   ├── Production Execution (Start / Pause / Resume / Hold)
│   ├── Production Updates (Daily / Weekly Cumulative Progress)
│   ├── Production Completion
│   ├── Quality Assurance (QA: Sensor, Heat, Electrical)
│   ├── Rework / Rebuild (Closed-loop Repair Bay)
│   └── Finished Goods (QA-Guaranteed Serialized Warehouse)
│
└── 🚚 Logistics & Delivery Management (9 Modules)
    ├── Dashboard (Outbound Fulfillment KPIs)
    ├── Delivery Planning (SO & Finished Goods Allocation)
    ├── Vehicle & Courier (Company Fleet & Courier Partners)
    ├── Dispatch (Gate Exit Slip & Serial Number Reservation)
    ├── Delivery Tracking (GPS Checkpoints & Delay Reason Logging)
    ├── Delivery Confirmation (Proof of Delivery POD & Partial Shipments)
    ├── Installation (On-Site Deployment & Service Tech Scheduling)
    ├── Installation Completion (Mandatory 7-Point Commissioning Checklist)
    └── Logistics Reports (Delivery SLA, Transit Delays & First-Time Pass Rates)
```

---

## 2. Documentation Index (In `docs/`)
- [`docs/workflows.md`](file:///k:/cryo2.0/docs/workflows.md) — Comprehensive workflow diagrams and operational step-by-step guides for SCM, Sales, Production, and Logistics.
- [`docs/api-documentation.md`](file:///k:/cryo2.0/docs/api-documentation.md) — Complete REST API reference for all 41 endpoints with methods, query parameters, payloads, and response structures.
- [`docs/business-logic.md`](file:///k:/cryo2.0/docs/business-logic.md) — Strict business logic, quarantine rules, inventory conservation, deduplication, quotation versioning, QA decision gates, and mandatory 7-point installation checklists.
- [`docs/task-tracker.md`](file:///k:/cryo2.0/docs/task-tracker.md) — Milestone and verification register.
- [`project.md`](file:///k:/cryo2.0/project.md) — High-level system architecture and module breakdown.

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### Backend Server Setup
```bash
cd server
npm install
node seed/seedData.js       # Seeds SCM sample data
node seed/salesSeed.js      # Seeds Sales CRM sample data
node seed/productionSeed.js # Seeds Production 10-Machine sample data
node seed/logisticsSeed.js  # Seeds Logistics & Delivery sample data
node server.js              # Starts API server on http://localhost:5000
```

### Frontend Client Setup
```bash
cd client
npm install
npm run dev                 # Starts Vite React on http://localhost:3000
```

---

## 4. Key Business Safeguards
1. **Stock Conservation**: Stock cannot be manually created; it increases only via approved `QC Pass` and decreases via store issues or supplier returns.
2. **Quarantine Inward**: GRN items enter `QC Pending` quarantine without directly entering available stock.
3. **Quotation History**: Commercial negotiations increment versions (`V1` → `V2` → `V3`) while preserving immutable history.
4. **Company Store Integration**: Production draws directly from SCM inventory with automated Stock Ledger audit trails.
5. **QA Gating**: Completed production batches cannot enter Finished Goods until passing Quality Assurance testing. Failed units are routed to Rework and re-tested via Re-QA.
6. **Dispatch Serial Reservation**: Dispatching finished goods immediately assigns serial tags and updates stock status to `Dispatched` to prevent double dispatch.
7. **Partial Delivery Handling**: POD confirms received quantity, leaving pending balances open in the delivery plan.
8. **7-Point Installation Quality Gate**: Installation completion enforces a 7-point technical verification. A single failed checkpoint triggers `Failed - Retest Required` and blocks sign-off until fully rectified.
