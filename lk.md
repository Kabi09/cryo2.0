# Project Documentation

## Project Overview
- **Project purpose**: Cryo Enterprise 2.0 is a comprehensive, production-grade manufacturing ERP and CRM platform. It provides an end-to-end operational pipeline across five core enterprise divisions: Supply Chain Management (SCM), Sales CRM, Production Management, Logistics & Delivery Fulfillment, and Human Resources & Role-Based Access Control (RBAC).
- **Technology stack**:
  - **Frontend**: React 19, Vite, Lucide React icons, Native Custom CSS Design Tokens (`index.css`), Canvas Confetti. Strictly vanilla JavaScript / JSX (**No TypeScript**, **No Tailwind**, **No Material UI**).
  - **Backend**: Node.js, Express.js REST API with CORS, Mongoose ODM, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Dotenv.
  - **Database**: MongoDB running on `mongodb://127.0.0.1:27017/cryo_scm`.
- **Main architecture**:
  - Full-stack decoupled architecture.
  - 5-Tier expandable tree-branch sidebar navigation (`└→`) featuring SVG bezier curved connectors.
  - Single-page application architecture orchestrated through `client/src/App.jsx` with centralized reactive state synchronization (`loadAllData()`).
  - Modular REST API endpoints mounted under `/api`, `/api/sales`, `/api/production`, `/api/logistics`, and `/api/employees`.
- **Important conventions**:
  - **NO TYPESCRIPT**: All files must strictly remain `.js` or `.jsx`.
  - **NO GIT PUSH**: All commits and working changes are retained locally on the machine.
  - **ENTERPRISE LIGHT THEME**: Clean modern white and light-grey theme (`--bg-app: #F5F7FA`, `--bg-surface: #FFFFFF`, `--bg-card: #FFFFFF`, `--primary: #2451C5`, `--text-primary: #172033`, `--text-secondary: #64748B`, `--border-subtle: #E5EAF1`, `--success: #16A36A`, `--warning: #F59E0B`, `--danger: #EF4444`).
  - **SINGLE ACTION BUTTON**: Exactly one primary action button per data table toolbar (`+ [Action]`) to eliminate UI clutter.
  - **WIDE MODALS**: All form dialogs utilize wide `size="lg"` dialog layouts with high contrast inputs and clean light date-picker color schemes.

### 2026-11-16 (Simplified ERP Production & Supply Chain Management Workflow)
- **User Request**: "ERP – Simplify Production & Supply Chain Workflow: Fix and simplify existing Production and SCM workflows without rebuilding. Phase 1: Sales Order Confirmed -> Production Order Created -> Planning -> BOM -> Material Request Sent to Store. Phase 2: Material Request Received -> Stock Availability Check (Case A: Fully Available -> Issue 100 -> Fully Issued; Case B: Partially Available -> Issue 60 -> Partially Issued -> Remaining: 40; Case C: Not Available -> Out of Stock -> Proceed to purchase). Phase 3: Shortage -> Purchase Request -> Supplier / PO -> GRN -> Inventory Updated -> Remaining Material Issued. Phase 4: Material Issued -> Production Plan -> Daily Production Process -> Production Completed. Fix Existing BOM Pending Bug: SCM already issued materials but Production still shows BOM Pending. Keep only 4 essential Production tabs (Production Orders, Planning & BOM, Daily Production, Completed Production) and 4 essential Store tabs (Material Requests, Stock & Material Issue, Purchase & GRN, Issue History). Single update to Finished Goods inventory and Sales Order synchronization."
- **Reason**: Factory workers and operators require a simple, intuitive, non-technical ERP interface with clear real-time statuses and seamless stage handovers without disconnected models or false "BOM Pending" indicators.
- **Root Cause of BOM Pending Bug**:
  - Supply Chain Store issued materials via `scmController.createMaterialIssue` (`/api/material-issues`), which wrote exclusively to `MaterialIssue` and did not update `MaterialRequest` or `WorkOrder`, nor write to `ProductionIssue` (`/api/production/material-issues`).
  - Production components checked `productionMaterialIssues`, so after SCM issued materials, Production had zero issue records and displayed "Store Issue Pending" or "Request BOM Required".
  - BOM status was not separated from Material Request and Material Issue status.
- **What was changed**:
  1. **Backend Synchronization & Dual-Model Mirroring**:
     - `scmController.createMaterialIssue`:
       - Synchronizes `MaterialRequest`: Updates `alreadyIssuedQty`, `remainingQty`, and sets status to `Fully Issued` or `Partially Issued`.
       - Synchronizes `WorkOrder`: Updates status to `Ready to Start` when fully issued, or `Partially Issued`.
       - Mirrors issue into `ProductionIssue` collection so all Production endpoints immediately receive the issue records.
     - `productionController.createMaterialIssue`:
       - Synchronizes `MaterialRequest` and `WorkOrder`.
       - Mirrors issue into `MaterialIssue` (SCM collection).
     - `productionController.createProductionUpdate`:
       - Supports daily progress logging (`supervisorName`, `workCompletedDescription`).
       - When completed (`isCompleted: true` or `totalCompleted >= planned`): Marks `WorkOrder.status = 'Completed'`, updates `SalesOrder.productionStatus = 'Completed'`, and creates `FinishedGood` inventory **exactly once**.
       - While in progress: Sets `WorkOrder.status = 'Running'` and `SalesOrder.productionStatus = 'In Assembly'`.
     - `scmController.createGRN`:
       - When GRN is directly accepted (`status: 'Accepted'`), immediately credits `Inventory.availableStock` and `Material.currentStock` and logs to `StockLedger`, enabling instant replenishment and issue of remaining materials.
     - Updated Mongoose Schema Enums in `WorkOrder.js`, `MaterialRequest.js`, `ProductionIssue.js`, `GRN.js`, and `StockLedger.js` to support all required operational states.
  2. **Simplified 4-Tab Production Management (`ProductionOrdersPage.jsx`)**:
     - **Tab 1: Production Orders**:
       - View all production orders with clear status breakdown (Planning, BOM Verified, Materials Readiness, Production Status) and dynamic next action.
       - **Simple Production Order Form**: Sales Order (dropdown), Product (auto-filled), Quantity (auto-filled/editable), Planned Start/End Dates, BOM (select dropdown), Remarks. Actions: **Save Plan | Request Materials**.
     - **Tab 2: Planning & BOM**:
       - Production Plan inspection, BOM recipe component verification, store inventory check with shortage detection.
       - 1-click **Send Material Request to Store** button.
     - **Tab 3: Daily Production**:
       - Active order selector, **Daily Production Form** (Order select, Production Date, Planned Qty, Previously Completed Qty, Completed Today, Rejected Today, Remaining Qty, Remarks).
       - Actions: **Save Daily Progress | Complete Production**.
       - Daily Shift Logs table.
     - **Tab 4: Completed Production**:
       - Archive of all completed production orders, finished goods serial and batch numbers, and warehouse stock status.
  3. **Simplified 4-Tab Supply Chain / Store (`MaterialRequestsPage.jsx`)**:
     - **Tab 1: Material Requests**: Requisitions received from Production with stock check (Case A: Fully In Stock, Case B: Partially In Stock, Case C: Out of Stock).
     - **Tab 2: Stock & Material Issue**: **Simple Material Issue Form** (Request ID, Production Order, Material, Required Qty, Available Stock, Already Issued, Issue Qty, Balance Qty) with stock limit validation warnings. Handles Case A, B, and C.
     - **Tab 3: Purchase & GRN**: Shortages table with 1-click **+ Create PO ➔**, Purchase Orders list, and Inward GRN receipt with direct acceptance to credit Store stock.
     - **Tab 4: Issue History**: Verified ledger of all material issue slips.
  4. **Sidebar & Pipeline Stepper Alignment**:
     - `Sidebar.jsx`: Production menu updated to `01 Production Orders`, `02 Planning & BOM`, `03 Daily Production`, `04 Completed Production`, and `05 Dashboard`. SCM item updated to `07 Store & Material Issue`.
     - `ProductionPipelineStepper.jsx`: Mapped to the streamlined stages.
- **Verification**:
  - Full end-to-end node integration test script passed 100% across all 9 workflow stages:
    1. Sales Order -> Production Order Created -> Planned.
    2. BOM Verified.
    3. Material Request Sent to Store -> Pending.
    4. SCM Partial Issue (Case B) -> Material Request & Work Order updated to `Partially Issued`.
    5. Shortage PO created -> GRN accepted -> Store inventory updated to 60 units.
    6. Issue Remaining (Case A) -> Material Request updated to `Fully Issued` and Work Order to `Ready to Start` (ZERO BOM Pending!).
    7. Daily Production progress logged -> Work Order updated to `Running` and Sales Order to `In Assembly`.
    8. Production completed -> Work Order updated to `Completed` and Sales Order to `Completed`.
    9. Finished Goods inventory record created **exactly once**.
  - `npm --prefix client run build`: Built in 878ms with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero `git push` executed (all changes kept locally).

---

## Project Structure
- **Important folders**:
  - `client/`: React 19 Vite application frontend.
    - `client/src/components/common/`: Shared UI components (`Sidebar.jsx`, `Header.jsx`, `DataTable.jsx`, `Modal.jsx`, `KpiCard.jsx`, `StatusBadge.jsx`).
    - `client/src/components/modules/`: Supply Chain Management (SCM) modules (10 modules).
    - `client/src/components/sales/`: Sales Management & CRM modules (10 modules).
    - `client/src/components/production/`: Production Management & Assembly modules (12 modules).
    - `client/src/components/logistics/`: Logistics & Field Service modules (9 modules).
    - `client/src/components/employee/`: Human Resources, RBAC & Security modules (6 modules).
    - `client/src/services/`: Client-side REST API communication bridge (`api.js`).
  - `server/`: Express REST API backend.
    - `server/config/`: Database connection and MongoDB runtime event handlers (`db.js`).
    - `server/controllers/`: Business logic handlers (`scmController.js`, `salesController.js`, `productionController.js`, `logisticsController.js`, `employeeController.js`).
    - `server/middleware/`: Security middleware (`authMiddleware.js`).
    - `server/models/`: Mongoose schemas (SCM models, Sales models, Production models, Logistics models, Department, Role, Employee, AuditLog).
    - `server/routes/`: Route declarations (`scmRoutes.js`, `salesRoutes.js`, `productionRoutes.js`, `logisticsRoutes.js`, `employeeRoutes.js`).
    - `server/seed/`: Data seeding automation scripts (`seedData.js`, `salesSeed.js`, `productionSeed.js`, `logisticsSeed.js`, `employeeSeed.js`).
  - `docs/`: Comprehensive engineering documentation (`workflows.md`, `api-documentation.md`, `business-logic.md`, `task-tracker.md`, `reusable-components.md`).
- **Important files**:
  - `lk.md`: The single source of truth for project changes, logic, decisions, and progress tracking.
  - `project.md`: High-level system architecture and module breakdown.
  - `README.md`: Repository overview and quick start guide.
  - `server/server.js`: Express server initialization, middleware setup, health endpoint, and route registration.
  - `client/src/App.jsx`: Master root React component orchestrating global state and 47 module renders.
  - `client/src/index.css`: Global obsidian dark theme CSS variable definitions and responsive rules.

### 2026-11-16 (Simplified ERP Production & Supply Chain Management Workflow)
- **User Request**: "ERP – Simplify Production & Supply Chain Workflow: Fix and simplify existing Production and SCM workflows without rebuilding. Phase 1: Sales Order Confirmed -> Production Order Created -> Planning -> BOM -> Material Request Sent to Store. Phase 2: Material Request Received -> Stock Availability Check (Case A: Fully Available -> Issue 100 -> Fully Issued; Case B: Partially Available -> Issue 60 -> Partially Issued -> Remaining: 40; Case C: Not Available -> Out of Stock -> Proceed to purchase). Phase 3: Shortage -> Purchase Request -> Supplier / PO -> GRN -> Inventory Updated -> Remaining Material Issued. Phase 4: Material Issued -> Production Plan -> Daily Production Process -> Production Completed. Fix Existing BOM Pending Bug: SCM already issued materials but Production still shows BOM Pending. Keep only 4 essential Production tabs (Production Orders, Planning & BOM, Daily Production, Completed Production) and 4 essential Store tabs (Material Requests, Stock & Material Issue, Purchase & GRN, Issue History). Single update to Finished Goods inventory and Sales Order synchronization."
- **Reason**: Factory workers and operators require a simple, intuitive, non-technical ERP interface with clear real-time statuses and seamless stage handovers without disconnected models or false "BOM Pending" indicators.
- **Root Cause of BOM Pending Bug**:
  - Supply Chain Store issued materials via `scmController.createMaterialIssue` (`/api/material-issues`), which wrote exclusively to `MaterialIssue` and did not update `MaterialRequest` or `WorkOrder`, nor write to `ProductionIssue` (`/api/production/material-issues`).
  - Production components checked `productionMaterialIssues`, so after SCM issued materials, Production had zero issue records and displayed "Store Issue Pending" or "Request BOM Required".
  - BOM status was not separated from Material Request and Material Issue status.
- **What was changed**:
  1. **Backend Synchronization & Dual-Model Mirroring**:
     - `scmController.createMaterialIssue`:
       - Synchronizes `MaterialRequest`: Updates `alreadyIssuedQty`, `remainingQty`, and sets status to `Fully Issued` or `Partially Issued`.
       - Synchronizes `WorkOrder`: Updates status to `Ready to Start` when fully issued, or `Partially Issued`.
       - Mirrors issue into `ProductionIssue` collection so all Production endpoints immediately receive the issue records.
     - `productionController.createMaterialIssue`:
       - Synchronizes `MaterialRequest` and `WorkOrder`.
       - Mirrors issue into `MaterialIssue` (SCM collection).
     - `productionController.createProductionUpdate`:
       - Supports daily progress logging (`supervisorName`, `workCompletedDescription`).
       - When completed (`isCompleted: true` or `totalCompleted >= planned`): Marks `WorkOrder.status = 'Completed'`, updates `SalesOrder.productionStatus = 'Completed'`, and creates `FinishedGood` inventory **exactly once**.
       - While in progress: Sets `WorkOrder.status = 'Running'` and `SalesOrder.productionStatus = 'In Assembly'`.
     - `scmController.createGRN`:
       - When GRN is directly accepted (`status: 'Accepted'`), immediately credits `Inventory.availableStock` and `Material.currentStock` and logs to `StockLedger`, enabling instant replenishment and issue of remaining materials.
     - Updated Mongoose Schema Enums in `WorkOrder.js`, `MaterialRequest.js`, `ProductionIssue.js`, `GRN.js`, and `StockLedger.js` to support all required operational states.
  2. **Simplified 4-Tab Production Management (`ProductionOrdersPage.jsx`)**:
     - **Tab 1: Production Orders**:
       - View all production orders with clear status breakdown (Planning, BOM Verified, Materials Readiness, Production Status) and dynamic next action.
       - **Simple Production Order Form**: Sales Order (dropdown), Product (auto-filled), Quantity (auto-filled/editable), Planned Start/End Dates, BOM (select dropdown), Remarks. Actions: **Save Plan | Request Materials**.
     - **Tab 2: Planning & BOM**:
       - Production Plan inspection, BOM recipe component verification, store inventory check with shortage detection.
       - 1-click **Send Material Request to Store** button.
     - **Tab 3: Daily Production**:
       - Active order selector, **Daily Production Form** (Order select, Production Date, Planned Qty, Previously Completed Qty, Completed Today, Rejected Today, Remaining Qty, Remarks).
       - Actions: **Save Daily Progress | Complete Production**.
       - Daily Shift Logs table.
     - **Tab 4: Completed Production**:
       - Archive of all completed production orders, finished goods serial and batch numbers, and warehouse stock status.
  3. **Simplified 4-Tab Supply Chain / Store (`MaterialRequestsPage.jsx`)**:
     - **Tab 1: Material Requests**: Requisitions received from Production with stock check (Case A: Fully In Stock, Case B: Partially In Stock, Case C: Out of Stock).
     - **Tab 2: Stock & Material Issue**: **Simple Material Issue Form** (Request ID, Production Order, Material, Required Qty, Available Stock, Already Issued, Issue Qty, Balance Qty) with stock limit validation warnings. Handles Case A, B, and C.
     - **Tab 3: Purchase & GRN**: Shortages table with 1-click **+ Create PO ➔**, Purchase Orders list, and Inward GRN receipt with direct acceptance to credit Store stock.
     - **Tab 4: Issue History**: Verified ledger of all material issue slips.
  4. **Sidebar & Pipeline Stepper Alignment**:
     - `Sidebar.jsx`: Production menu updated to `01 Production Orders`, `02 Planning & BOM`, `03 Daily Production`, `04 Completed Production`, and `05 Dashboard`. SCM item updated to `07 Store & Material Issue`.
     - `ProductionPipelineStepper.jsx`: Mapped to the streamlined stages.
