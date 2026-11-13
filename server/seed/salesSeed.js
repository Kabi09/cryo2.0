require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

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

const seedSalesDatabase = async () => {
  try {
    await connectDB();
    console.log('Seeding Sales Management Data...');

    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Enquiry.deleteMany({});
    await Lead.deleteMany({});
    await FollowUp.deleteMany({});
    await Quotation.deleteMany({});
    await ProformaInvoice.deleteMany({});
    await CustomerPO.deleteMany({});
    await Payment.deleteMany({});
    await SalesOrder.deleteMany({});

    console.log('1. Creating Products Master...');
    const p1 = await Product.create({
      productCode: 'PRD-MCH-A',
      productName: 'Machine A (High-Precision CNC Lathe)',
      category: 'Heavy Machinery',
      unit: 'Nos',
      standardPrice: 200000,
      description: 'Industrial heavy duty CNC turning lathe for high precision parts'
    });

    const p2 = await Product.create({
      productCode: 'PRD-MCH-B',
      productName: 'Machine B (Hydraulic Press 50 Ton)',
      category: 'Heavy Machinery',
      unit: 'Nos',
      standardPrice: 350000,
      description: '50-Ton high capacity compression hydraulic stamping press'
    });

    const p3 = await Product.create({
      productCode: 'PRD-CVY-01',
      productName: 'Conveyor Belt System 10M',
      category: 'Material Handling',
      unit: 'Nos',
      standardPrice: 75000,
      description: 'Heavy duty motorized modular slat conveyor system'
    });

    console.log('2. Creating Customers...');
    const c1 = await Customer.create({
      customerCode: 'CUS-001',
      companyName: 'ABC Industries Pvt Ltd',
      contactPerson: 'Kumar Mohan',
      mobileNumber: '9876543210',
      email: 'kumar@abcindustries.com',
      gstNumber: '33AABCA1234F1Z9',
      billingAddress: 'Plot 45, Ambattur Industrial Estate',
      shippingAddress: 'Plot 45, Ambattur Industrial Estate, Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600058',
      paymentTerms: '50% Advance, Balance Before Dispatch'
    });

    const c2 = await Customer.create({
      customerCode: 'CUS-002',
      companyName: 'XYZ Company Ltd',
      contactPerson: 'Suresh Kumar',
      mobileNumber: '9840123456',
      email: 'suresh@xyzcompany.com',
      gstNumber: '33AAACX5678B1Z2',
      billingAddress: '12 GST Road, Guindy',
      shippingAddress: '12 GST Road, Guindy, Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600032',
      paymentTerms: 'Net 30 Days'
    });

    const c3 = await Customer.create({
      customerCode: 'CUS-003',
      companyName: 'Delta Engineering Solutions',
      contactPerson: 'Priya Sundaram',
      mobileNumber: '9789012345',
      email: 'priya@deltaeng.in',
      gstNumber: '29AAACD9012E1Z5',
      billingAddress: 'Peenya Industrial Area, Phase 1',
      shippingAddress: 'Peenya Industrial Area, Phase 1, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560058',
      paymentTerms: 'Advance 100%'
    });

    console.log('3. Creating Customer Enquiries...');
    const e1 = await Enquiry.create({
      enquiryNumber: 'ENQ-001',
      enquiryDate: new Date('2026-11-10'),
      customerType: 'Existing',
      customer: c1._id,
      companyName: c1.companyName,
      contactPerson: c1.contactPerson,
      mobileNumber: c1.mobileNumber,
      email: c1.email,
      address: c1.billingAddress,
      product: p1._id,
      quantity: 10,
      unit: 'Nos',
      requiredDeliveryDate: new Date('2026-12-15'),
      additionalRequirements: 'Requires auto-feeder attachment and 415V 3-phase wiring.',
      enquirySource: 'Website',
      assignedSalesPerson: 'Kabilan (Senior Account Lead)',
      remarks: 'Urgent enquiry for new plant expansion line.',
      status: 'Converted to Lead'
    });

    const e2 = await Enquiry.create({
      enquiryNumber: 'ENQ-002',
      enquiryDate: new Date('2026-11-12'),
      customerType: 'Existing',
      customer: c2._id,
      companyName: c2.companyName,
      contactPerson: c2.contactPerson,
      mobileNumber: c2.mobileNumber,
      email: c2.email,
      address: c2.billingAddress,
      product: p2._id,
      quantity: 2,
      unit: 'Nos',
      requiredDeliveryDate: new Date('2026-12-20'),
      additionalRequirements: 'Dual safety light curtains needed.',
      enquirySource: 'Phone',
      assignedSalesPerson: 'Kabilan (Senior Account Lead)',
      remarks: 'Referred by plant consultant.',
      status: 'Converted to Lead'
    });

    const e3 = await Enquiry.create({
      enquiryNumber: 'ENQ-003',
      enquiryDate: new Date('2026-11-13'),
      customerType: 'New',
      customer: c3._id,
      companyName: c3.companyName,
      contactPerson: c3.contactPerson,
      mobileNumber: c3.mobileNumber,
      email: c3.email,
      address: c3.billingAddress,
      product: p3._id,
      quantity: 4,
      unit: 'Nos',
      requiredDeliveryDate: new Date('2026-12-05'),
      additionalRequirements: 'Variable frequency speed drives.',
      enquirySource: 'Email',
      assignedSalesPerson: 'Ravi Teja',
      remarks: 'Evaluating budget quotes.',
      status: 'New'
    });

    console.log('4. Creating Leads...');
    const l1 = await Lead.create({
      leadNumber: 'LD-001',
      customer: c1._id,
      enquiryReference: e1._id,
      interestedProduct: p1._id,
      expectedQuantity: 10,
      expectedOrderValue: 2000000,
      expectedClosingDate: new Date('2026-11-25'),
      leadOwner: 'Kabilan (Senior Account Lead)',
      leadStatus: 'Qualified',
      notes: 'Customer visited factory demo. Commercial quotation sent.'
    });

    const l2 = await Lead.create({
      leadNumber: 'LD-002',
      customer: c2._id,
      enquiryReference: e2._id,
      interestedProduct: p2._id,
      expectedQuantity: 2,
      expectedOrderValue: 700000,
      expectedClosingDate: new Date('2026-11-20'),
      leadOwner: 'Kabilan (Senior Account Lead)',
      leadStatus: 'Won',
      notes: 'Customer accepted quotation V2. PO received and verified.'
    });

    const l3 = await Lead.create({
      leadNumber: 'LD-003',
      customer: c3._id,
      enquiryReference: e3._id,
      interestedProduct: p3._id,
      expectedQuantity: 4,
      expectedOrderValue: 300000,
      expectedClosingDate: new Date('2026-11-15'),
      leadOwner: 'Ravi Teja',
      leadStatus: 'Lost',
      notes: 'Customer postponed conveyor expansion project to next quarter.'
    });

    console.log('5. Creating Follow-ups...');
    const today = new Date();
    today.setHours(14, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 30, 0, 0);

    await FollowUp.create([
      {
        followUpNumber: 'FU-001',
        customer: c1._id,
        relatedLead: l1._id,
        contactDate: new Date('2026-11-13'),
        contactMethod: 'Meeting',
        discussionNotes: 'Reviewed technical specs of Machine A. Price negotiation on discount.',
        customerResponse: 'Negotiation',
        nextFollowUpDate: today,
        nextAction: 'Send revised commercial quote V2',
        assignedEmployee: 'Kabilan',
        status: 'Pending'
      },
      {
        followUpNumber: 'FU-002',
        customer: c2._id,
        relatedLead: l2._id,
        contactDate: new Date('2026-11-12'),
        contactMethod: 'Call',
        discussionNotes: 'Confirming delivery timeline and advance payment bank transfer status.',
        customerResponse: 'Interested',
        nextFollowUpDate: tomorrow,
        nextAction: 'Verify incoming RTGS advance payment',
        assignedEmployee: 'Kabilan',
        status: 'Pending'
      }
    ]);

    console.log('6. Creating Quotations (with V1 & V2 Negotiation)...');
    const q1 = await Quotation.create({
      quotationNumber: 'QT-001',
      version: 'V1',
      quotationDate: new Date('2026-11-11'),
      customer: c1._id,
      leadReference: l1._id,
      validUntil: new Date('2026-12-10'),
      items: [
        {
          product: p1._id,
          description: 'High-Precision CNC Lathe with standard tooling package',
          quantity: 10,
          unit: 'Nos',
          unitPrice: 200000,
          discount: 0,
          gstPercent: 18,
          amount: 2360000
        }
      ],
      subtotal: 2000000,
      discountTotal: 0,
      gstTotal: 360000,
      grandTotal: 2360000,
      deliveryTerms: 'Ex-Factory, 4 to 6 weeks from PO confirmation',
      paymentTerms: '50% Advance with PO, 50% Before Dispatch',
      warranty: '12 Months comprehensive warranty',
      notes: 'Special factory price for batch volume of 10 machines.',
      status: 'Sent'
    });

    const q2_v1 = await Quotation.create({
      quotationNumber: 'QT-002',
      version: 'V1',
      quotationDate: new Date('2026-11-10'),
      customer: c2._id,
      leadReference: l2._id,
      validUntil: new Date('2026-12-10'),
      items: [
        {
          product: p2._id,
          description: '50-Ton Hydraulic Stamping Press',
          quantity: 2,
          unit: 'Nos',
          unitPrice: 350000,
          discount: 0,
          gstPercent: 18,
          amount: 826000
        }
      ],
      subtotal: 700000,
      discountTotal: 0,
      gstTotal: 126000,
      grandTotal: 826000,
      status: 'Negotiation'
    });

    const q2_v2 = await Quotation.create({
      quotationNumber: 'QT-002',
      version: 'V2',
      quotationDate: new Date('2026-11-12'),
      customer: c2._id,
      leadReference: l2._id,
      validUntil: new Date('2026-12-10'),
      items: [
        {
          product: p2._id,
          description: '50-Ton Hydraulic Stamping Press (Negotiated Corporate Discount)',
          quantity: 2,
          unit: 'Nos',
          unitPrice: 350000,
          discount: 30000,
          gstPercent: 18,
          amount: 790600
        }
      ],
      subtotal: 700000,
      discountTotal: 30000,
      gstTotal: 120600,
      grandTotal: 790600,
      status: 'Accepted'
    });

    console.log('7. Creating Proforma Invoices (PI)...');
    const pi1 = await ProformaInvoice.create({
      piNumber: 'PI-001',
      customer: c1._id,
      quotation: q1._id,
      piDate: new Date('2026-11-13'),
      items: q1.items,
      grandTotal: 2000000,
      advancePercentage: 50,
      advanceAmount: 1000000,
      balanceAmount: 950000, // 50,000 received
      totalReceived: 50000,
      status: 'Sent'
    });

    const pi2 = await ProformaInvoice.create({
      piNumber: 'PI-002',
      customer: c2._id,
      quotation: q2_v2._id,
      piDate: new Date('2026-11-12'),
      items: q2_v2.items,
      grandTotal: 790600,
      advancePercentage: 50,
      advanceAmount: 395300,
      balanceAmount: 0,
      totalReceived: 790600,
      status: 'Paid'
    });

    console.log('8. Creating Customer Purchase Orders (CPO)...');
    const cpo1 = await CustomerPO.create({
      internalPOId: 'CPO-001',
      customerPONumber: 'ABC/PO/101',
      customer: c1._id,
      piReference: pi1._id,
      quotationReference: q1._id,
      customerPODate: new Date('2026-11-13'),
      receivedDate: new Date('2026-11-13'),
      poAmount: 2000000,
      deliveryDate: new Date('2026-12-25'),
      paymentTerms: '50% Advance, 50% Before Dispatch',
      poDocument: 'ABC_Signed_Purchase_Order_101.pdf',
      remarks: 'Verified against Quotation QT-001. Terms match perfectly.',
      status: 'Verified',
      verifiedBy: 'Commercial Head',
      verifiedDate: new Date('2026-11-13')
    });

    console.log('9. Creating Payments...');
    const pay1 = await Payment.create({
      paymentNumber: 'PAY-001',
      customer: c1._id,
      piReference: pi1._id,
      paymentDate: new Date('2026-11-13'),
      paymentType: 'Advance',
      amountReceived: 50000,
      paymentMethod: 'Bank Transfer',
      transactionReference: 'NEFT-HDFC-99882103',
      paymentProof: 'NEFT_Counterfoil_50000.pdf',
      remarks: 'Initial token advance received. Remaining 9,50,000 advance scheduled.',
      status: 'Verified',
      verifiedBy: 'Accounts Officer',
      verifiedDate: new Date('2026-11-13')
    });

    console.log('10. Creating Sales Orders (SO)...');
    await SalesOrder.create({
      soNumber: 'SO-001',
      soDate: new Date('2026-11-13'),
      customer: c1._id,
      customerPOReference: cpo1._id,
      quotationReference: q1._id,
      piReference: pi1._id,
      expectedDeliveryDate: new Date('2026-12-30'),
      items: [
        {
          product: p1._id,
          description: 'Machine A (High-Precision CNC Lathe)',
          quantity: 10,
          unit: 'Nos',
          unitPrice: 200000,
          discount: 0,
          gstPercent: 18,
          totalAmount: 2000000
        }
      ],
      orderAmount: 2000000,
      advanceReceived: 50000,
      balanceAmount: 1950000,
      paymentTerms: '50% Advance, Balance Before Dispatch',
      shippingAddress: 'Plot 45, Ambattur Industrial Estate, Chennai',
      deliveryInstructions: 'Special crane required for shopfloor machine positioning.',
      productionRemarks: 'Raw Material requisition raised. Structural fabrication in progress.',
      productionStatus: 'Sent to Production',
      status: 'Confirmed'
    });

    console.log('--- SALES SEEDING COMPLETED SUCCESSFULLY! ---');
    process.exit(0);
  } catch (error) {
    console.error('Sales seeding error:', error);
    process.exit(1);
  }
};

seedSalesDatabase();

