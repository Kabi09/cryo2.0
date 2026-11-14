const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Enquiry = require('../models/Enquiry');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const Quotation = require('../models/Quotation');
const ProformaInvoice = require('../models/ProformaInvoice');
const CustomerPO = require('../models/CustomerPO');
const Payment = require('../models/Payment');
const SalesOrder = require('../models/SalesOrder');

// --------------------------------------------------------------------
// PRODUCTS MASTER
// --------------------------------------------------------------------
exports.getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const products = await Product.find(filter).sort({ productCode: 1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 01. DASHBOARD
// --------------------------------------------------------------------
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalEnquiries = await Enquiry.countDocuments();
    const pendingQuotes = await Quotation.countDocuments({ status: { $in: ['Sent', 'Under Review', 'Negotiation'] } });
    
    // Today's Follow-ups
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const todaysFollowUps = await FollowUp.countDocuments({
      status: 'Pending',
      nextFollowUpDate: { $gte: startOfToday, $lte: endOfToday }
    });

    const activeSalesOrders = await SalesOrder.countDocuments({ status: { $in: ['Draft', 'Confirmed', 'In Production'] } });
    const wonDeals = await Lead.countDocuments({ leadStatus: 'Won' });
    const lostDeals = await Lead.countDocuments({ leadStatus: 'Lost' });

    // Recent 5 Enquiries
    const recentEnquiries = await Enquiry.find()
      .populate('product', 'productName productCode')
      .populate('customer', 'companyName contactPerson')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming Follow-ups (Next 5)
    const upcomingFollowUps = await FollowUp.find({ status: 'Pending' })
      .populate('customer', 'companyName contactPerson mobileNumber')
      .populate('relatedLead', 'leadNumber interestedProduct')
      .sort({ nextFollowUpDate: 1 })
      .limit(5);

    // Total sales order value
    const salesOrders = await SalesOrder.find({ status: { $ne: 'Cancelled' } });
    const totalOrderValue = salesOrders.reduce((sum, so) => sum + (so.orderAmount || 0), 0);

    // Pending payments
    const pis = await ProformaInvoice.find({ status: { $ne: 'Cancelled' } });
    const pendingPayments = pis.reduce((sum, pi) => sum + (pi.balanceAmount || 0), 0);

    res.json({
      success: true,
      kpis: {
        totalEnquiries,
        pendingQuotes,
        todaysFollowUps,
        activeSalesOrders,
        wonDeals,
        lostDeals,
        totalOrderValue,
        pendingPayments
      },
      recentEnquiries,
      upcomingFollowUps
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 02. CUSTOMER ENQUIRIES
// --------------------------------------------------------------------
exports.getEnquiries = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { enquiryNumber: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }

    const enquiries = await Enquiry.find(query)
      .populate('product', 'productName productCode unit standardPrice')
      .populate('customer', 'customerCode companyName contactPerson')
      .sort({ enquiryDate: -1, createdAt: -1 });

    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEnquiry = async (req, res) => {
  try {
    let {
      enquiryNumber,
      customerType,
      customer,
      companyName,
      contactPerson,
      mobileNumber,
      email,
      address,
      productName,
      productDescription,
      targetPrice,
      product,
      quantity,
      unit,
      requiredDeliveryDate,
      additionalRequirements,
      enquirySource,
      assignedSalesPerson,
      remarks,
      convertToLead,
      initialFollowUp
    } = req.body;

    if (!enquiryNumber) {
      const count = await Enquiry.countDocuments();
      enquiryNumber = `ENQ-${String(count + 1).padStart(3, '0')}`;
    }

    // Reuse existing customer or create one without duplicating
    let targetCustomer = null;
    if (customer) {
      targetCustomer = await Customer.findById(customer);
    } else if (companyName) {
      targetCustomer = await Customer.findOne({ companyName: { $regex: new RegExp(`^${companyName.trim()}$`, 'i') } });
      if (!targetCustomer) {
        const custCount = await Customer.countDocuments();
        targetCustomer = await Customer.create({
          customerCode: `CUS-${String(custCount + 1).padStart(3, '0')}`,
          companyName: companyName.trim(),
          contactPerson: contactPerson || 'Purchasing Lead',
          mobileNumber: mobileNumber || '0000000000',
          email: email || '',
          billingAddress: address || '',
          shippingAddress: address || '',
          city: 'Chennai',
          state: 'Tamil Nadu'
        });
      }
    }

    const resolvedProductName = (productName && productName.trim()) ? productName.trim() : 'Custom Cryo Equipment';

    const enquiry = await Enquiry.create({
      enquiryNumber: enquiryNumber.toUpperCase(),
      customerType: customerType || 'New',
      customer: targetCustomer ? targetCustomer._id : null,
      companyName: companyName || targetCustomer?.companyName,
      contactPerson: contactPerson || targetCustomer?.contactPerson,
      mobileNumber: mobileNumber || targetCustomer?.mobileNumber,
      email: email || targetCustomer?.email,
      address,
      productName: resolvedProductName,
      productDescription: productDescription || additionalRequirements || '',
      product: product || null,
      targetPrice: Number(targetPrice) || 0,
      quantity: Number(quantity) || 1,
      unit: unit || 'Nos',
      requiredDeliveryDate: requiredDeliveryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      additionalRequirements,
      enquirySource: enquirySource || 'Website',
      assignedSalesPerson: assignedSalesPerson || 'Sales Executive',
      remarks,
      status: convertToLead ? 'Converted to Lead' : 'New'
    });

    // Optional initial follow-up logged directly on creation
    if (initialFollowUp && initialFollowUp.notes && targetCustomer) {
      const fuCount = await FollowUp.countDocuments();
      await FollowUp.create({
        followUpNumber: `FU-${String(fuCount + 1).padStart(3, '0')}`,
        customer: targetCustomer._id,
        enquiryReference: enquiry._id,
        contactDate: Date.now(),
        contactMethod: initialFollowUp.contactMethod || 'Call',
        discussionNotes: initialFollowUp.notes,
        customerResponse: initialFollowUp.response || 'Interested',
        nextFollowUpDate: initialFollowUp.nextDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        nextAction: 'Follow-up on Requirement Specs',
        assignedEmployee: assignedSalesPerson || 'Sales Executive',
        status: 'Pending'
      });
    }

    // If convertToLead was requested at creation time
    if (convertToLead && targetCustomer) {
      const leadCount = await Lead.countDocuments();
      const prd = product ? await Product.findById(product) : null;
      const expectedVal = Number(targetPrice) && Number(targetPrice) > 0
        ? Number(targetPrice) * (Number(quantity) || 1)
        : (prd ? prd.standardPrice * (Number(quantity) || 1) : 100000);

      await Lead.create({
        leadNumber: `LD-${String(leadCount + 1).padStart(3, '0')}`,
        customer: targetCustomer._id,
        enquiryReference: enquiry._id,
        productName: resolvedProductName,
        interestedProduct: product || null,
        expectedQuantity: Number(quantity) || 1,
        expectedOrderValue: expectedVal,
        expectedClosingDate: requiredDeliveryDate || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        leadOwner: assignedSalesPerson || 'Sales Executive',
        leadStatus: 'Qualified',
        notes: `Converted from ${enquiry.enquiryNumber}. ${additionalRequirements || ''}`
      });
    }

    const populated = await Enquiry.findById(enquiry._id)
      .populate('product', 'productName productCode unit')
      .populate('customer', 'customerCode companyName');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.convertEnquiryToLead = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    let customer = enquiry.customer;
    if (!customer) {
      const custCount = await Customer.countDocuments();
      const newCust = await Customer.create({
        customerCode: `CUS-${String(custCount + 1).padStart(3, '0')}`,
        companyName: enquiry.companyName,
        contactPerson: enquiry.contactPerson,
        mobileNumber: enquiry.mobileNumber,
        email: enquiry.email,
        billingAddress: enquiry.address
      });
      customer = newCust._id;
      enquiry.customer = customer;
    }

    const leadCount = await Lead.countDocuments();
    const prd = enquiry.product ? await Product.findById(enquiry.product) : null;
    const expectedVal = enquiry.targetPrice && enquiry.targetPrice > 0
      ? enquiry.targetPrice * (enquiry.quantity || 1)
      : (prd ? prd.standardPrice * (enquiry.quantity || 1) : 100000);

    const lead = await Lead.create({
      leadNumber: `LD-${String(leadCount + 1).padStart(3, '0')}`,
      customer,
      enquiryReference: enquiry._id,
      productName: enquiry.productName || 'Custom Equipment Requirement',
      interestedProduct: enquiry.product || null,
      expectedQuantity: enquiry.quantity || 1,
      expectedOrderValue: expectedVal,
      expectedClosingDate: enquiry.requiredDeliveryDate || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      leadOwner: enquiry.assignedSalesPerson || 'Sales Executive',
      leadStatus: 'Qualified',
      notes: `Converted from ${enquiry.enquiryNumber}. ${enquiry.additionalRequirements || ''}`
    });

    enquiry.status = 'Qualified';
    await enquiry.save();

    res.json({ success: true, message: 'Enquiry successfully converted to Qualified Lead', data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status, lostReason } = req.body;
    const update = { status };
    if (lostReason !== undefined) update.lostReason = lostReason;
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, data: enquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 03. CUSTOMERS & LEADS
// --------------------------------------------------------------------
exports.getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { customerCode: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const customers = await Customer.find(query).sort({ companyName: 1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    let { customerCode, companyName, contactPerson, mobileNumber, email, gstNumber, billingAddress, shippingAddress, city, state, pincode, customerType, paymentTerms, notes } = req.body;
    
    if (!customerCode) {
      const count = await Customer.countDocuments();
      customerCode = `CUS-${String(count + 1).padStart(3, '0')}`;
    }

    const customer = await Customer.create({
      customerCode: customerCode.toUpperCase(),
      companyName,
      contactPerson,
      mobileNumber,
      email,
      gstNumber,
      billingAddress,
      shippingAddress: shippingAddress || billingAddress,
      city: city || 'Chennai',
      state: state || 'Tamil Nadu',
      pincode,
      customerType: customerType || 'Company',
      paymentTerms: paymentTerms || 'Net 30 Days',
      notes
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'All') query.leadStatus = status;

    const leads = await Lead.find(query)
      .populate('customer', 'customerCode companyName contactPerson mobileNumber email city')
      .populate('interestedProduct', 'productName productCode unit standardPrice')
      .populate('enquiryReference', 'enquiryNumber enquirySource')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    let { leadNumber, customer, interestedProduct, expectedQuantity, expectedOrderValue, expectedClosingDate, leadOwner, leadStatus, notes } = req.body;
    
    if (!leadNumber) {
      const count = await Lead.countDocuments();
      leadNumber = `LD-${String(count + 1).padStart(3, '0')}`;
    }

    const lead = await Lead.create({
      leadNumber: leadNumber.toUpperCase(),
      customer,
      interestedProduct,
      expectedQuantity: Number(expectedQuantity) || 1,
      expectedOrderValue: Number(expectedOrderValue) || 0,
      expectedClosingDate: expectedClosingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      leadOwner: leadOwner || 'Sales Representative',
      leadStatus: leadStatus || 'New',
      notes
    });

    const populated = await Lead.findById(lead._id)
      .populate('customer', 'customerCode companyName contactPerson')
      .populate('interestedProduct', 'productName productCode');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { leadStatus } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { leadStatus }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 04. FOLLOW-UPS
// --------------------------------------------------------------------
exports.getFollowUps = async (req, res) => {
  try {
    const { status, enquiryId, quotationId } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (enquiryId) query.enquiryReference = enquiryId;
    if (quotationId) {
      query.$or = [{ relatedQuotation: quotationId }, { quotationReference: quotationId }];
    }

    const followUps = await FollowUp.find(query)
      .populate('customer', 'customerCode companyName contactPerson mobileNumber email')
      .populate('enquiryReference', 'enquiryNumber companyName productName contactPerson')
      .populate('relatedLead', 'leadNumber productName interestedProduct')
      .populate('relatedQuotation', 'quotationNumber version grandTotal')
      .populate('quotationReference', 'quotationNumber version grandTotal')
      .sort({ nextFollowUpDate: 1, contactDate: -1 });

    res.json({ success: true, count: followUps.length, data: followUps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFollowUp = async (req, res) => {
  try {
    let {
      followUpNumber,
      customer,
      companyName,
      enquiryReference,
      relatedLead,
      relatedQuotation,
      contactDate,
      contactMethod,
      contactType,
      discussionNotes,
      customerResponse,
      responseStatus,
      nextFollowUpDate,
      nextAction,
      assignedEmployee,
      status
    } = req.body;

    // Normalize field names
    contactMethod = contactMethod || contactType || 'Call';
    customerResponse = customerResponse || responseStatus || 'Interested';
    status = status || 'Pending';

    // Normalize quotation and lead references
    relatedQuotation = relatedQuotation || req.body.quotationReference || null;
    const quotationReference = req.body.quotationReference || relatedQuotation || null;
    relatedLead = relatedLead || req.body.leadReference || null;

    // If customer is an object ({ _id }), extract string ID
    if (customer && typeof customer === 'object' && customer._id) {
      customer = customer._id;
    }

    // If customer ID is missing but enquiryReference is present, resolve customer
    if (!customer && enquiryReference) {
      const enq = await Enquiry.findById(enquiryReference);
      if (enq) {
        companyName = companyName || enq.companyName;
        if (enq.customer) {
          customer = enq.customer;
        } else if (enq.companyName) {
          // Find or create customer
          let existingCust = await Customer.findOne({ companyName: enq.companyName });
          if (!existingCust) {
            const count = await Customer.countDocuments();
            existingCust = await Customer.create({
              customerCode: `CUS-${String(count + 1).padStart(3, '0')}`,
              companyName: enq.companyName,
              contactPerson: enq.contactPerson || 'Procurement Contact',
              mobileNumber: enq.mobileNumber || '9999999999',
              email: enq.email || '',
              billingAddress: enq.address || ''
            });
            enq.customer = existingCust._id;
            await enq.save();
          }
          if (existingCust) customer = existingCust._id;
        }
      }
    }

    // If customer ID is missing but quotation is present, resolve customer
    if (!customer && relatedQuotation) {
      const q = await Quotation.findById(relatedQuotation);
      if (q && q.customer) {
        customer = q.customer;
      }
    }

    if (!followUpNumber) {
      const count = await FollowUp.countDocuments();
      followUpNumber = `FU-${String(count + 1).padStart(3, '0')}`;
    }

    const followUp = await FollowUp.create({
      followUpNumber: followUpNumber.toUpperCase(),
      customer: customer || null,
      companyName: companyName || '',
      enquiryReference: enquiryReference || null,
      relatedLead: relatedLead || null,
      relatedQuotation: relatedQuotation || null,
      quotationReference: quotationReference || null,
      contactDate: contactDate || Date.now(),
      contactMethod,
      discussionNotes,
      customerResponse,
      nextFollowUpDate,
      nextAction: nextAction || 'Follow-up Call',
      assignedEmployee: assignedEmployee || 'Sales Representative',
      status
    });

    const populated = await FollowUp.findById(followUp._id)
      .populate('customer', 'customerCode companyName contactPerson mobileNumber')
      .populate('enquiryReference', 'enquiryNumber productName')
      .populate('relatedLead', 'leadNumber productName')
      .populate('relatedQuotation', 'quotationNumber version grandTotal')
      .populate('quotationReference', 'quotationNumber version grandTotal');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateFollowUpStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!followUp) return res.status(404).json({ success: false, message: 'Follow-up not found' });
    res.json({ success: true, data: followUp });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 05. QUOTATIONS (WITH V1, V2, V3 REVISIONS)
// --------------------------------------------------------------------
exports.getQuotations = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;

    const quotations = await Quotation.find(query)
      .populate('customer', 'customerCode companyName contactPerson mobileNumber email gstNumber')
      .populate('items.product', 'productName productCode unit standardPrice')
      .populate('leadReference', 'leadNumber')
      .sort({ quotationDate: -1, createdAt: -1 });

    res.json({ success: true, count: quotations.length, data: quotations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createQuotation = async (req, res) => {
  try {
    let {
      quotationNumber,
      version,
      quotationDate,
      customer,
      leadReference,
      validUntil,
      items,
      deliveryTerms,
      paymentTerms,
      warranty,
      notes,
      status
    } = req.body;

    if (!quotationNumber) {
      const count = await Quotation.distinct('quotationNumber');
      quotationNumber = `QT-${String(count.length + 1).padStart(3, '0')}`;
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Quotation must have at least one product line item' });
    }

    let subtotal = 0;
    let discountTotal = 0;
    let gstTotal = 0;

    const computedItems = items.map(item => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const disc = Number(item.discount) || 0;
      const taxRate = Number(item.gstPercent) || 18;

      const base = qty * price;
      const discountedBase = Math.max(0, base - disc);
      const tax = (discountedBase * taxRate) / 100;
      const lineTotal = discountedBase + tax;

      subtotal += base;
      discountTotal += disc;
      gstTotal += tax;

      return {
        product: item.product || null,
        productName: item.productName || item.description || '',
        description: item.description || '',
        quantity: qty,
        unit: item.unit || 'Nos',
        unitPrice: price,
        discount: disc,
        gstPercent: taxRate,
        amount: Math.round(lineTotal * 100) / 100
      };
    });

    const grandTotal = Math.round((subtotal - discountTotal + gstTotal) * 100) / 100;

    const quote = await Quotation.create({
      quotationNumber: quotationNumber.toUpperCase(),
      version: version || 'V1',
      quotationDate: quotationDate || Date.now(),
      customer,
      leadReference: leadReference || null,
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: computedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      gstTotal: Math.round(gstTotal * 100) / 100,
      grandTotal,
      deliveryTerms,
      paymentTerms,
      warranty,
      notes,
      status: status || 'Sent'
    });

    const populated = await Quotation.findById(quote._id)
      .populate('customer', 'customerCode companyName contactPerson')
      .populate('items.product', 'productName productCode unit');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.reviseQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const parentQuote = await Quotation.findById(id);
    if (!parentQuote) return res.status(404).json({ success: false, message: 'Original quotation not found' });

    // Determine next version (e.g. V1 -> V2, V2 -> V3)
    const existingVersions = await Quotation.find({ quotationNumber: parentQuote.quotationNumber });
    const nextVerNumber = existingVersions.length + 1;
    const newVersionTag = `V${nextVerNumber}`;

    // Mark previous quotation as Negotiation
    parentQuote.status = 'Negotiation';
    await parentQuote.save();

    // Use revised items or inherit from parent
    const itemsToUse = req.body.items || parentQuote.items;
    let subtotal = 0;
    let discountTotal = 0;
    let gstTotal = 0;

    const computedItems = itemsToUse.map(item => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const disc = Number(item.discount) || 0;
      const taxRate = Number(item.gstPercent) || 18;

      const base = qty * price;
      const discountedBase = Math.max(0, base - disc);
      const tax = (discountedBase * taxRate) / 100;
      const lineTotal = discountedBase + tax;

      subtotal += base;
      discountTotal += disc;
      gstTotal += tax;

      return {
        product: item.product || null,
        productName: item.productName || item.description || '',
        description: item.description || '',
        quantity: qty,
        unit: item.unit || 'Nos',
        unitPrice: price,
        discount: disc,
        gstPercent: taxRate,
        amount: Math.round(lineTotal * 100) / 100
      };
    });

    const grandTotal = Math.round((subtotal - discountTotal + gstTotal) * 100) / 100;

    const revisedQuote = await Quotation.create({
      quotationNumber: parentQuote.quotationNumber,
      version: newVersionTag,
      quotationDate: new Date(),
      customer: parentQuote.customer,
      leadReference: parentQuote.leadReference,
      validUntil: req.body.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: computedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      gstTotal: Math.round(gstTotal * 100) / 100,
      grandTotal,
      deliveryTerms: req.body.deliveryTerms || parentQuote.deliveryTerms,
      paymentTerms: req.body.paymentTerms || parentQuote.paymentTerms,
      warranty: req.body.warranty || parentQuote.warranty,
      notes: req.body.notes || `Revised negotiation proposal (${newVersionTag})`,
      status: 'Sent'
    });

    const populated = await Quotation.findById(revisedQuote._id)
      .populate('customer', 'customerCode companyName')
      .populate('items.product', 'productName productCode');

    res.status(201).json({ success: true, message: `Quotation revised to ${newVersionTag}`, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quote = await Quotation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });

    // CRITICAL BUSINESS RULE:
    // Customer accepts -> Mark Lead as Won!
    // Customer rejects -> Mark Lead as Lost!
    if (quote.leadReference) {
      if (status === 'Accepted') {
        await Lead.findByIdAndUpdate(quote.leadReference, { leadStatus: 'Won' });
      } else if (status === 'Rejected') {
        await Lead.findByIdAndUpdate(quote.leadReference, { leadStatus: 'Lost' });
      }
    }

    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 06. PROFORMA INVOICES (PI)
// --------------------------------------------------------------------
exports.getProformaInvoices = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;

    const pis = await ProformaInvoice.find(query)
      .populate('customer', 'customerCode companyName contactPerson mobileNumber email gstNumber')
      .populate('quotation', 'quotationNumber version grandTotal items')
      .populate('items.product', 'productName productCode unit')
      .sort({ piDate: -1, createdAt: -1 });

    res.json({ success: true, count: pis.length, data: pis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProformaInvoice = async (req, res) => {
  try {
    let {
      piNumber,
      customer,
      quotation,
      piDate,
      advancePercentage,
      bankDetails,
      paymentTerms,
      deliveryTerms,
      validity,
      status
    } = req.body;

    if (!piNumber) {
      const count = await ProformaInvoice.countDocuments();
      piNumber = `PI-${String(count + 1).padStart(3, '0')}`;
    }

    const quote = await Quotation.findById(quotation);
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });

    const grandTotal = quote.grandTotal;
    const advPercent = Number(advancePercentage) || 50;
    const advanceAmount = Math.round((grandTotal * advPercent) / 100);
    const balanceAmount = grandTotal - advanceAmount;

    const pi = await ProformaInvoice.create({
      piNumber: piNumber.toUpperCase(),
      customer: customer || quote.customer,
      quotation,
      piDate: piDate || Date.now(),
      items: quote.items,
      grandTotal,
      advancePercentage: advPercent,
      advanceAmount,
      balanceAmount,
      totalReceived: 0,
      bankDetails,
      paymentTerms: paymentTerms || quote.paymentTerms,
      deliveryTerms: deliveryTerms || quote.deliveryTerms,
      validity,
      status: status || 'Sent'
    });

    const populated = await ProformaInvoice.findById(pi._id)
      .populate('customer', 'customerCode companyName contactPerson')
      .populate('quotation', 'quotationNumber version');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 07. CUSTOMER PURCHASE ORDERS
// --------------------------------------------------------------------
exports.getCustomerPOs = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;

    const pos = await CustomerPO.find(query)
      .populate('customer', 'customerCode companyName contactPerson mobileNumber')
      .populate('piReference', 'piNumber grandTotal advanceAmount balanceAmount')
      .populate('quotationReference', 'quotationNumber version')
      .sort({ receivedDate: -1, createdAt: -1 });

    res.json({ success: true, count: pos.length, data: pos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCustomerPO = async (req, res) => {
  try {
    let {
      internalPOId,
      customerPONumber,
      customer,
      piReference,
      quotationReference,
      customerPODate,
      receivedDate,
      poAmount,
      deliveryDate,
      paymentTerms,
      poDocument,
      remarks,
      status
    } = req.body;

    if (!internalPOId) {
      const count = await CustomerPO.countDocuments();
      internalPOId = `CPO-${String(count + 1).padStart(3, '0')}`;
    }

    const cpo = await CustomerPO.create({
      internalPOId: internalPOId.toUpperCase(),
      customerPONumber,
      customer,
      piReference: piReference || null,
      quotationReference: quotationReference || null,
      customerPODate: customerPODate || Date.now(),
      receivedDate: receivedDate || Date.now(),
      poAmount: Number(poAmount),
      deliveryDate,
      paymentTerms,
      poDocument: poDocument || 'Customer_Signed_PO.pdf',
      remarks,
      status: status || 'Received'
    });

    const populated = await CustomerPO.findById(cpo._id)
      .populate('customer', 'customerCode companyName')
      .populate('piReference', 'piNumber grandTotal');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyCustomerPO = async (req, res) => {
  try {
    const { verifiedBy, status } = req.body;
    const cpo = await CustomerPO.findByIdAndUpdate(
      req.params.id,
      {
        status: status || 'Verified',
        verifiedBy: verifiedBy || 'Commercial Sales Auditor',
        verifiedDate: new Date()
      },
      { new: true }
    );
    if (!cpo) return res.status(404).json({ success: false, message: 'Customer PO not found' });
    res.json({ success: true, message: 'Customer PO successfully verified', data: cpo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 08. PAYMENTS
// --------------------------------------------------------------------
exports.getPayments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;

    const payments = await Payment.find(query)
      .populate('customer', 'customerCode companyName contactPerson')
      .populate('piReference', 'piNumber grandTotal advanceAmount balanceAmount totalReceived')
      .populate('salesOrderReference', 'soNumber')
      .sort({ paymentDate: -1, createdAt: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    let {
      paymentNumber,
      customer,
      piReference,
      salesOrderReference,
      paymentDate,
      paymentType,
      amountReceived,
      paymentMethod,
      transactionReference,
      paymentProof,
      remarks
    } = req.body;

    if (!paymentNumber) {
      const count = await Payment.countDocuments();
      paymentNumber = `PAY-${String(count + 1).padStart(3, '0')}`;
    }

    const pi = await ProformaInvoice.findById(piReference);
    if (!pi) return res.status(404).json({ success: false, message: 'Proforma Invoice reference not found' });

    const payment = await Payment.create({
      paymentNumber: paymentNumber.toUpperCase(),
      customer: customer || pi.customer,
      piReference,
      salesOrderReference: salesOrderReference || null,
      paymentDate: paymentDate || Date.now(),
      paymentType: paymentType || 'Advance',
      amountReceived: Number(amountReceived),
      paymentMethod: paymentMethod || 'Bank Transfer',
      transactionReference,
      paymentProof: paymentProof || 'Bank_Transfer_Slip.pdf',
      remarks,
      status: 'Received'
    });

    // Automatically update PI amounts
    const receivedAmt = Number(amountReceived);
    pi.totalReceived = (pi.totalReceived || 0) + receivedAmt;
    pi.balanceAmount = Math.max(0, pi.grandTotal - pi.totalReceived);
    if (pi.balanceAmount === 0) {
      pi.status = 'Paid';
    } else {
      pi.status = 'Partially Paid';
    }
    await pi.save();

    const populated = await Payment.findById(payment._id)
      .populate('customer', 'customerCode companyName')
      .populate('piReference', 'piNumber grandTotal');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { verifiedBy } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Verified',
        verifiedBy: verifiedBy || 'Accounts Officer',
        verifiedDate: new Date()
      },
      { new: true }
    );
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
    res.json({ success: true, message: 'Payment verified and posted to commercial ledger', data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 09. SALES ORDERS (SO)
// --------------------------------------------------------------------
exports.getSalesOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;

    const orders = await SalesOrder.find(query)
      .populate('customer', 'customerCode companyName contactPerson mobileNumber billingAddress shippingAddress')
      .populate('customerPOReference', 'customerPONumber customerPODate poAmount')
      .populate('quotationReference', 'quotationNumber version')
      .populate('piReference', 'piNumber advanceAmount totalReceived')
      .populate('items.product', 'productName productCode unit')
      .sort({ soDate: -1, createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSalesOrder = async (req, res) => {
  try {
    let {
      soNumber,
      soDate,
      customer,
      customerPOReference,
      quotationReference,
      piReference,
      expectedDeliveryDate,
      items,
      orderAmount,
      advanceReceived,
      balanceAmount,
      paymentTerms,
      shippingAddress,
      deliveryInstructions,
      productionRemarks,
      status
    } = req.body;

    if (!soNumber) {
      const count = await SalesOrder.countDocuments();
      soNumber = `SO-${String(count + 1).padStart(3, '0')}`;
    }

    const order = await SalesOrder.create({
      soNumber: soNumber.toUpperCase(),
      soDate: soDate || Date.now(),
      customer,
      customerPOReference: customerPOReference || null,
      quotationReference: quotationReference || null,
      piReference: piReference || null,
      expectedDeliveryDate,
      items: items || [],
      orderAmount: Number(orderAmount),
      advanceReceived: Number(advanceReceived) || 0,
      balanceAmount: Number(balanceAmount) || 0,
      paymentTerms,
      shippingAddress,
      deliveryInstructions,
      productionRemarks,
      productionStatus: 'Not Started',
      status: status || 'Confirmed'
    });

    const populated = await SalesOrder.findById(order._id)
      .populate('customer', 'customerCode companyName')
      .populate('items.product', 'productName productCode unit');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.sendSOToProduction = async (req, res) => {
  try {
    const { productionRemarks } = req.body;
    const order = await SalesOrder.findByIdAndUpdate(
      req.params.id,
      {
        productionStatus: 'Sent to Production',
        status: 'In Production',
        productionRemarks: productionRemarks || 'Work Order dispatched to shopfloor engineering.'
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Sales Order not found' });
    res.json({ success: true, message: 'Sales Order dispatched to Production department', data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------
// 10. SALES REPORTS & ANALYTICS
// --------------------------------------------------------------------
exports.getSalesReports = async (req, res) => {
  try {
    // 1. KPI Counts
    const totalEnquiries = await Enquiry.countDocuments();
    const totalQuotations = await Quotation.countDocuments();
    const wonDeals = await Lead.countDocuments({ leadStatus: 'Won' });
    const lostDeals = await Lead.countDocuments({ leadStatus: 'Lost' });
    const totalSalesOrders = await SalesOrder.countDocuments();

    const orders = await SalesOrder.find({ status: { $ne: 'Cancelled' } });
    const totalOrderValue = orders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);

    const pis = await ProformaInvoice.find({ status: { $ne: 'Cancelled' } });
    const pendingPayments = pis.reduce((sum, p) => sum + (p.balanceAmount || 0), 0);

    // 2. Tabular Reports
    const enquiriesReport = await Enquiry.find()
      .populate('product', 'productName productCode')
      .populate('customer', 'companyName')
      .sort({ enquiryDate: -1 });

    const leadsReport = await Lead.find()
      .populate('customer', 'companyName contactPerson city')
      .populate('interestedProduct', 'productName')
      .sort({ createdAt: -1 });

    const quotationsReport = await Quotation.find()
      .populate('customer', 'companyName')
      .populate('items.product', 'productName')
      .sort({ quotationDate: -1 });

    const salesOrdersReport = await SalesOrder.find()
      .populate('customer', 'companyName')
      .populate('items.product', 'productName')
      .sort({ soDate: -1 });

    const customersReport = await Customer.find().sort({ companyName: 1 });

    const paymentsReport = await Payment.find()
      .populate('customer', 'companyName')
      .populate('piReference', 'piNumber grandTotal')
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      kpis: {
        totalEnquiries,
        totalQuotations,
        wonDeals,
        lostDeals,
        totalSalesOrders,
        totalOrderValue: Math.round(totalOrderValue),
        pendingPayments: Math.round(pendingPayments)
      },
      reports: {
        enquiries: enquiriesReport,
        leads: leadsReport,
        quotations: quotationsReport,
        salesOrders: salesOrdersReport,
        customers: customersReport,
        payments: paymentsReport
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