- **Verification**:
  - Full end-to-end node integration test script passed 100% across all 9 workflow stages:
    1. Sales Order -> Production Order Created -> Planned.
    2. BOM Verified.
    3. Material Request Sent to Store -> Pending.
    4. SCM Partial Issue (Case B) -> Material Request & Work Order updated to `Partially Issued`.
    5. Shortage PO created -> GRN accepted -> Store inventory updated to 60 units.
    6. Issue Remaining (Case A) -> Material Request updated to `Fully Issued` and Work Order to `Ready to Start` (ZERO BOM Pending!).
    7. Daily Production progress logged -> Work Order updated to `Running` and Sales Order to `In Assembly`.
    8. Production completed -> Work Order updated to `Completed` and Sales Order to `Completed`.
    9. Finished Goods inventory record created **exactly once**.
  - `npm --prefix client run build`: Built in 878ms with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero `git push` executed (all changes kept locally).

---

## UI & Styling Rules
- **Pure CSS Tokens**: CSS custom properties defined in `client/src/index.css` drive colors, borders, elevation, and typography.
- **No Tailwind / No MUI**: Do not use Tailwind utility classes or Material UI components. Use Cryo native classes (`module-container`, `kpi-grid`, `btn`, `btn-primary`, `btn-secondary`, `form-grid`, `form-input`, `data-table`, `tab-switcher`, `tab-btn`, `subtable-box`).
- **Icons**: Lucide React (`lucide-react`) provides consistent SVG iconography.
- **Tree Branch Navigation**: Custom SVG connectors (`TreeBranchArrow`) render vertical trunks with smooth cubic bezier curves (`V 13 C 3 18, 6 21, 11 21 H 17`) and directional arrows (`└→`).
- **Responsive Approach**:
  - Flexbox and CSS Grid layout with mobile collapse breakpoints (`@media (max-width: 768px)`).
  - Left navigation drawers for mobile (`isOpen` / `onClose`).
  - Sticky table headers and frozen sticky first column for wide permission matrices (`position: sticky`, `left: 0`, `z-index: 2`).

### 2026-11-16 (Simplified ERP Production & Supply Chain Management Workflow)
- **User Request**: "ERP – Simplify Production & Supply Chain Workflow: Fix and simplify existing Production and SCM workflows without rebuilding. Phase 1: Sales Order Confirmed -> Production Order Created -> Planning -> BOM -> Material Request Sent to Store. Phase 2: Material Request Received -> Stock Availability Check (Case A: Fully Available -> Issue 100 -> Fully Issued; Case B: Partially Available -> Issue 60 -> Partially Issued -> Remaining: 40; Case C: Not Available -> Out of Stock -> Proceed to purchase). Phase 3: Shortage -> Purchase Request -> Supplier / PO -> GRN -> Inventory Updated -> Remaining Material Issued. Phase 4: Material Issued -> Production Plan -> Daily Production Process -> Production Completed. Fix Existing BOM Pending Bug: SCM already issued materials but Production still shows BOM Pending. Keep only 4 essential Production tabs (Production Orders, Planning & BOM, Daily Production, Completed Production) and 4 essential Store tabs (Material Requests, Stock & Material Issue, Purchase & GRN, Issue History). Single update to Finished Goods inventory and Sales Order synchronization."
- **Reason**: Factory workers and operators require a simple, intuitive, non-technical ERP interface with clear real-time statuses and seamless stage handovers without disconnected models or false "BOM Pending" indicators.
- **Root Cause of BOM Pending Bug**:
  - Supply Chain Store issued materials via `scmController.createMaterialIssue` (`/api/material-issues`), which wrote exclusively to `MaterialIssue` and did not update `MaterialRequest` or `WorkOrder`, nor write to `ProductionIssue` (`/api/production/material-issues`).
  - Production components checked `productionMaterialIssues`, so after SCM issued materials, Production had zero issue records and displayed "Store Issue Pending" or "Request BOM Required".
  - BOM status was not separated from Material Request and Material Issue status.
- **What was changed**:
  1. **Backend Synchronization & Dual-Model Mirroring**:
     - `scmController.createMaterialIssue`:
       - Synchronizes `MaterialRequest`: Updates `alreadyIssuedQty`, `remainingQty`, and sets status to `Fully Issued` or `Partially Issued`.
       - Synchronizes `WorkOrder`: Updates status to `Ready to Start` when fully issued, or `Partially Issued`.
       - Mirrors issue into `ProductionIssue` collection so all Production endpoints immediately receive the issue records.
     - `productionController.createMaterialIssue`:
       - Synchronizes `MaterialRequest` and `WorkOrder`.
       - Mirrors issue into `MaterialIssue` (SCM collection).
     - `productionController.createProductionUpdate`:
       - Supports daily progress logging (`supervisorName`, `workCompletedDescription`).
       - When completed (`isCompleted: true` or `totalCompleted >= planned`): Marks `WorkOrder.status = 'Completed'`, updates `SalesOrder.productionStatus = 'Completed'`, and creates `FinishedGood` inventory **exactly once**.
       - While in progress: Sets `WorkOrder.status = 'Running'` and `SalesOrder.productionStatus = 'In Assembly'`.
     - `scmController.createGRN`:
       - When GRN is directly accepted (`status: 'Accepted'`), immediately credits `Inventory.availableStock` and `Material.currentStock` and logs to `StockLedger`, enabling instant replenishment and issue of remaining materials.
     - Updated Mongoose Schema Enums in `WorkOrder.js`, `MaterialRequest.js`, `ProductionIssue.js`, `GRN.js`, and `StockLedger.js` to support all required operational states.
  2. **Simplified 4-Tab Production Management (`ProductionOrdersPage.jsx`)**:
     - **Tab 1: Production Orders**:
       - View all production orders with clear status breakdown (Planning, BOM Verified, Materials Readiness, Production Status) and dynamic next action.
       - **Simple Production Order Form**: Sales Order (dropdown), Product (auto-filled), Quantity (auto-filled/editable), Planned Start/End Dates, BOM (select dropdown), Remarks. Actions: **Save Plan | Request Materials**.
     - **Tab 2: Planning & BOM**:
       - Production Plan inspection, BOM recipe component verification, store inventory check with shortage detection.
       - 1-click **Send Material Request to Store** button.
     - **Tab 3: Daily Production**:
       - Active order selector, **Daily Production Form** (Order select, Production Date, Planned Qty, Previously Completed Qty, Completed Today, Rejected Today, Remaining Qty, Remarks).
       - Actions: **Save Daily Progress | Complete Production**.
       - Daily Shift Logs table.
     - **Tab 4: Completed Production**:
       - Archive of all completed production orders, finished goods serial and batch numbers, and warehouse stock status.
  3. **Simplified 4-Tab Supply Chain / Store (`MaterialRequestsPage.jsx`)**:
     - **Tab 1: Material Requests**: Requisitions received from Production with stock check (Case A: Fully In Stock, Case B: Partially In Stock, Case C: Out of Stock).
     - **Tab 2: Stock & Material Issue**: **Simple Material Issue Form** (Request ID, Production Order, Material, Required Qty, Available Stock, Already Issued, Issue Qty, Balance Qty) with stock limit validation warnings. Handles Case A, B, and C.
     - **Tab 3: Purchase & GRN**: Shortages table with 1-click **+ Create PO ➔**, Purchase Orders list, and Inward GRN receipt with direct acceptance to credit Store stock.
     - **Tab 4: Issue History**: Verified ledger of all material issue slips.
  4. **Sidebar & Pipeline Stepper Alignment**:
     - `Sidebar.jsx`: Production menu updated to `01 Production Orders`, `02 Planning & BOM`, `03 Daily Production`, `04 Completed Production`, and `05 Dashboard`. SCM item updated to `07 Store & Material Issue`.
     - `ProductionPipelineStepper.jsx`: Mapped to the streamlined stages.
- **Verification**:
  - Full end-to-end node integration test script passed 100% across all 9 workflow stages:
    1. Sales Order -> Production Order Created -> Planned.
    2. BOM Verified.
    3. Material Request Sent to Store -> Pending.
    4. SCM Partial Issue (Case B) -> Material Request & Work Order updated to `Partially Issued`.
    5. Shortage PO created -> GRN accepted -> Store inventory updated to 60 units.
    6. Issue Remaining (Case A) -> Material Request updated to `Fully Issued` and Work Order to `Ready to Start` (ZERO BOM Pending!).
    7. Daily Production progress logged -> Work Order updated to `Running` and Sales Order to `In Assembly`.
    8. Production completed -> Work Order updated to `Completed` and Sales Order to `Completed`.
    9. Finished Goods inventory record created **exactly once**.
  - `npm --prefix client run build`: Built in 878ms with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero `git push` executed (all changes kept locally).

---

## Application Logic
- **Authentication**:
  - Stateless JWT token authentication (`Authorization: Bearer <token>`).
  - Passwords hashed via `bcryptjs` with salt rounds = 10.
  - Instant Role Switcher simulation supporting 5 demo accounts (`superadmin`, `admin.operations`, `sales.rajesh`, `prod.suresh`, `log.dinesh`).
  - Polymorphic credential processing: `handleLogin` supports both structured objects `{ username, password }` and sequential arguments `(username, password)`.
- **State Management**:
  - Centralized React `useState` & `useCallback` in `client/src/App.jsx`.
  - Automatic cross-module reload via `loadAllData()` upon any mutation.
- **API Handling**:
  - `client/src/services/api.js` provides centralized REST wrapper with unified `handleResponse`.
  - Graceful JSON parse error capture prevents unhandled syntax exceptions.
- **Business Logic**:
  - **Quarantine Quality Gate**: Inward GRN items default to `QC Pending`. Inventory balances only credit passed inspection quantities.
  - **Inventory Conservation**: Materials cannot be issued beyond verified warehouse physical stock balances.
  - **Installation Quality Gate**: All 7 commissioning points must pass or the report status forces to `Failed - Retest Required`.
  - **Super Admin Inviolability**: Super Admin permissions cannot be degraded, modified, or deactivated.
  - **Cascading RBAC**: Disabling `access` on a module clears and disables all 6 operational action flags (`view`, `add`, `edit`, `delete`, `export`, `approve`).

### 2026-11-16 (Simplified ERP Production & Supply Chain Management Workflow)
- **User Request**: "ERP – Simplify Production & Supply Chain Workflow: Fix and simplify existing Production and SCM workflows without rebuilding. Phase 1: Sales Order Confirmed -> Production Order Created -> Planning -> BOM -> Material Request Sent to Store. Phase 2: Material Request Received -> Stock Availability Check (Case A: Fully Available -> Issue 100 -> Fully Issued; Case B: Partially Available -> Issue 60 -> Partially Issued -> Remaining: 40; Case C: Not Available -> Out of Stock -> Proceed to purchase). Phase 3: Shortage -> Purchase Request -> Supplier / PO -> GRN -> Inventory Updated -> Remaining Material Issued. Phase 4: Material Issued -> Production Plan -> Daily Production Process -> Production Completed. Fix Existing BOM Pending Bug: SCM already issued materials but Production still shows BOM Pending. Keep only 4 essential Production tabs (Production Orders, Planning & BOM, Daily Production, Completed Production) and 4 essential Store tabs (Material Requests, Stock & Material Issue, Purchase & GRN, Issue History). Single update to Finished Goods inventory and Sales Order synchronization."
- **Reason**: Factory workers and operators require a simple, intuitive, non-technical ERP interface with clear real-time statuses and seamless stage handovers without disconnected models or false "BOM Pending" indicators.
- **Root Cause of BOM Pending Bug**:
  - Supply Chain Store issued materials via `scmController.createMaterialIssue` (`/api/material-issues`), which wrote exclusively to `MaterialIssue` and did not update `MaterialRequest` or `WorkOrder`, nor write to `ProductionIssue` (`/api/production/material-issues`).
  - Production components checked `productionMaterialIssues`, so after SCM issued materials, Production had zero issue records and displayed "Store Issue Pending" or "Request BOM Required".
  - BOM status was not separated from Material Request and Material Issue status.
