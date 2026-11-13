# Business Logic & Validation Rules

1. **Inventory Conservation**:
   - Available Stock = Σ(QC Accepted) - Σ(Production Issued) - Σ(Supplier Returned) ± Audited Adjustments.
   - No direct manual inventory additions allowed.

2. **Supplier Material Link Uniqueness**:
   - Compound index on `(supplierId, materialId)` prevents duplicate mapping.

3. **Purchase Order Line Calculation**:
   - `Line Total = (Quantity × Unit Price) + (Quantity × Unit Price × GST% / 100)`.
   - `Grand Total = Σ(Line Totals) + Freight`.

4. **Goods Receipt Note (GRN) Inward**:
   - Received quantity cannot exceed PO pending quantity unless approved.
   - Material placed into Quarantine; Available Stock remains 0 until QC signoff.

5. **QC Tests**:
   - `Tested Qty = Accepted Qty + Rejected Qty`.
   - Result:
     - `Pass`: Accepted == Tested
     - `Reject`: Rejected == Tested
     - `Partial Pass`: Both Accepted > 0 and Rejected > 0

6. **Material Issue**:
   - Issue Qty must be greater than 0 and `<= Available Stock`.
   - Overdraft of stock is rejected with HTTP 400 validation error.

7. **Supplier Return**:
   - Return Qty must be `<= Available Rejected Qty` from QC.

