# Supply Chain Management Workflows

## Workflow 1: Master Setup
1. Define Materials in **Raw Material Master** (`RM-001`, `RM-002`).
2. Register Vendors in **Suppliers** (`SUP-001`).
3. Contract Mapping in **Supplier Material Link** (Bind Vendor + Material + Price + Lead Time).

## Workflow 2: Inward Procurement & Quality Loop
1. Create and Approve **Purchase Order** (`PO-001`).
2. Factory Inward: Receive items via **Goods Receipt Note (GRN)**. Status becomes `QC Pending`. Stock is quarantined.
3. Quality Inspection in **QC Tests**:
   - `Accepted Qty` -> Automatically credited to **Raw Material Inventory**.
   - `Rejected Qty` -> Automatically transferred to **Returns to Supplier** queue.
   - GRN marked `Completed`.

## Workflow 3: Production Consumption
1. Shopfloor raises a requisition against a Work Order.
2. Store creates **Material Issue to Production**.
3. System verifies `Issue Qty <= Available Approved Stock`.
4. On issue, **Raw Material Inventory** is automatically decremented and logged in Stock Ledger.

## Workflow 4: Vendor Return
1. Vendor return initiated from QC-rejected batches.
2. Store creates **Returns to Supplier** with gate pass and debit note number.
3. System verifies `Return Qty <= Available Rejected Qty` and updates records.