- **What was changed**:
  1. **Backend Synchronization & Dual-Model Mirroring**:
     - `scmController.createMaterialIssue`:
       - Synchronizes `MaterialRequest`: Updates `alreadyIssuedQty`, `remainingQty`, and sets status to `Fully Issued` or `Partially Issued`.
       - Synchronizes `WorkOrder`: Updates status to `Ready to Start` when fully issued, or `Partially Issued`.
       - Mirrors issue into `ProductionIssue` collection so all Production endpoints immediately receive the issue records.
     - `productionController.createMaterialIssue`:
       - Synchronizes `MaterialRequest` and `WorkOrder`.
       - Mirrors issue into `MaterialIssue` (SCM collection).
     - `productionController.createProductionUpdate`:
       - Supports daily progress logging (`supervisorName`, `workCompletedDescription`).
       - When completed (`isCompleted: true` or `totalCompleted >= planned`): Marks `WorkOrder.status = 'Completed'`, updates `SalesOrder.productionStatus = 'Completed'`, and creates `FinishedGood` inventory **exactly once**.
       - While in progress: Sets `WorkOrder.status = 'Running'` and `SalesOrder.productionStatus = 'In Assembly'`.
     - `scmController.createGRN`:
       - When GRN is directly accepted (`status: 'Accepted'`), immediately credits `Inventory.availableStock` and `Material.currentStock` and logs to `StockLedger`, enabling instant replenishment and issue of remaining materials.
     - Updated Mongoose Schema Enums in `WorkOrder.js`, `MaterialRequest.js`, `ProductionIssue.js`, `GRN.js`, and `StockLedger.js` to support all required operational states.
  2. **Simplified 4-Tab Production Management (`ProductionOrdersPage.jsx`)**:
     - **Tab 1: Production Orders**:
       - View all production orders with clear status breakdown (Planning, BOM Verified, Materials Readiness, Production Status) and dynamic next action.
       - **Simple Production Order Form**: Sales Order (dropdown), Product (auto-filled), Quantity (auto-filled/editable), Planned Start/End Dates, BOM (select dropdown), Remarks. Actions: **Save Plan | Request Materials**.
     - **Tab 2: Planning & BOM**:
       - Production Plan inspection, BOM recipe component verification, store inventory check with shortage detection.
       - 1-click **Send Material Request to Store** button.
     - **Tab 3: Daily Production**:
       - Active order selector, **Daily Production Form** (Order select, Production Date, Planned Qty, Previously Completed Qty, Completed Today, Rejected Today, Remaining Qty, Remarks).
       - Actions: **Save Daily Progress | Complete Production**.
       - Daily Shift Logs table.
     - **Tab 4: Completed Production**:
       - Archive of all completed production orders, finished goods serial and batch numbers, and warehouse stock status.
  3. **Simplified 4-Tab Supply Chain / Store (`MaterialRequestsPage.jsx`)**:
     - **Tab 1: Material Requests**: Requisitions received from Production with stock check (Case A: Fully In Stock, Case B: Partially In Stock, Case C: Out of Stock).
     - **Tab 2: Stock & Material Issue**: **Simple Material Issue Form** (Request ID, Production Order, Material, Required Qty, Available Stock, Already Issued, Issue Qty, Balance Qty) with stock limit validation warnings. Handles Case A, B, and C.
     - **Tab 3: Purchase & GRN**: Shortages table with 1-click **+ Create PO ➔**, Purchase Orders list, and Inward GRN receipt with direct acceptance to credit Store stock.
     - **Tab 4: Issue History**: Verified ledger of all material issue slips.
  4. **Sidebar & Pipeline Stepper Alignment**:
     - `Sidebar.jsx`: Production menu updated to `01 Production Orders`, `02 Planning & BOM`, `03 Daily Production`, `04 Completed Production`, and `05 Dashboard`. SCM item updated to `07 Store & Material Issue`.
     - `ProductionPipelineStepper.jsx`: Mapped to the streamlined stages.
- **Verification**:
  - Full end-to-end node integration test script passed 100% across all 9 workflow stages:
    1. Sales Order -> Production Order Created -> Planned.
    2. BOM Verified.
    3. Material Request Sent to Store -> Pending.
    4. SCM Partial Issue (Case B) -> Material Request & Work Order updated to `Partially Issued`.
    5. Shortage PO created -> GRN accepted -> Store inventory updated to 60 units.
    6. Issue Remaining (Case A) -> Material Request updated to `Fully Issued` and Work Order to `Ready to Start` (ZERO BOM Pending!).
    7. Daily Production progress logged -> Work Order updated to `Running` and Sales Order to `In Assembly`.
    8. Production completed -> Work Order updated to `Completed` and Sales Order to `Completed`.
    9. Finished Goods inventory record created **exactly once**.
  - `npm --prefix client run build`: Built in 878ms with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero `git push` executed (all changes kept locally).

---

## API / Backend Integration
- **API Endpoints (47 Total Across 5 Suites + Health)**:
  - **Health**: `GET /api/health` -> Live server uptime, MongoDB status, host, port, DB name, and readyState.
  - **SCM (10)**: `/api/materials`, `/api/suppliers`, `/api/supplier-material-links`, `/api/purchase-orders`, `/api/grns`, `/api/qc-tests`, `/api/inventory`, `/api/material-issues`, `/api/supplier-returns`, `/api/reports`.
  - **Sales (10)**: `/api/sales/products`, `/api/sales/customers`, `/api/sales/enquiries`, `/api/sales/leads`, `/api/sales/follow-ups`, `/api/sales/quotations`, `/api/sales/proforma-invoices`, `/api/sales/customer-pos`, `/api/sales/payments`, `/api/sales/sales-orders`, `/api/sales/dashboard-summary`, `/api/sales/sales-reports`.
  - **Production (12)**: `/api/production/dashboard-summary`, `/api/production/work-orders`, `/api/production/boms`, `/api/production/schedules`, `/api/production/material-requests`, `/api/production/material-issues`, `/api/production/executions`, `/api/production/production-updates`, `/api/production/completions`, `/api/production/qa-tests`, `/api/production/rework-orders`, `/api/production/finished-goods`.
  - **Logistics (9)**: `/api/logistics/dashboard`, `/api/logistics/delivery-plans`, `/api/logistics/vehicles-couriers`, `/api/logistics/dispatches`, `/api/logistics/tracking`, `/api/logistics/confirmations`, `/api/logistics/installations`, `/api/logistics/installation-completions`, `/api/logistics/reports`.
  - **Employee & RBAC (6)**: `/api/employees/dashboard`, `/api/employees`, `/api/employees/roles`, `/api/employees/departments`, `/api/employees/login`, `/api/employees/reports`, `/api/employees/audit-logs`.
- **Payload Structures**: Standard JSON with `Content-Type: application/json`.
- **Response Handling**: Standard response envelope `{ success: true, count?: number, data: ... }`.

### 2026-11-16 (Simplified ERP Production & Supply Chain Management Workflow)
- **User Request**: "ERP – Simplify Production & Supply Chain Workflow: Fix and simplify existing Production and SCM workflows without rebuilding. Phase 1: Sales Order Confirmed -> Production Order Created -> Planning -> BOM -> Material Request Sent to Store. Phase 2: Material Request Received -> Stock Availability Check (Case A: Fully Available -> Issue 100 -> Fully Issued; Case B: Partially Available -> Issue 60 -> Partially Issued -> Remaining: 40; Case C: Not Available -> Out of Stock -> Proceed to purchase). Phase 3: Shortage -> Purchase Request -> Supplier / PO -> GRN -> Inventory Updated -> Remaining Material Issued. Phase 4: Material Issued -> Production Plan -> Daily Production Process -> Production Completed. Fix Existing BOM Pending Bug: SCM already issued materials but Production still shows BOM Pending. Keep only 4 essential Production tabs (Production Orders, Planning & BOM, Daily Production, Completed Production) and 4 essential Store tabs (Material Requests, Stock & Material Issue, Purchase & GRN, Issue History). Single update to Finished Goods inventory and Sales Order synchronization."
- **Reason**: Factory workers and operators require a simple, intuitive, non-technical ERP interface with clear real-time statuses and seamless stage handovers without disconnected models or false "BOM Pending" indicators.
- **Root Cause of BOM Pending Bug**:
  - Supply Chain Store issued materials via `scmController.createMaterialIssue` (`/api/material-issues`), which wrote exclusively to `MaterialIssue` and did not update `MaterialRequest` or `WorkOrder`, nor write to `ProductionIssue` (`/api/production/material-issues`).
  - Production components checked `productionMaterialIssues`, so after SCM issued materials, Production had zero issue records and displayed "Store Issue Pending" or "Request BOM Required".
  - BOM status was not separated from Material Request and Material Issue status.
- **What was changed**:
  1. **Backend Synchronization & Dual-Model Mirroring**:
     - `scmController.createMaterialIssue`:
       - Synchronizes `MaterialRequest`: Updates `alreadyIssuedQty`, `remainingQty`, and sets status to `Fully Issued` or `Partially Issued`.
       - Synchronizes `WorkOrder`: Updates status to `Ready to Start` when fully issued, or `Partially Issued`.
       - Mirrors issue into `ProductionIssue` collection so all Production endpoints immediately receive the issue records.
     - `productionController.createMaterialIssue`:
       - Synchronizes `MaterialRequest` and `WorkOrder`.
       - Mirrors issue into `MaterialIssue` (SCM collection).
     - `productionController.createProductionUpdate`:
       - Supports daily progress logging (`supervisorName`, `workCompletedDescription`).
       - When completed (`isCompleted: true` or `totalCompleted >= planned`): Marks `WorkOrder.status = 'Completed'`, updates `SalesOrder.productionStatus = 'Completed'`, and creates `FinishedGood` inventory **exactly once**.
       - While in progress: Sets `WorkOrder.status = 'Running'` and `SalesOrder.productionStatus = 'In Assembly'`.
     - `scmController.createGRN`:
       - When GRN is directly accepted (`status: 'Accepted'`), immediately credits `Inventory.availableStock` and `Material.currentStock` and logs to `StockLedger`, enabling instant replenishment and issue of remaining materials.
     - Updated Mongoose Schema Enums in `WorkOrder.js`, `MaterialRequest.js`, `ProductionIssue.js`, `GRN.js`, and `StockLedger.js` to support all required operational states.
  2. **Simplified 4-Tab Production Management (`ProductionOrdersPage.jsx`)**:
     - **Tab 1: Production Orders**:
       - View all production orders with clear status breakdown (Planning, BOM Verified, Materials Readiness, Production Status) and dynamic next action.
       - **Simple Production Order Form**: Sales Order (dropdown), Product (auto-filled), Quantity (auto-filled/editable), Planned Start/End Dates, BOM (select dropdown), Remarks. Actions: **Save Plan | Request Materials**.
     - **Tab 2: Planning & BOM**:
       - Production Plan inspection, BOM recipe component verification, store inventory check with shortage detection.
       - 1-click **Send Material Request to Store** button.
     - **Tab 3: Daily Production**:
       - Active order selector, **Daily Production Form** (Order select, Production Date, Planned Qty, Previously Completed Qty, Completed Today, Rejected Today, Remaining Qty, Remarks).
       - Actions: **Save Daily Progress | Complete Production**.
       - Daily Shift Logs table.
     - **Tab 4: Completed Production**:
       - Archive of all completed production orders, finished goods serial and batch numbers, and warehouse stock status.
  3. **Simplified 4-Tab Supply Chain / Store (`MaterialRequestsPage.jsx`)**:
     - **Tab 1: Material Requests**: Requisitions received from Production with stock check (Case A: Fully In Stock, Case B: Partially In Stock, Case C: Out of Stock).
     - **Tab 2: Stock & Material Issue**: **Simple Material Issue Form** (Request ID, Production Order, Material, Required Qty, Available Stock, Already Issued, Issue Qty, Balance Qty) with stock limit validation warnings. Handles Case A, B, and C.
     - **Tab 3: Purchase & GRN**: Shortages table with 1-click **+ Create PO ➔**, Purchase Orders list, and Inward GRN receipt with direct acceptance to credit Store stock.
     - **Tab 4: Issue History**: Verified ledger of all material issue slips.
  4. **Sidebar & Pipeline Stepper Alignment**:
     - `Sidebar.jsx`: Production menu updated to `01 Production Orders`, `02 Planning & BOM`, `03 Daily Production`, `04 Completed Production`, and `05 Dashboard`. SCM item updated to `07 Store & Material Issue`.
     - `ProductionPipelineStepper.jsx`: Mapped to the streamlined stages.
- **Verification**:
  - Full end-to-end node integration test script passed 100% across all 9 workflow stages:
    1. Sales Order -> Production Order Created -> Planned.
    2. BOM Verified.
    3. Material Request Sent to Store -> Pending.
    4. SCM Partial Issue (Case B) -> Material Request & Work Order updated to `Partially Issued`.
    5. Shortage PO created -> GRN accepted -> Store inventory updated to 60 units.
    6. Issue Remaining (Case A) -> Material Request updated to `Fully Issued` and Work Order to `Ready to Start` (ZERO BOM Pending!).
    7. Daily Production progress logged -> Work Order updated to `Running` and Sales Order to `In Assembly`.
    8. Production completed -> Work Order updated to `Completed` and Sales Order to `Completed`.
    9. Finished Goods inventory record created **exactly once**.
  - `npm --prefix client run build`: Built in 878ms with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero `git push` executed (all changes kept locally).

---

## Components

### Sidebar (`client/src/components/common/Sidebar.jsx`)
- **Purpose**: Collapsible 5-tier tree-branch accordion navigation with SVG curve connectors.
- **Props**: `activeDomain`, `onSelectDomain`, `activeModule`, `onSelectModule`, `isOpen`, `onClose`.
- **State**: `openDropdowns` (manages independent collapse state for scm, sales, production, logistics, employee).

### Header (`client/src/components/common/Header.jsx`)
- **Purpose**: Top navigation bar with domain quick-switch pills, manual refresh sync button, live MongoDB connection indicator, and live ERP status pill.
- **Props**: `activeDomain`, `onSelectDomain`, `activeModule`, `onToggleMobileMenu`, `onRefresh`, `isRefreshing`, `currentUser`, `dbHealth`.

### DataTable (`client/src/components/common/DataTable.jsx`)
- **Purpose**: Unified table rendering engine with search bar, pagination controls, and single primary action button.
- **Props**: `title`, `subtitle`, `data`, `columns`, `searchPlaceholder`, `actionLabel`, `onAction`, `isLoading`.

### RolesPermissionsModule (`client/src/components/employee/RolesPermissionsModule.jsx`)
- **Purpose**: 13-Module by 7-Capability permission configuration matrix with sticky frozen column for mobile/desktop.
- **Props**: `roles`, `departments`, `onSaveRole`, `onUpdateRolePermissions`, `showToast`.

### EmployeeLoginModule (`client/src/components/employee/EmployeeLoginModule.jsx`)
- **Purpose**: Active session inspector, quick role simulation switcher (5 preset accounts), and manual JWT sign-in form.
- **Props**: `currentUser`, `onLogin`, `onLogout`, `showToast`.

### 2026-11-16 (Simplified ERP Production & Supply Chain Management Workflow)
- **User Request**: "ERP – Simplify Production & Supply Chain Workflow: Fix and simplify existing Production and SCM workflows without rebuilding. Phase 1: Sales Order Confirmed -> Production Order Created -> Planning -> BOM -> Material Request Sent to Store. Phase 2: Material Request Received -> Stock Availability Check (Case A: Fully Available -> Issue 100 -> Fully Issued; Case B: Partially Available -> Issue 60 -> Partially Issued -> Remaining: 40; Case C: Not Available -> Out of Stock -> Proceed to purchase). Phase 3: Shortage -> Purchase Request -> Supplier / PO -> GRN -> Inventory Updated -> Remaining Material Issued. Phase 4: Material Issued -> Production Plan -> Daily Production Process -> Production Completed. Fix Existing BOM Pending Bug: SCM already issued materials but Production still shows BOM Pending. Keep only 4 essential Production tabs (Production Orders, Planning & BOM, Daily Production, Completed Production) and 4 essential Store tabs (Material Requests, Stock & Material Issue, Purchase & GRN, Issue History). Single update to Finished Goods inventory and Sales Order synchronization."
- **Reason**: Factory workers and operators require a simple, intuitive, non-technical ERP interface with clear real-time statuses and seamless stage handovers without disconnected models or false "BOM Pending" indicators.
- **Root Cause of BOM Pending Bug**:
  - Supply Chain Store issued materials via `scmController.createMaterialIssue` (`/api/material-issues`), which wrote exclusively to `MaterialIssue` and did not update `MaterialRequest` or `WorkOrder`, nor write to `ProductionIssue` (`/api/production/material-issues`).
  - Production components checked `productionMaterialIssues`, so after SCM issued materials, Production had zero issue records and displayed "Store Issue Pending" or "Request BOM Required".
  - BOM status was not separated from Material Request and Material Issue status.
