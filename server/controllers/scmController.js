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

// Helper to determine inventory status
const calculateInventoryStatus = (available, min) => {
  if (available <= 0) return 'Out of Stock';
  if (available <= min) return 'Low Stock';
  return 'In Stock';
};

// --------------------------------------------------------------------
// 01. RAW MATERIAL MASTER
// --------------------------------------------------------------------
exports.getMaterials = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { materialCode: { $regex: search, $options: 'i' } },
        { materialName: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;

    const materials = await Material.find(query).sort({ materialCode: 1 }).lean();
    
    // Attach inventory snapshot to each material
    const materialIds = materials.map(m => m._id);
    const inventories = await Inventory.find({ material: { $in: materialIds } }).lean();
    const inventoryMap = {};
    inventories.forEach(inv => {
      inventoryMap[inv.material.toString()] = inv;
    });

    const enriched = materials.map(m => {
      const inv = inventoryMap[m._id.toString()];
      return {
        ...m,
        currentStock: inv ? inv.availableStock : 0,
        stockStatus: inv ? inv.status : 'Out of Stock',
        totalReceived: inv ? inv.totalReceived : 0,
        totalIssued: inv ? inv.totalIssued : 0
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    let { materialCode, materialName, category, unit, minimumStock, reorderLevel, description, storageLocation, hsnCode } = req.body;
    
    // Auto-generate code if empty
    if (!materialCode) {
      const count = await Material.countDocuments();
      materialCode = `RM-${String(count + 1).padStart(3, '0')}`;
    }

    const existing = await Material.findOne({ materialCode: materialCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Material Code ${materialCode} already exists` });
    }

    const material = await Material.create({
      materialCode: materialCode.toUpperCase(),
      materialName,
      category,
      unit,
      minimumStock: Number(minimumStock) || 100,
      reorderLevel: Number(reorderLevel) || 150,
      description,
      storageLocation,
      hsnCode
    });

    // Automatically initialize Inventory record
    await Inventory.create({
      material: material._id,
      availableStock: 0,
      minimumStock: material.minimumStock,
      status: 'Out of Stock'
    });

    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    
    // Sync minimum stock with Inventory record
    if (req.body.minimumStock !== undefined) {
      const inv = await Inventory.findOne({ material: material._id });
      if (inv) {
        inv.minimumStock = req.body.minimumStock;
        inv.status = calculateInventoryStatus(inv.availableStock, inv.minimumStock);
        await inv.save();
      }
    }

    res.json({ success: true, data: material });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 02. SUPPLIERS
// --------------------------------------------------------------------
exports.getSuppliers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { supplierCode: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'All') query.status = status;

    const suppliers = await Supplier.find(query).sort({ supplierCode: 1 });
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    let { supplierCode, supplierName, contactPerson, mobileNumber, email, gstNumber, address, city, state, pincode, paymentTerms } = req.body;
    
    if (!supplierCode) {
      const count = await Supplier.countDocuments();
      supplierCode = `SUP-${String(count + 1).padStart(3, '0')}`;
    }

    const existing = await Supplier.findOne({ supplierCode: supplierCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Supplier Code ${supplierCode} already exists` });
    }

    const supplier = await Supplier.create({
      supplierCode: supplierCode.toUpperCase(),
      supplierName,
      contactPerson,
      mobileNumber,
      email,
      gstNumber: gstNumber ? gstNumber.toUpperCase() : '',
      address,
      city,
      state,
      pincode,
      paymentTerms
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 03. SUPPLIER MATERIAL LINK
// --------------------------------------------------------------------
exports.getSupplierMaterialLinks = async (req, res) => {
  try {
    const { supplier, material } = req.query;
    let query = {};
    if (supplier) query.supplier = supplier;
    if (material) query.material = material;

    const links = await SupplierMaterialLink.find(query)
      .populate('supplier', 'supplierCode supplierName contactPerson city')
      .populate('material', 'materialCode materialName category unit')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: links.length, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSupplierMaterialLink = async (req, res) => {
  try {
    const { supplier, material, supplierMaterialCode, unitPrice, minOrderQty, leadTimeDays, preferredSupplier } = req.body;
    
    // Check for duplicate link
    const existing = await SupplierMaterialLink.findOne({ supplier, material });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This Supplier is already linked with this Material. Edit the existing record instead.'
      });
    }

    // If preferredSupplier is set, reset other suppliers for this material
    if (preferredSupplier) {
      await SupplierMaterialLink.updateMany({ material }, { preferredSupplier: false });
    }

    const link = await SupplierMaterialLink.create({
      supplier,
      material,
      supplierMaterialCode,
      unitPrice: Number(unitPrice),
      minOrderQty: Number(minOrderQty) || 1,
      leadTimeDays: Number(leadTimeDays) || 3,
      preferredSupplier: !!preferredSupplier
    });

    const populated = await SupplierMaterialLink.findById(link._id)
      .populate('supplier', 'supplierCode supplierName')
      .populate('material', 'materialCode materialName unit');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSupplierMaterialLink = async (req, res) => {
  try {
    const { unitPrice, minOrderQty, leadTimeDays, preferredSupplier, status } = req.body;
    const link = await SupplierMaterialLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    if (preferredSupplier) {
      await SupplierMaterialLink.updateMany({ material: link.material, _id: { $ne: link._id } }, { preferredSupplier: false });
      link.preferredSupplier = true;
    } else if (preferredSupplier === false) {
      link.preferredSupplier = false;
    }

    if (unitPrice !== undefined) link.unitPrice = Number(unitPrice);
    if (minOrderQty !== undefined) link.minOrderQty = Number(minOrderQty);
    if (leadTimeDays !== undefined) link.leadTimeDays = Number(leadTimeDays);
    if (status) link.status = status;

    await link.save();
    res.json({ success: true, data: link });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 04. PURCHASE ORDERS (PO)
// --------------------------------------------------------------------
exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status, supplier } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (supplier) query.supplier = supplier;

    const pos = await PurchaseOrder.find(query)
      .populate('supplier', 'supplierCode supplierName contactPerson mobileNumber gstNumber paymentTerms')
      .populate('items.material', 'materialCode materialName category unit')
      .sort({ poDate: -1, createdAt: -1 });

    res.json({ success: true, count: pos.length, data: pos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    let { poNumber, poDate, supplier, expectedDeliveryDate, deliveryAddress, items, freightCharges, paymentTerms, notes, status } = req.body;
    
    if (!poNumber) {
      const year = new Date().getFullYear();
      let count = await PurchaseOrder.countDocuments();
      let candidate = `PO-${year}-${String(count + 1).padStart(3, '0')}`;
      while (await PurchaseOrder.findOne({ poNumber: candidate })) {
        count++;
        candidate = `PO-${year}-${String(count + 1).padStart(3, '0')}`;
      }
      poNumber = candidate;
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'PO must have at least one material item' });
    }

    // Calculate item totals
    let subtotal = 0;
    let gstTotal = 0;
    const computedItems = items.map(item => {
      const qty = Number(item.quantity !== undefined ? item.quantity : (item.orderedQuantity !== undefined ? item.orderedQuantity : 1));
      const price = Number(item.unitPrice || 0);
      const taxRate = Number(item.taxPercent) || 18;
      const baseAmount = qty * price;
      const taxAmount = (baseAmount * taxRate) / 100;
      const lineTotal = baseAmount + taxAmount;

      subtotal += baseAmount;
      gstTotal += taxAmount;

      return {
        material: item.material,
        quantity: qty,
        unit: item.unit || 'Kg',
        unitPrice: price,
        taxPercent: taxRate,
        lineTotal: Math.round(lineTotal * 100) / 100
      };
    });

    const freight = Number(freightCharges) || 0;
    const grandTotal = Math.round((subtotal + gstTotal + freight) * 100) / 100;

    const po = await PurchaseOrder.create({
      poNumber: poNumber.toUpperCase(),
      poDate: poDate || Date.now(),
      supplier,
      expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deliveryAddress: deliveryAddress || 'Cryo Main Warehouse, Chennai',
      items: computedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      gstTotal: Math.round(gstTotal * 100) / 100,
      freightCharges: freight,
      grandTotal,
      paymentTerms,
      notes,
      status: status || 'Approved' // Can be Draft, Pending, Approved
    });

    const populated = await PurchaseOrder.findById(po._id)
      .populate('supplier', 'supplierCode supplierName')
      .populate('items.material', 'materialCode materialName unit');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePOStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    res.json({ success: true, data: po });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 05. GOODS RECEIPT NOTE (GRN)
// --------------------------------------------------------------------
exports.getGRNs = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;

    const grns = await GRN.find(query)
      .populate('purchaseOrder', 'poNumber poDate grandTotal')
      .populate('supplier', 'supplierCode supplierName')
      .populate('items.material', 'materialCode materialName unit')
      .sort({ receivedDate: -1 });

    res.json({ success: true, count: grns.length, data: grns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGRN = async (req, res) => {
  try {
    let { grnNumber, purchaseOrder, supplier, receivedDate, invoiceNumber, invoiceDate, deliveryChallanNo, vehicleNumber, receivedBy, items, remarks } = req.body;

    if (!grnNumber) {
      const year = new Date().getFullYear();
      const count = await GRN.countDocuments();
      grnNumber = `GRN-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    const po = await PurchaseOrder.findById(purchaseOrder);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });

    if (!invoiceNumber) {
      invoiceNumber = deliveryChallanNo || `INV-${Date.now().toString().slice(-6)}`;
    }

    // Validate items
    const processedItems = items.map(item => {
      const matchingPOItem = po.items.find(pi => pi.material && pi.material.toString() === (item.material ? item.material.toString() : ''));
      const ordered = Number(item.orderedQty !== undefined ? item.orderedQty : (matchingPOItem ? matchingPOItem.quantity : (item.currentReceivedQty || item.receivedQuantity || 1)));
      const currentReceived = Number(item.currentReceivedQty !== undefined ? item.currentReceivedQty : (item.receivedQuantity !== undefined ? item.receivedQuantity : 1));
      const prev = Number(item.previouslyReceivedQty) || 0;
      const balance = Math.max(0, ordered - (prev + currentReceived));

      return {
        material: item.material,
        orderedQty: ordered,
        previouslyReceivedQty: prev,
        currentReceivedQty: currentReceived,
        balanceQty: balance,
        unit: item.unit || matchingPOItem?.unit || 'Kg',
        batchNumber: item.batchNumber || `BAT-${Date.now().toString().slice(-6)}`,
        expiryDate: item.expiryDate || null
      };
    });

    const grn = await GRN.create({
      grnNumber: grnNumber.toUpperCase(),
      purchaseOrder,
      supplier: supplier || po.supplier,
      receivedDate: receivedDate || Date.now(),
      invoiceNumber,
      invoiceDate: invoiceDate || Date.now(),
      deliveryChallanNo,
      vehicleNumber,
      receivedBy: receivedBy || 'Store Officer',
      items: processedItems,
      remarks,
      status: 'QC Pending' // STRICT RULE: Never direct to stock. Must be QC Pending!
    });

    // Update PO item received counts and status
    let allCompleted = true;
    po.items.forEach(poItem => {
      const matchingGRNItem = processedItems.find(gi => gi.material.toString() === poItem.material.toString());
      if (matchingGRNItem) {
        poItem.receivedQuantity = (poItem.receivedQuantity || 0) + matchingGRNItem.currentReceivedQty;
      }
      if (poItem.receivedQuantity < poItem.quantity) {
        allCompleted = false;
      }
    });

    po.status = allCompleted ? 'Completed' : 'Partially Received';
    await po.save();

    const populated = await GRN.findById(grn._id)
      .populate('purchaseOrder', 'poNumber')
      .populate('supplier', 'supplierCode supplierName')
      .populate('items.material', 'materialCode materialName unit');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 06. QC TESTS (QUALITY CONTROL)
// --------------------------------------------------------------------
exports.getQCTests = async (req, res) => {
  try {
    const { overallResult } = req.query;
    let query = {};
    if (overallResult && overallResult !== 'All') query.overallResult = overallResult;

    const tests = await QCTest.find(query)
      .populate('grn', 'grnNumber invoiceNumber receivedDate')
      .populate('material', 'materialCode materialName unit category')
      .populate('supplier', 'supplierCode supplierName')
      .sort({ testDate: -1, createdAt: -1 });

    res.json({ success: true, count: tests.length, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createQCTest = async (req, res) => {
  try {
    let {
      qcNumber,
      grn,
      material,
      supplier,
      batchNumber,
      receivedQuantity,
      testedQuantity,
      acceptedQuantity,
      rejectedQuantity,
      testDate,
      inspectorName,
      parameters,
      overallResult,
      remarks
    } = req.body;

    if (!qcNumber) {
      const year = new Date().getFullYear();
      const count = await QCTest.countDocuments();
      qcNumber = `QC-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    const tested = Number(testedQuantity);
    const accepted = Number(acceptedQuantity) || 0;
    const rejected = Number(rejectedQuantity) || 0;

    if (Math.abs(tested - (accepted + rejected)) > 0.001) {
      return res.status(400).json({
        success: false,
        message: `Tested quantity (${tested}) must equal Accepted (${accepted}) + Rejected (${rejected})`
      });
    }

    // Determine overall result if not explicitly passed
    let result = overallResult;
    if (!result) {
      if (rejected === 0) result = 'Pass';
      else if (accepted === 0) result = 'Reject';
      else result = 'Partial Pass';
    }

    const recQty = Number(receivedQuantity !== undefined ? receivedQuantity : (tested || (accepted + rejected) || 1));

    // 1. Create QC Test Record
    const qcTest = await QCTest.create({
      qcNumber: qcNumber.toUpperCase(),
      grn,
      material,
      supplier,
      batchNumber: batchNumber || 'BAT-DEFAULT',
      receivedQuantity: recQty,
      testedQuantity: tested,
      acceptedQuantity: accepted,
      rejectedQuantity: rejected,
      availableRejectedQuantity: rejected, // Available for returns
      testDate: testDate || Date.now(),
      inspectorName: inspectorName || 'QC Inspector',
      parameters: parameters || [
        { parameter: 'Visual Inspection', standard: 'Clean & Defect-free', actual: 'Verified', result: 'Pass' },
        { parameter: 'Dimensional Accuracy', standard: 'Standard tolerance', actual: 'Verified', result: 'Pass' }
      ],
      overallResult: result,
      remarks,
      status: 'Completed'
    });

    // 2. CRITICAL STOCK TRIGGER: Accepted Qty added to Inventory
    if (accepted > 0) {
      let inv = await Inventory.findOne({ material });
      if (!inv) {
        inv = new Inventory({ material, availableStock: 0, minimumStock: 100 });
      }

      const prevStock = inv.availableStock;
      inv.totalReceived = (inv.totalReceived || 0) + accepted;
      inv.availableStock = prevStock + accepted;
      inv.status = calculateInventoryStatus(inv.availableStock, inv.minimumStock);
      inv.lastUpdated = Date.now();
      await inv.save();

      // Record in Stock Ledger
      await StockLedger.create({
        material,
        date: testDate || Date.now(),
        transactionType: 'QC Inward Receipt',
        referenceDoc: qcTest.qcNumber,
        qtyIn: accepted,
        qtyOut: 0,
        balanceAfter: inv.availableStock,
        loggedBy: inspectorName || 'QC Team',
        notes: `QC Approved from GRN for Batch ${batchNumber}`
      });
    }

    // 3. Mark GRN as Completed
    await GRN.findByIdAndUpdate(grn, { status: 'Completed' });

    const populated = await QCTest.findById(qcTest._id)
      .populate('grn', 'grnNumber')
      .populate('material', 'materialCode materialName unit')
      .populate('supplier', 'supplierCode supplierName');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 07. RAW MATERIAL INVENTORY & LEDGER
// --------------------------------------------------------------------
exports.getInventory = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    const inventories = await Inventory.find()
      .populate('material', 'materialCode materialName category unit minimumStock reorderLevel storageLocation')
      .sort({ 'material.materialCode': 1 });

    let filtered = inventories.filter(inv => inv.material != null);
    
    if (status && status !== 'All') {
      filtered = filtered.filter(inv => inv.status === status);
    }
    if (category && category !== 'All') {
      filtered = filtered.filter(inv => inv.material && inv.material.category === category);
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMaterialStockLedger = async (req, res) => {
  try {
    const { materialId } = req.params;
    const ledger = await StockLedger.find({ material: materialId }).sort({ date: -1, createdAt: -1 });
    const inventory = await Inventory.findOne({ material: materialId }).populate('material');

    res.json({ success: true, inventory, ledger });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { materialId, adjustedStock, reason, loggedBy } = req.body;
    const inv = await Inventory.findOne({ material: materialId }).populate('material');
    if (!inv) return res.status(404).json({ success: false, message: 'Inventory record not found' });

    const oldStock = inv.availableStock;
    const newStock = Number(adjustedStock);
    const diff = newStock - oldStock;

    inv.availableStock = newStock;
    inv.adjustments = (inv.adjustments || 0) + diff;
    inv.status = calculateInventoryStatus(newStock, inv.minimumStock);
    inv.lastUpdated = Date.now();
    await inv.save();

    await StockLedger.create({
      material: materialId,
      date: Date.now(),
      transactionType: 'Audit Adjustment',
      referenceDoc: `ADJ-${Date.now().toString().slice(-6)}`,
      qtyIn: diff > 0 ? diff : 0,
      qtyOut: diff < 0 ? Math.abs(diff) : 0,
      balanceAfter: newStock,
      loggedBy: loggedBy || 'Inventory Auditor',
      notes: reason || 'Physical Stock Audit Verification'
    });

    res.json({ success: true, data: inv });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 08. MATERIAL ISSUE TO PRODUCTION
// --------------------------------------------------------------------
exports.getMaterialIssues = async (req, res) => {
  try {
    const issues = await MaterialIssue.find()
      .populate('items.material', 'materialCode materialName unit')
      .sort({ issueDate: -1, createdAt: -1 });

    res.json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMaterialIssue = async (req, res) => {
  try {
    let { issueNumber, workOrder, department, issueDate, requestedBy, issuedBy, items, remarks } = req.body;

    if (!issueNumber) {
      const year = new Date().getFullYear();
      const count = await MaterialIssue.countDocuments();
      issueNumber = `MI-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Issue must contain at least one material' });
    }

    // 1. Validate Stock availability for every single line item
    for (const item of items) {
      const inv = await Inventory.findOne({ material: item.material }).populate('material', 'materialName materialCode');
      const issueQty = Number(item.issueQuantity !== undefined ? item.issueQuantity : (item.issuedQuantity !== undefined ? item.issuedQuantity : 1));
      if (!inv || inv.availableStock < issueQty) {
        const available = inv ? inv.availableStock : 0;
        const name = inv?.material?.materialName || 'Selected Material';
        return res.status(400).json({
          success: false,
          message: `Cannot issue ${issueQty} for '${name}'. Current available stock is only ${available}!`
        });
      }
    }

    // 2. Perform Stock Deductions & Ledger writes
    const processedItems = [];
    for (const item of items) {
      const inv = await Inventory.findOne({ material: item.material });
      const issueQty = Number(item.issueQuantity !== undefined ? item.issueQuantity : (item.issuedQuantity !== undefined ? item.issuedQuantity : 1));
      const stockBefore = inv.availableStock;

      inv.availableStock = stockBefore - issueQty;
      inv.totalIssued = (inv.totalIssued || 0) + issueQty;
      inv.status = calculateInventoryStatus(inv.availableStock, inv.minimumStock);
      inv.lastUpdated = Date.now();
      await inv.save();

      // Log in Stock Ledger
      await StockLedger.create({
        material: item.material,
        date: issueDate || Date.now(),
        transactionType: 'Production Issue',
        referenceDoc: issueNumber.toUpperCase(),
        qtyIn: 0,
        qtyOut: issueQty,
        balanceAfter: inv.availableStock,
        loggedBy: issuedBy || 'Store Manager',
        notes: `Issued to Work Order ${workOrder} (${department})`
      });

      processedItems.push({
        material: item.material,
        availableStockAtTime: stockBefore,
        requiredQuantity: Number(item.requiredQuantity) || issueQty,
        issueQuantity: issueQty,
        unit: item.unit,
        batchNumber: item.batchNumber || 'DEFAULT'
      });
    }

    const validDepts = ['Fabrication', 'Machining', 'Assembly', 'Finishing', 'Packaging', 'R&D'];
    let safeDept = 'Assembly';
    if (department) {
      if (validDepts.includes(department)) safeDept = department;
      else if (/fab/i.test(department)) safeDept = 'Fabrication';
      else if (/mach/i.test(department)) safeDept = 'Machining';
      else if (/finish/i.test(department)) safeDept = 'Finishing';
      else if (/pack/i.test(department)) safeDept = 'Packaging';
      else if (/r&d|research/i.test(department)) safeDept = 'R&D';
      else safeDept = 'Assembly';
    }

    // 3. Create Issue Record
    const materialIssue = await MaterialIssue.create({
      issueNumber: issueNumber.toUpperCase(),
      workOrder: String(workOrder || 'WO-001').toUpperCase(),
      department: safeDept,
      issueDate: issueDate || Date.now(),
      requestedBy: requestedBy || 'Production Supervisor',
      issuedBy: issuedBy || 'Store Officer',
      items: processedItems,
      remarks,
      status: 'Issued'
    });

    const populated = await MaterialIssue.findById(materialIssue._id)
      .populate('items.material', 'materialCode materialName unit');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 09. RETURNS TO SUPPLIER
// --------------------------------------------------------------------
exports.getSupplierReturns = async (req, res) => {
  try {
    const returns = await SupplierReturn.find()
      .populate('supplier', 'supplierCode supplierName')
      .populate('grn', 'grnNumber invoiceNumber')
      .populate('qcReference', 'qcNumber testDate overallResult')
      .populate('material', 'materialCode materialName unit')
      .sort({ returnDate: -1 });

    res.json({ success: true, count: returns.length, data: returns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSupplierReturn = async (req, res) => {
  try {
    let {
      returnNumber,
      supplier,
      grn,
      qcReference,
      material,
      returnQuantity,
      returnDate,
      reason,
      debitNoteNumber,
      vehicleNumber,
      remarks
    } = req.body;

    if (!returnNumber) {
      const year = new Date().getFullYear();
      const count = await SupplierReturn.countDocuments();
      returnNumber = `RT-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    const qc = await QCTest.findById(qcReference);
    if (!qc) return res.status(404).json({ success: false, message: 'QC Reference not found' });

    const returnQty = Number(returnQuantity);
    const availableRejected = qc.availableRejectedQuantity || 0;

    if (returnQty > availableRejected) {
      return res.status(400).json({
        success: false,
        message: `Cannot return ${returnQty}. Available rejected quantity in this QC test is only ${availableRejected}`
      });
    }

    // Deduct from available rejected quantity
    qc.availableRejectedQuantity = availableRejected - returnQty;
    await qc.save();

    // Create Return Record
    const supplierReturn = await SupplierReturn.create({
      returnNumber: returnNumber.toUpperCase(),
      supplier: supplier || qc.supplier,
      grn: grn || qc.grn,
      qcReference,
      material: material || qc.material,
      rejectedQuantityAvailable: availableRejected,
      returnQuantity: returnQty,
      returnDate: returnDate || Date.now(),
      reason,
      debitNoteNumber: debitNoteNumber || `DN-${Date.now().toString().slice(-6)}`,
      vehicleNumber,
      remarks,
      status: 'Returned'
    });

    const populated = await SupplierReturn.findById(supplierReturn._id)
      .populate('supplier', 'supplierCode supplierName')
      .populate('material', 'materialCode materialName unit')
      .populate('qcReference', 'qcNumber');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 10. INVENTORY REPORT & ANALYTICS
// --------------------------------------------------------------------
exports.getInventoryReport = async (req, res) => {
  try {
    // 1. KPI Counts
    const totalMaterials = await Material.countDocuments({ status: 'Active' });
    const totalSuppliers = await Supplier.countDocuments({ status: 'Active' });
    const pendingQC = await GRN.countDocuments({ status: 'QC Pending' });
    const pendingPOs = await PurchaseOrder.countDocuments({ status: { $in: ['Pending', 'Approved', 'Partially Received'] } });

    // 2. Inventories & Stock Valuation
    const inventories = await Inventory.find().populate('material').lean();
    
    // Fetch average unit price from links for stock valuation
    const links = await SupplierMaterialLink.find({ status: 'Active' }).lean();
    const priceMap = {};
    links.forEach(l => {
      priceMap[l.material.toString()] = l.unitPrice;
    });

    let totalStockValue = 0;
    let lowStockCount = 0;
    const reportRows = inventories
      .filter(inv => inv.material != null)
      .map(inv => {
        const unitPrice = priceMap[inv.material._id.toString()] || 0;
        const stockVal = inv.availableStock * unitPrice;
        totalStockValue += stockVal;

        if (inv.availableStock <= inv.minimumStock) {
          lowStockCount++;
        }

        return {
          materialId: inv.material._id,
          materialCode: inv.material.materialCode,
          materialName: inv.material.materialName,
          category: inv.material.category,
          unit: inv.material.unit,
          unitPrice,
          openingStock: inv.openingStock || 0,
          totalReceived: inv.totalReceived || 0,
          totalIssued: inv.totalIssued || 0,
          totalReturned: inv.totalReturned || 0,
          availableStock: inv.availableStock,
          minimumStock: inv.minimumStock,
          stockValue: Math.round(stockVal * 100) / 100,
          status: inv.status
        };
      });

    res.json({
      success: true,
      kpis: {
        totalMaterials,
        totalSuppliers,
        totalStockValue: Math.round(totalStockValue),
        lowStockCount,
        pendingQC,
        pendingPOs
      },
      reports: reportRows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

