# Cryo Enterprise 2.0 – Complete REST API Reference

All endpoints run on Express.js (`http://localhost:5000`) and Vite development proxy (`/api`). Responses follow standard JSON `{ success: boolean, data?: any, message?: string }`.

---

## 1. Supply Chain Management Endpoints (`/api/*`)

| # | Endpoint | Method | Description | Sample Request / Query |
|---|---|---|---|---|
| 01 | `/api/materials` | `GET` | List all raw materials with current stock | `?category=Metals&status=Active` |
| 01 | `/api/materials` | `POST` | Register new raw material SKU | `{ materialCode, materialName, category, unit, minimumStock, reorderLevel }` |
| 01 | `/api/materials/:id` | `PUT` | Update raw material parameters | `{ materialName, minimumStock, reorderLevel, status }` |
| 02 | `/api/suppliers` | `GET` | List all suppliers | `?status=Active` |
| 02 | `/api/suppliers` | `POST` | Create vendor profile | `{ supplierCode, supplierName, contactPerson, mobileNumber, email, gstin, city, paymentTerms }` |
| 02 | `/api/suppliers/:id` | `PUT` | Update vendor profile | `{ contactPerson, phone, email, paymentTerms, status }` |
| 03 | `/api/supplier-material-links` | `GET` | List vendor-material mappings | `?supplierId=...&materialId=...` |
| 03 | `/api/supplier-material-links` | `POST` | Bind supplier to raw material with rate | `{ supplier, material, supplierMaterialCode, unitPrice, minOrderQty, leadTimeDays, preferredSupplier }` |
| 03 | `/api/supplier-material-links/:id` | `PUT` | Update vendor pricing or lead time | `{ unitPrice, minOrderQty, leadTimeDays, status }` |
| 04 | `/api/purchase-orders` | `GET` | List all purchase orders | `?status=Approved` |
| 04 | `/api/purchase-orders` | `POST` | Create multi-row purchase order | `{ supplier, expectedDeliveryDate, deliveryAddress, items: [{ material, quantity, unitPrice, gstPercent }], paymentTerms }` |
| 04 | `/api/purchase-orders/:id/status` | `PUT` | Advance PO workflow status | `{ status: 'Submitted' \| 'Approved' \| 'Cancelled' }` |
| 05 | `/api/grns` | `GET` | List all Goods Receipt Notes | `?status=QC Pending` |
| 05 | `/api/grns` | `POST` | Inward shipment into quarantine | `{ purchaseOrder, invoiceNumber, challanNumber, items: [{ material, receivedQuantity, batchNumber, expiryDate }] }` |
| 06 | `/api/qc-tests` | `GET` | List QC inspection records | `?result=Pass` |
| 06 | `/api/qc-tests` | `POST` | Log QC test and route accepted stock | `{ grn, material, testedQuantity, passedQuantity, rejectedQuantity, inspectionNotes, result }` |
| 07 | `/api/inventory` | `GET` | Get approved stock levels | `?lowStockOnly=true` |
| 07 | `/api/inventory/ledger/:matId` | `GET` | Retrieve chronological stock audit ledger | Returns array of `IN` and `OUT` balance entries |
| 07 | `/api/inventory/adjust` | `POST` | Audit inventory adjustment | `{ materialId, newStock, reason, notes }` |
| 08 | `/api/material-issues` | `GET` | List production issue slips | `?workOrderNumber=...` |
| 08 | `/api/material-issues` | `POST` | Issue approved stock to shopfloor | `{ workOrderNumber, department, items: [{ material, quantity }] }` |
| 09 | `/api/supplier-returns` | `GET` | List rejected vendor returns | `?status=Dispatched` |
| 09 | `/api/supplier-returns` | `POST` | Dispatch rejected goods with debit note | `{ qcTest, supplier, returnQuantity, reason, debitNoteNumber }` |
| 10 | `/api/reports` | `GET` | SCM analytical valuation & low-stock report | Returns categories, totalValuation, and lowStockAlerts |

---

## 2. Sales Management Endpoints (`/api/sales/*`)

