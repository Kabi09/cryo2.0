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

// Helper to generate auto numbers
const generateCode = async (Model, prefix, fieldName) => {
  const count = await Model.countDocuments();
  const nextNum = (count + 1).toString().padStart(3, '0');
  return `${prefix}-${nextNum}`;
};

// -------------------------------------------------------------
// 1. DASHBOARD OVERVIEW
// -------------------------------------------------------------
exports.getDashboardSummary = async (req, res) => {
  try {
    const [
      pendingDeliveries,
      inTransit,
      delivered,
      installationPending,
      recentDeliveries
    ] = await Promise.all([
      DeliveryPlan.countDocuments({ status: { $in: ['Planned', 'Pending'] } }),
      DeliveryPlan.countDocuments({ status: { $in: ['Dispatched', 'In Transit'] } }),
      DeliveryPlan.countDocuments({ status: 'Delivered' }),
      Installation.countDocuments({ status: { $in: ['Scheduled', 'In Progress'] } }),
      DeliveryPlan.find().sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        pendingDeliveries,
        inTransit,
        delivered,
        installationPending,
        recentDeliveries
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// 2. DELIVERY PLANNING
// -------------------------------------------------------------
exports.getDeliveryPlans = async (req, res) => {
  try {
    const plans = await DeliveryPlan.find().sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDeliveryPlan = async (req, res) => {
  try {
    const {
      salesOrder,
      soNumber,
      customer,
      customerName,
      contactPerson,
      mobileNumber,
      deliveryAddress,
      product,
      productName,
      finishedGood,
      serialNumber,
      orderedQuantity,
      alreadyDeliveredQuantity,
      plannedDeliveryQuantity,
      deliveryDate,
      deliveryMethod,
      installationRequired,
      specialInstructions,
      remarks
    } = req.body;

    const deliveryNumber = await generateCode(DeliveryPlan, 'DEL', 'deliveryNumber');
    const pendingQty = Math.max(0, (Number(orderedQuantity) || 1) - ((Number(alreadyDeliveredQuantity) || 0) + (Number(plannedDeliveryQuantity) || 1)));

    const newPlan = new DeliveryPlan({
      deliveryNumber,
      salesOrder,
      soNumber,
      customer,
      customerName,
      contactPerson,
      mobileNumber,
      deliveryAddress,
      product,
      productName,
      finishedGood,
      serialNumber,
      orderedQuantity: Number(orderedQuantity) || 1,
      alreadyDeliveredQuantity: Number(alreadyDeliveredQuantity) || 0,
      pendingQuantity: pendingQty,
      plannedDeliveryQuantity: Number(plannedDeliveryQuantity) || 1,
      deliveryDate: deliveryDate || new Date(),
      deliveryMethod: deliveryMethod || 'Company Vehicle',
      installationRequired: installationRequired !== false,
      specialInstructions,
      remarks,
      status: 'Planned'
    });

    await newPlan.save();
    res.status(201).json({ success: true, data: newPlan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// 3. VEHICLE & COURIER
// -------------------------------------------------------------
exports.getVehiclesCouriers = async (req, res) => {
  try {
    const records = await VehicleCourier.find().sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createVehicleCourier = async (req, res) => {
  try {
    const code = await generateCode(VehicleCourier, req.body.entityType === 'Company Vehicle' ? 'VEH' : 'CR', 'code');
    const newVC = new VehicleCourier({
      ...req.body,
      code
    });
    await newVC.save();
    res.status(201).json({ success: true, data: newVC });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateVehicleCourier = async (req, res) => {
  try {
    const updated = await VehicleCourier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// 4. DISPATCH (REDUCES FG INVENTORY & CREATES TRACKING)
// -------------------------------------------------------------
exports.getDispatches = async (req, res) => {
  try {
    const dispatches = await Dispatch.find().sort({ createdAt: -1 });
    res.json({ success: true, data: dispatches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDispatch = async (req, res) => {
  try {
    const {
      deliveryPlan,
      deliveryNumber,
      salesOrder,
      soNumber,
      customer,
      customerName,
      product,
      productName,
      finishedGood,
      serialNumber,
      plannedQuantity,
      actualDispatchQuantity,
      warehouseLocation,
      packingDetails,
      dispatchDateTime,
      deliveryMethod,
      vehicleCourier,
      vehicleNumber,
      driverName,
      driverMobile,
      courierPartner,
      trackingNumber,
      dispatchedBy,
      checkedBy,
      deliveryChallan,
      remarks
    } = req.body;

    // Rule: Validate against available Finished Goods
    if (finishedGood) {
      const fgItem = await FinishedGood.findById(finishedGood);
      if (fgItem && fgItem.stockStatus === 'Dispatched') {
        return res.status(400).json({
          success: false,
          message: `Finished Good ${fgItem.fgNumber} (${fgItem.serialNumber}) has already been dispatched.`
        });
      }
    }

    const dispatchNumber = await generateCode(Dispatch, 'DISP', 'dispatchNumber');

    let finalSerial = serialNumber;
    if (!finalSerial && deliveryPlan) {
      const planDoc = await DeliveryPlan.findById(deliveryPlan);
      if (planDoc && planDoc.serialNumber) finalSerial = planDoc.serialNumber;
    }
    if (!finalSerial) finalSerial = 'SN-' + Date.now().toString().slice(-6);

    const newDispatch = new Dispatch({
      dispatchNumber,
      deliveryPlan,
      deliveryNumber,
      salesOrder,
      soNumber,
      customer,
      customerName,
      product,
      productName,
      finishedGood,
      serialNumber: finalSerial,
      plannedQuantity: Number(plannedQuantity) || 1,
      actualDispatchQuantity: Number(actualDispatchQuantity) || 1,
      warehouseLocation: warehouseLocation || 'FG Central Warehouse - Bay 1',
      packingDetails,
      dispatchDateTime: dispatchDateTime || new Date(),
      deliveryMethod: deliveryMethod || 'Company Vehicle',
      vehicleCourier,
      vehicleNumber,
      driverName,
      driverMobile,
      courierPartner,
      trackingNumber,
      dispatchedBy: dispatchedBy || 'Warehouse Officer',
      checkedBy: checkedBy || 'QA Security Gate',
      deliveryChallan: deliveryChallan || `DC-${dispatchNumber}`,
      remarks,
      status: 'Dispatched'
    });

    await newDispatch.save();

    // 1. Update Delivery Plan status to 'Dispatched'
    if (deliveryPlan) {
      await DeliveryPlan.findByIdAndUpdate(deliveryPlan, { status: 'Dispatched' });
    }

    // 2. Mark Finished Good as 'Dispatched' in Warehouse
    if (finishedGood) {
      await FinishedGood.findByIdAndUpdate(finishedGood, { stockStatus: 'Dispatched' });
    }

    // 3. Mark Vehicle/Courier status as 'In Transit'
    if (vehicleCourier) {
      await VehicleCourier.findByIdAndUpdate(vehicleCourier, {
        status: 'In Transit',
        assignedDelivery: deliveryPlan,
        assignedDeliveryNumber: deliveryNumber
      });
    }

    // 4. Auto-initialize Delivery Tracking record
    const trkNumber = await generateCode(DeliveryTracking, 'TRK', 'trackingNumber');
    const initialTracking = new DeliveryTracking({
      trackingNumber: trkNumber,
      deliveryPlan,
      deliveryNumber,
      dispatch: newDispatch._id,
      dispatchNumber,
      customerName,
      deliveryMethod,
      currentStatus: 'In Transit',
      currentLocation: 'Dispatched from Central Warehouse Gate',
      updateDateTime: new Date(),
      expectedArrival: new Date(Date.now() + 48 * 3600000), // Default 2 days
      remarks: 'Goods dispatched with sealed packing and delivery challan.'
    });
    await initialTracking.save();

    res.status(201).json({ success: true, data: newDispatch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// 5. DELIVERY TRACKING
// -------------------------------------------------------------
exports.getDeliveryTracking = async (req, res) => {
  try {
    const list = await DeliveryTracking.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTrackingMilestone = async (req, res) => {
  try {
    const {
      deliveryPlan,
      deliveryNumber,
      dispatch,
      dispatchNumber,
      customerName,
      deliveryMethod,
      currentStatus,
      currentLocation,
      updateDateTime,
      expectedArrival,
      delayReason,
      remarks,
      trackingProof,
      updatedBy
    } = req.body;

    const trackingNumber = await generateCode(DeliveryTracking, 'TRK', 'trackingNumber');

    const newMilestone = new DeliveryTracking({
      trackingNumber,
      deliveryPlan,
      deliveryNumber,
      dispatch,
      dispatchNumber,
      customerName,
      deliveryMethod,
      currentStatus,
      currentLocation,
      updateDateTime: updateDateTime || new Date(),
      expectedArrival,
      delayReason,
      remarks,
      trackingProof,
      updatedBy: updatedBy || 'Logistics Operator'
    });

    await newMilestone.save();

    // Update parent DeliveryPlan status accordingly
    if (deliveryPlan) {
      await DeliveryPlan.findByIdAndUpdate(deliveryPlan, {
        status: currentStatus === 'Delivered' ? 'Delivered' : 'In Transit'
      });
    }

    res.status(201).json({ success: true, data: newMilestone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// 6. DELIVERY CONFIRMATION (POD)
// -------------------------------------------------------------
exports.getDeliveryConfirmations = async (req, res) => {
  try {
    const list = await DeliveryConfirmation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDeliveryConfirmation = async (req, res) => {
  try {
    const {
      deliveryPlan,
      deliveryNumber,
      dispatch,
      dispatchNumber,
      customer,
      customerName,
      product,
      productName,
      dispatchedQuantity,
      receivedQuantity,
      deliveryDateTime,
      receivedBy,
      customerMobile,
      customerSignature,
      productCondition,
      damageRemarks,
      podDocument,
      installationRequired,
      remarks
    } = req.body;

    const dispQty = Number(dispatchedQuantity) || 1;
    const recQty = Number(receivedQuantity) || 1;
    const pendingQty = Math.max(0, dispQty - recQty);

    const confirmationNumber = await generateCode(DeliveryConfirmation, 'POD', 'confirmationNumber');

    const newConfirmation = new DeliveryConfirmation({
      confirmationNumber,
      deliveryPlan,
      deliveryNumber,
      dispatch,
      dispatchNumber,
      customer,
      customerName,
      product,
      productName,
      dispatchedQuantity: dispQty,
      receivedQuantity: recQty,
      pendingQuantity: pendingQty,
      deliveryDateTime: deliveryDateTime || new Date(),
      receivedBy,
      customerMobile,
      customerSignature: customerSignature || 'Confirmed on Delivery Challan',
      productCondition: productCondition || 'Good',
      damageRemarks,
      podDocument,
      installationRequired: installationRequired !== false,
      remarks,
      status: pendingQty === 0 ? 'Delivered' : 'Partial Delivery'
    });

    await newConfirmation.save();

    // 1. Update Delivery Plan status to 'Delivered'
    if (deliveryPlan) {
      await DeliveryPlan.findByIdAndUpdate(deliveryPlan, {
        status: 'Delivered',
        alreadyDeliveredQuantity: recQty,
        pendingQuantity: pendingQty
      });
    }

    // 2. If vehicle assigned, set vehicle back to 'Available'
    await VehicleCourier.updateMany(
      { assignedDeliveryNumber: deliveryNumber },
      { status: 'Available', assignedDelivery: null, assignedDeliveryNumber: null }
    );

    // 3. If installation is required, automatically schedule/create an Installation record
    if (installationRequired !== false) {
      const insNumber = await generateCode(Installation, 'INS', 'installationNumber');
      const planDoc = deliveryPlan ? await DeliveryPlan.findById(deliveryPlan) : null;

      const newInstallation = new Installation({
        installationNumber: insNumber,
        deliveryPlan,
        deliveryNumber,
        salesOrder: planDoc?.salesOrder,
        soNumber: planDoc?.soNumber || 'SO-001',
        customer,
        customerName,
        installationAddress: planDoc?.deliveryAddress || 'Client Site',
        contactPerson: receivedBy || planDoc?.contactPerson || 'Site Supervisor',
        mobileNumber: customerMobile || planDoc?.mobileNumber || '',
        product,
        productName,
        serialNumber: planDoc?.serialNumber || 'SN-001',
        installationQuantity: recQty,
        assignedTechnician: 'Ravi Kumar (Senior Service Engineer)',
        plannedInstallationDate: new Date(Date.now() + 24 * 3600000), // Next day
        requiredTools: 'Multimeter, Calibration Jig, Fluke Thermal Camera, Software Dongle',
        installationInstructions: 'Mount on vibration dampening pad, check 3-phase power supply, calibrate pressure sensors.',
        status: 'Scheduled',
        remarks: 'Auto-created following successful delivery confirmation (POD).'
      });
      await newInstallation.save();
    }

    res.status(201).json({ success: true, data: newConfirmation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// 7. INSTALLATION JOBS
// -------------------------------------------------------------
exports.getInstallations = async (req, res) => {
  try {
    const list = await Installation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createInstallation = async (req, res) => {
  try {
    const installationNumber = await generateCode(Installation, 'INS', 'installationNumber');
    const newIns = new Installation({
      deliveryNumber: req.body.deliveryNumber || 'DEL-DIRECT',
      installationAddress: req.body.installationAddress || 'Customer Plant Site',
      assignedTechnician: req.body.assignedTechnician || req.body.technician || 'Senior Field Service Engineer',
      plannedInstallationDate: req.body.plannedInstallationDate || req.body.scheduledDate || new Date(),
      ...req.body,
      installationNumber
    });
    await newIns.save();
    res.status(201).json({ success: true, data: newIns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateInstallationStatus = async (req, res) => {
  try {
    const updated = await Installation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, remarks: req.body.remarks },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// 8. INSTALLATION COMPLETION & QA SIGN-OFF
// -------------------------------------------------------------
exports.getInstallationCompletions = async (req, res) => {
  try {
    const list = await InstallationCompletion.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createInstallationCompletion = async (req, res) => {
  try {
    const {
      installation,
      installationNumber,
      customer,
      customerName,
      product,
      productName,
      serialNumber,
      technician,
      installationDate,
      completionDate,
      checklist,
      testingDetails,
      customerConfirmation,
      overallResult,
      issueReported,
      issueResolutionDetails,
      remarks
    } = req.body;

    const completionNumber = await generateCode(InstallationCompletion, 'ICOMP', 'completionNumber');

    // Rule: Verify if all checklist items are 'Pass'
    const checklistValues = Object.values(checklist || {});
    const hasFail = checklistValues.some(val => val === 'Fail') || overallResult === 'Fail';

    const finalStatus = hasFail ? 'Failed - Retest Required' : 'Completed';

    let finalSerialNumber = serialNumber;
    if (!finalSerialNumber && installation) {
      const instRec = await Installation.findById(installation);
      if (instRec && instRec.serialNumber) finalSerialNumber = instRec.serialNumber;
    }
    if (!finalSerialNumber) {
      finalSerialNumber = 'SN-' + Date.now().toString().slice(-6);
    }

    const newComp = new InstallationCompletion({
      completionNumber,
      installation,
      installationNumber,
      customer,
      customerName,
      product,
      productName,
      serialNumber: finalSerialNumber,
      technician,
      installationDate: installationDate || new Date(),
      completionDate: completionDate || new Date(),
      checklist,
      testingDetails: testingDetails || [],
      customerConfirmation: customerConfirmation || {
        customerName: customerName || 'Site Engineer',
        customerFeedback: 'Installation complete and verified operational.',
        customerSignature: 'Signed on Site'
      },
      overallResult: hasFail ? 'Fail' : 'Pass',
      issueReported: Boolean(issueReported || hasFail),
      issueResolutionDetails,
      status: finalStatus,
      remarks
    });

    await newComp.save();

    // Update parent Installation record
    if (installation) {
      await Installation.findByIdAndUpdate(installation, {
        status: hasFail ? 'Failed / Rework' : 'Completed'
      });
    }

    res.status(201).json({ success: true, data: newComp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// 9. LOGISTICS REPORTS
// -------------------------------------------------------------
exports.getLogisticsReports = async (req, res) => {
  try {
    const [
      allDeliveries,
      allDispatches,
      allVehicles,
      allTracking,
      allInstallations,
      allCompletions
    ] = await Promise.all([
      DeliveryPlan.find(),
      Dispatch.find(),
      VehicleCourier.find(),
      DeliveryTracking.find(),
      Installation.find(),
      InstallationCompletion.find()
    ]);

    const delayedDeliveries = allTracking.filter(t => t.currentStatus === 'Delayed' || t.currentStatus === 'Delivery Failed');
    const failedInstallations = allCompletions.filter(c => c.overallResult === 'Fail');

    res.json({
      success: true,
      data: {
        totalPlanned: allDeliveries.length,
        totalDispatched: allDispatches.length,
        totalDelivered: allDeliveries.filter(d => d.status === 'Delivered').length,
        totalPending: allDeliveries.filter(d => d.status === 'Planned' || d.status === 'Dispatched').length,
        delayedCount: delayedDeliveries.length,
        installationTotal: allInstallations.length,
        installationCompleted: allInstallations.filter(i => i.status === 'Completed').length,
        installationFailed: failedInstallations.length,
        vehicles: allVehicles.filter(v => v.entityType === 'Company Vehicle'),
        couriers: allVehicles.filter(v => v.entityType === 'Courier / Transport'),
        delays: delayedDeliveries,
        deliveriesList: allDeliveries,
        installationsList: allInstallations
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

