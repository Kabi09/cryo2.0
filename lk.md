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

---

## Current Progress
- **Completed**:
  - UI/UX Complete Redesign: 100% migrated to clean light theme matching Reference Screenshot 1.
  - Supply Chain Management: 10/10 modules fully operational with light styling.
  - Sales Management CRM: 10/10 modules fully operational with light styling.
  - Production Management: 12/12 modules fully operational with light styling.
  - Logistics & Delivery Management: 9/9 modules fully operational with light styling.
  - Employee Management & RBAC: 6/6 modules fully operational with light styling.
  - Total: 47/47 modules functional with HTTP 200 API verification.
  - Root tracking file `lk.md` updated as single source of truth.
- **In Progress**:
  - Continuous runtime stability monitoring.
- **Pending**:
  - User feedback and acceptance testing.

---

## Known Issues
- *None.* All 50 API endpoints and frontend modules compile and render cleanly with zero errors.

---

## Technical Decisions
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

---

## Important Notes
- Always check `lk.md` before making any code or architectural changes.
- Always run `npm run build` inside `client/` to verify frontend builds after any JSX or CSS modification.
- Always ensure backend routes in `server/routes/` match the frontend methods in `client/src/services/api.js`.