| # | Endpoint | Method | Description | Sample Request / Query |
|---|---|---|---|---|
| 01 | `/api/sales/dashboard-summary` | `GET` | Sales pipeline KPI metrics | Returns totalEnquiries, pendingQuotes, wonDeals, pendingPayments |
| 01 | `/api/sales/products` | `GET` | List manufactured catalog products | `?category=Machinery` |
| 01 | `/api/sales/products` | `POST` | Register manufactured product | `{ productCode, productName, category, unit, basePrice, description }` |
| 02 | `/api/sales/enquiries` | `GET` | List customer enquiries | `?status=New` |
| 02 | `/api/sales/enquiries` | `POST` | Register new prospect enquiry | `{ customerType, companyName, contactPerson, mobileNumber, email, product, quantity, enquirySource, remarks }` |
| 02 | `/api/sales/enquiries/:id/convert-to-lead` | `POST` | Convert enquiry to lead without duplicate | Generates `Lead` and reuses existing `Customer` |
| 03 | `/api/sales/customers` | `GET` | List registered customer accounts | `?search=ABC` |
| 03 | `/api/sales/customers` | `POST` | Create customer profile | `{ companyName, contactPerson, mobileNumber, email, gstin, billingAddress, paymentTerms }` |
| 03 | `/api/sales/leads` | `GET` | List sales opportunities | `?leadStatus=Qualified` |
| 03 | `/api/sales/leads` | `POST` | Create lead opportunity | `{ customer, interestedProduct, expectedQuantity, expectedOrderValue, expectedClosingDate, leadStatus }` |
| 03 | `/api/sales/leads/:id/status` | `PUT` | Update lead status | `{ status: 'Qualified' \| 'Won' \| 'Lost' }` |
| 04 | `/api/sales/follow-ups` | `GET` | List customer touchpoints | `?status=Pending` |
| 04 | `/api/sales/follow-ups` | `POST` | Schedule call/meeting follow-up | `{ customer, relatedLead, contactMethod, discussionNotes, customerResponse, nextFollowUpDate, nextAction }` |
| 04 | `/api/sales/follow-ups/:id/status` | `PUT` | Mark touchpoint completed | `{ status: 'Completed' }` |
| 05 | `/api/sales/quotations` | `GET` | List commercial quotations | `?status=Sent` |
| 05 | `/api/sales/quotations` | `POST` | Generate quotation | `{ customer, lead, validUntil, items: [{ product, quantity, unitPrice, discount, gstPercent }], termsAndConditions }` |
| 05 | `/api/sales/quotations/:id/revise` | `POST` | Revise quotation (increments V1->V2) | `{ items, termsAndConditions }` |
| 05 | `/api/sales/quotations/:id/status` | `PUT` | Accept/Reject quotation | `{ status: 'Accepted' \| 'Rejected' }` |
| 06 | `/api/sales/proforma-invoices` | `GET` | List proforma invoices | `?quotation=...` |
| 06 | `/api/sales/proforma-invoices` | `POST` | Issue PI with advance terms | `{ quotation, advanceRequiredPercent, bankDetails, terms }` |
| 07 | `/api/sales/customer-pos` | `GET` | List client purchase orders | `?verified=false` |
| 07 | `/api/sales/customer-pos` | `POST` | Log customer PO document | `{ customer, customerPoNumber, relatedPI, poTotalValue, deliveryDate, paymentTerms }` |
| 07 | `/api/sales/customer-pos/:id/verify` | `PUT` | Accounts verification gate | `{ verifiedBy: 'Accounts Lead' }` |
| 08 | `/api/sales/payments` | `GET` | List advance and balance payments | `?customer=...` |
| 08 | `/api/sales/payments` | `POST` | Record payment & deduct PI balance | `{ customer, proformaInvoice, paymentMode, transactionRefNo, amountPaid, bankName }` |
| 08 | `/api/sales/payments/:id/verify` | `PUT` | Bank remittance audit sign-off | `{ verified: true }` |
| 09 | `/api/sales/sales-orders` | `GET` | List confirmed sales orders | `?status=Confirmed` |
| 09 | `/api/sales/sales-orders` | `POST` | Generate confirmed Sales Order | `{ customer, customerPO, quotation, items, billingAddress, shippingAddress }` |
| 09 | `/api/sales/sales-orders/:id/send-to-production` | `POST` | Dispatch order to Production Planning | `{ productionNotes, priority }` |
| 10 | `/api/sales/sales-reports` | `GET` | CRM performance and revenue reports | Returns revenueByRep, productSales, conversionRate, wonVsLost |

