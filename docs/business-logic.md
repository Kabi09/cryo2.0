# Cryo Enterprise 2.0 – Core Business Logic & Validation Rules

---

## 1. Supply Chain Management (SCM) Rules

1. **Inventory Conservation Law**:
   - `Available Stock = Σ(QC Accepted Inward) - Σ(Store Issues to Production) - Σ(Supplier Returns) ± Audited Adjustments`.
   - **No Arbitrary Additions**: Direct manual stock additions without purchase/QC paperwork are strictly blocked.
   - Initial stock can only enter after Goods Receipt Note (GRN) items pass Quality Control.

2. **Supplier Material Link Compound Uniqueness**:
   - Compound index on `(supplier, material)` strictly prevents duplicate vendor-material mappings.
   - Prevents inconsistent price contracts and ambiguous sourcing rules.

3. **Quarantine & Inward Receipt**:
   - Creating a Goods Receipt Note (GRN) flags items as `QC Pending`.
   - Quarantined stock remains at `0` available quantity until QA approval.

4. **Stock Issue Bounds**:
   - `Issue Quantity <= Available Approved Stock`.
   - Attempting to issue more than available stock triggers an HTTP 400 validation error.

5. **Vendor Return Limits**:
   - Returns to supplier can only be processed from items flagged as `Rejected` during QC.
   - `Return Quantity <= Available Rejected Quantity`.

---

## 2. Sales Management (CRM) Rules

1. **Customer Deduplication on Conversion**:
   - Converting an Enquiry (`ENQ`) to a Lead Opportunity (`LD`) reuses the existing Customer Code (`CUS`) if the company name or email matches.
   - Duplicate customer accounts for the same client entity are blocked.

2. **Quotation Negotiation Versioning**:
   - Modifying a quotation during commercial negotiation increments the version (`V1` → `V2` → `V3`).
   - Previous versions remain immutable in the database for legal and pricing audit trails.

3. **Synchronized Lead Pipeline**:
   - Marking a Quotation `Accepted` automatically transitions the associated Lead Opportunity to `Won`.
   - Marking a Quotation `Rejected` transitions the Lead Opportunity to `Lost`.

4. **Advance Payment & Proforma Balance**:
   - Payments recorded against a Proforma Invoice (`PI`) automatically decrement the invoice's outstanding balance:
     `Remaining Balance = Grand Total - Σ(Verified Payments)`.
   - Overpayment beyond invoice total is flagged for accounting reconciliation.

5. **Production Handover Gate**:
   - A Sales Order can only be dispatched to Production Planning once client Purchase Order verification or minimum advance payment terms are met.

---

## 3. Production Management Rules

1. **BOM Freezing on Work Order Creation**:
   - When a Work Order (`WO`) binds to a Bill of Materials (`BOM`), the exact revision (`V1`) and component ratios are locked to that order.
   - Future engineering alterations to the master BOM do not retroactively alter active production batches.

2. **Single Company Store Stock Registry**:
   - Material requests from production connect directly to the **Supply Chain Inventory** database.
   - Production does not maintain a detached phantom stock database. All consumption draws from verified SCM inventory.

3. **Store Issuance Verification & Stock Ledger Audit**:
   - The Company Store can only issue materials up to the verified warehouse balance.
   - Confirming an issuance simultaneously:
     1. Decrements `Inventory.currentStock`.
     2. Updates `Material.currentStock`.
     3. Records a permanent `OUT` transaction in `StockLedger` tagged with the issue number and batch numbers.

4. **Manufacturing Execution Prerequisite Gate**:
   - Starting a production batch (`EX`) requires either `Fully Issued` material status or an explicit authorized supervisor exception.
   - Assembly lines cannot start blindly without parts on the shopfloor.

5. **Cumulative Shift Completion Logic**:
   - Daily and weekly shift updates enforce cumulative progress math:
     `Total Completed = Previously Completed + Today's Completed`.
     `Pending Quantity = max(0, Planned Quantity - Total Completed)`.

6. **Quality Gate – Finished Goods Separation**:
   - Marking production physically complete (`PC`) changes work order status to `QA Pending`.
   - Physical completion **does not permit products into Finished Goods stock**.
   - Products are held in testing quarantine until functional QA passes.

7. **Closed-Loop Rework Cycle**:
   - Products failing QA tests (e.g. sensor offset, thermal trip) automatically generate a **Rework Order** (`RW`).
   - Defective units are assigned to technicians for repair and component replacement.
   - Repaired units must undergo a mandatory **Re-QA Inspection**.
   - Only upon passing Re-QA can repaired units enter Finished Goods inventory.

8. **Finished Goods Serialized Admission**:
   - Every entry into the Finished Goods Warehouse (`FG`) must reference a passing QA test approval code (`QA Number`).
   - Units are registered with serialized tags and warranty start dates before dispatch.

---

## 4. Logistics & Delivery Management Rules

1. **Warehouse Dispatch Inventory Protection**:
   - An exit dispatch gate slip (`DISP`) cannot be authorized without linking an active `DeliveryPlan` and a verified physical `FinishedGood` serial number.
   - Upon confirming dispatch, the referenced finished good machine status in the database transitions from `'Available'` to `'Dispatched'`.
   - Double-dispatch or phantom equipment allocation is strictly prevented by DB-level validations.

