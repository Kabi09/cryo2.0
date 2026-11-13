# Project AI Instructions

## 1. Core Principles
- Language: JavaScript (ES6+), JSX for React. Do not use TypeScript as per project constraint.
- Stack: MERN (MongoDB, Express, React, Node.js).
- Modern, clean, responsive UI supporting all devices (mobile drawer, desktop sidebar, responsive tables, cards, modal popups).
- Reusable component architecture (common UI elements: Modal, Drawer, DataTable, KPI Cards, StatusBadges, Form fields).
- Do not push code to remote Git repository (`git push` is strictly forbidden).

## 2. Supply Chain Workflow Rules
1. **Raw Material Inventory Integrity**:
   - Stock cannot be added manually via an arbitrary "Add Stock" button.
   - Stock increases ONLY when Goods Receipt Note (GRN) items pass Quality Control (QC Pass).
   - Stock decreases ONLY when Material is issued to Production or returned to Supplier.
2. **GRN Inward**:
   - Creating a GRN puts received items into `QC Pending` quarantine status, NOT direct inventory.
3. **Quality Inspection (QC)**:
   - Accepted quantity moves to Available Inventory.
   - Rejected quantity queues into Returns to Supplier.
4. **Material Issue**:
   - Cannot issue more than the current available approved stock.
5. **Supplier Material Link**:
   - Must prevent duplicate mapping of the same supplier to the same material.