---

## 3. Production Management Endpoints (`/api/production/*`)

| # | Endpoint | Method | Description | Sample Request / Query |
|---|---|---|---|---|
| 01 | `/api/production/dashboard-summary` | `GET` | Manufacturing shopfloor KPI metrics | Returns totalOrders, inProgress, waitingMaterials, qaPending, reworkCount, completedOrders |
| 02 | `/api/production/work-orders` | `GET` | List production work orders | `?status=Running` |
| 02 | `/api/production/work-orders` | `POST` | Create work order from Sales Order | `{ salesOrder, customer, product, orderQuantity, productionQuantity, priority, productionManager, plannedStartDate, expectedCompletionDate, bom }` |
| 02 | `/api/production/work-orders/:id/status` | `PUT` | Update work order execution status | `{ status: 'Running' \| 'Paused' \| 'On Hold' \| 'Completed' }` |
| 03 | `/api/production/boms` | `GET` | List Bill of Materials | `?product=...` |
| 03 | `/api/production/boms` | `POST` | Create multi-row material recipe | `{ product, version: 'V1', effectiveDate, materials: [{ material, materialCode, materialName, quantityPerUnit, unit, wastagePercent }] }` |
| 03 | `/api/production/boms/:id` | `PUT` | Revise or archive BOM version | `{ version, status, materials }` |
| 04 | `/api/production/schedules` | `GET` | List shopfloor routing schedules | `?workOrder=...` |
| 04 | `/api/production/schedules` | `POST` | Allocate manufacturing duration & shifts | `{ workOrder, plannedQuantity, startDate, endDate, durationDays, supervisor, shift, activities: [{ activityName, durationDays }] }` |
| 04 | `/api/production/schedules/:id` | `PUT` | Update schedule milestones | `{ shift, activities, status }` |
| 05 | `/api/production/material-requests` | `GET` | List requisitions to Company Store | `?status=Pending` |
| 05 | `/api/production/material-requests` | `POST` | Requisition materials based on BOM | `{ workOrder, requestedDate, requiredDate, requestedBy, department, items: [{ material, requiredQty, requestedQty, unit }] }` |
| 05 | `/api/production/material-requests/:id/status` | `PUT` | Approve/Reject material requisition | `{ status: 'Approved' \| 'Rejected' }` |
| 06 | `/api/production/material-issues` | `GET` | List company store issuance slips | `?workOrder=...` |
| 06 | `/api/production/material-issues` | `POST` | Issue materials & decrement store stock | `{ materialRequest, workOrder, storeLocation, issuedBy, receivedBy, items: [{ material, requestedQty, approvedQty, issuedQty, batchNumber, unit }] }` |
| 07 | `/api/production/executions` | `GET` | List active manufacturing batches | `?status=Running` |
| 07 | `/api/production/executions` | `POST` | Start physical assembly line | `{ workOrder, plannedQty, materialsIssued, startDateTime, supervisor, machineWorkstation, shift, operatorName }` |
| 07 | `/api/production/executions/:id/status` | `PUT` | Pause/Resume/Hold batch execution | `{ status: 'Paused' \| 'Running' \| 'On Hold' }` |
| 08 | `/api/production/production-updates` | `GET` | List daily and weekly shift updates | `?workOrder=...` |
| 08 | `/api/production/production-updates` | `POST` | Log cumulative completed units & bottlenecks | `{ workOrder, updateType, fromDate, supervisorName, plannedQuantity, previouslyCompletedQuantity, completedQuantity, workCompletedDescription, machineStatus, problemsDelays }` |
| 09 | `/api/production/completions` | `GET` | List completed assembly batches | `?status=QA Pending` |
| 09 | `/api/production/completions` | `POST` | Sign off production & route to QA | `{ workOrder, plannedQuantity, producedQuantity, acceptedDuringProduction, actualStartDate, actualCompletionDate, productionSupervisor, remainingMaterial }` |
| 10 | `/api/production/qa-tests` | `GET` | List product functional QA tests | `?overallResult=Pass` |
| 10 | `/api/production/qa-tests` | `POST` | Test thermal, sensor, and motor specs | `{ workOrder, completion, product, batchSerialNumber, testedQuantity, passedQuantity, failedQuantity, inspectorName, testParameters: [{ parameter, expected, actual, result }], overallResult, decision: 'Finished Goods' \| 'Rework' }` |
| 11 | `/api/production/rework-orders` | `GET` | List defect repair orders | `?status=In Progress` |
| 11 | `/api/production/rework-orders` | `POST` | Log rework order for failed QA units | `{ workOrder, qaReference, serialNumber, reworkQuantity, defectDescription, reworkType, priority, assignedTechnician }` |
| 11 | `/api/production/rework-orders/:id/status` | `PUT` | Record repair actions & send for Re-QA | `{ status: 'Repair Completed' \| 'Re-QA Pending', repairAction, problemIdentified, replacementMaterials, technicianRemarks }` |
| 12 | `/api/production/finished-goods` | `GET` | List serialized QA-approved stock | `?stockStatus=Available` |
| 12 | `/api/production/finished-goods` | `POST` | Admit QA-approved machines to warehouse | `{ workOrder, salesOrder, product, serialNumber, qaApprovalReference, approvedQuantity, warehouseLocation, storageDate, productCondition }` |
| 12 | `/api/production/finished-goods/:id/status` | `PUT` | Update stock dispatch reservation | `{ stockStatus: 'Available' \| 'Reserved for Dispatch' \| 'Dispatched' }` |

