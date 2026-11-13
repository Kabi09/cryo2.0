# Project Overview — Cryo Enterprise 2.0 (SCM • Sales • Production • Logistics • HR/RBAC)

## 1. Overview
A unified enterprise manufacturing ERP & CRM platform engineered on the MERN stack (MongoDB, Express, React, Node.js) with pure JavaScript (`.jsx` / `.js`, **no TypeScript**). Features an obsidian dark industrial interface with vibrant neon accents and a 5-tier tree-branch expandable accordion navigation (`└→`).

The system integrates 47 comprehensive modules across 5 functional suites:
1. **Supply Chain Management (10 Modules)**: From Raw Material Master to Supplier Linkage, PO, Inward Quarantine GRN, QC Tests, Stock Ledger, Production Issue, and Supplier Return.
2. **Sales Management CRM (10 Modules)**: From Inbound Customer Enquiry to Lead Opportunity, Follow-up Tracking, Multi-Version Quotations (V1/V2/V3), Proforma Invoices, Customer PO Verification, Advance Payments, Sales Orders, and Analytical Reports.
3. **Production Management (12 Modules)**: From Sales Order handover to Work Order Planning, BOM calculations, Scheduling, Company Store Requisitions, Stock-checked Material Issue, Shopfloor Execution, Daily/Weekly Progress Updates, Assembly Completion, Multilateral QA Testing, Closed-Loop Rework, and Serialized Finished Goods Warehouse admission.
4. **Logistics & Delivery Management (9 Modules)**: From Delivery Planning and Company Fleet/Courier allocation to Warehouse Dispatch Gate passes, Serial Number reservation, Real-time Milestone Tracking, Proof of Delivery (POD) partial fulfillment, On-site Installation scheduling, Mandatory 7-Point Commissioning Checklist, and SLA analytics.
5. **Employee Management & Role-Based Access Control (6 Modules)**: Comprehensive workforce directory, department administration, 13-module granular permission matrix (`Access`, `View`, `Add`, `Edit`, `Delete`, `Export`, `Approve`), protected Super Admin authority, active session management with multi-account simulation, and an immutable security audit trail.

---

## 2. Technology Stack & Architecture
- **Frontend**: React 19 + Vite, Pure CSS custom design system (`index.css`), Lucide React icons, Responsive drawer & tree-branch navigation.
- **Backend**: Node.js + Express.js REST API with modular controllers, Mongoose ODM, and CORS support.
- **Database**: MongoDB running locally on port 27017 (`cryo_scm`).
- **Language**: Vanilla JavaScript (ES6+ / JSX). TypeScript is strictly forbidden per project constraints.
- **Safety**: Code is maintained locally without `git push`.

---

## 3. Module Index (41 Total Modules)

### Part A: Supply Chain Management (10 Modules)
1. `Raw Material Master` - Raw material SKU registration, units, and stock thresholds.
2. `Suppliers` - Vendor directory, contact particulars, GSTIN, and payment terms.
3. `Supplier Material Link` - Vendor-to-material pricing contracts and lead times. Duplicate prevention.
4. `Purchase Orders (PO)` - Multi-line purchasing with tax calculations and approval flows.
5. `GRN – Goods Receipt` - Inward delivery receipt with automatic quarantine routing (`QC Pending`).
6. `QC Tests` - Quality inspection. Passed quantity credits inventory; rejected quantity queues to returns.
7. `Raw Material Inventory` - Approved stock levels and chronological Stock Ledger audit trail.
8. `Material Issue to Production` - Regulated issuance checked against available approved stock.
9. `Returns to Supplier` - Rejection return management with debit note generation.
10. `Inventory Report` - Category valuation, dead stock alerts, and low stock warnings.

### Part B: Sales Management CRM (10 Modules)
1. `Dashboard` - Executive pipeline KPIs, recent enquiries, and scheduled follow-ups.
2. `Customer Enquiries` - Prospect demand capture with 1-click Convert to Lead.
3. `Customers & Leads` - Account directory and opportunity stages (`Qualified`, `Won`, `Lost`).
4. `Follow-ups` - Communication logging for phone, email, and on-site meetings.
5. `Quotations` - Multi-row proposals with tax/discount math and V1/V2/V3 negotiation versioning.
6. `Proforma Invoices (PI)` - Advance payment invoices with bank transfer particulars.
7. `Customer Purchase Orders` - Inward audit of customer-signed POs and commercial verification.
8. `Payments` - Advance and balance collection with UTR tracking and PI deduction.
9. `Sales Orders (SO)` - Confirmed executable orders with 1-click dispatch to Production.
10. `Sales Reports` - Analytical reports with revenue charts and CSV export.

### Part C: Production Management (12 Modules)
1. `Dashboard` - Overall manufacturing KPIs (Work Orders, Running, Material Pending, QA Pending, Rework, Completed).
2. `Production Planning` - Convert confirmed Sales Orders into Work Orders (`WO-001`).
3. `BOM – Bill of Materials` - Unit component recipes multiplied by order volume. Locked per work order.
4. `Production Schedule` - Duration calculation, shift allocation, and sub-assembly milestone routing.
5. `Material Requests` - Requisitions to Company Store pulling live available SCM inventory.
6. `Material Issue` - Store verifies physical stock, issues batch numbers, and decrements SCM inventory.
7. `Production Execution` - Shopfloor line start, pause, resume, and hold controls.
8. `Production Updates` - Daily and weekly shift completion logs with cumulative progress calculation.
9. `Production Completion` - Manufacturing sign-off and transfer to QA department.
10. `Quality Assurance (QA)` - Thermal (<55°C), sensor, motor, and electrical testing. Pass -> FG, Fail -> Rework.
11. `Rework / Rebuild` - Repair bay for defective units with mandatory Re-QA validation before admission to stock.
12. `Finished Goods` - Serialized QA-approved warehouse inventory ready for customer dispatch.

### Part D: Logistics & Delivery Management (9 Modules)
1. `Dashboard` - Outbound fulfillment KPIs (Pending, In Transit, Delivered, Installation Pending).
2. `Delivery Planning` - Schedule deliveries against confirmed Sales Orders and available Finished Goods.
3. `Vehicle & Courier` - Fleet management (vehicles + drivers) and third-party courier partner management.
4. `Dispatch` - Warehouse exit gate slip, physical serial number allocation, decrements FG warehouse inventory.
5. `Delivery Tracking` - Live GPS/checkpoint milestone recording with transit delay reason tracking.
6. `Delivery Confirmation` - Proof of Delivery (POD) capturing customer receipt signature and partial deliveries.
7. `Installation` - On-site deployment scheduling, tool provisioning, and engineer assignment.
8. `Installation Completion` - Mandatory 7-point technical verification checklist and customer sign-off certificate.
9. `Logistics Reports` - End-to-end delivery metrics, SLA on-time rate, transit delay analysis, and CSV export.

### Part E: Employee Management & RBAC (6 Modules)
1. `Dashboard` - Workforce overview, active/inactive headcount, department breakdown, and recent security logs.
2. `Employees` - Central staff directory, profile viewer, designation, reporting manager, and password reset modal.
3. `Roles & Permissions` - 13-module permission matrix with 7 granular capability checkboxes, mobile-responsive sticky columns, and custom role builder.
4. `Departments` - Company departmental hierarchy, descriptions, and designated heads of department.
5. `Employee Login` - Active session status, credential sign-in, and instant role switcher simulation across 5 demo profiles.
6. `Employee Reports` - Workforce roster, security audit trail, department allocation charts, and CSV data export.
