require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Material = require('../models/Material');
const Supplier = require('../models/Supplier');
const SupplierMaterialLink = require('../models/SupplierMaterialLink');
const PurchaseOrder = require('../models/PurchaseOrder');
const GRN = require('../models/GRN');
const QCTest = require('../models/QCTest');
const Inventory = require('../models/Inventory');
const StockLedger = require('../models/StockLedger');
const MaterialIssue = require('../models/MaterialIssue');
const SupplierReturn = require('../models/SupplierReturn');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Clearing existing SCM collections...');
    await Material.deleteMany({});
    await Supplier.deleteMany({});
    await SupplierMaterialLink.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await GRN.deleteMany({});
    await QCTest.deleteMany({});
    await Inventory.deleteMany({});
    await StockLedger.deleteMany({});
    await MaterialIssue.deleteMany({});
    await SupplierReturn.deleteMany({});

    console.log('1. Creating Materials...');
    const m1 = await Material.create({
      materialCode: 'RM-001',
      materialName: 'Steel Sheet 2mm (CRCA Grade)',
      category: 'Metals',
      unit: 'Kg',
      minimumStock: 100,
      reorderLevel: 150,
      description: 'Cold Rolled Close Annealed Steel Sheet 2mm thickness for enclosure fabrication',
      storageLocation: 'Rack A-01, Warehouse 1',
      hsnCode: '7209',
      status: 'Active'
    });

    const m2 = await Material.create({
      materialCode: 'RM-002',
      materialName: 'Plastic Granules (HDPE Virgin)',
      category: 'Plastics',
      unit: 'Kg',
      minimumStock: 100,
      reorderLevel: 120,
      description: 'High Density Polyethylene granules for injection molding casings',
      storageLocation: 'Silo B-03, Warehouse 2',
      hsnCode: '3901',
      status: 'Active'
    });

    const m3 = await Material.create({
      materialCode: 'RM-003',
      materialName: 'Aluminum Alloy 6061 Rod 25mm',
      category: 'Metals',
      unit: 'Kg',
      minimumStock: 50,
      reorderLevel: 80,
      description: 'High tensile aluminum extrusion rods for CNC machining',
      storageLocation: 'Rack A-04, Warehouse 1',
      hsnCode: '7604',
      status: 'Active'
    });

    const m4 = await Material.create({
      materialCode: 'RM-004',
      materialName: 'Neoprene Rubber Gasket Strips',
      category: 'Rubber',
      unit: 'Meter',
      minimumStock: 200,
      reorderLevel: 300,
      description: 'Weatherproof high-temperature sealing gasket',
      storageLocation: 'Bin C-12, Warehouse 1',
      hsnCode: '4016',
      status: 'Active'
    });

    const m5 = await Material.create({
      materialCode: 'RM-005',
      materialName: 'Hex Head Bolt M8 x 40mm SS304',
      category: 'Fasteners',
      unit: 'Nos',
      minimumStock: 500,
      reorderLevel: 800,
      description: 'Stainless steel grade 304 anti-corrosion assembly bolts',
      storageLocation: 'Drawer D-08, Small Parts Bay',
      hsnCode: '7318',
      status: 'Active'
    });

    console.log('2. Creating Suppliers...');
    const s1 = await Supplier.create({
      supplierCode: 'SUP-001',
      supplierName: 'ABC Steels & Alloys Pvt Ltd',
      contactPerson: 'Kumar Mohan',
      mobileNumber: '9876543210',
      email: 'kumar@abcsteels.com',
      gstNumber: '33AABCA1234F1Z9',
      address: 'Plot 45, Ambattur Industrial Estate',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600058',
      paymentTerms: 'Net 30 Days',
      status: 'Active'
    });

    const s2 = await Supplier.create({
      supplierCode: 'SUP-002',
      supplierName: 'XYZ Polymers & Plastics Ltd',
      contactPerson: 'Priya Sundaram',
      mobileNumber: '9840123456',
      email: 'priya@xyzpolymers.in',
      gstNumber: '33AAACX5678B1Z2',
      address: '12 GST Road, Guindy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600032',
      paymentTerms: 'Net 15 Days',
      status: 'Active'
    });

    const s3 = await Supplier.create({
      supplierCode: 'SUP-003',
      supplierName: 'Apex Fasteners & Engineering',
      contactPerson: 'Venkatesh R',
      mobileNumber: '9789012345',
      email: 'sales@apexfasteners.com',
      gstNumber: '33AAACV9012E1Z8',
      address: '88 Sidco Estate, Coimbatore',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641021',
      paymentTerms: 'Immediate',
      status: 'Active'
    });

    console.log('3. Linking Suppliers to Materials...');
    await SupplierMaterialLink.create([
      {
        supplier: s1._id,
        material: m1._id,
        supplierMaterialCode: 'ABC-CRCA-2MM',
        unitPrice: 80,
        minOrderQty: 100,
        leadTimeDays: 5,
        preferredSupplier: true,
        status: 'Active'
      },
      {
        supplier: s2._id,
        material: m2._id,
        supplierMaterialCode: 'XYZ-HDPE-VIR',
        unitPrice: 100,
        minOrderQty: 50,
        leadTimeDays: 3,
        preferredSupplier: true,
        status: 'Active'
      },
      {
        supplier: s1._id,
        material: m3._id,
        supplierMaterialCode: 'ABC-ALU-6061',
        unitPrice: 220,
        minOrderQty: 25,
        leadTimeDays: 7,
        preferredSupplier: true,
        status: 'Active'
      },
      {
        supplier: s3._id,
        material: m5._id,
        supplierMaterialCode: 'APX-M8-40SS',
        unitPrice: 4.5,
        minOrderQty: 200,
        leadTimeDays: 2,
        preferredSupplier: true,
        status: 'Active'
      }
    ]);

    console.log('4. Initializing Base Inventories...');
    const inv1 = await Inventory.create({
      material: m1._id,
      openingStock: 0,
      totalReceived: 480,
      totalIssued: 200,
      totalReturned: 0,
      adjustments: 0,
      availableStock: 280, // 480 - 200
      minimumStock: 100,
      status: 'In Stock'
    });

    const inv2 = await Inventory.create({
      material: m2._id,
      openingStock: 100,
      totalReceived: 0,
      totalIssued: 80,
      totalReturned: 0,
      adjustments: 0,
      availableStock: 20,
      minimumStock: 100,
      status: 'Low Stock' // 20 <= 100
    });

    const inv3 = await Inventory.create({
      material: m3._id,
      openingStock: 80,
      totalReceived: 0,
      totalIssued: 0,
      totalReturned: 0,
      adjustments: 0,
      availableStock: 80,
      minimumStock: 50,
      status: 'In Stock'
    });

    const inv4 = await Inventory.create({
      material: m4._id,
      openingStock: 0,
      totalReceived: 0,
      totalIssued: 0,
      totalReturned: 0,
      adjustments: 0,
      availableStock: 0,
      minimumStock: 200,
      status: 'Out of Stock'
    });

    const inv5 = await Inventory.create({
      material: m5._id,
      openingStock: 1200,
      totalReceived: 0,
      totalIssued: 300,
      totalReturned: 0,
      adjustments: 0,
      availableStock: 900,
      minimumStock: 500,
      status: 'In Stock'
    });

    console.log('5. Creating Purchase Orders...');
    const po1 = await PurchaseOrder.create({
      poNumber: 'PO-2026-001',
      poDate: new Date('2026-11-10'),
      supplier: s1._id,
      expectedDeliveryDate: new Date('2026-11-15'),
      deliveryAddress: 'Cryo Factory, Phase 2, Industrial Estate, Chennai - 600058',
      items: [
        {
          material: m1._id,
          quantity: 500,
          unit: 'Kg',
          unitPrice: 80,
          taxPercent: 18,
          lineTotal: 47200,
          receivedQuantity: 500
        }
      ],
      subtotal: 40000,
      gstTotal: 7200,
      freightCharges: 0,
      grandTotal: 47200,
      paymentTerms: 'Net 30 Days',
      notes: 'Standard batch for automotive sub-assemblies',
      status: 'Completed'
    });

    const po2 = await PurchaseOrder.create({
      poNumber: 'PO-2026-002',
      poDate: new Date('2026-11-12'),
      supplier: s2._id,
      expectedDeliveryDate: new Date('2026-11-16'),
      deliveryAddress: 'Cryo Factory, Phase 2, Industrial Estate, Chennai - 600058',
      items: [
        {
          material: m2._id,
          quantity: 200,
          unit: 'Kg',
          unitPrice: 100,
          taxPercent: 18,
          lineTotal: 23600,
          receivedQuantity: 0
        }
      ],
      subtotal: 20000,
      gstTotal: 3600,
      freightCharges: 500,
      grandTotal: 24100,
      paymentTerms: 'Net 15 Days',
      notes: 'Urgent requirement for casing mold run',
      status: 'Approved'
    });

    console.log('6. Creating Goods Receipt Note (GRN)...');
    const grn1 = await GRN.create({
      grnNumber: 'GRN-2026-001',
      purchaseOrder: po1._id,
      supplier: s1._id,
      receivedDate: new Date('2026-11-13'),
      invoiceNumber: 'INV-ABC-9912',
      invoiceDate: new Date('2026-11-12'),
      deliveryChallanNo: 'DC-8821',
      vehicleNumber: 'TN-05-BQ-7890',
      receivedBy: 'Selvaraj (Store Incharge)',
      items: [
        {
          material: m1._id,
          orderedQty: 500,
          previouslyReceivedQty: 0,
          currentReceivedQty: 500,
          balanceQty: 0,
          unit: 'Kg',
          batchNumber: 'BAT-ST-901',
          expiryDate: null
        }
      ],
      remarks: 'Delivered in good sealed bundle condition, moved to quarantine bay.',
      status: 'Completed'
    });

    console.log('7. Creating QC Test Records...');
    const qc1 = await QCTest.create({
      qcNumber: 'QC-2026-001',
      grn: grn1._id,
      material: m1._id,
      supplier: s1._id,
      batchNumber: 'BAT-ST-901',
      receivedQuantity: 500,
      testedQuantity: 500,
      acceptedQuantity: 480,
      rejectedQuantity: 20,
      availableRejectedQuantity: 0, // 20 Kg was rejected and subsequently returned
      testDate: new Date('2026-11-13'),
      inspectorName: 'Anand Kumar (Sr QC Lead)',
      parameters: [
        { parameter: 'Thickness Check (2.0mm +/- 0.05)', standard: '1.95 - 2.05 mm', actual: '2.01 mm average', result: 'Pass' },
        { parameter: 'Surface Finish & Rust Check', standard: 'Free of pitting and deep scratches', actual: '20kg had deep transport gouges', result: 'Fail' },
        { parameter: 'Yield Strength Test', standard: '>= 240 MPa', actual: '262 MPa', result: 'Pass' }
      ],
      overallResult: 'Partial Pass',
      remarks: 'Approved 480 Kg for standard production. 20 Kg rejected due to mechanical surface gouges.',
      status: 'Completed'
    });

    console.log('8. Creating Stock Ledger Records...');
    await StockLedger.create([
      {
        material: m1._id,
        date: new Date('2026-11-13T10:00:00Z'),
        transactionType: 'QC Inward Receipt',
        referenceDoc: qc1.qcNumber,
        qtyIn: 480,
        qtyOut: 0,
        balanceAfter: 480,
        loggedBy: 'Anand Kumar',
        notes: 'Inward from GRN-2026-001 after QC approval'
      },
      {
        material: m1._id,
        date: new Date('2026-11-13T11:30:00Z'),
        transactionType: 'Production Issue',
        referenceDoc: 'MI-2026-001',
        qtyIn: 0,
        qtyOut: 200,
        balanceAfter: 280,
        loggedBy: 'Selvam (Store)',
        notes: 'Issued to Work Order WO-2026-101 (Fabrication Dept)'
      }
    ]);

    console.log('9. Creating Material Issue to Production...');
    await MaterialIssue.create({
      issueNumber: 'MI-2026-001',
      workOrder: 'WO-2026-101',
      department: 'Fabrication',
      issueDate: new Date('2026-11-13T11:30:00Z'),
      requestedBy: 'Dinesh (Production Supervisor)',
      issuedBy: 'Selvam (Store Officer)',
      items: [
        {
          material: m1._id,
          availableStockAtTime: 480,
          requiredQuantity: 200,
          issueQuantity: 200,
          unit: 'Kg',
          batchNumber: 'BAT-ST-901'
        }
      ],
      remarks: 'Issued for Main Machine Chassis cutting operation',
      status: 'Issued'
    });

    console.log('10. Creating Supplier Return...');
    await SupplierReturn.create({
      returnNumber: 'RT-2026-001',
      supplier: s1._id,
      grn: grn1._id,
      qcReference: qc1._id,
      material: m1._id,
      rejectedQuantityAvailable: 20,
      returnQuantity: 20,
      unit: 'Kg',
      returnDate: new Date('2026-11-13T12:00:00Z'),
      reason: 'Failed QC Specifications',
      debitNoteNumber: 'DN-2026-014',
      vehicleNumber: 'TN-05-BQ-7890 (Return load)',
      remarks: 'Returned back on same truck with driver signoff. Debit note issued.',
      status: 'Returned'
    });

    console.log('--- SEEDING COMPLETED SUCCESSFULLY! ---');
    console.log('Real-Time Example State:');
    console.log('Steel Sheet RM-001: 500 Kg Ordered -> 500 Received -> QC: 480 Pass + 20 Reject -> 200 Issued -> 280 Kg Available!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();