- **What was changed**:
  1. **Backend Synchronization & Dual-Model Mirroring**:
     - `scmController.createMaterialIssue`:
       - Synchronizes `MaterialRequest`: Updates `alreadyIssuedQty`, `remainingQty`, and sets status to `Fully Issued` or `Partially Issued`.
       - Synchronizes `WorkOrder`: Updates status to `Ready to Start` when fully issued, or `Partially Issued`.
       - Mirrors issue into `ProductionIssue` collection so all Production endpoints immediately receive the issue records.
     - `productionController.createMaterialIssue`:
       - Synchronizes `MaterialRequest` and `WorkOrder`.
       - Mirrors issue into `MaterialIssue` (SCM collection).
     - `productionController.createProductionUpdate`:
       - Supports daily progress logging (`supervisorName`, `workCompletedDescription`).
       - When completed (`isCompleted: true` or `totalCompleted >= planned`): Marks `WorkOrder.status = 'Completed'`, updates `SalesOrder.productionStatus = 'Completed'`, and creates `FinishedGood` inventory **exactly once**.
       - While in progress: Sets `WorkOrder.status = 'Running'` and `SalesOrder.productionStatus = 'In Assembly'`.
     - `scmController.createGRN`:
       - When GRN is directly accepted (`status: 'Accepted'`), immediately credits `Inventory.availableStock` and `Material.currentStock` and logs to `StockLedger`, enabling instant replenishment and issue of remaining materials.
     - Updated Mongoose Schema Enums in `WorkOrder.js`, `MaterialRequest.js`, `ProductionIssue.js`, `GRN.js`, and `StockLedger.js` to support all required operational states.
  2. **Simplified 4-Tab Production Management (`ProductionOrdersPage.jsx`)**:
     - **Tab 1: Production Orders**:
       - View all production orders with clear status breakdown (Planning, BOM Verified, Materials Readiness, Production Status) and dynamic next action.
       - **Simple Production Order Form**: Sales Order (dropdown), Product (auto-filled), Quantity (auto-filled/editable), Planned Start/End Dates, BOM (select dropdown), Remarks. Actions: **Save Plan | Request Materials**.
     - **Tab 2: Planning & BOM**:
       - Production Plan inspection, BOM recipe component verification, store inventory check with shortage detection.
       - 1-click **Send Material Request to Store** button.
     - **Tab 3: Daily Production**:
       - Active order selector, **Daily Production Form** (Order select, Production Date, Planned Qty, Previously Completed Qty, Completed Today, Rejected Today, Remaining Qty, Remarks).
       - Actions: **Save Daily Progress | Complete Production**.
       - Daily Shift Logs table.
     - **Tab 4: Completed Production**:
       - Archive of all completed production orders, finished goods serial and batch numbers, and warehouse stock status.
  3. **Simplified 4-Tab Supply Chain / Store (`MaterialRequestsPage.jsx`)**:
     - **Tab 1: Material Requests**: Requisitions received from Production with stock check (Case A: Fully In Stock, Case B: Partially In Stock, Case C: Out of Stock).
     - **Tab 2: Stock & Material Issue**: **Simple Material Issue Form** (Request ID, Production Order, Material, Required Qty, Available Stock, Already Issued, Issue Qty, Balance Qty) with stock limit validation warnings. Handles Case A, B, and C.
     - **Tab 3: Purchase & GRN**: Shortages table with 1-click **+ Create PO ➔**, Purchase Orders list, and Inward GRN receipt with direct acceptance to credit Store stock.
     - **Tab 4: Issue History**: Verified ledger of all material issue slips.
  4. **Sidebar & Pipeline Stepper Alignment**:
     - `Sidebar.jsx`: Production menu updated to `01 Production Orders`, `02 Planning & BOM`, `03 Daily Production`, `04 Completed Production`, and `05 Dashboard`. SCM item updated to `07 Store & Material Issue`.
     - `ProductionPipelineStepper.jsx`: Mapped to the streamlined stages.
- **Verification**:
  - Full end-to-end node integration test script passed 100% across all 9 workflow stages:
    1. Sales Order -> Production Order Created -> Planned.
    2. BOM Verified.
    3. Material Request Sent to Store -> Pending.
    4. SCM Partial Issue (Case B) -> Material Request & Work Order updated to `Partially Issued`.
    5. Shortage PO created -> GRN accepted -> Store inventory updated to 60 units.
    6. Issue Remaining (Case A) -> Material Request updated to `Fully Issued` and Work Order to `Ready to Start` (ZERO BOM Pending!).
    7. Daily Production progress logged -> Work Order updated to `Running` and Sales Order to `In Assembly`.
    8. Production completed -> Work Order updated to `Completed` and Sales Order to `Completed`.
    9. Finished Goods inventory record created **exactly once**.
  - `npm --prefix client run build`: Built in 878ms with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero `git push` executed (all changes kept locally).

---

## Change History

### 2026-11-13
#### Change: Project Tracking & Documentation Single Source of Truth
- **What was changed**: Created root-level `lk.md` following standard project tracking instructions.
- **Files changed**: `lk.md`.
- **Logic changed**: Established persistent agent memory and change tracking rules.
- **Reason**: User requested root-level `lk.md` to be the single source of truth for all changes, logic, and implementation progress.
- **Impact**: Ensures no undocumented changes and prevents regressions across future sessions.

#### Change: Role Switcher Credentials Fix
- **What was changed**: Resolved `Unexpected token '"', "*admin.operations*" is not valid JSON` error when using the Instant Role Switcher.
- **Files changed**: `client/src/App.jsx`, `client/src/components/employee/EmployeeLoginModule.jsx`, `client/src/services/api.js`, `server/controllers/employeeController.js`.
- **Logic changed**: 
  - `handleLogin` now handles both polymorphic argument types: structured object `{ username, password }` or separate parameters `(username, password)`.
  - `api.loginEmployee` defensively ensures payloads are serialized as valid JSON objects.
  - Server controller returns both `user` and `data` in response body.
- **Reason**: Fix runtime string serialization crash when switching accounts.
- **Impact**: All 5 preset role-switch accounts log in seamlessly with HTTP 200 and instant session refresh.

#### Change: Inventory Report API Alias & State Synchronization Fix
- **What was changed**: Fixed `api.getInventoryReport is not a function` error that halted `loadAllData()` and caused newly created records to not appear.
- **Files changed**: `client/src/services/api.js`, `client/src/App.jsx`.
- **Logic changed**: Added `getInventoryReport` alias pointing to `/api/reports` in `api.js`.
- **Reason**: Resolves unhandled TypeError inside `Promise.all` during global state refresh.
- **Impact**: All 47 modules now fetch and render their records without interruption.

#### Change: Health Check Database Connectivity & Department Collision Protection
- **What was changed**: Enhanced `/api/health` to report real-time MongoDB status, host, port, DB name, and readyState. Upgraded department creation with case-insensitive duplication check and collision-proof codes.
- **Files changed**: `server/server.js`, `server/config/db.js`, `server/controllers/employeeController.js`, `client/src/components/common/Header.jsx`.
- **Logic changed**: `/api/health` checks `mongoose.connection.readyState` and returns HTTP 200 (UP) or HTTP 503 (DEGRADED). Department creation returns user-friendly HTTP 400 Bad Request on duplicates instead of HTTP 500.
- **Reason**: Fulfill user request to monitor live DB connectivity in health check and prevent server crashes on duplicate department names.
- **Impact**: Live visual DB connection indicator in header and clean toast notifications.

#### Change: Complete Frontend UI/UX Redesign – Enterprise Light Theme
- **What was changed**: Transformed the complete frontend application from the obsidian dark theme into a clean, modern, professional light-theme ERP system matching the user's reference design ("VairaWorks ADMIN - Duty Management System").
- **Files changed**:
  - Global CSS: `client/src/index.css` (Complete design token overhaul: `#2451C5` primary, `#F5F7FA` page background, `#FFFFFF` cards, `#172033` primary text, `#64748B` secondary text, `#E5EAF1` borders).
  - Common Components: `client/src/components/common/Header.jsx`, `client/src/components/common/Sidebar.jsx`, `client/src/components/common/KpiCard.jsx`, `client/src/components/common/StatusBadge.jsx`.
  - SCM Modules: `InventoryModule.jsx`, `InventoryReportModule.jsx`, `MaterialIssueModule.jsx`, `PurchaseOrdersModule.jsx`, `QCTestsModule.jsx`, `SupplierMaterialLinkModule.jsx`, `SupplierReturnsModule.jsx`.
  - Sales Modules: `DashboardModule.jsx`, `SalesReportsModule.jsx`, `CustomerPOsModule.jsx`, `CustomersLeadsModule.jsx`, `EnquiriesModule.jsx`, `FollowUpsModule.jsx`, `PaymentsModule.jsx`, `ProformaInvoicesModule.jsx`, `QuotationsModule.jsx`, `SalesOrdersModule.jsx`.
  - Production Modules: `MaterialRequestsModule.jsx`, `ProductionMaterialIssueModule.jsx`.
  - Logistics Modules: `InstallationCompletionModule.jsx`, `InstallationModule.jsx`, `LogisticsDashboardModule.jsx`, `LogisticsReportsModule.jsx`, `VehicleCourierModule.jsx`.
  - Employee & RBAC: `EmployeeDashboardModule.jsx`, `EmployeeLoginModule.jsx`, `EmployeeReportsModule.jsx`, `EmployeesModule.jsx`, `DepartmentsModule.jsx`, `RolesPermissionsModule.jsx`.
- **Logic & Styling changed**:
  - Replaced all 60+ hardcoded dark/white inline text styles (`color: '#fff'`) with semantic light tokens (`var(--text-primary)`, `var(--primary)`, `code-badge`).
  - Audited and updated tables, modal overlays, form input controls, select dropdowns (`color-scheme: light !important;`), squircle KPI cards, and sub-table lists.
  - Implemented top header brand identity with gradient icon, **CryoWorks** brand name, **ADMIN** badge, department quick-switch pills, circular sync button, live `DB: Connected` status pill, and user profile pill with initials avatar (`AV`/`DE`).
- **Reason**: User requested complete elimination of crowded dark interface in favor of clean enterprise light theme matching reference screenshot 1.
- **Impact**: Crystal-clear legibility, cohesive design system across all 47 modules, zero compile errors (`vite build` in 941ms).

#### Change: Enterprise Navigation Restructuring (47 Tabs → 28 Main Pages)
- **What was changed**: Re-architected the frontend navigation by consolidating 47 cluttered sidebar tabs into **28 clean, intuitive main pages** across all 5 enterprise departments with internal sub-tabs, unified toolbars, status filters, and complete backward-compatible routing aliases.
- **Files changed**:
  - `client/src/components/common/Sidebar.jsx`: Updated department counts, badges, and module definitions for the 28 pages (SCM: 6, Sales: 6, Production: 7, Logistics: 5, Employee & RBAC: 4).
  - `client/src/components/common/Header.jsx`: Updated department switcher pills to reflect the simplified module counts (SCM: 6, Sales: 6, Prod: 7, Log: 5, HR: 4).
  - `client/src/App.jsx`: Updated imports and routing logic to mount the 28 consolidated pages while retaining seamless fallbacks and cross-module navigation for all previous 47 routes.
  - SCM Consolidated Components:
    - `client/src/components/modules/ScmDashboardModule.jsx`: Executive KPI cards, pipeline progress banner, quick action buttons, and recent PO / GRN feeds.
    - `client/src/components/modules/MaterialsPage.jsx`: Internal sub-tabs for `Raw Material Master` and `Supplier Material Link`.
    - `client/src/components/modules/PurchasingPage.jsx`: Internal sub-tabs for `Purchase Orders (PO)`, `Goods Receipt (GRN)`, and `Supplier Returns`.
    - `client/src/components/modules/QualityInventoryPage.jsx`: Internal sub-tabs for `QC Tests`, `Warehouse Inventory`, and `Inventory Reports`.
    - `client/src/components/modules/MaterialRequestsPage.jsx`: Physical store issues and material requisition tracking.
  - Sales Consolidated Components:
    - `client/src/components/sales/CustomersEnquiriesPage.jsx`: Internal sub-tabs for `Customers & Leads` and `Customer Enquiries`.
    - `client/src/components/sales/QuotationsPIPage.jsx`: Internal sub-tabs for `Quotations (V1/V2/V3)` and `Proforma Invoices (PI)`.
    - `client/src/components/sales/OrdersPaymentsPage.jsx`: Internal sub-tabs for `Sales Orders (SO)`, `Customer POs`, and `Payments`.
  - Production Consolidated Components:
    - `client/src/components/production/ProductionOrdersPage.jsx`: Internal sub-tabs for `Production Planning (Work Orders)` and `Production Schedule`.
    - `client/src/components/production/ProdMaterialRequestsPage.jsx`: Internal sub-tabs for `Material Requests` and `Production Material Issues`.
    - `client/src/components/production/ProductionTrackingPage.jsx`: Internal sub-tabs for `Shop Floor Execution`, `Daily Updates`, and `Production Completion`.
    - `client/src/components/production/QualityReworkPage.jsx`: Internal sub-tabs for `Quality Assurance (QA)` and `Rework / Repair`.
  - Logistics Consolidated Components:
    - `client/src/components/logistics/DeliveryPlanningPage.jsx`: Internal sub-tabs for `Delivery Planning` and `Vehicle & Courier Fleet`.
    - `client/src/components/logistics/DispatchTrackingPage.jsx`: Internal sub-tabs for `Warehouse Dispatch` and `Live Tracking`.
    - `client/src/components/logistics/DeliveryInstallationPage.jsx`: Internal sub-tabs for `Delivery Confirmation (POD)`, `Installation Scheduling`, and `Installation QA Completion`.
  - Employee Management Consolidated Components:
    - `client/src/components/employee/EmployeesPage.jsx`: Internal sub-tabs for `Employee Directory` and `Employee Login & Role Simulation`.
    - `client/src/components/employee/DepartmentsReportsPage.jsx`: Internal sub-tabs for `Corporate Departments` and `Audit Logs & Personnel Reports`.
- **Logic & Workflow changed**:
  - Preserved 100% of underlying business logic, state handlers, MongoDB schemas, and MERN API interactions.
  - Cross-module links (e.g. GRN → QC test preselection, Production completion → QA, Sales quotes → PI) now navigate directly into the appropriate parent page and active sub-tab.
  - Reduced cognitive overload from 47 tabs to 28 main pages, making the client ERP website vastly easier to navigate on both desktop and mobile.