2. **Dual Transport Method Enforcement**:
   - Every delivery plan must categorize whether movement is by **Company Vehicle** or **Third-Party Courier / Transport**.
   - If *Company Vehicle*: Validates driver name, mobile number, and vehicle registration number.
   - If *Courier / Transport*: Validates carrier partner name, tracking / LR / Docket ID, and dispatch hub.

3. **Proof of Delivery (POD) & Partial Delivery Protection**:
   - A shipment cannot be closed without capturing the receiving customer representative's name and verification acknowledgment.
   - Partial Deliveries: If a customer accepts fewer machines than planned (e.g. 2 out of 3 delivered due to space constraint or transit damage), the system increments `Delivered Quantity` to 2 and leaves `Pending Quantity = 1` active in the delivery plan.
   - The delivery plan remains in status `'Partially Delivered'` until remaining units are fulfilled.

4. **Automated Site Installation Handover**:
   - When a delivery plan specifies `installationRequired: true`, the successful creation of a `DeliveryConfirmation` (POD) triggers the backend controller to automatically instantiate an `Installation` record in `'Scheduled'` status, assigning the lead field engineer without manual administrative intervention.

5. **Mandatory 7-Point Installation Quality Gate**:
   - Before an on-site installation can be closed, the technician must execute and submit the formal 7-point commissioning checklist:
     1. `Machine Bed & Structural Base Fixed Properly`
     2. `3-Phase Electrical Wiring & Grounding Safe`
     3. `Regulated Power Supply & Surge Protection Test`
     4. `Cryo Sensor & Thermocouple Calibrations Verified`
     5. `Operating Chamber Temperature Pulldown Test`
     6. `Embedded Firmware & HMI Profile Setup Complete`
     7. `Overall Functional Operation & Emergency Stop Test`
   - **Quality Rule**: If even one (1) single checkpoint is marked `'Fail'`, the backend and frontend immediately force the report status to `'Failed - Retest Required'`. The installation **cannot be signed off or completed** until the engineering defect is fixed and a 100% (7/7) passing retest is registered.

6. **Customer Acceptance & Warranty Commencement**:
   - Formal warranty coverage begins only upon mutual digital acknowledgment by both the Customer Site Engineer and the Certified Field Technician on the `InstallationCompletion` certificate.

---

## 5. Employee Management & Role-Based Access Control (RBAC) Rules

1. **Role Hierarchy & Super Admin Inviolability**:
   - **Super Admin (`isSuperAdmin: true`)**:
     - Supreme system authority with universal access across all 13 modules (`Access`, `View`, `Add`, `Edit`, `Delete`, `Export`, `Approve`).
     - **Inviolability Rule**: Super Admin permissions cannot be modified, restricted, or deleted through the UI or API endpoints. This prevents accidental system lockout.
   - **Admin (`isAdmin: true`)**:
     - Departmental or cross-departmental administrative privileges. Can manage staff, approve transactions, and generate reports, but cannot downgrade Super Admin privileges.
   - **Employee / Custom Roles**:
     - Restrictive permission profiles tailored to specific job titles (e.g., `Sales Executive`, `Store Manager`, `QA Inspector`).

2. **13-Module Permission Matrix Structure**:
   - Every role maintains a permission profile across 13 distinct ERP modules:
     `Dashboard`, `Marketing`, `Sales`, `Purchase`, `Production`, `Supply Chain`, `Inventory`, `Quality Assurance`, `Logistics`, `Installation`, `Employee Management`, `Reports`, `Settings`.
   - Each module contains 7 granular boolean capability flags:
     - `access`: Permission to enter the module from navigation/sidebar.
     - `view`: Permission to view listings, data tables, and records.
     - `add`: Permission to open creation dialogs and post new records.
     - `edit`: Permission to update or patch existing records.
     - `delete`: Permission to delete or archive records.
     - `export`: Permission to download CSV data exports or trigger print reports.
     - `approve`: Permission to authorize critical transactions (PO sign-offs, QC approvals, dispatch releases).

3. **Cascade Permission Dependency Rule**:
   - **Downward Cascade**: If `access` is toggled off (`false`) for any module, all 6 operational actions (`view`, `add`, `edit`, `delete`, `export`, `approve`) are automatically cleared to `false` and locked.
   - **Upward Cascade**: Enabling any action flag (`add`, `edit`, `delete`, `export`, `approve`) automatically sets `access` and `view` to `true`.

4. **Security Audit Logging (`AuditLog`)**:
   - Every security-sensitive transaction (Staff login, employee creation, password reset, role permission update, employee deactivation) creates an immutable record in `AuditLog` storing:
     - `action`: E.g. `LOGIN`, `CREATE`, `UPDATE_PERMISSIONS`, `RESET_PASSWORD`.
     - `module`: E.g. `Employee Management`, `Roles & Permissions`.
     - `performedBy`: User ID, username, and role.
     - `targetUser`: Target employee or role ID.
     - `details`: Human-readable summary of the action.
     - `ipAddress` & `userAgent`: Session telemetry.

5. **Authentication Security**:
   - Passwords hashed using `bcryptjs` with salt rounds = 10 before saving.
   - Plaintext passwords never transmitted in responses or logged to console/files.
   - JWT tokens signed with secure secrets for stateless request verification.
