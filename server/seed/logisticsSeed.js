require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const DeliveryPlan = require('../models/DeliveryPlan');
const VehicleCourier = require('../models/VehicleCourier');
const Dispatch = require('../models/Dispatch');
const DeliveryTracking = require('../models/DeliveryTracking');
const DeliveryConfirmation = require('../models/DeliveryConfirmation');
const Installation = require('../models/Installation');
const InstallationCompletion = require('../models/InstallationCompletion');
const FinishedGood = require('../models/FinishedGood');
const SalesOrder = require('../models/SalesOrder');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

async function seedLogistics() {
  try {
    await connectDB();
    console.log('--- Seeding Logistics & Delivery Management ---');

    // Fetch existing cross-domain references
    const [salesOrders, customers, products, finishedGoods] = await Promise.all([
      SalesOrder.find(),
      Customer.find(),
      Product.find(),
      FinishedGood.find()
    ]);

    const so1 = salesOrders[0] || { _id: new mongoose.Types.ObjectId(), soNumber: 'SO-001' };
    const so2 = salesOrders[1] || { _id: new mongoose.Types.ObjectId(), soNumber: 'SO-002' };
    const cust1 = customers[0] || { _id: new mongoose.Types.ObjectId(), companyName: 'ABC Industries Pvt Ltd', contactPerson: 'Kumar', mobile: '9876543210' };
    const cust2 = customers[1] || { _id: new mongoose.Types.ObjectId(), companyName: 'XYZ Pvt Ltd', contactPerson: 'Ramesh', mobile: '9123456780' };
    const prod1 = products[0] || { _id: new mongoose.Types.ObjectId(), productName: 'Machine A (Cryo Reactor)' };
    const prod2 = products[1] || { _id: new mongoose.Types.ObjectId(), productName: 'Machine B (Thermal Chamber)' };
    const fg1 = finishedGoods[0] || { _id: new mongoose.Types.ObjectId(), serialNumber: 'MA-001-SERIES', warehouseLocation: 'FG Bay 1' };

    // Clear old logistics data
    await Promise.all([
      DeliveryPlan.deleteMany({}),
      VehicleCourier.deleteMany({}),
      Dispatch.deleteMany({}),
      DeliveryTracking.deleteMany({}),
      DeliveryConfirmation.deleteMany({}),
      Installation.deleteMany({}),
      InstallationCompletion.deleteMany({})
    ]);

    console.log('Cleared existing logistics collections.');

    // 1. Vehicles & Couriers
    const vc1 = await VehicleCourier.create({
      code: 'VEH-001',
      entityType: 'Company Vehicle',
      vehicleNumber: 'TN 52 AB 1234',
      vehicleType: 'Van',
      driverName: 'Murugan (Company Driver)',
      driverMobile: '9842109876',
      licenseNumber: 'TN-43-2018-09142',
      vehicleCapacity: '3.5 Tons / 10 Machines',
      insuranceExpiry: new Date(Date.now() + 180 * 86400000),
      assignedDeliveryNumber: 'DEL-001',
      status: 'In Transit',
      remarks: 'Fitted with GPS tracking and hydraulic lift gate.'
    });

    const vc2 = await VehicleCourier.create({
      code: 'VEH-002',
      entityType: 'Company Vehicle',
      vehicleNumber: 'TN 38 CD 5678',
      vehicleType: 'Truck',
      driverName: 'Selvam (Senior Driver)',
      driverMobile: '9786543210',
      licenseNumber: 'TN-38-2015-88201',
      vehicleCapacity: '8.0 Tons / 25 Machines',
      insuranceExpiry: new Date(Date.now() + 240 * 86400000),
      status: 'Available',
      remarks: 'Heavy transport truck, ready for inter-state delivery.'
    });

    const vc3 = await VehicleCourier.create({
      code: 'CR-001',
      entityType: 'Courier / Transport',
      courierPartner: 'ABC Transport & Freight',
      trackingNumber: 'TRK-ABC-992104',
      serviceType: 'Express Cargo',
      contactPerson: 'Mr. David (Dispatch Desk)',
      contactMobile: '9443210987',
      assignedDeliveryNumber: 'DEL-002',
      status: 'In Transit',
      remarks: 'Container shipment with real-time temperature tracking.'
    });

    const vc4 = await VehicleCourier.create({
      code: 'CR-002',
      entityType: 'Courier / Transport',
      courierPartner: 'BlueDart Surface Freight',
      trackingNumber: 'BD-88271034',
      serviceType: 'Standard Surface',
      contactPerson: 'Hub Coordinator',
      contactMobile: '9822334455',
      status: 'Available',
      remarks: 'Empaneled courier for tier-2/3 city dispatches.'
    });

    // 2. Delivery Plans
    const delPlan1 = await DeliveryPlan.create({
      deliveryNumber: 'DEL-001',
      salesOrder: so1._id,
      soNumber: so1.soNumber || 'SO-001',
      customer: cust1._id,
      customerName: cust1.companyName || 'ABC Industries',
      contactPerson: cust1.contactPerson || 'Kumar',
      mobileNumber: cust1.mobile || '9876543210',
      deliveryAddress: 'Plot 45, Guindy Industrial Estate, Chennai - 600032',
      product: prod1._id,
      productName: prod1.productName,
      finishedGood: fg1._id,
      serialNumber: fg1.serialNumber || 'MA-001-SERIES',
      orderedQuantity: 10,
      alreadyDeliveredQuantity: 0,
      pendingQuantity: 0,
      plannedDeliveryQuantity: 10,
      deliveryDate: new Date('2026-11-15'),
      deliveryMethod: 'Company Vehicle',
      installationRequired: true,
      specialInstructions: 'Handle with high precision crane. Forklift ramp required on site.',
      remarks: 'Customer requested morning delivery between 09:00 - 11:00 AM.',
      status: 'In Transit'
    });

    const delPlan2 = await DeliveryPlan.create({
      deliveryNumber: 'DEL-002',
      salesOrder: so2._id,
      soNumber: so2.soNumber || 'SO-002',
      customer: cust2._id,
      customerName: cust2.companyName || 'XYZ Pvt Ltd',
      contactPerson: cust2.contactPerson || 'Ramesh',
      mobileNumber: cust2.mobile || '9123456780',
      deliveryAddress: 'Peenya Industrial Area, Phase II, Bangalore - 560058',
      product: prod2._id,
      productName: prod2.productName,
      orderedQuantity: 5,
      alreadyDeliveredQuantity: 5,
      pendingQuantity: 0,
      plannedDeliveryQuantity: 5,
      deliveryDate: new Date('2026-11-16'),
      deliveryMethod: 'Courier / Transport',
      installationRequired: true,
      specialInstructions: 'Door delivery with dock unloading.',
      remarks: 'Goods delivered successfully and verified at client warehouse.',
      status: 'Delivered'
    });

    const delPlan3 = await DeliveryPlan.create({
      deliveryNumber: 'DEL-003',
      salesOrder: so1._id,
      soNumber: so1.soNumber || 'SO-001',
      customer: cust1._id,
      customerName: 'Kumar Systems',
      contactPerson: 'Suresh Kumar',
      mobileNumber: '9841122334',
      deliveryAddress: 'Ambattur Industrial Estate, Chennai - 600058',
      product: prod1._id,
      productName: prod1.productName,
      orderedQuantity: 2,
      alreadyDeliveredQuantity: 2,
      pendingQuantity: 0,
      plannedDeliveryQuantity: 2,
      deliveryDate: new Date('2026-11-14'),
      deliveryMethod: 'Company Vehicle',
      installationRequired: true,
      specialInstructions: 'Power panel connection kit to be delivered along with unit.',
      remarks: 'Delivered and awaiting installation engineer.',
      status: 'Delivered'
    });

    // 3. Dispatches
    const disp1 = await Dispatch.create({
      dispatchNumber: 'DISP-001',
      deliveryPlan: delPlan1._id,
      deliveryNumber: 'DEL-001',
      salesOrder: so1._id,
      soNumber: so1.soNumber || 'SO-001',
      customer: cust1._id,
      customerName: 'ABC Industries',
      product: prod1._id,
      productName: prod1.productName,
      finishedGood: fg1._id,
      serialNumber: fg1.serialNumber || 'MA-001-SERIES',
      plannedQuantity: 10,
      actualDispatchQuantity: 10,
      warehouseLocation: 'FG Bay 1 - Loading Dock A',
      packingDetails: '10x Heavy wooden crate with impact sensors & shrink wrap',
      dispatchDateTime: new Date('2026-11-14T08:30:00Z'),
      deliveryMethod: 'Company Vehicle',
      vehicleCourier: vc1._id,
      vehicleNumber: 'TN 52 AB 1234',
      driverName: 'Murugan (Company Driver)',
      driverMobile: '9842109876',
      dispatchedBy: 'Warehouse Manager Anbu',
      checkedBy: 'Security Lead Joseph',
      deliveryChallan: 'DC-DISP-001',
      remarks: 'Loaded and cleared warehouse gate after physical inspection.',
      status: 'Dispatched'
    });

    const disp2 = await Dispatch.create({
      dispatchNumber: 'DISP-002',
      deliveryPlan: delPlan2._id,
      deliveryNumber: 'DEL-002',
      salesOrder: so2._id,
      soNumber: so2.soNumber || 'SO-002',
      customer: cust2._id,
      customerName: 'XYZ Pvt Ltd',
      product: prod2._id,
      productName: prod2.productName,
      serialNumber: 'MB-001-SERIES',
      plannedQuantity: 5,
      actualDispatchQuantity: 5,
      warehouseLocation: 'FG Bay 2 - Loading Dock B',
      packingDetails: '5x Sealed shock-proof pallet with tamper-evident tape',
      dispatchDateTime: new Date('2026-11-13T14:00:00Z'),
      deliveryMethod: 'Courier / Transport',
      vehicleCourier: vc3._id,
      courierPartner: 'ABC Transport & Freight',
      trackingNumber: 'TRK-ABC-992104',
      dispatchedBy: 'Warehouse Officer Rajan',
      checkedBy: 'Security Officer Velu',
      deliveryChallan: 'DC-DISP-002',
      remarks: 'Handed over to ABC Transport lorry with signed receipt.',
      status: 'Delivered'
    });

    // 4. Delivery Tracking Milestones
    await DeliveryTracking.create([
      {
        trackingNumber: 'TRK-001',
        deliveryPlan: delPlan1._id,
        deliveryNumber: 'DEL-001',
        dispatch: disp1._id,
        dispatchNumber: 'DISP-001',
        customerName: 'ABC Industries',
        deliveryMethod: 'Company Vehicle',
        currentStatus: 'In Transit',
        currentLocation: 'Vellore Toll Plaza - NH48 (En Route Chennai to Bangalore Belt)',
        updateDateTime: new Date('2026-11-14T11:45:00Z'),
        expectedArrival: new Date('2026-11-15T09:30:00Z'),
        remarks: 'Vehicle moving at steady 60km/h. Driver reported zero transit vibration alarms.',
        updatedBy: 'Murugan (Driver via GPS Mobile App)'
      },
      {
        trackingNumber: 'TRK-002',
        deliveryPlan: delPlan2._id,
        deliveryNumber: 'DEL-002',
        dispatch: disp2._id,
        dispatchNumber: 'DISP-002',
        customerName: 'XYZ Pvt Ltd',
        deliveryMethod: 'Courier / Transport',
        currentStatus: 'Delivered',
        currentLocation: 'XYZ Pvt Ltd Inward Receiving Dock - Bangalore',
        updateDateTime: new Date('2026-11-14T17:15:00Z'),
        expectedArrival: new Date('2026-11-14T17:00:00Z'),
        remarks: 'Package unloaded, outer seal verified intact, POD signed.',
        updatedBy: 'ABC Transport API Webhook'
      },
      {
        trackingNumber: 'TRK-003',
        deliveryPlan: delPlan3._id,
        deliveryNumber: 'DEL-003',
        customerName: 'Kumar Systems',
        deliveryMethod: 'Company Vehicle',
        currentStatus: 'Delivered',
        currentLocation: 'Kumar Systems Assembly Hall - Ambattur',
        updateDateTime: new Date('2026-11-14T15:00:00Z'),
        expectedArrival: new Date('2026-11-14T15:00:00Z'),
        remarks: 'Direct drop-off at machine shop floor.',
        updatedBy: 'Selvam (Driver)'
      }
    ]);

    // 5. Delivery Confirmation (POD)
    await DeliveryConfirmation.create([
      {
        confirmationNumber: 'POD-001',
        deliveryPlan: delPlan2._id,
        deliveryNumber: 'DEL-002',
        dispatch: disp2._id,
        dispatchNumber: 'DISP-002',
        customer: cust2._id,
        customerName: 'XYZ Pvt Ltd',
        product: prod2._id,
        productName: prod2.productName,
        dispatchedQuantity: 5,
        receivedQuantity: 5,
        pendingQuantity: 0,
        deliveryDateTime: new Date('2026-11-14T17:30:00Z'),
        receivedBy: 'Ramesh (Site Operations Manager)',
        customerMobile: '9123456780',
        customerSignature: 'Signed on electronic POD terminal - OTP verified',
        productCondition: 'Good',
        installationRequired: true,
        podDocument: 'POD-DEL-002-SIGNED.pdf',
        remarks: 'All 5 machines received in pristine condition with manuals and spare kits.',
        status: 'Delivered'
      },
      {
        confirmationNumber: 'POD-002',
        deliveryPlan: delPlan3._id,
        deliveryNumber: 'DEL-003',
        customerName: 'Kumar Systems',
        productName: prod1.productName,
        dispatchedQuantity: 2,
        receivedQuantity: 2,
        pendingQuantity: 0,
        deliveryDateTime: new Date('2026-11-14T15:30:00Z'),
        receivedBy: 'Suresh Kumar (Proprietor)',
        customerMobile: '9841122334',
        customerSignature: 'Physical Stamp & Signature on Delivery Challan',
        productCondition: 'Good',
        installationRequired: true,
        podDocument: 'DC-DEL-003-STAMPED.pdf',
        remarks: 'Received and placed on foundation pad.',
        status: 'Delivered'
      }
    ]);

    // 6. Installation Orders
    const ins1 = await Installation.create({
      installationNumber: 'INS-001',
      deliveryPlan: delPlan2._id,
      deliveryNumber: 'DEL-002',
      salesOrder: so2._id,
      soNumber: so2.soNumber || 'SO-002',
      customer: cust2._id,
      customerName: 'XYZ Pvt Ltd',
      installationAddress: 'Peenya Industrial Area, Phase II, Bangalore - 560058',
      contactPerson: 'Ramesh (Site Manager)',
      mobileNumber: '9123456780',
      product: prod2._id,
      productName: prod2.productName,
      serialNumber: 'MB-001-SERIES',
      installationQuantity: 5,
      assignedTechnician: 'Ravi Kumar (Lead Service Specialist)',
      plannedInstallationDate: new Date('2026-11-16'),
      requiredTools: 'Multimeter, Torque Wrench, Fluke Thermal Camera, Optical Power Meter',
      installationInstructions: 'Verify 415V 3-phase line, mount dampers, calibrate temperature sensor.',
      status: 'Completed',
      remarks: 'Commissioning completed and sign-off obtained from client.'
    });

    const ins2 = await Installation.create({
      installationNumber: 'INS-002',
      deliveryPlan: delPlan3._id,
      deliveryNumber: 'DEL-003',
      salesOrder: so1._id,
      soNumber: so1.soNumber || 'SO-001',
      customer: cust1._id,
      customerName: 'Kumar Systems',
      installationAddress: 'Ambattur Industrial Estate, Chennai - 600058',
      contactPerson: 'Suresh Kumar',
      mobileNumber: '9841122334',
      product: prod1._id,
      productName: prod1.productName,
      serialNumber: 'MA-002-SERIES',
      installationQuantity: 2,
      assignedTechnician: 'Karthik (Field Engineer)',
      plannedInstallationDate: new Date('2026-11-17'),
      requiredTools: 'Mechanical alignment kit, pressure calibration gauge',
      installationInstructions: 'Install high-pressure cryo lines and test for leakage.',
      status: 'Scheduled',
      remarks: 'Technician dispatched with tool kit.'
    });

    // 7. Installation Completion Record
    await InstallationCompletion.create({
      completionNumber: 'ICOMP-001',
      installation: ins1._id,
      installationNumber: 'INS-001',
      customer: cust2._id,
      customerName: 'XYZ Pvt Ltd',
      product: prod2._id,
      productName: prod2.productName,
      serialNumber: 'MB-001-SERIES',
      technician: 'Ravi Kumar',
      installationDate: new Date('2026-11-16'),
      completionDate: new Date('2026-11-16'),
      checklist: {
        productFixedProperly: 'Pass',
        electricalConnection: 'Pass',
        powerSupplyTest: 'Pass',
        sensorConnection: 'Pass',
        temperatureTest: 'Pass',
        softwareConfiguration: 'Pass',
        overallWorkingCondition: 'Pass'
      },
      testingDetails: [
        {
          parameter: '3-Phase Line Voltage',
          expectedValue: '415V ± 5%',
          actualValue: '414.2V',
          result: 'Pass',
          correctiveAction: 'None'
        },
        {
          parameter: 'Full Load Temperature Stability',
          expectedValue: 'Stable at -40°C',
          actualValue: '-40.3°C',
          result: 'Pass',
          correctiveAction: 'None'
        },
        {
          parameter: 'Touchscreen HMI & PLC Link',
          expectedValue: 'Online & Polling',
          actualValue: 'Online 100%',
          result: 'Pass',
          correctiveAction: 'Firmware verified V2.4'
        }
      ],
      customerConfirmation: {
        customerName: 'Ramesh (Site Operations Manager)',
        customerFeedback: 'All 5 thermal chambers installed, calibrated, and operators trained. Excellent performance.',
        customerSignature: 'Signed on tablet by Ramesh',
        technicianSignature: 'Signed by Ravi Kumar',
        installationReport: 'INST-REPORT-XYZ-001.pdf'
      },
      overallResult: 'Pass',
      issueReported: false,
      status: 'Completed',
      remarks: 'Warranty activated. Client given operational training.'
    });

    console.log('✅ Logistics & Delivery seeded successfully with 9 modules test data!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Logistics:', err);
    process.exit(1);
  }
}

seedLogistics();