- **Reason**: User requested restructuring: "complersory entha tabes la venuma? reduce panni easy ya irrukanum clicent website not compleex".
- **Impact**: Clean, production-grade navigation tree with fast rendering; `vite build` completed in 1.29s with zero errors.

### 2026-11-14
#### Change: Sales CRM Workflow Simplification & Numbered Funnel Tabs
- **What was changed**: Reorganized the Sales Management department from complex multi-concept bundles into an intuitive, sequential 6-stage sales pipeline that matches the requested workflow:
  $$\textbf{Enquiry} \xrightarrow{\textbf{+ Follow-up}} \textbf{Qualified / Not Qualified Lead} \xrightarrow{\textbf{+ Follow-up}} \textbf{Quotation} \xrightarrow{\textbf{Accept}} \textbf{Proforma Invoice (PI)} \xrightarrow{\textbf{Convert}} \textbf{Sales Order (SO)}$$
  1. **Numbered Sidebar Tabs**:
     - `Dashboard`: Executive KPI and revenue overview
     - `1. Enquiry`: Log customer enquiries with free-text manual product specifications (no catalog dropdown blockers) + target budget + instant first follow-up note + 1-click **"Move to Lead ➔"**
     - `2. Follow-up`: Centralized touchpoint log for phone calls, meetings, WhatsApp notes, and upcoming reminder dates
     - `3. Qualified / Not Qualified Lead`: Dedicated qualification view with clear segmentation:
       - **Qualified Leads**: Active opportunities ready for quotation, with 1-click **"Quote ➔"** action button, **"+ Follow-up"** logger, and **"Mark Lost"**
       - **Not Qualified / Lost**: Budget mismatch or dropped leads with 1-click **"Requalify"** button to restore back to active pipeline
       - **All Pipeline & Client Accounts**: Registered account master directory
     - `4. Quotation`: Commercial proposals with V1/V2 revisions, manual line items, follow-up logs, and 1-click **"Generate PI ➔"** on accepted quotes
     - `5. Proforma Invoice (PI)`: Commercial advance payment bill with payment terms, advance tracking, and 1-click **"Convert to SO ➔"**
     - `6. Sales Order (SO)`: Confirmed orders ready for factory execution with 1-click **"Dispatch to Production ➔"**, plus sub-tabs for Customer POs and Payments
     - `Sales Reports`: Sales analytics and performance breakdown
  2. **Top Visual Stepper (`SalesPipelineStepper.jsx`)**:
     - Built an interactive 6-stage horizontal stepper shown across all sales pages:
       `[1. Enquiry] ➔ [2. Follow-up] ➔ [3. Qualified / Not Qualified Lead] ➔ [4. Quotation] ➔ [5. Proforma Invoice] ➔ [6. Sales Order]`
     - Highlights active stage with blue branding (`#2451C5`), completed stages in green (`#16A36A`), and allows 1-click direct navigation between any stage.
  3. **Seamless Cross-Stage Pre-filling (Zero Duplicate Typing)**:
     - Enquiry ➔ Lead carries over customer particulars, manual product specification, and expected deal value (`targetPrice * quantity`).
     - Qualified Lead ➔ Quotation pre-fills customer, lead ref, and manual product line items into `QuotationsModule`.
     - Quotation ➔ PI pre-fills commercial quote lines and payment terms into `ProformaInvoicesModule`.
     - PI ➔ SO pre-fills confirmed line items, advance received, and balance amount into `SalesOrdersModule`.
     - SO ➔ Production dispatches the work order directly to shopfloor engineering.
  4. **Backend Mongoose Schemas & Controller Handlers**:
     - `server/models/Enquiry.js`: Made `product` optional; added `productName: { type: String, required: true }`, `productDescription`, `targetPrice`.
     - `server/models/Lead.js`: Added `productName`.
     - `server/models/FollowUp.js`: Added `enquiryReference` linking directly to `Enquiry`.
     - `server/models/Quotation.js`: Made item `product` optional and added `productName`.
     - `server/models/SalesOrder.js`: Made item `product` optional and added `productName`.
     - `server/controllers/salesController.js`: Updated `createEnquiry`, `convertEnquiryToLead`, `getFollowUps`, `createFollowUp`, `createQuotation`, and `reviseQuotation`.
- **Files changed**:
  - `client/src/components/common/Sidebar.jsx`
  - `client/src/components/sales/SalesPipelineStepper.jsx`
  - `client/src/components/sales/CustomersLeadsModule.jsx`
  - `client/src/components/sales/EnquiriesModule.jsx`
  - `client/src/components/sales/FollowUpsModule.jsx`
  - `client/src/components/sales/QuotationsModule.jsx`
  - `client/src/components/sales/ProformaInvoicesModule.jsx`
  - `client/src/components/sales/SalesOrdersModule.jsx`
  - `client/src/components/sales/OrdersPaymentsPage.jsx`
  - `client/src/App.jsx`
  - `server/models/Enquiry.js`
  - `server/models/Lead.js`
  - `server/models/FollowUp.js`
  - `server/models/Quotation.js`
  - `server/models/SalesOrder.js`
  - `server/controllers/salesController.js`
  - `lk.md`
- **Reason**: User requested: "sales management-complex irruku tabes change panni make user fiendly and simply understanable; fix;enquiry-follow-qualified lead/not qualified-follow-quation-pi-so;fix the worflow; make simply ; easy to use and client web easy use; fix; easy tabs and esay make; worflow;".
- **Impact**: Extremely simple and intuitive navigation. Eliminates confusing tab bundles and reflects the natural sales funnel sequentially with 1-click progression.

### 2026-11-16 (Simplified ERP Production & Supply Chain Management Workflow)
- **User Request**: "ERP – Simplify Production & Supply Chain Workflow: Fix and simplify existing Production and SCM workflows without rebuilding. Phase 1: Sales Order Confirmed -> Production Order Created -> Planning -> BOM -> Material Request Sent to Store. Phase 2: Material Request Received -> Stock Availability Check (Case A: Fully Available -> Issue 100 -> Fully Issued; Case B: Partially Available -> Issue 60 -> Partially Issued -> Remaining: 40; Case C: Not Available -> Out of Stock -> Proceed to purchase). Phase 3: Shortage -> Purchase Request -> Supplier / PO -> GRN -> Inventory Updated -> Remaining Material Issued. Phase 4: Material Issued -> Production Plan -> Daily Production Process -> Production Completed. Fix Existing BOM Pending Bug: SCM already issued materials but Production still shows BOM Pending. Keep only 4 essential Production tabs (Production Orders, Planning & BOM, Daily Production, Completed Production) and 4 essential Store tabs (Material Requests, Stock & Material Issue, Purchase & GRN, Issue History). Single update to Finished Goods inventory and Sales Order synchronization."
- **Reason**: Factory workers and operators require a simple, intuitive, non-technical ERP interface with clear real-time statuses and seamless stage handovers without disconnected models or false "BOM Pending" indicators.
- **Root Cause of BOM Pending Bug**:
  - Supply Chain Store issued materials via `scmController.createMaterialIssue` (`/api/material-issues`), which wrote exclusively to `MaterialIssue` and did not update `MaterialRequest` or `WorkOrder`, nor write to `ProductionIssue` (`/api/production/material-issues`).
  - Production components checked `productionMaterialIssues`, so after SCM issued materials, Production had zero issue records and displayed "Store Issue Pending" or "Request BOM Required".
  - BOM status was not separated from Material Request and Material Issue status.
- **What was changed**:
  1. **Backend Synchronization & Dual-Model Mirroring**:
     - `scmController.createMaterialIssue`:
       - Synchronizes `MaterialRequest`: Updates `alreadyIssuedQty`, `remainingQty`, and sets status to `Fully Issued` or `Partially Issued`.
       - Synchronizes `WorkOrder`: Updates status to `Ready to Start` when fully issued, or `Partially Issued`.
       - Mirrors issue into `ProductionIssue` collection so all Production endpoints immediately receive the issue records.
     - `productionController.createMaterialIssue`:
       - Synchronizes `MaterialRequest` and `WorkOrder`.
       - Mirrors issue into `MaterialIssue` (SCM collection).
     - `productionController.createProductionUpdate`:
       - Supports daily progress logging (`supervisorName`, `workCompletedDescription`).
       - When completed (`isCompleted: true` or `totalCompleted >= planned`): Marks `WorkOrder.status = 'Completed'`, updates `SalesOrder.productionStatus = 'Completed'`, and creates `FinishedGood` inventory **exactly once**.
       - While in progress: Sets `WorkOrder.status = 'Running'` and `SalesOrder.productionStatus = 'In Assembly'`.
     - `scmController.createGRN`:
       - When GRN is directly accepted (`status: 'Accepted'`), immediately credits `Inventory.availableStock` and `Material.currentStock` and logs to `StockLedger`, enabling instant replenishment and issue of remaining materials.
     - Updated Mongoose Schema Enums in `WorkOrder.js`, `MaterialRequest.js`, `ProductionIssue.js`, `GRN.js`, and `StockLedger.js` to support all required operational states.
  2. **Simplified 4-Tab Production Management (`ProductionOrdersPage.jsx`)**:
     - **Tab 1: Production Orders**:
       - View all production orders with clear status breakdown (Planning, BOM Verified, Materials Readiness, Production Status) and dynamic next action.
       - **Simple Production Order Form**: Sales Order (dropdown), Product (auto-filled), Quantity (auto-filled/editable), Planned Start/End Dates, BOM (select dropdown), Remarks. Actions: **Save Plan | Request Materials**.
     - **Tab 2: Planning & BOM**:
       - Production Plan inspection, BOM recipe component verification, store inventory check with shortage detection.
       - 1-click **Send Material Request to Store** button.
     - **Tab 3: Daily Production**:
       - Active order selector, **Daily Production Form** (Order select, Production Date, Planned Qty, Previously Completed Qty, Completed Today, Rejected Today, Remaining Qty, Remarks).
       - Actions: **Save Daily Progress | Complete Production**.
       - Daily Shift Logs table.
     - **Tab 4: Completed Production**:
       - Archive of all completed production orders, finished goods serial and batch numbers, and warehouse stock status.
  3. **Simplified 4-Tab Supply Chain / Store (`MaterialRequestsPage.jsx`)**:
     - **Tab 1: Material Requests**: Requisitions received from Production with stock check (Case A: Fully In Stock, Case B: Partially In Stock, Case C: Out of Stock).
     - **Tab 2: Stock & Material Issue**: **Simple Material Issue Form** (Request ID, Production Order, Material, Required Qty, Available Stock, Already Issued, Issue Qty, Balance Qty) with stock limit validation warnings. Handles Case A, B, and C.
     - **Tab 3: Purchase & GRN**: Shortages table with 1-click **+ Create PO ➔**, Purchase Orders list, and Inward GRN receipt with direct acceptance to credit Store stock.
     - **Tab 4: Issue History**: Verified ledger of all material issue slips.
  4. **Sidebar & Pipeline Stepper Alignment**:
     - `Sidebar.jsx`: Production menu updated to `01 Production Orders`, `02 Planning & BOM`, `03 Daily Production`, `04 Completed Production`, and `05 Dashboard`. SCM item updated to `07 Store & Material Issue`.
     - `ProductionPipelineStepper.jsx`: Mapped to the streamlined stages.
- **Verification**:
  - Full end-to-end node integration test script passed 100% across all 9 workflow stages:
    1. Sales Order -> Production Order Created -> Planned.
    2. BOM Verified.
    3. Material Request Sent to Store -> Pending.
    4. SCM Partial Issue (Case B) -> Material Request & Work Order updated to `Partially Issued`.
    5. Shortage PO created -> GRN accepted -> Store inventory updated to 60 units.
    6. Issue Remaining (Case A) -> Material Request updated to `Fully Issued` and Work Order to `Ready to Start` (ZERO BOM Pending!).
    7. Daily Production progress logged -> Work Order updated to `Running` and Sales Order to `In Assembly`.
    8. Production completed -> Work Order updated to `Completed` and Sales Order to `Completed`.
    9. Finished Goods inventory record created **exactly once**.
  - `npm --prefix client run build`: Built in 878ms with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero `git push` executed (all changes kept locally).

---

## Current Progress
- **Completed**:
  - Sales CRM Workflow Simplification: Sidebar reorganized into 6 sequential stages with top interactive visual stepper.
  - Manual Product Specifications: Free-text manual product entry preserved from Enquiry ➔ Lead ➔ Quote ➔ PI ➔ SO.
  - Qualified vs Not Qualified Leads: Distinct segmented views with 1-click `Quote ➔`, `+ Follow-up`, `Requalify`, and `Mark Lost`.
  - Backend Mongoose Models & REST Endpoints: Full support for manual product specs, enquiry follow-ups, and converted leads.
  - Full Production Build: `npm --prefix client run build` passed in 759ms with 0 errors.
  - Backend Daemon: Active on port 5000 with MongoDB connected.
  - Enterprise Navigation Restructuring: 47 tabs simplified into 28 main pages across all 5 departments.
  - Sub-Tab Navigation: 13 consolidated tabbed containers created and wired into global state.
  - Backward Compatibility: Route aliases and cross-module deep-linking preserved for all 47 workflow steps.
  - Mobile Responsive Layout: 100% responsive across mobile, tablet, and desktop viewports.
  - Mobile Bottom Navigation Bar: Implemented 5-tab quick switcher matching mobile reference.
  - UI/UX Complete Redesign: 100% migrated to clean light theme matching Reference Screenshot 1.
  - Supply Chain Management: 6 main pages (10 sub-modules) fully operational.
  - Sales Management CRM: 6 main pages (10 sub-modules) fully operational.
  - Production Management: 7 main pages (12 sub-modules) fully operational.
  - Logistics & Delivery Management: 5 main pages (9 sub-modules) fully operational.
  - Employee Management & RBAC: 4 main pages (6 sub-modules) fully operational.
  - Total: 28 main pages / 47 workflows functional with HTTP 200 API verification.
  - Root tracking file `lk.md` updated as single source of truth.
- **In Progress**:
  - Continuous runtime stability monitoring.
- **Pending**:
  - User feedback and acceptance testing.