---

## 4. Logistics & Delivery Endpoints (`/api/logistics/*`)

| # | Endpoint | Method | Description | Sample Request / Query |
|---|---|---|---|---|
| 01 | `/api/logistics/dashboard` | `GET` | Logistics KPI summary & stage counts | Returns `{ summary: { pendingDeliveries, inTransit, delivered, installationPending, failedDelivery }, recentDeliveries }` |
| 02 | `/api/logistics/delivery-plans` | `GET` | List planned product deliveries | `?status=Planned` |
| 02 | `/api/logistics/delivery-plans` | `POST` | Create delivery plan linked to Sales Order | `{ salesOrder, customer, deliveryAddress, product, plannedDeliveryQuantity, deliveryDate, deliveryMethod, installationRequired }` |
| 03 | `/api/logistics/vehicles-couriers` | `GET` | List company fleet vehicles and carrier partners | `?category=Vehicle` or `?category=Courier` |
| 03 | `/api/logistics/vehicles-couriers` | `POST` | Register company vehicle or courier agency | `{ category: 'Vehicle' \| 'Courier', vehicleNumber, driverName, mobileNumber, courierCompanyName, trackingPortalUrl, status }` |
| 03 | `/api/logistics/vehicles-couriers/:id` | `PUT` | Update vehicle maintenance or courier status | `{ status: 'Available' \| 'On Trip' \| 'Maintenance' \| 'Active' }` |
| 04 | `/api/logistics/dispatches` | `GET` | List warehouse dispatch exit passes | `?status=Dispatched` |
| 04 | `/api/logistics/dispatches` | `POST` | Gate dispatch, serial allocation, decrements FG stock | `{ deliveryPlan, finishedGood, serialNumber, dispatchedQuantity, ewayBillNumber, invoiceNumber, packagingCondition, driverVerified }` |
| 05 | `/api/logistics/tracking` | `GET` | List shipment transit milestone logs | `?deliveryPlan=...` or `?delayed=true` |
| 05 | `/api/logistics/tracking` | `POST` | Record live GPS/checkpoint milestone & delays | `{ deliveryPlan, currentLocation, status: 'In Transit' \| 'Out for Delivery' \| 'Delivered', delayed, delayReason, expectedDeliveryDate }` |
| 06 | `/api/logistics/confirmations` | `GET` | List Proof of Delivery (POD) sign-offs | `?status=Accepted` |
| 06 | `/api/logistics/confirmations` | `POST` | Record customer receipt, POD signature & partial deliveries | `{ deliveryPlan, receivedQuantity, damagedQuantity, customerReceiverName, customerPhone, packagingIntact, customerSignatureText, status }` |
| 07 | `/api/logistics/installations` | `GET` | List scheduled on-site engineering jobs | `?status=Scheduled` |
| 07 | `/api/logistics/installations` | `POST` | Schedule technical deployment & assign engineers | `{ deliveryPlan, customer, installationAddress, product, serialNumber, assignedTechnician, plannedInstallationDate, requiredTools }` |
| 07 | `/api/logistics/installations/:id/status` | `PUT` | Update installation progress / mark complete | `{ status: 'In Progress' \| 'Completed' \| 'Failed', remarks }` |
| 08 | `/api/logistics/installation-completions` | `GET` | List formal commissioning reports | `?overallResult=Pass` |
| 08 | `/api/logistics/installation-completions` | `POST` | Submit 7-point mandatory checklist & telemetry | `{ installation, checklist: { productFixedProperly, electricalConnection, powerSupplyTest, sensorConnection, temperatureTest, softwareConfiguration, overallWorkingCondition }, testingDetails: [...], customerConfirmation: { customerName, customerFeedback, customerSignature } }` |
| 09 | `/api/logistics/reports` | `GET` | Delivery SLA, carrier speed, and quality ratios | Returns onTimeRate, delayCauses, carrierComparison, firstTimeInstallPassRate |

