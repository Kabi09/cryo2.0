require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Product = require('../models/Product');
const Material = require('../models/Material');
const SalesOrder = require('../models/SalesOrder');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');

const BOM = require('../models/BOM');
const WorkOrder = require('../models/WorkOrder');
const ProductionSchedule = require('../models/ProductionSchedule');
const MaterialRequest = require('../models/MaterialRequest');
const ProductionIssue = require('../models/ProductionIssue');
const ProductionExecution = require('../models/ProductionExecution');
const ProductionUpdate = require('../models/ProductionUpdate');
const ProductionCompletion = require('../models/ProductionCompletion');
const ProductionQA = require('../models/ProductionQA');
const ReworkOrder = require('../models/ReworkOrder');
const FinishedGood = require('../models/FinishedGood');

async function seedProduction() {
  await connectDB();
  console.log('Seeding Production Data...');

  // Clear existing production collections
  await Promise.all([
    BOM.deleteMany({}),
    WorkOrder.deleteMany({}),
    ProductionSchedule.deleteMany({}),
    MaterialRequest.deleteMany({}),
    ProductionIssue.deleteMany({}),
    ProductionExecution.deleteMany({}),
    ProductionUpdate.deleteMany({}),
    ProductionCompletion.deleteMany({}),
    ProductionQA.deleteMany({}),
    ReworkOrder.deleteMany({}),
    FinishedGood.deleteMany({})
  ]);

  // Lookup existing base records
  const machineA = await Product.findOne({ productCode: 'PRD-MCH-A' }) || await Product.findOne();
  const machineB = await Product.findOne({ productCode: 'PRD-MCH-B' });
  const steelSheet = await Material.findOne({ materialCode: 'RM-001' }) || await Material.findOne();
  const motor = await Material.findOne({ materialCode: 'RM-002' }) || steelSheet;
  const sensor = await Material.findOne({ materialCode: 'RM-003' }) || steelSheet;
  const wiring = await Material.findOne({ materialCode: 'RM-004' }) || steelSheet;

  const salesOrder = await SalesOrder.findOne() || null;
  const customer = await Customer.findOne() || null;

  // 1. Create BOM-001 for Machine A
  const bom001 = await BOM.create({
    bomNumber: 'BOM-001',
    product: machineA._id,
    version: 'V1',
    effectiveDate: new Date('2026-11-01'),
    materials: [
      {
        material: steelSheet._id,
        materialCode: steelSheet.materialCode,
        materialName: steelSheet.materialName,
        quantityPerUnit: 10,
        unit: steelSheet.unit || 'Kg',
        wastagePercent: 2
      },
      {
        material: motor._id,
        materialCode: motor.materialCode,
        materialName: motor.materialName,
        quantityPerUnit: 1,
        unit: motor.unit || 'Nos',
        wastagePercent: 0
      },
      {
        material: sensor._id,
        materialCode: sensor.materialCode,
        materialName: sensor.materialName,
        quantityPerUnit: 2,
        unit: sensor.unit || 'Nos',
        wastagePercent: 1
      },
      {
        material: wiring._id,
        materialCode: wiring.materialCode,
        materialName: wiring.materialName,
        quantityPerUnit: 5,
        unit: wiring.unit || 'Meter',
        wastagePercent: 3
      }
    ],
    status: 'Active',
    remarks: 'Standard BOM for Machine A high precision CNC lathe'
  });

  // 2. Create Production Work Order WO-001
  const wo001 = await WorkOrder.create({
    workOrderNumber: 'WO-001',
    salesOrder: salesOrder ? salesOrder._id : null,
    salesOrderNumber: salesOrder ? salesOrder.soNumber : 'SO-001',
    customer: customer ? customer._id : null,
    customerName: customer ? customer.companyName : 'ABC Industries Pvt Ltd',
    product: machineA._id,
    productName: machineA.productName,
    orderQuantity: 10,
    productionQuantity: 10,
    priority: 'High',
    productionManager: 'Rajesh Sharma',
    productionLocation: 'Assembly Line 1 (Bay A)',
    plannedStartDate: new Date('2026-11-15'),
    expectedCompletionDate: new Date('2026-11-25'),
    bom: bom001._id,
    status: 'Running',
    remarks: 'Urgent confirmed order for ABC Industries expansion plant.'
  });

  // 3. Create Production Schedule SCH-001
  const sch001 = await ProductionSchedule.create({
    scheduleNumber: 'SCH-001',
    workOrder: wo001._id,
    product: machineA._id,
    productName: machineA.productName,
    plannedQuantity: 10,
    startDate: new Date('2026-11-15'),
    endDate: new Date('2026-11-25'),
    durationDays: 10,
    workingDays: 10,
    supervisor: 'Karthik Raja',
    shift: 'Morning',
    workInstructions: 'Standard SOP-44: Precision machining, torque tightening to 45Nm, wiring color-coded.',
    activities: [
      { activityName: 'Sheet Metal Cutting & Bending', durationDays: 2, status: 'Completed' },
      { activityName: 'Chassis & Sub-Assembly', durationDays: 4, status: 'Completed' },
      { activityName: 'Motor & Sensor Wiring', durationDays: 2, status: 'In Progress' },
      { activityName: 'Pre-Inspection Calibration', durationDays: 2, status: 'Pending' }
    ],
    status: 'In Progress',
    remarks: 'On-track with dual shift assistance.'
  });

  // 4. Create Material Request MR-001
  const mr001 = await MaterialRequest.create({
    requestNumber: 'MR-001',
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    product: machineA._id,
    productName: machineA.productName,
    requestedDate: new Date('2026-11-13'),
    requiredDate: new Date('2026-11-15'),
    requestedBy: 'Karthik Raja',
    department: 'Production Assembly',
    items: [
      {
        material: steelSheet._id,
        materialCode: steelSheet.materialCode,
        materialName: steelSheet.materialName,
        requiredQty: 100,
        availableStock: 500,
        alreadyIssuedQty: 100,
        requestedQty: 100,
        remainingQty: 0,
        unit: 'Kg',
        status: 'Issued'
      },
      {
        material: motor._id,
        materialCode: motor.materialCode,
        materialName: motor.materialName,
        requiredQty: 10,
        availableStock: 80,
        alreadyIssuedQty: 10,
        requestedQty: 10,
        remainingQty: 0,
        unit: 'Nos',
        status: 'Issued'
      },
      {
        material: sensor._id,
        materialCode: sensor.materialCode,
        materialName: sensor.materialName,
        requiredQty: 20,
        availableStock: 150,
        alreadyIssuedQty: 20,
        requestedQty: 20,
        remainingQty: 0,
        unit: 'Nos',
        status: 'Issued'
      },
      {
        material: wiring._id,
        materialCode: wiring.materialCode,
        materialName: wiring.materialName,
        requiredQty: 50,
        availableStock: 300,
        alreadyIssuedQty: 50,
        requestedQty: 50,
        remainingQty: 0,
        unit: 'Meter',
        status: 'Issued'
      }
    ],
    status: 'Fully Issued',
    remarks: 'All 10 unit BOM materials verified and issued by Company Store.'
  });

  // 5. Create Material Issue MI-001
  const mi001 = await ProductionIssue.create({
    issueNumber: 'MI-001',
    materialRequest: mr001._id,
    requestNumber: mr001.requestNumber,
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    storeLocation: 'Central RM Warehouse - Rack A',
    issueDate: new Date('2026-11-14'),
    issuedBy: 'Store Keeper Kumar',
    receivedBy: 'Shop Floor Tech Suresh',
    items: [
      {
        material: steelSheet._id,
        materialCode: steelSheet.materialCode,
        materialName: steelSheet.materialName,
        requestedQty: 100,
        approvedQty: 100,
        availableStock: 500,
        issuedQty: 100,
        batchNumber: 'BATCH-STL-09',
        unit: 'Kg'
      },
      {
        material: motor._id,
        materialCode: motor.materialCode,
        materialName: motor.materialName,
        requestedQty: 10,
        approvedQty: 10,
        availableStock: 80,
        issuedQty: 10,
        batchNumber: 'BATCH-MOT-04',
        unit: 'Nos'
      }
    ],
    status: 'Issued',
    remarks: 'Full kit issued for WO-001.'
  });

  // 6. Create Production Execution EX-001
  const ex001 = await ProductionExecution.create({
    executionNumber: 'EX-001',
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    product: machineA._id,
    productName: machineA.productName,
    plannedQty: 10,
    materialsIssued: 'Fully Issued',
    startDateTime: new Date('2026-11-15T09:00:00Z'),
    supervisor: 'Karthik Raja',
    machineWorkstation: 'CNC Workstation 1',
    shift: 'Morning',
    operatorName: 'Arun Vijay & Team',
    status: 'Running',
    initialRemarks: 'Production started on schedule. All materials verified at workstation.'
  });

  // 7. Create Production Updates (Daily / Weekly)
  const pu001 = await ProductionUpdate.create({
    updateNumber: 'PU-001',
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    product: machineA._id,
    productName: machineA.productName,
    updateType: 'Daily',
    fromDate: new Date('2026-11-16'),
    toDate: new Date('2026-11-16'),
    supervisorName: 'Karthik Raja',
    plannedQuantity: 10,
    previouslyCompletedQuantity: 0,
    completedQuantity: 5,
    totalCompletedQuantity: 5,
    pendingQuantity: 5,
    rejectedQuantity: 0,
    wastageQuantity: 0,
    workCompletedDescription: '5 chassis frame assemblies and base motor mountings completed.',
    machineStatus: 'Operational',
    problemsDelays: 'None',
    nextWorkPlan: 'Proceed to next 5 units and initial wiring.',
    status: 'Verified'
  });

  const pu002 = await ProductionUpdate.create({
    updateNumber: 'PU-002',
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    product: machineA._id,
    productName: machineA.productName,
    updateType: 'Daily',
    fromDate: new Date('2026-11-17'),
    toDate: new Date('2026-11-17'),
    supervisorName: 'Karthik Raja',
    plannedQuantity: 10,
    previouslyCompletedQuantity: 5,
    completedQuantity: 5,
    totalCompletedQuantity: 10,
    pendingQuantity: 0,
    rejectedQuantity: 0,
    wastageQuantity: 0,
    workCompletedDescription: 'Remaining 5 units assembly completed. All 10 machines assembled and ready for final testing.',
    machineStatus: 'Operational',
    problemsDelays: 'Slight thermal calibration variance on 2 units.',
    nextWorkPlan: 'Send all 10 units for Production Completion & QA testing.',
    status: 'Verified'
  });

  // 8. Create Production Completion PC-001
  const pc001 = await ProductionCompletion.create({
    completionNumber: 'PC-001',
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    product: machineA._id,
    productName: machineA.productName,
    plannedQuantity: 10,
    producedQuantity: 10,
    acceptedDuringProduction: 10,
    rejectedQuantity: 0,
    actualStartDate: new Date('2026-11-15'),
    actualCompletionDate: new Date('2026-11-18'),
    productionSupervisor: 'Karthik Raja',
    remainingMaterial: '1.5m wiring returned to store',
    remarks: '10 units fully assembled and wired. Handed over to QA Inspection.',
    status: 'QA In Progress'
  });

  // 9. Create QA Inspection QA-001
  const qa001 = await ProductionQA.create({
    qaNumber: 'QA-001',
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    completion: pc001._id,
    completionNumber: pc001.completionNumber,
    product: machineA._id,
    productName: machineA.productName,
    batchSerialNumber: 'BATCH-MA-001',
    testedQuantity: 10,
    passedQuantity: 8,
    failedQuantity: 2,
    inspectorName: 'Devanathan (Senior QA Engineer)',
    testDate: new Date('2026-11-19'),
    testParameters: [
      { parameter: 'Sensor Calibration', expected: 'Working +/- 0.01mm', actual: '8 units working, 2 units high variance', result: 'Fail' },
      { parameter: 'Heat & Thermal Load Test', expected: '< 55°C', actual: '2 units reached 72°C', result: 'Fail' },
      { parameter: 'Motor RPM & Torque', expected: '3000 RPM @ 45Nm', actual: 'Pass on all units', result: 'Pass' },
      { parameter: 'Electrical Insulation & Earth', expected: '> 100 MΩ', actual: 'Pass on all units', result: 'Pass' },
      { parameter: 'Overall Mechanical Function', expected: 'Smooth operation', actual: 'Pass on 8 units', result: 'Pass' }
    ],
    overallResult: 'Partial Pass',
    decision: 'Rework',
    defectDescription: '2 machines exhibited heat levels exceeding 55°C limit and optical sensor misalignment.',
    failureReason: 'Cooling fan cable loose and sensor bracket needs re-alignment.',
    remarks: '8 machines approved for Finished Goods; 2 machines sent to Rework bay.'
  });

  // 10. Create Rework Order RW-001
  const rw001 = await ReworkOrder.create({
    reworkNumber: 'RW-001',
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    qaReference: qa001._id,
    qaNumber: qa001.qaNumber,
    product: machineA._id,
    productName: machineA.productName,
    serialNumber: 'MA-009, MA-010',
    reworkQuantity: 2,
    defectDescription: 'Thermal trip above 70°C and sensor alignment offset.',
    failureReason: 'Improper thermal paste application on heatsink and misaligned bracket.',
    reworkType: 'Repair',
    priority: 'High',
    assignedTechnician: 'Muthuvel (Lead Service Tech)',
    problemIdentified: 'Thermal interface paste dried out; sensor bracket screws loose.',
    repairAction: 'Reapplied industrial thermal compound, replaced cooling fan connector, calibrated optical sensor.',
    replacementMaterials: 'Thermal paste tube, 1x cooling fan jumper cable',
    technicianRemarks: 'Bench tested for 30 minutes. Operating temperature steady at 48°C. Ready for Re-QA.',
    reworkStartDate: new Date('2026-11-20'),
    reworkCompletionDate: new Date('2026-11-21'),
    retestRequired: true,
    retestStatus: 'Passed',
    status: 'Passed'
  });

  // 10b. Create Re-QA QA-002 for the 2 repaired units
  const qa002 = await ProductionQA.create({
    qaNumber: 'QA-002',
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    completion: pc001._id,
    completionNumber: pc001.completionNumber,
    product: machineA._id,
    productName: machineA.productName,
    batchSerialNumber: 'BATCH-MA-REWORK-01',
    testedQuantity: 2,
    passedQuantity: 2,
    failedQuantity: 0,
    inspectorName: 'Devanathan (Senior QA Engineer)',
    testDate: new Date('2026-11-21'),
    testParameters: [
      { parameter: 'Sensor Calibration', expected: 'Working +/- 0.01mm', actual: '0.005mm (Pass)', result: 'Pass' },
      { parameter: 'Heat & Thermal Load Test', expected: '< 55°C', actual: '48.2°C (Pass)', result: 'Pass' },
      { parameter: 'Overall Mechanical Function', expected: 'Smooth operation', actual: 'All tests passed', result: 'Pass' }
    ],
    overallResult: 'Pass',
    decision: 'Finished Goods',
    defectDescription: 'None',
    remarks: 'Re-tested after rework repair. Both units passed with flying colors. Approved for Finished Goods storage.'
  });

  // Link Re-QA to rework order
  rw001.reQAReference = qa002._id;
  await rw001.save();

  // 11. Create Finished Goods (FG-001 for 8 initial passed, FG-002 for 2 reworked passed -> 10 Total!)
  await FinishedGood.create({
    fgNumber: 'FG-001',
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    salesOrder: salesOrder ? salesOrder._id : null,
    salesOrderNumber: salesOrder ? salesOrder.soNumber : 'SO-001',
    product: machineA._id,
    productName: machineA.productName,
    serialNumber: 'MA-001 to MA-008',
    qaApprovalReference: qa001._id,
    qaNumber: qa001.qaNumber,
    approvedQuantity: 8,
    warehouseLocation: 'FG Warehouse - Bay 4A',
    storageDate: new Date('2026-11-20'),
    productCondition: 'Brand New / QA Passed',
    stockStatus: 'Available',
    warrantyStartDate: new Date('2026-11-20'),
    remarks: '8 units from initial QA pass. Packed in industrial crates.'
  });

  await FinishedGood.create({
    fgNumber: 'FG-002',
    workOrder: wo001._id,
    workOrderNumber: wo001.workOrderNumber,
    salesOrder: salesOrder ? salesOrder._id : null,
    salesOrderNumber: salesOrder ? salesOrder.soNumber : 'SO-001',
    product: machineA._id,
    productName: machineA.productName,
    serialNumber: 'MA-009, MA-010',
    qaApprovalReference: qa002._id,
    qaNumber: qa002.qaNumber,
    approvedQuantity: 2,
    warehouseLocation: 'FG Warehouse - Bay 4A',
    storageDate: new Date('2026-11-21'),
    productCondition: 'Brand New / Rework Verified & QA Passed',
    stockStatus: 'Available',
    warrantyStartDate: new Date('2026-11-21'),
    remarks: '2 units from Rework pass. Total 10/10 order fulfilled!'
  });

  console.log('Production Data Seeded Successfully! Total 10 units fulfilled through QA & Rework.');
  process.exit(0);
}

seedProduction().catch(err => {
  console.error('Error seeding production data:', err);
  process.exit(1);
});

