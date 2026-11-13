# Cryo SCM 2.0 — Supply Chain Management MERN Stack Web Application

A full-stack, responsive Supply Chain Management web application built with the MERN stack (MongoDB, Express, React, Node.js) in vanilla JavaScript (no TypeScript) with modern UI and responsive multi-device support.

---

## 1. Design & Architecture Principles

- **Bilingual & Intuitive Workflow**: Designed following the 10 core industrial factory modules.
- **Strict Stock Conservation**: Available stock is system-calculated. No manual "Add Stock" button. Goods inward via GRN sits in `QC Pending` quarantine. Stock increases **only** when items pass `QC Tests` (`QC Pass`), and decreases **only** upon `Material Issue to Production` or `Returns to Supplier`.
- **Reusable Component Architecture**: Reusable `DataTable`, `Modal`, `Drawer`, `KpiCard`, `StatusBadge`, `FormField`, `Header`, `Sidebar`, and notification snackbars (`Toast`).
- **All-Device Support**: Mobile navigation drawer, tablet/desktop sidebar, responsive table cards, touch-friendly inputs.
- **Database Backed**: MongoDB schemas with compound unique index guards (e.g. duplicate supplier-material link prevention), automated balance tracking, and immutable audit stock ledgers.

---

## 2. The 10 Core SCM Modules

| # | Module | Key Features & Responsibilities |
|---|---|---|
| **01** | **Raw Material Master** | Catalog factory raw materials (Steel, Plastic, Chemicals) with UOM, minimum safety stock, and reorder alerts. |
| **02** | **Suppliers** | Maintain vendor profiles, contact personnel, GSTIN, payment terms, and geographical locations. |
| **03** | **Supplier Material Link** | Contract price agreements, MOQs, lead times, and preferred vendor mapping (prevents duplicate mappings). |
| **04** | **Purchase Orders (PO)** | Multi-row procurement orders with automated subtotal, GST, freight, and grand total computation. Lifecycle: `Draft` → `Approved` → `Partially Received` → `Completed` / `Cancelled`. |
| **05** | **GRN (Goods Receipt Note)** | Factory gate inwarding against approved POs. Items placed in `QC Pending` quarantine status without entering live stock. |
| **06** | **QC Tests** | Quality inspection against dimensional, tensile, and visual parameters. Automatically routes accepted quantity to available stock and rejected quantity to return queue. |
| **07** | **Raw Material Inventory** | Real-time available stock balance, status health, and complete chronological stock ledger movement passbook. |
| **08** | **Material Issue to Production**| Requisition by shopfloor work orders. Validates against available stock (blocks overdrafts) and immediately debits inventory. |
| **09** | **Returns to Supplier** | Outward dispatch gate pass and debit note generation for QC-rejected materials. |
| **10** | **Inventory Report & Analytics** | Executive dashboard KPI cards, net stock valuation (₹), category/status filtering, and export to CSV / print. |

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally at `mongodb://127.0.0.1:27017`

### Running the Backend Server
```bash
cd server
npm install
node seed/seedData.js   # Optional: Seeds sample factory data
npm run dev             # Starts API at http://localhost:5000
```

### Running the Frontend Client
```bash
cd client
npm install
npm run dev             # Starts React UI at http://localhost:3000
```

