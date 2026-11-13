# Project Overview — Cryo 2.0 Enterprise Sales & Supply Chain Management

## Overview
A high-performance, full-stack MERN (MongoDB, Express, React, Node.js) web application engineered in pure JavaScript (no TypeScript) with an ultra-modern precision dark industrial design. The system features a flat 10-menu Sales Management lifecycle from inbound prospect enquiry to quotation revision, customer purchase order verification, payment tracking, and production sales order release.

## Technology Stack
- **Frontend**: React (Vite), Pure CSS custom modern dark design system, Lucide React icons, Responsive Layout (Mobile Drawer + Desktop Sidebar).
- **Backend**: Node.js, Express.js REST API with modular controllers, Mongoose ODM, and CORS support.
- **Database**: MongoDB (Server 8.0) running locally with schemas for all 10 sales modules.
- **Language**: Vanilla JavaScript (ES6+ / JSX). TypeScript is deliberately excluded per project specification.

## Core Sales Management Modules (10 Flat Menus)
1. `Dashboard` - Executive KPI summary cards (Total Enquiries, Pending Quotes, Today's Follow-ups, Active Orders, Won Deals, Lost Deals), Recent Enquiries table, and Upcoming Follow-ups feed.
2. `Customer Enquiries` - Inbound demand capture, company particulars, technical specs, source, and 1-click Convert to Lead.
3. `Customers & Leads` - Centralized account directory with lead opportunity tracking (`New`, `Qualified`, `Won`, `Lost`) preventing duplicate client entries.
4. `Follow-ups` - Communication log for calls, meetings, and emails with next action date and completion toggles.
5. `Quotations` - Multi-line commercial proposals with automatic tax/discount calculations and V1/V2/V3 negotiation versioning. Customer acceptance automatically marks Lead as Won; rejection marks as Lost.
6. `Proforma Invoices (PI)` - Official pre-invoices generated from accepted quotes with advance percentage, bank remittance info, and balance due.
7. `Customer Purchase Orders` - Inward audit of customer-signed POs with document attachment and commercial verification before production release.
8. `Payments` - Advance, partial, and final payment recording with UTR reference, proof attachment, and automatic PI balance deduction.
9. `Sales Orders (SO)` - Executable factory sales orders linking verified customer POs, commercial quotes, and 1-click dispatch to shopfloor production.
10. `Sales Reports` - 6 tabbed analytical reports (Enquiry Report, Lead Report, Quotation Report, Sales Order Report, Customer Report, Payment Report) with CSV export and print options.