---

## 5. Employee Management & RBAC Endpoints (`/api/employees/*`)

| # | Endpoint | Method | Description | Sample Request / Query |
|---|---|---|---|---|
| 01 | `/api/employees/dashboard` | `GET` | Executive HR KPIs, headcount, and recent audits | Returns `{ kpis: { totalEmployees, activeEmployees, inactiveEmployees, departmentsCount, rolesCount }, recentEmployees, recentAuditLogs }` |
| 02 | `/api/employees` | `GET` | Staff directory with department & role filters | `?department=...` or `?status=Active` or `?search=Kumar` |
| 02 | `/api/employees` | `POST` | Create new staff account with hashed password | `{ name, email, mobile, department, designation, role, reportingManager, username, password }` |
| 02 | `/api/employees/:id` | `PUT` | Update employee information or designation | `{ name, email, mobile, department, designation, role, reportingManager }` |
| 02 | `/api/employees/:id/reset-password` | `PUT` | Secure administrative password reset | `{ newPassword: 'NewSecurePassword123' }` |
| 02 | `/api/employees/:id/toggle-status` | `PUT` | Activate or deactivate staff login capability | Toggles `status: 'Active'` / `'Inactive'` |
| 03 | `/api/employees/roles` | `GET` | List all roles with 13-module permission matrices | Returns array of roles with embedded `permissions` object |
| 03 | `/api/employees/roles` | `POST` | Create custom organizational role | `{ roleName, description, department, permissions: [...] }` |
| 03 | `/api/employees/roles/:id` | `PUT` | Update role permissions (protected for Super Admin) | `{ permissions: [{ module: 'Sales', access: true, view: true, add: true, edit: true, delete: false, export: true, approve: true }, ...] }` |
| 04 | `/api/employees/departments` | `GET` | List all corporate departments & head of dept | Returns `{ data: [{ departmentCode, name, description, headOfDepartment, employeeCount }] }` |
| 04 | `/api/employees/departments` | `POST` | Create new company department | `{ name, description, headOfDepartment }` |
| 05 | `/api/employees/login` | `POST` | Authenticate staff credentials & issue JWT | `{ username, password }` -> Returns `{ success: true, token, user }` |
| 05 | `/api/employees/me` | `GET` | Retrieve logged-in session user profile | Header: `Authorization: Bearer <token>` |
| 06 | `/api/employees/reports` | `GET` | Workforce analytics, allocation & audit logs | Returns `{ totalStaff, activeStaff, inactiveStaff, departmentBreakdown, auditLogs }` |
| 06 | `/api/employees/audit-logs` | `GET` | Real-time immutable security audit trail | Returns `{ data: [{ action, module, performedBy, details, timestamp, ipAddress }] }` |