### 2026-11-16 (Simplified ERP Production & Supply Chain Management Workflow)
- **User Request**: "ERP – Simplify Production & Supply Chain Workflow: Fix and simplify existing Production and SCM workflows without rebuilding. Phase 1: Sales Order Confirmed -> Production Order Created -> Planning -> BOM -> Material Request Sent to Store. Phase 2: Material Request Received -> Stock Availability Check (Case A: Fully Available -> Issue 100 -> Fully Issued; Case B: Partially Available -> Issue 60 -> Partially Issued -> Remaining: 40; Case C: Not Available -> Out of Stock -> Proceed to purchase). Phase 3: Shortage -> Purchase Request -> Supplier / PO -> GRN -> Inventory Updated -> Remaining Material Issued. Phase 4: Material Issued -> Production Plan -> Daily Production Process -> Production Completed. Fix Existing BOM Pending Bug: SCM already issued materials but Production still shows BOM Pending. Keep only 4 essential Production tabs (Production Orders, Planning & BOM, Daily Production, Completed Production) and 4 essential Store tabs (Material Requests, Stock & Material Issue, Purchase & GRN, Issue History). Single update to Finished Goods inventory and Sales Order synchronization."
- **Reason**: Factory workers and operators require a simple, intuitive, non-technical ERP interface with clear real-time statuses and seamless stage handovers without disconnected models or false "BOM Pending" indicators.
- **Root Cause of BOM Pending Bug**:
  - Supply Chain Store issued materials via `scmController.createMaterialIssue` (`/api/material-issues`), which wrote exclusively to `MaterialIssue` and did not update `MaterialRequest` or `WorkOrder`, nor write to `ProductionIssue` (`/api/production/material-issues`).
  - Production components checked `productionMaterialIssues`, so after SCM issued materials, Production had zero issue records and displayed "Store Issue Pending" or "Request BOM Required".
  - BOM status was not separated from Material Request and Material Issue status.
- **What was changed**:
  1. **Backend Synchronization & Dual-Model Mirroring**:
     - `scmController.createMaterialIssue`:
       - Synchronizes `MaterialRequest`: Updates `alreadyIssuedQty`, `remainingQty`, and sets status to `Fully Issued` or `Partially Issued`.
       - Synchronizes `WorkOrder`: Updates status to `Ready to Start` when fully issued, or `Partially Issued`.
       - Mirrors issue into `ProductionIssue` collection so all Production endpoints immediately receive the issue records.
     - `productionController.createMaterialIssue`:
       - Synchronizes `MaterialRequest` and `WorkOrder`.
       - Mirrors issue into `MaterialIssue` (SCM collection).
     - `productionController.createProductionUpdate`:
       - Supports daily progress logging (`supervisorName`, `workCompletedDescription`).
       - When completed (`isCompleted: true` or `totalCompleted >= planned`): Marks `WorkOrder.status = 'Completed'`, updates `SalesOrder.productionStatus = 'Completed'`, and creates `FinishedGood` inventory **exactly once**.
       - While in progress: Sets `WorkOrder.status = 'Running'` and `SalesOrder.productionStatus = 'In Assembly'`.
     - `scmController.createGRN`:
       - When GRN is directly accepted (`status: 'Accepted'`), immediately credits `Inventory.availableStock` and `Material.currentStock` and logs to `StockLedger`, enabling instant replenishment and issue of remaining materials.
     - Updated Mongoose Schema Enums in `WorkOrder.js`, `MaterialRequest.js`, `ProductionIssue.js`, `GRN.js`, and `StockLedger.js` to support all required operational states.
  2. **Simplified 4-Tab Production Management (`ProductionOrdersPage.jsx`)**:
     - **Tab 1: Production Orders**:
       - View all production orders with clear status breakdown (Planning, BOM Verified, Materials Readiness, Production Status) and dynamic next action.
       - **Simple Production Order Form**: Sales Order (dropdown), Product (auto-filled), Quantity (auto-filled/editable), Planned Start/End Dates, BOM (select dropdown), Remarks. Actions: **Save Plan | Request Materials**.
     - **Tab 2: Planning & BOM**:
       - Production Plan inspection, BOM recipe component verification, store inventory check with shortage detection.
       - 1-click **Send Material Request to Store** button.
     - **Tab 3: Daily Production**:
       - Active order selector, **Daily Production Form** (Order select, Production Date, Planned Qty, Previously Completed Qty, Completed Today, Rejected Today, Remaining Qty, Remarks).
       - Actions: **Save Daily Progress | Complete Production**.
       - Daily Shift Logs table.
     - **Tab 4: Completed Production**:
       - Archive of all completed production orders, finished goods serial and batch numbers, and warehouse stock status.
  3. **Simplified 4-Tab Supply Chain / Store (`MaterialRequestsPage.jsx`)**:
     - **Tab 1: Material Requests**: Requisitions received from Production with stock check (Case A: Fully In Stock, Case B: Partially In Stock, Case C: Out of Stock).
     - **Tab 2: Stock & Material Issue**: **Simple Material Issue Form** (Request ID, Production Order, Material, Required Qty, Available Stock, Already Issued, Issue Qty, Balance Qty) with stock limit validation warnings. Handles Case A, B, and C.
     - **Tab 3: Purchase & GRN**: Shortages table with 1-click **+ Create PO ➔**, Purchase Orders list, and Inward GRN receipt with direct acceptance to credit Store stock.
     - **Tab 4: Issue History**: Verified ledger of all material issue slips.
  4. **Sidebar & Pipeline Stepper Alignment**:
     - `Sidebar.jsx`: Production menu updated to `01 Production Orders`, `02 Planning & BOM`, `03 Daily Production`, `04 Completed Production`, and `05 Dashboard`. SCM item updated to `07 Store & Material Issue`.
     - `ProductionPipelineStepper.jsx`: Mapped to the streamlined stages.
- **Verification**:
  - Full end-to-end node integration test script passed 100% across all 9 workflow stages:
    1. Sales Order -> Production Order Created -> Planned.
    2. BOM Verified.
    3. Material Request Sent to Store -> Pending.
    4. SCM Partial Issue (Case B) -> Material Request & Work Order updated to `Partially Issued`.
    5. Shortage PO created -> GRN accepted -> Store inventory updated to 60 units.
    6. Issue Remaining (Case A) -> Material Request updated to `Fully Issued` and Work Order to `Ready to Start` (ZERO BOM Pending!).
    7. Daily Production progress logged -> Work Order updated to `Running` and Sales Order to `In Assembly`.
    8. Production completed -> Work Order updated to `Completed` and Sales Order to `Completed`.
    9. Finished Goods inventory record created **exactly once**.
  - `npm --prefix client run build`: Built in 878ms with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero `git push` executed (all changes kept locally).

---

## Known Issues
- *None.* All 50 API endpoints and frontend modules compile and render cleanly with zero errors.

### 2026-11-16 (Simplified ERP Production & Supply Chain Management Workflow)
- **User Request**: "ERP – Simplify Production & Supply Chain Workflow: Fix and simplify existing Production and SCM workflows without rebuilding. Phase 1: Sales Order Confirmed -> Production Order Created -> Planning -> BOM -> Material Request Sent to Store. Phase 2: Material Request Received -> Stock Availability Check (Case A: Fully Available -> Issue 100 -> Fully Issued; Case B: Partially Available -> Issue 60 -> Partially Issued -> Remaining: 40; Case C: Not Available -> Out of Stock -> Proceed to purchase). Phase 3: Shortage -> Purchase Request -> Supplier / PO -> GRN -> Inventory Updated -> Remaining Material Issued. Phase 4: Material Issued -> Production Plan -> Daily Production Process -> Production Completed. Fix Existing BOM Pending Bug: SCM already issued materials but Production still shows BOM Pending. Keep only 4 essential Production tabs (Production Orders, Planning & BOM, Daily Production, Completed Production) and 4 essential Store tabs (Material Requests, Stock & Material Issue, Purchase & GRN, Issue History). Single update to Finished Goods inventory and Sales Order synchronization."
- **Reason**: Factory workers and operators require a simple, intuitive, non-technical ERP interface with clear real-time statuses and seamless stage handovers without disconnected models or false "BOM Pending" indicators.
- **Root Cause of BOM Pending Bug**:
  - Supply Chain Store issued materials via `scmController.createMaterialIssue` (`/api/material-issues`), which wrote exclusively to `MaterialIssue` and did not update `MaterialRequest` or `WorkOrder`, nor write to `ProductionIssue` (`/api/production/material-issues`).
  - Production components checked `productionMaterialIssues`, so after SCM issued materials, Production had zero issue records and displayed "Store Issue Pending" or "Request BOM Required".
  - BOM status was not separated from Material Request and Material Issue status.
- **What was changed**:
  1. **Backend Synchronization & Dual-Model Mirroring**:
     - `scmController.createMaterialIssue`:
       - Synchronizes `MaterialRequest`: Updates `alreadyIssuedQty`, `remainingQty`, and sets status to `Fully Issued` or `Partially Issued`.
       - Synchronizes `WorkOrder`: Updates status to `Ready to Start` when fully issued, or `Partially Issued`.
       - Mirrors issue into `ProductionIssue` collection so all Production endpoints immediately receive the issue records.
     - `productionController.createMaterialIssue`:
       - Synchronizes `MaterialRequest` and `WorkOrder`.
       - Mirrors issue into `MaterialIssue` (SCM collection).
     - `productionController.createProductionUpdate`:
       - Supports daily progress logging (`supervisorName`, `workCompletedDescription`).
       - When completed (`isCompleted: true` or `totalCompleted >= planned`): Marks `WorkOrder.status = 'Completed'`, updates `SalesOrder.productionStatus = 'Completed'`, and creates `FinishedGood` inventory **exactly once**.
       - While in progress: Sets `WorkOrder.status = 'Running'` and `SalesOrder.productionStatus = 'In Assembly'`.
     - `scmController.createGRN`:
       - When GRN is directly accepted (`status: 'Accepted'`), immediately credits `Inventory.availableStock` and `Material.currentStock` and logs to `StockLedger`, enabling instant replenishment and issue of remaining materials.
     - Updated Mongoose Schema Enums in `WorkOrder.js`, `MaterialRequest.js`, `ProductionIssue.js`, `GRN.js`, and `StockLedger.js` to support all required operational states.
  2. **Simplified 4-Tab Production Management (`ProductionOrdersPage.jsx`)**:
     - **Tab 1: Production Orders**:
       - View all production orders with clear status breakdown (Planning, BOM Verified, Materials Readiness, Production Status) and dynamic next action.
       - **Simple Production Order Form**: Sales Order (dropdown), Product (auto-filled), Quantity (auto-filled/editable), Planned Start/End Dates, BOM (select dropdown), Remarks. Actions: **Save Plan | Request Materials**.
     - **Tab 2: Planning & BOM**:
       - Production Plan inspection, BOM recipe component verification, store inventory check with shortage detection.
       - 1-click **Send Material Request to Store** button.
     - **Tab 3: Daily Production**:
       - Active order selector, **Daily Production Form** (Order select, Production Date, Planned Qty, Previously Completed Qty, Completed Today, Rejected Today, Remaining Qty, Remarks).
       - Actions: **Save Daily Progress | Complete Production**.
       - Daily Shift Logs table.
     - **Tab 4: Completed Production**:
       - Archive of all completed production orders, finished goods serial and batch numbers, and warehouse stock status.
  3. **Simplified 4-Tab Supply Chain / Store (`MaterialRequestsPage.jsx`)**:
     - **Tab 1: Material Requests**: Requisitions received from Production with stock check (Case A: Fully In Stock, Case B: Partially In Stock, Case C: Out of Stock).
     - **Tab 2: Stock & Material Issue**: **Simple Material Issue Form** (Request ID, Production Order, Material, Required Qty, Available Stock, Already Issued, Issue Qty, Balance Qty) with stock limit validation warnings. Handles Case A, B, and C.
     - **Tab 3: Purchase & GRN**: Shortages table with 1-click **+ Create PO ➔**, Purchase Orders list, and Inward GRN receipt with direct acceptance to credit Store stock.
     - **Tab 4: Issue History**: Verified ledger of all material issue slips.
  4. **Sidebar & Pipeline Stepper Alignment**:
     - `Sidebar.jsx`: Production menu updated to `01 Production Orders`, `02 Planning & BOM`, `03 Daily Production`, `04 Completed Production`, and `05 Dashboard`. SCM item updated to `07 Store & Material Issue`.
     - `ProductionPipelineStepper.jsx`: Mapped to the streamlined stages.
- **Verification**:
  - Full end-to-end node integration test script passed 100% across all 9 workflow stages:
    1. Sales Order -> Production Order Created -> Planned.
    2. BOM Verified.
    3. Material Request Sent to Store -> Pending.
    4. SCM Partial Issue (Case B) -> Material Request & Work Order updated to `Partially Issued`.
    5. Shortage PO created -> GRN accepted -> Store inventory updated to 60 units.
    6. Issue Remaining (Case A) -> Material Request updated to `Fully Issued` and Work Order to `Ready to Start` (ZERO BOM Pending!).
    7. Daily Production progress logged -> Work Order updated to `Running` and Sales Order to `In Assembly`.
    8. Production completed -> Work Order updated to `Completed` and Sales Order to `Completed`.
    9. Finished Goods inventory record created **exactly once**.
  - `npm --prefix client run build`: Built in 878ms with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero `git push` executed (all changes kept locally).

---

## Technical Decisions
- **Decision**: Redesign Sales Management into 7 Simplified Pages with Embedded Follow-ups & 4-Stage Stepper.
  - **Reason**: The sales workflow had fragmented tabs (Follow-ups and Qualified Leads as separate pages). Embedding follow-ups into Enquiry Details and managing qualification inside Enquiry status simplifies user experience for non-technical manufacturing staff while retaining 100% data integrity.
#### Change: Production Management Simplification & 7-Page Workflow Re-architecture
- **What was changed**: Re-architected the 12 underlying production modules into an intuitive, sequential 7-page manufacturing pipeline matching the requested workflow:
  $$\textbf{Sales Order} \longrightarrow \textbf{Work Orders (BOM/Schedule)} \longrightarrow \textbf{Materials (Requests/Issues)} \longrightarrow \textbf{Manufacturing (Progress/Updates)} \longrightarrow \textbf{Quality Check (QA/Rework)} \longrightarrow \textbf{Finished Goods} \longrightarrow \textbf{Logistics}$$
  1. **7 Main Sidebar Navigation Pages**:
     - `01 Dashboard`: Executive summary cards (Total Orders, Pending, In Progress, Completed, QA Pending, Ready for Dispatch), pending task actions (Materials required, Awaiting scheduling, Awaiting QA), and live Work Order table.
     - `02 Work Orders`: 3 sub-tabs (`All Orders | BOM | Schedule`) consolidating Work Order planning, BOM recipe inspection, and production scheduling. Added duplicate SO warning, missing BOM warning with direct link, and full Work Order details dialog.
     - `03 Materials`: 2 sub-tabs (`Material Requests | Issued Materials`) linking directly to SCM inventory stock. Required quantities are calculated from BOM $\times$ production quantity. Enforces strict stock conservation (issued cannot exceed available warehouse stock).
     - `04 Manufacturing`: 3 sub-tabs (`In Progress | Daily Updates | Completed`). Real-time line controls (Pause, Resume, Hold), daily shift updates with auto-calculated pending quantities (`planned - completed`), and completion sign-off routing to QA.
     - `05 Quality Check`: 3 sub-tabs (`Pending QA | Passed | Failed & Rework`). Quarantine gate displaying completed batches awaiting QA, approved test parameter checklist, Pass $\rightarrow$ Finished Goods routing, and Fail $\rightarrow$ Rework technician assignment loop.
     - `06 Finished Goods`: 4 sub-tabs (`All | Available | Reserved | Dispatched`). Full audit lineage from SO $\rightarrow$ WO $\rightarrow$ QA Approval $\rightarrow$ FG Serial, stock reservations, and 1-click handover to Logistics dispatch.
     - `07 Reports`: Production summary analytics, work order status mix, QA first-pass yield rate, delay tracker, and CSV report export.
  2. **Zero Duplicate Typing & Clean Data Carryover**:
     - Sales Order handover pre-fills customer, product, specifications, and target dates into Work Orders.
     - Work Order pre-fills required raw materials and quantities into Material Requests based on the linked BOM.
     - Material Issue enforces SCM stock deductions.
     - Completion passes verified units to QA.
     - Passed QA tests auto-populate Finished Goods receipts.
     - Finished Goods reservations hand over to Logistics delivery planning.
  3. **Files changed**:
     - `client/src/components/common/Sidebar.jsx`
     - `client/src/components/production/ProductionDashboardModule.jsx`
     - `client/src/components/production/ProductionOrdersPage.jsx`
     - `client/src/components/production/ProductionPlanningModule.jsx`
     - `client/src/components/production/ProdMaterialRequestsPage.jsx`
     - `client/src/components/production/MaterialRequestsModule.jsx`
     - `client/src/components/production/ProductionMaterialIssueModule.jsx`
     - `client/src/components/production/ProductionTrackingPage.jsx`
     - `client/src/components/production/QualityReworkPage.jsx`
     - `client/src/components/production/ProductionQAModule.jsx`
     - `client/src/components/production/FinishedGoodsModule.jsx`
     - `client/src/components/production/ProductionReportsModule.jsx`
     - `client/src/App.jsx`
