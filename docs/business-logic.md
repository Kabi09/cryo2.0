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
