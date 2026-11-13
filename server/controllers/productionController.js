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

const Material = require('../models/Material');
const Inventory = require('../models/Inventory');
const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');
const SalesOrder = require('../models/SalesOrder');
const Customer = require('../models/Customer');

// ==========================================
// 01. PRODUCTION DASHBOARD
// ==========================================
exports.getProductionDashboard = async (req, res) => {
  try {
    const totalOrders = await WorkOrder.countDocuments();
    const inProgress = await WorkOrder.countDocuments({ status: { $in: ['Running', 'Ready to Start'] } });
    const waitingMaterials = await WorkOrder.countDocuments({ status: 'Waiting for Materials' });
    const qaPending = await ProductionCompletion.countDocuments({ status: 'QA Pending' });
    const reworkCount = await ReworkOrder.countDocuments({ status: { $in: ['Pending', 'In Progress', 'Assigned', 'Re-QA Pending'] } });
    const completedOrders = await WorkOrder.countDocuments({ status: 'Completed' });

    const recentOrders = await WorkOrder.find()
      .populate('product', 'productCode productName')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      kpis: {
        totalOrders,
        inProgress,
        waitingMaterials,
        qaPending,
        reworkCount,
        completedOrders
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 02. PRODUCTION PLANNING (WORK ORDERS)
// ==========================================
exports.getWorkOrders = async (req, res) => {
  try {
    const orders = await WorkOrder.find()
      .populate('salesOrder', 'soNumber customer grandTotal')
      .populate('customer', 'companyName contactPerson')
      .populate('product', 'productCode productName unit')
      .populate('bom', 'bomNumber version')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createWorkOrder = async (req, res) => {
  try {
    const count = await WorkOrder.countDocuments();
    const workOrderNumber = `WO-${String(count + 1).padStart(3, '0')}`;

    let customerName = req.body.customerName;
    if (!customerName && req.body.customer) {
      const cust = await Customer.findById(req.body.customer);
      if (cust) customerName = cust.companyName;
    }

    let productName = req.body.productName;
    if (!productName && req.body.product) {
      const prod = await Product.findById(req.body.product);
      if (prod) productName = prod.productName;
    }

    let salesOrderNumber = req.body.salesOrderNumber;
    if (!salesOrderNumber && req.body.salesOrder) {
      const so = await SalesOrder.findById(req.body.salesOrder);
      if (so) salesOrderNumber = so.soNumber;
    }

    const newOrder = new WorkOrder({
      ...req.body,
      workOrderNumber,
      customerName: customerName || 'Direct Factory Order',
      productName: productName || 'Finished Unit',
      salesOrderNumber
    });

    await newOrder.save();
    res.status(201).json({ success: true, data: newOrder });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateWorkOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 03. BILL OF MATERIALS (BOM)
// ==========================================
exports.getBOMs = async (req, res) => {
  try {
    const boms = await BOM.find()
      .populate('product', 'productCode productName category')
      .populate('materials.material', 'materialCode materialName unit')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: boms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBOM = async (req, res) => {
  try {
    const count = await BOM.countDocuments();
    const bomNumber = `BOM-${String(count + 1).padStart(3, '0')}`;

    const newBOM = new BOM({
      ...req.body,
      bomNumber
    });

    await newBOM.save();
    res.status(201).json({ success: true, data: newBOM });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateBOM = async (req, res) => {
  try {
    const updated = await BOM.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 04. PRODUCTION SCHEDULE
// ==========================================
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await ProductionSchedule.find()
      .populate('workOrder', 'workOrderNumber productName orderQuantity status')
      .populate('product', 'productCode productName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const count = await ProductionSchedule.countDocuments();
    const scheduleNumber = `SCH-${String(count + 1).padStart(3, '0')}`;

    const newSchedule = new ProductionSchedule({
      ...req.body,
      scheduleNumber
    });

    await newSchedule.save();
    res.status(201).json({ success: true, data: newSchedule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const updated = await ProductionSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 05. MATERIAL REQUESTS
// ==========================================
exports.getMaterialRequests = async (req, res) => {
  try {
    const requests = await MaterialRequest.find()
      .populate('workOrder', 'workOrderNumber productName productionQuantity')
      .populate('product', 'productCode productName')
      .populate('items.material', 'materialCode materialName unit currentStock')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createMaterialRequest = async (req, res) => {
  try {
    const count = await MaterialRequest.countDocuments();
    const requestNumber = `MR-${String(count + 1).padStart(3, '0')}`;

    // Enrich items with company store available stock
    const enrichedItems = await Promise.all((req.body.items || []).map(async (item) => {
      const inv = await Inventory.findOne({ material: item.material });
      const availableStock = inv ? inv.currentStock : 0;
      return {
        ...item,
        availableStock,
        remainingQty: (item.requestedQty || 0) - (item.alreadyIssuedQty || 0)
      };
    }));

    const newRequest = new MaterialRequest({
      ...req.body,
      requestNumber,
      items: enrichedItems
    });

    await newRequest.save();

    // Update WorkOrder to 'Waiting for Materials'
    if (newRequest.workOrder) {
      await WorkOrder.findByIdAndUpdate(newRequest.workOrder, { status: 'Waiting for Materials' });
    }

    res.status(201).json({ success: true, data: newRequest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateMaterialRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await MaterialRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 06. MATERIAL ISSUE (COMPANY STORE ISSUANCE)
// ==========================================
exports.getMaterialIssues = async (req, res) => {
  try {
    const issues = await ProductionIssue.find()
      .populate('materialRequest', 'requestNumber requestedDate')
      .populate('workOrder', 'workOrderNumber productName')
      .populate('items.material', 'materialCode materialName unit')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: issues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createMaterialIssue = async (req, res) => {
  try {
    const count = await ProductionIssue.countDocuments();
    const issueNumber = `MI-${String(count + 1).padStart(3, '0')}`;

    // Verify stock and issue
    for (const item of (req.body.items || [])) {
      const inv = await Inventory.findOne({ material: item.material });
      if (!inv || inv.currentStock < item.issuedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient approved stock for ${item.materialName || 'material'}. Available: ${inv ? inv.currentStock : 0}, Requested to Issue: ${item.issuedQty}`
        });
      }

      // Decrement stock in Company Store Inventory
      const prevStock = inv.currentStock;
      inv.currentStock -= Number(item.issuedQty);
      inv.lastUpdated = new Date();
      await inv.save();

      // Record in StockLedger
      await StockLedger.create({
        material: item.material,
        transactionDate: new Date(),
        transactionType: 'OUT',
        referenceNumber: issueNumber,
        referenceType: 'PRODUCTION_ISSUE',
        quantity: Number(item.issuedQty),
        previousStock: prevStock,
        currentStock: inv.currentStock,
        notes: `Issued to Production for ${req.body.workOrderNumber || 'Work Order'}`
      });

      // Update Material master current stock
      await Material.findByIdAndUpdate(item.material, { currentStock: inv.currentStock });
    }

    const newIssue = new ProductionIssue({
      ...req.body,
      issueNumber
    });
    await newIssue.save();

    // Update MaterialRequest items issued qty and status
    if (req.body.materialRequest) {
      const mr = await MaterialRequest.findById(req.body.materialRequest);
      if (mr) {
        mr.status = 'Fully Issued';
        for (const issuedItem of (req.body.items || [])) {
          const match = mr.items.find(i => String(i.material) === String(issuedItem.material));
          if (match) {
            match.alreadyIssuedQty = (match.alreadyIssuedQty || 0) + Number(issuedItem.issuedQty);
            match.remainingQty = Math.max(0, match.requiredQty - match.alreadyIssuedQty);
            match.status = match.remainingQty === 0 ? 'Issued' : 'Partially Approved';
          }
        }
        await mr.save();
      }
    }

    // Update WorkOrder to 'Ready to Start'
    if (req.body.workOrder) {
      await WorkOrder.findByIdAndUpdate(req.body.workOrder, { status: 'Ready to Start' });
    }

    res.status(201).json({ success: true, data: newIssue });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 07. PRODUCTION EXECUTION
// ==========================================
exports.getExecutions = async (req, res) => {
  try {
    const executions = await ProductionExecution.find()
      .populate('workOrder', 'workOrderNumber productName productionQuantity priority')
      .populate('product', 'productCode productName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: executions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.startExecution = async (req, res) => {
  try {
    const count = await ProductionExecution.countDocuments();
    const executionNumber = `EX-${String(count + 1).padStart(3, '0')}`;

    const newExec = new ProductionExecution({
      ...req.body,
      executionNumber,
      status: 'Running'
    });
    await newExec.save();

    // Update WorkOrder status to 'Running'
    if (req.body.workOrder) {
      await WorkOrder.findByIdAndUpdate(req.body.workOrder, { status: 'Running' });
    }

    res.status(201).json({ success: true, data: newExec });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateExecutionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const exec = await ProductionExecution.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (exec && exec.workOrder) {
      await WorkOrder.findByIdAndUpdate(exec.workOrder, { status });
    }
    res.json({ success: true, data: exec });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 08. PRODUCTION UPDATES (DAILY / WEEKLY)
// ==========================================
exports.getProductionUpdates = async (req, res) => {
  try {
    const updates = await ProductionUpdate.find()
      .populate('workOrder', 'workOrderNumber productName productionQuantity')
      .populate('product', 'productCode productName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: updates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProductionUpdate = async (req, res) => {
  try {
    const count = await ProductionUpdate.countDocuments();
    const updateNumber = `PU-${String(count + 1).padStart(3, '0')}`;

    const prevCompleted = Number(req.body.previouslyCompletedQuantity || 0);
    const completedNow = Number(req.body.completedQuantity || 0);
    const planned = Number(req.body.plannedQuantity || 0);

    const totalCompleted = prevCompleted + completedNow;
    const pending = Math.max(0, planned - totalCompleted);

    const newUpdate = new ProductionUpdate({
      ...req.body,
      updateNumber,
      previouslyCompletedQuantity: prevCompleted,
      totalCompletedQuantity: totalCompleted,
      pendingQuantity: pending
    });

    await newUpdate.save();
    res.status(201).json({ success: true, data: newUpdate });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 09. PRODUCTION COMPLETION
// ==========================================
exports.getCompletions = async (req, res) => {
  try {
    const completions = await ProductionCompletion.find()
      .populate('workOrder', 'workOrderNumber productName productionQuantity customerName')
      .populate('product', 'productCode productName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: completions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCompletion = async (req, res) => {
  try {
    const count = await ProductionCompletion.countDocuments();
    const completionNumber = `PC-${String(count + 1).padStart(3, '0')}`;

    const newCompletion = new ProductionCompletion({
      ...req.body,
      completionNumber,
      status: 'QA Pending'
    });

    await newCompletion.save();

    // Update WorkOrder to 'On Hold' or waiting QA
    if (req.body.workOrder) {
      await WorkOrder.findByIdAndUpdate(req.body.workOrder, { status: 'On Hold' });
    }

    res.status(201).json({ success: true, data: newCompletion });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 10. QUALITY ASSURANCE (QA)
// ==========================================
exports.getQATests = async (req, res) => {
  try {
    const tests = await ProductionQA.find()
      .populate('workOrder', 'workOrderNumber productName productionQuantity')
      .populate('completion', 'completionNumber actualCompletionDate')
      .populate('product', 'productCode productName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createQATest = async (req, res) => {
  try {
    const count = await ProductionQA.countDocuments();
    const qaNumber = `QA-${String(count + 1).padStart(3, '0')}`;

    const newQA = new ProductionQA({
      ...req.body,
      qaNumber
    });
    await newQA.save();

    // If QA Decision is Rework, automatically create Rework record
    if (newQA.decision === 'Rework' || newQA.failedQuantity > 0) {
      const rwCount = await ReworkOrder.countDocuments();
      const reworkNumber = `RW-${String(rwCount + 1).padStart(3, '0')}`;

      await ReworkOrder.create({
        reworkNumber,
        workOrder: newQA.workOrder,
        workOrderNumber: newQA.workOrderNumber,
        qaReference: newQA._id,
        qaNumber,
        product: newQA.product,
        productName: newQA.productName,
        serialNumber: newQA.batchSerialNumber || 'SN-PENDING',
        reworkQuantity: newQA.failedQuantity || 1,
        defectDescription: newQA.defectDescription || 'Inspection parameters failed during QA',
        failureReason: newQA.failureReason || 'High temperature / Sensor calibration out of spec',
        assignedTechnician: 'Senior QA Tech',
        status: 'Pending'
      });
    }

    // Update Completion status
    if (newQA.completion) {
      await ProductionCompletion.findByIdAndUpdate(newQA.completion, {
        status: newQA.overallResult === 'Pass' ? 'QA Passed' : 'QA Failed'
      });
    }

    res.status(201).json({ success: true, data: newQA });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 11. REWORK / REBUILD
// ==========================================
exports.getReworkOrders = async (req, res) => {
  try {
    const reworks = await ReworkOrder.find()
      .populate('workOrder', 'workOrderNumber productName')
      .populate('qaReference', 'qaNumber overallResult testDate')
      .populate('product', 'productCode productName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reworks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createReworkOrder = async (req, res) => {
  try {
    const count = await ReworkOrder.countDocuments();
    const reworkNumber = `RW-${String(count + 1).padStart(3, '0')}`;

    const newRework = new ReworkOrder({
      ...req.body,
      reworkNumber
    });
    await newRework.save();
    res.status(201).json({ success: true, data: newRework });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateReworkStatus = async (req, res) => {
  try {
    const { status, repairAction, problemIdentified, replacementMaterials, technicianRemarks } = req.body;
    const updateData = { status };
    if (repairAction) updateData.repairAction = repairAction;
    if (problemIdentified) updateData.problemIdentified = problemIdentified;
    if (replacementMaterials) updateData.replacementMaterials = replacementMaterials;
    if (technicianRemarks) updateData.technicianRemarks = technicianRemarks;
    if (status === 'Repair Completed' || status === 'Re-QA Pending') {
      updateData.reworkCompletionDate = new Date();
    }

    const updated = await ReworkOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 12. FINISHED GOODS
// ==========================================
exports.getFinishedGoods = async (req, res) => {
  try {
    const goods = await FinishedGood.find()
      .populate('workOrder', 'workOrderNumber customerName')
      .populate('salesOrder', 'soNumber customer')
      .populate('product', 'productCode productName')
      .populate('qaApprovalReference', 'qaNumber overallResult testDate')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: goods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createFinishedGood = async (req, res) => {
  try {
    const count = await FinishedGood.countDocuments();
    const fgNumber = `FG-${String(count + 1).padStart(3, '0')}`;

    const newFG = new FinishedGood({
      ...req.body,
      fgNumber
    });
    await newFG.save();

    // Mark WorkOrder completed
    if (req.body.workOrder) {
      await WorkOrder.findByIdAndUpdate(req.body.workOrder, { status: 'Completed' });
    }

    res.status(201).json({ success: true, data: newFG });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateFinishedGoodStatus = async (req, res) => {
  try {
    const { stockStatus } = req.body;
    const updated = await FinishedGood.findByIdAndUpdate(
      req.params.id,
      { stockStatus },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