- **Reason**: User requested simplification of the Production Management module for non-technical manufacturing staff with clean 7-page navigation and minimal clicks.
- **Impact**: Streamlined shopfloor workflow, zero build errors (`npm run build` in 786ms), 100% backward compatibility for all legacy routes and APIs.

- **Date**: 2026-11-14
- **Decision**: Mobile Responsiveness & Layout Overhaul matching Reference Screenshot 1 (VairaWorks ADMIN).
  - **Reason**: Eliminated header horizontal overflow by hiding department pills under 1200px and breadcrumbs on mobile, docked the bottom navigation bar with fixed z-index, enhanced KPI cards with responsive 2-column squircle icons, and added mobile touch-friendly table scrolling.
#### Change: Production Management Simplification & 7-Page Workflow Re-architecture
- **What was changed**: Re-architected the 12 underlying production modules into an intuitive, sequential 7-page manufacturing pipeline matching the requested workflow:
  $$\textbf{Sales Order} \longrightarrow \textbf{Work Orders (BOM/Schedule)} \longrightarrow \textbf{Materials (Requests/Issues)} \longrightarrow \textbf{Manufacturing (Progress/Updates)} \longrightarrow \textbf{Quality Check (QA/Rework)} \longrightarrow \textbf{Finished Goods} \longrightarrow \textbf{Logistics}$$
  1. **7 Main Sidebar Navigation Pages**:
     - `01 Dashboard`: Executive summary cards (Total Orders, Pending, In Progress, Completed, QA Pending, Ready for Dispatch), pending task actions (Materials required, Awaiting scheduling, Awaiting QA), and live Work Order table.
     - `02 Work Orders`: 3 sub-tabs (`All Orders | BOM | Schedule`) consolidating Work Order planning, BOM recipe inspection, and production scheduling. Added duplicate SO warning, missing BOM warning with direct link, and full Work Order details dialog.
     - `03 Materials`: 2 sub-tabs (`Material Requests | Issued Materials`) linking directly to SCM inventory stock. Required quantities are calculated from BOM $\times$ production quantity. Enforces strict stock conservation (issued cannot exceed available warehouse stock).
     - `04 Manufacturing`: 3 sub-tabs (`In Progress | Daily Updates | Completed`). Real-time line controls (Pause, Resume, Hold), daily shift updates with auto-calculated pending quantities (`planned - completed`), and completion sign-off routing to QA.
     - `05 Quality Check`: 3 sub-tabs (`Pending QA | Passed | Failed & Rework`). Quarantine gate displaying completed batches awaiting QA, approved test parameter checklist, Pass $\rightarrow$ Finished Goods routing, and Fail $\rightarrow$ Rework technician assignment loop.
     - `06 Finished Goods`: 4 sub-tabs (`All | Available | Reserved | Dispatched`). Full audit lineage from SO $\rightarrow$ WO $\rightarrow$ QA Approval $\rightarrow$ FG Serial, stock reservations, and 1-click handover to Logistics dispatch.
     - `07 Reports`: Production summary analytics, work order status mix, QA first-pass yield rate, delay tracker, and CSV report export.
  2. **Zero Duplicate Typing & Clean Data Carryover**:
     - Sales Order handover pre-fills customer, product, specifications, and target dates into Work Orders.
     - Work Order pre-fills required raw materials and quantities into Material Requests based on the linked BOM.
     - Material Issue enforces SCM stock deductions.
     - Completion passes verified units to QA.
     - Passed QA tests auto-populate Finished Goods receipts.
     - Finished Goods reservations hand over to Logistics delivery planning.
  3. **Files changed**:
     - `client/src/components/common/Sidebar.jsx`
     - `client/src/components/production/ProductionDashboardModule.jsx`
     - `client/src/components/production/ProductionOrdersPage.jsx`
     - `client/src/components/production/ProductionPlanningModule.jsx`
     - `client/src/components/production/ProdMaterialRequestsPage.jsx`
     - `client/src/components/production/MaterialRequestsModule.jsx`
     - `client/src/components/production/ProductionMaterialIssueModule.jsx`
     - `client/src/components/production/ProductionTrackingPage.jsx`
     - `client/src/components/production/QualityReworkPage.jsx`
     - `client/src/components/production/ProductionQAModule.jsx`
     - `client/src/components/production/FinishedGoodsModule.jsx`
     - `client/src/components/production/ProductionReportsModule.jsx`
     - `client/src/App.jsx`
- **Reason**: User requested simplification of the Production Management module for non-technical manufacturing staff with clean 7-page navigation and minimal clicks.
- **Impact**: Streamlined shopfloor workflow, zero build errors (`npm run build` in 786ms), 100% backward compatibility for all legacy routes and APIs.

- **Date**: 2026-11-15
- **Decision**: SCM Stock Promotion to Head Tab & Bidirectional Supplier-Material Cross-Linking
  1. **Stock Head Tab Promotion**:
     - Moved `Stock` (InventoryModule) out of `Quality & Inventory` to become the #2 top-level head tab directly below Dashboard (`02 Stock`).
     - Sidebar order: `01 Dashboard`, `02 Stock`, `03 Materials`, `04 Suppliers`, `05 Purchasing`, `06 Quality Control`, `07 Material Issues`, `08 Reports`.
     - Quality Control module now focuses cleanly on 3 inspection tabs: `QC Pending`, `QC History`, `Supplier Returns`.
  2. **Bidirectional Supplier-Material Visibility & Quick PO**:
     - **Supplier Directory**: Added `Supplied Materials` count badge to table; in details modal, displays table of all supplied materials (SKU, rate, MOQ, lead time, priority) with direct `+ Create PO` button, plus recent purchase order history.
     - **Material Master**: Added `Approved Suppliers` badge and preferred vendor rate to table; in details modal, displays table of all approved vendors supplying this material with direct `+ Create PO` procurement action.
     - **Automated PO Pre-population**: Clicking `+ Create PO` from either a Material or Supplier navigates to Purchasing with vendor, material, contract rate, and MOQ pre-filled.
  3. **Verification**: Frontend build verified clean with Vite (994ms, 0 errors) and all 14 end-to-end integration tests passing.

- **Date**: 2026-11-15
- **Decision**: SCM Navigation Polish - Move Supplier Material Links to Suppliers Module
  1. **User Request**: User requested moving `Supplier Material Links` from the `Materials` page into the `Suppliers` page so both `Suppliers` and `Supplier Material Links` are together under the Suppliers tab.
  2. **Components Created / Modified**:
     - Created `client/src/components/modules/SuppliersPage.jsx`: Houses 2 internal sub-tabs:
       - Sub-tab 1: `Suppliers ({count})` (Vendor Directory with registration, GST, contact info, payment terms)
       - Sub-tab 2: `Supplier Material Links ({count})` (Vendor-to-Material contracts, negotiated rates, MOQ, lead time, preferred vendor toggle)
     - Streamlined `client/src/components/modules/MaterialsPage.jsx`: Dedicated purely to `MaterialMasterModule` (Raw Material Catalog) without redundant link sub-tabs.
     - Updated `client/src/App.jsx`: Directed `scm-suppliers` and alias `scm-supplier-links` to `SuppliersPage`, defaulting to appropriate sub-tab.
     - High-contrast styling fix in `SupplierMaterialLinkModule.jsx` for contract rates on enterprise light theme.
  3. **Verification**: Frontend build verified clean with Vite in 1.19s with 0 errors.

- **Date**: 2026-11-15
- **Decision**: SCM, Logistics, and Employee Management Overhaul & Master Integration Verification
  1. **Supply Chain Management (SCM) Overhaul (7 Main Pages)**:
     - Consolidated SCM navigation into 7 clean pages: `Dashboard`, `Materials`, `Suppliers`, `Purchasing` (Sub-tabs: Purchase Orders | Goods Receipts), `Quality & Inventory` (Sub-tabs: QC Pending | QC History | Stock | Supplier Returns), `Material Issues` (Sub-tabs: Factory Requisitions | Issue History), `Reports`.
     - Enforced strict inventory conservation: Stock increases ONLY upon passing QC tests (`QC Pending` quarantine gate prevents premature inventory usage).
     - Connected Production Work Orders with SCM Material Issues (`preSelectedRequest` auto-fill).
  2. **Logistics & Delivery Management Overhaul (6 Main Pages)**:
     - Consolidated Logistics navigation into 6 clean pages: `Dashboard`, `Deliveries` (Sub-tabs: Delivery Planning | Dispatch | Vehicles & Couriers), `Tracking` (Sub-tabs: In Transit | Delivered | Exceptions & Delays), `Delivery Confirmation` (Sub-tabs: Pending POD | Confirmed Receipts), `Installation & Service` (Sub-tabs: Scheduled | In Progress | Completed | Failed / Retest | All Deployments), `Reports`.
     - Integrated the mandatory **7-Point Commissioning Quality Gate** (Physical, Electrical, Vacuum Integrity, Cooling Performance, Safety Sensors, Calibration, Operator Training) before marking installation complete.
     - Automated handoff: Confirming POD automatically schedules the installation job.
  3. **Employee Management & RBAC Overhaul (5 Main Pages)**:
     - Consolidated Employee navigation into 5 clean pages: `Dashboard`, `Employees` (Sub-tabs: All | Active | Inactive), `Departments`, `Roles & Permissions` (Sub-tabs: Configured Roles | Permission Matrix), `Audit Logs` (Sub-tabs: Activity History | Personnel Reports).
     - Enforced cascading RBAC rules: when `access = false`, all child action flags (`create`, `read`, `edit`, `delete`, `approve`, `export`) are disabled.
     - Enforced Super Admin Inviolability (cannot delete or demote root administrator).
  4. **Master Integration & Bug Fixes**:
     - Fixed Follow-Up status validation failure (`status: 'Scheduled'`) by removing restrictive enum constraint from `server/models/FollowUp.js` and adding safe fallbacks.
     - Fixed collision handling in code generators for `followUpNumber`, `piNumber`, `customerPONumber`, `soNumber`, and `workOrderNumber`.
     - Added automatic customer resolution in Quotations and Follow-ups if `companyName` is provided without a pre-existing customer ID.
     - Fixed Proforma Invoice `bankDetails` object serialization to string.
     - Mounted SCM routes on both `/api` and `/api/scm` in `server/server.js` for seamless frontend compatibility.
     - Fixed item quantity mapping in GRN and Material Issue (`quantity` / `orderedQuantity` / `issueQuantity` / `issuedQuantity`).
     - Executed full 14-point master integration test suite spanning Sales -> Production -> SCM -> Logistics -> Employee Management with **14 / 14 tests passing (100%)**.
     - Frontend production build verified with Vite (`npm run build`) passing cleanly in 797ms with zero errors.

- **Date**: 2026-11-14
- **Decision**: Consolidate 47 separate tabs into 28 structured main pages with internal sub-tabs.
  - **Reason**: Having 47 flat sidebar tabs caused excessive cognitive load, cluttered navigation, and poor mobile UX. Grouping tightly-coupled steps (e.g. PO + GRN + Returns, Quotes + PI, Work Orders + Schedules) into unified tabbed pages improves ergonomics while maintaining 100% of existing workflows and data models.
  - **Date**: 2026-11-13
- **Decision**: Transform UI to Modern Enterprise Light Theme based on Reference Screenshot 1.
  - **Reason**: Dark obsidian theme was identified by user as crowded and difficult to read. Light theme provides superior contrast, cleaner presentation, and executive dashboard aesthetics.
  - **Date**: 2026-11-13
- **Decision**: Avoid TypeScript and keep pure JavaScript (`.js` / `.jsx`).
  - **Reason**: Explicit user constraint and consistency with existing project configuration.
  - **Date**: 2026-11-13
- **Decision**: Avoid Tailwind CSS and Material UI in favor of custom light-theme design tokens.
  - **Reason**: Preserves custom CSS architecture and avoids utility-class bloat or Material UI runtime overhead.
  - **Date**: 2026-11-13
- **Decision**: Zero `git push` command execution.
  - **Reason**: Safety constraint to maintain local branch control without remote interference.
  - **Date**: 2026-11-13

### 2026-11-16
#### Change: Production & Supply Chain Workflow Harmonization & Sales Order Visibility
- **What was changed**:
  1. **Sales Order Visibility in Production Dashboard**:
     - Embedded dedicated **Incoming Sales Orders (from Sales CRM)** table directly in `ProductionDashboardModule.jsx`.
     - Displays confirmed customer sales orders awaiting production planning with Customer name, Product, Ordered Quantity, Target Delivery Date, and Work Order linkage status.
     - 1-Click **`+ Create Work Order ➔`** button opens the pre-filled Work Order creation dialog with customer, product, batch quantity, and BOM pre-selected (zero duplicate typing).
  2. **Work Orders Enhanced with Sales Order Context & Stock Issued Status**:
     - `ProductionPlanningModule.jsx` renders linked Sales Order particulars (SO number, shipping address, commercial notes, and sales instructions) in the Work Order row and details view.
     - Displays real-time **Stock / Material Status** (`✓ Stock Issued`, `Store Issue Pending`, `Request BOM Required`) based on store issuance records.
     - Added direct **`Request BOM ➔`** and **`Assembly ➔`** action buttons on every Work Order.
  3. **Supply Chain Dashboard Production Requisitions & Shortage PO Integration**:
     - `ScmDashboardModule.jsx` features a dedicated **Production Material Requisitions** section evaluating warehouse stock balances for every requested BOM component.
     - **If stock is available**: 1-click **`Issue to Production ➔`** opens store issue slip.
     - **If material shortage exists**: Displays prominent warning badge and 1-click **`+ Order from Supplier (Create PO) ➔`** which pre-fills the vendor, raw material, and required shortage quantity into `PurchaseOrdersModule.jsx`.
     - Added visual **5-Step SCM Inward Lifecycle Banner**: `1. Order from Supplier (PO) ➔ 2. Goods Receipt (GRN) ➔ 3. Quality Check (QC Pass) ➔ 4. Stock Increases ➔ 5. Issue to Production`.
  4. **Production Execution, Daily Updates & QA Completion Workflow**:
     - Added direct **`+ Daily Update`** button on active assembly execution rows in `ProductionExecutionModule.jsx` to log shift progress without changing screens.
     - `ProductionQAModule.jsx` passing inspection (`Pass`) automatically updates the Work Order status to `Completed`, updates completion status to `QA Passed`, and transfers approved machines to `FinishedGoodsModule.jsx`.
     - `ProductionPipelineStepper.jsx` updated to 5 user-friendly lifecycle stages: `1. Work Orders (from SO) ➔ 2. Stock Issued & Requisitions ➔ 3. Start Production & Updates ➔ 4. Quality QA Inspection ➔ 5. Production Completed`.
- **Files changed**:
  - `client/src/components/production/ProductionDashboardModule.jsx`
  - `client/src/components/production/ProductionPlanningModule.jsx`
  - `client/src/components/production/ProductionOrdersPage.jsx`
  - `client/src/components/production/ProductionExecutionModule.jsx`
  - `client/src/components/production/ProductionTrackingPage.jsx`
  - `client/src/components/production/ProductionPipelineStepper.jsx`
  - `client/src/components/production/MaterialRequestsModule.jsx`
  - `client/src/components/production/QualityReworkPage.jsx`
  - `client/src/components/modules/ScmDashboardModule.jsx`
  - `client/src/App.jsx`
  - `server/controllers/productionController.js`
  - `lk.md`
- **Reason**: User requested: "sales management=> enquiry-qualifed lead-follow up-quation-customer accept/reject-pi-po like(so)-production dashboard show so order have; production management- work order sho the so details- request bom send- show the supply chain dashboard- have material issuse not metrial have - order suppier-gnd-quatity check-accept increase the stock- then issuse to production; production show the stock issued-planning-start production-daily updates-qa-pass-production completed; make userfriendli worflow; dont complex design; make simmply ;user friendly; alredy correct working sales management and supply chain management; production is some complex ; fix; also worflow make; fix;".
- **Impact**: Full end-to-end synchronization between Sales, Supply Chain, and Production. Clear, intuitive, non-complex navigation for shopfloor staff. Production build passes in 1.68s with zero errors; no code pushed to remote Git.
- **What was changed**:
  1. **Numbered Sidebar Navigation**:
     - `01 Dashboard`: Executive summary with interactive manufacturing pipeline overview, 6 KPIs, and priority blocker tasks.
     - `02 Work Orders`: Work Orders, BOM recipes, and production scheduling with 1-click status transitions.
     - `03 Material Requests`: Clarified from generic "Materials" to eliminate confusion with SCM Materials Master. Manages shopfloor requisitions and warehouse material issues.
     - `04 Assembly & Execution`: Clarified from "Manufacturing" to emphasize shopfloor assembly lines, shifts, and daily progress logs.
     - `05 Quality & Rework`: Clarified from "Quality Check" to encompass quarantine inspection, test parameter checks, and rework loops.
     - `06 Finished Goods`: Warehouse storage, serial tracking, and 1-click handover to Logistics delivery scheduling.
     - `07 Reports`: Production throughput, QA yield, and scrap analytics.
  2. **Interactive 5-Stage Stepper (`ProductionPipelineStepper.jsx`)**:
     - Embedded across all Production views (`Dashboard`, `Work Orders`, `Material Requests`, `Assembly & Execution`, `Quality & Rework`, `Finished Goods`).
     - Features live count badges for each stage (`workOrders`, `materialRequests`, `executions`, `qaTests`, `finishedGoods`).
     - Allows direct 1-click navigation between stages and provides visual cues for active vs passed stages.
  3. **Seamless Stage Handovers (Zero Duplicate Steps)**:
     - **Work Orders ➔ Material Requests**: Clicking "Materials" carries the Work Order down and pre-calculates required raw materials from the active BOM.
     - **Work Orders ➔ Assembly**: Added direct 1-click `Assembly ➔` button on ready/running orders to jump directly to the assembly execution bay.
     - **Material Requests ➔ Material Issue**: Fixed state loss bug where clicking `Issue ➔` previously dropped the requisition. Now passes `selectedMRForIssue` to `ProductionMaterialIssueModule` and auto-opens the prefilled issue modal.
     - **Material Issue ➔ Shopfloor Assembly**: Added `Proceed to Shopfloor Assembly ➔` button on issue records and detail modals to transition immediately into manufacturing.
     - **Shopfloor Assembly ➔ Completion**: Added `Complete ➔` button on active execution rows to take operators directly into the completion log.
     - **Completion ➔ Quality QA**: 1-click handover to quarantine quality inspection.
     - **Quality QA ➔ Finished Goods**: 1-click transfer on passed inspection into warehouse inventory.
- **Files changed**:
  - `client/src/components/common/Sidebar.jsx`
  - `client/src/components/production/ProductionPipelineStepper.jsx`
  - `client/src/components/production/ProductionDashboardModule.jsx`
  - `client/src/components/production/ProductionOrdersPage.jsx`
  - `client/src/components/production/ProductionPlanningModule.jsx`
  - `client/src/components/production/ProdMaterialRequestsPage.jsx`
  - `client/src/components/production/ProductionMaterialIssueModule.jsx`
  - `client/src/components/production/ProductionTrackingPage.jsx`
  - `client/src/components/production/ProductionExecutionModule.jsx`
  - `client/src/components/production/QualityReworkPage.jsx`
  - `client/src/components/production/FinishedGoodsModule.jsx`
  - `client/src/App.jsx`
- **Impact**: Intuitive, easy-to-use production workflow with zero technical friction for shopfloor staff. Production build passes cleanly with zero errors.

### 2026-11-16 (Post-WO BOM Recipe Workflow & Zero BOQ in Work Order Form)
- **User Request**: "one small chabge create work order then make the bom; fix the bug; form dont be show select the boq"
- **Reason**: The user specified that Work Orders must be created first before formulating the BOM recipe, and the Work Order creation form must NEVER ask the user to select a BOM/BOQ.
- **What was changed**:
  1. **Work Order Form Simplification (Zero BOM/BOQ Select)**:
     - Verified and ensured the Create Work Order modal in `ProductionPlanningModule.jsx` has NO BOM or BOQ select dropdown.
     - Added a helpful inline tip: *"💡 Tip: Create this Work Order first. You will define or review its BOM recipe in the next step."*
     - Sanitized `formData.bom`, `salesOrder`, `customer`, and `product` so empty strings do not trigger Mongoose `CastError` during creation.
  2. **Post-WO BOM Creation & Auto-Link Flow**:
     - In `ProductionOrdersPage.jsx`: Added state `preSelectedProductForBOM` and handler `handleNavigateToBOM(wo)`.
     - In `ProductionPlanningModule.jsx`:
       - If no BOM exists for the Work Order product: table shows `+ Make BOM ➔` button in orange; details modal displays *Step 2: Define Bill of Materials (BOM Recipe)* banner with `+ Make BOM Recipe ➔` button.
       - If BOM exists: displays *Request BOM Materials ➔* store requisition button.
     - In `BOMModule.jsx`: Accepts `preSelectedProduct` and auto-opens the "Create Bill of Materials" modal with the Work Order's target product pre-selected.
     - In `server/controllers/productionController.js`:
       - `createWorkOrder`: Cleans empty string references to prevent Mongoose ObjectId cast failures.
       - `createBOM`: Automatically links the newly created BOM to any pending Work Orders for that product in the database.
- **Files changed**:
  - `client/src/components/production/ProductionPlanningModule.jsx`
  - `client/src/components/production/ProductionOrdersPage.jsx`
  - `client/src/components/production/BOMModule.jsx`
  - `server/controllers/productionController.js`
  - `lk.md`
- **Verification**:
  - `npm --prefix client run build`: Built cleanly in 1.41s with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero git push performed (all changes kept locally).

### 2026-11-16 (Simplified ERP Production & Supply Chain Management Workflow)
- **User Request**: "ERP – Simplify Production & Supply Chain Workflow: Fix and simplify existing Production and SCM workflows without rebuilding. Phase 1: Sales Order Confirmed -> Production Order Created -> Planning -> BOM -> Material Request Sent to Store. Phase 2: Material Request Received -> Stock Availability Check (Case A: Fully Available -> Issue 100 -> Fully Issued; Case B: Partially Available -> Issue 60 -> Partially Issued -> Remaining: 40; Case C: Not Available -> Out of Stock -> Proceed to purchase). Phase 3: Shortage -> Purchase Request -> Supplier / PO -> GRN -> Inventory Updated -> Remaining Material Issued. Phase 4: Material Issued -> Production Plan -> Daily Production Process -> Production Completed. Fix Existing BOM Pending Bug: SCM already issued materials but Production still shows BOM Pending. Keep only 4 essential Production tabs (Production Orders, Planning & BOM, Daily Production, Completed Production) and 4 essential Store tabs (Material Requests, Stock & Material Issue, Purchase & GRN, Issue History). Single update to Finished Goods inventory and Sales Order synchronization."
- **Reason**: Factory workers and operators require a simple, intuitive, non-technical ERP interface with clear real-time statuses and seamless stage handovers without disconnected models or false "BOM Pending" indicators.
- **Root Cause of BOM Pending Bug**:
  - Supply Chain Store issued materials via `scmController.createMaterialIssue` (`/api/material-issues`), which wrote exclusively to `MaterialIssue` and did not update `MaterialRequest` or `WorkOrder`, nor write to `ProductionIssue` (`/api/production/material-issues`).
  - Production components checked `productionMaterialIssues`, so after SCM issued materials, Production had zero issue records and displayed "Store Issue Pending" or "Request BOM Required".
  - BOM status was not separated from Material Request and Material Issue status.
- **What was changed**:
  1. **Backend Synchronization & Dual-Model Mirroring**:
     - `scmController.createMaterialIssue`:
       - Synchronizes `MaterialRequest`: Updates `alreadyIssuedQty`, `remainingQty`, and sets status to `Fully Issued` or `Partially Issued`.
       - Synchronizes `WorkOrder`: Updates status to `Ready to Start` when fully issued, or `Partially Issued`.
       - Mirrors issue into `ProductionIssue` collection so all Production endpoints immediately receive the issue records.
     - `productionController.createMaterialIssue`:
       - Synchronizes `MaterialRequest` and `WorkOrder`.
       - Mirrors issue into `MaterialIssue` (SCM collection).
     - `productionController.createProductionUpdate`:
       - Supports daily progress logging (`supervisorName`, `workCompletedDescription`).
       - When completed (`isCompleted: true` or `totalCompleted >= planned`): Marks `WorkOrder.status = 'Completed'`, updates `SalesOrder.productionStatus = 'Completed'`, and creates `FinishedGood` inventory **exactly once**.
       - While in progress: Sets `WorkOrder.status = 'Running'` and `SalesOrder.productionStatus = 'In Assembly'`.
     - `scmController.createGRN`:
       - When GRN is directly accepted (`status: 'Accepted'`), immediately credits `Inventory.availableStock` and `Material.currentStock` and logs to `StockLedger`, enabling instant replenishment and issue of remaining materials.
     - Updated Mongoose Schema Enums in `WorkOrder.js`, `MaterialRequest.js`, `ProductionIssue.js`, `GRN.js`, and `StockLedger.js` to support all required operational states.
  2. **Simplified 4-Tab Production Management (`ProductionOrdersPage.jsx`)**:
     - **Tab 1: Production Orders**:
       - View all production orders with clear status breakdown (Planning, BOM Verified, Materials Readiness, Production Status) and dynamic next action.
       - **Simple Production Order Form**: Sales Order (dropdown), Product (auto-filled), Quantity (auto-filled/editable), Planned Start/End Dates, BOM (select dropdown), Remarks. Actions: **Save Plan | Request Materials**.
     - **Tab 2: Planning & BOM**:
       - Production Plan inspection, BOM recipe component verification, store inventory check with shortage detection.
       - 1-click **Send Material Request to Store** button.
     - **Tab 3: Daily Production**:
       - Active order selector, **Daily Production Form** (Order select, Production Date, Planned Qty, Previously Completed Qty, Completed Today, Rejected Today, Remaining Qty, Remarks).
       - Actions: **Save Daily Progress | Complete Production**.
       - Daily Shift Logs table.
     - **Tab 4: Completed Production**:
       - Archive of all completed production orders, finished goods serial and batch numbers, and warehouse stock status.
  3. **Simplified 4-Tab Supply Chain / Store (`MaterialRequestsPage.jsx`)**:
     - **Tab 1: Material Requests**: Requisitions received from Production with stock check (Case A: Fully In Stock, Case B: Partially In Stock, Case C: Out of Stock).
     - **Tab 2: Stock & Material Issue**: **Simple Material Issue Form** (Request ID, Production Order, Material, Required Qty, Available Stock, Already Issued, Issue Qty, Balance Qty) with stock limit validation warnings. Handles Case A, B, and C.
     - **Tab 3: Purchase & GRN**: Shortages table with 1-click **+ Create PO ➔**, Purchase Orders list, and Inward GRN receipt with direct acceptance to credit Store stock.
     - **Tab 4: Issue History**: Verified ledger of all material issue slips.
  4. **Sidebar & Pipeline Stepper Alignment**:
     - `Sidebar.jsx`: Production menu updated to `01 Production Orders`, `02 Planning & BOM`, `03 Daily Production`, `04 Completed Production`, and `05 Dashboard`. SCM item updated to `07 Store & Material Issue`.
     - `ProductionPipelineStepper.jsx`: Mapped to the streamlined stages.
- **Verification**:
  - Full end-to-end node integration test script passed 100% across all 9 workflow stages:
    1. Sales Order -> Production Order Created -> Planned.
    2. BOM Verified.
    3. Material Request Sent to Store -> Pending.
    4. SCM Partial Issue (Case B) -> Material Request & Work Order updated to `Partially Issued`.
    5. Shortage PO created -> GRN accepted -> Store inventory updated to 60 units.
    6. Issue Remaining (Case A) -> Material Request updated to `Fully Issued` and Work Order to `Ready to Start` (ZERO BOM Pending!).
    7. Daily Production progress logged -> Work Order updated to `Running` and Sales Order to `In Assembly`.
    8. Production completed -> Work Order updated to `Completed` and Sales Order to `Completed`.
    9. Finished Goods inventory record created **exactly once**.
  - `npm --prefix client run build`: Built in 878ms with zero errors.
  - Backend running healthy on port 5000 with MongoDB connected.
  - Zero `git push` executed (all changes kept locally).

---

## Important Notes
- Always check `lk.md` before making any code or architectural changes.
- Always run `npm run build` inside `client/` to verify frontend builds after any JSX or CSS modification.
- Always ensure backend routes in `server/routes/` match the frontend methods in `client/src/services/api.js`.

