import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import ProductionPipelineStepper from './ProductionPipelineStepper';
import {
  Calendar,
  Layers,
  Wrench,
  PackageCheck,
  Factory,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  Send,
  Boxes,
  Clock,
  Info,
  Check,
  FileText
} from 'lucide-react';

export default function ProductionOrdersPage({
  workOrders = [],
  salesOrders = [],
  products = [],
  boms = [],
  materials = [],
  inventory = [],
  materialRequests = [],
  productionMaterialIssues = [],
  materialIssues = [],
  executions = [],
  productionUpdates = [],
  completions = [],
  finishedGoods = [],
  preSelectedSO = null,
  onClearPreSelectedSO,
  onSaveWorkOrder,
  onUpdateWorkOrderStatus,
  onSaveBOM,
  onSaveMaterialRequest,
  onSaveProductionUpdate,
  onSaveCompletion,
  onSaveFinishedGood,
  onNavigateToMaterials,
  onNavigateModule,
  showToast,
  defaultTab = 'orders'
}) {
  // Map incoming tab names to the 4 essential tabs
  const resolveInitialTab = (tab) => {
    if (tab === 'planning' || tab === 'bom' || tab === 'production-planning') return 'planning';
    if (tab === 'daily' || tab === 'manufacturing' || tab === 'execution' || tab === 'updates' || tab === 'tracking') return 'daily';
    if (tab === 'completed' || tab === 'finished-goods') return 'completed';
    return 'orders';
  };

  const [activeTab, setActiveTab] = useState(resolveInitialTab(defaultTab));
  const [selectedWOForPlan, setSelectedWOForPlan] = useState(null);
  const [selectedWOForDaily, setSelectedWOForDaily] = useState(null);
  const [selectedWODetails, setSelectedWODetails] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Simple Production Order Form State
  const [orderForm, setOrderForm] = useState({
    salesOrder: '',
    salesOrderNumber: '',
    customer: '',
    customerName: '',
    product: '',
    productName: '',
    orderQuantity: 1,
    productionQuantity: 1,
    plannedStartDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    bom: '',
    priority: 'High',
    productionManager: 'Senior Production Engineer',
    productionLocation: 'Main Assembly Bay 1',
    remarks: ''
  });

  // Daily Production Form State
  const [dailyForm, setDailyForm] = useState({
    workOrder: '',
    workOrderNumber: '',
    productionDate: new Date().toISOString().split('T')[0],
    plannedQuantity: 0,
    previouslyCompletedQuantity: 0,
    completedQuantity: 1,
    rejectedQuantity: 0,
    remarks: ''
  });

  // Handle defaultTab updates
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(resolveInitialTab(defaultTab));
    }
  }, [defaultTab]);

  // Handle incoming preSelectedSO from Sales CRM
  useEffect(() => {
    if (preSelectedSO) {
      handleSelectSO(preSelectedSO._id);
      setIsCreateModalOpen(true);
      setActiveTab('orders');
      if (onClearPreSelectedSO) onClearPreSelectedSO();
    }
  }, [preSelectedSO]);

  // Set default selected order for Planning tab if none selected
  useEffect(() => {
    if (activeTab === 'planning' && !selectedWOForPlan && workOrders.length > 0) {
      setSelectedWOForPlan(workOrders[0]);
    }
  }, [activeTab, workOrders, selectedWOForPlan]);

  // Set default selected order for Daily tab if none selected
  useEffect(() => {
    if (activeTab === 'daily' && !selectedWOForDaily) {
      const readyOrRunning = workOrders.find(w => w.status === 'Ready to Start' || w.status === 'Running' || w.status === 'Partially Issued') || workOrders[0];
      if (readyOrRunning) {
        handleSelectDailyWO(readyOrRunning._id);
      }
    }
  }, [activeTab, workOrders, selectedWOForDaily]);

  // Helper to get Store inventory stock balance
  const getStoreStock = (matId) => {
    const inv = (inventory || []).find(i => String(i.material?._id || i.material) === String(matId));
    return inv ? (inv.availableStock !== undefined ? inv.availableStock : inv.currentStock || 0) : 0;
  };

  // Helper to determine Material Readiness Status (never falsely shows BOM Pending)
  const getMaterialReadiness = (wo) => {
    const linkedMR = (materialRequests || []).find(mr =>
      mr.workOrderNumber === wo.workOrderNumber || String(mr.workOrder?._id || mr.workOrder) === String(wo._id)
    );

    const hasIssue = (productionMaterialIssues || []).some(mi =>
      (mi.workOrderNumber === wo.workOrderNumber || String(mi.workOrder?._id || mi.workOrder) === String(wo._id)) &&
      (mi.status === 'Issued' || mi.status === 'Fully Issued')
    ) || (materialIssues || []).some(mi => mi.workOrder === wo.workOrderNumber);

    if (wo.status === 'Completed') {
      return { label: 'Stock Issued', badgeClass: 'badge-success', icon: CheckCircle2, code: 'COMPLETED' };
    }
    if (wo.status === 'Ready to Start' || wo.status === 'Running' || linkedMR?.status === 'Fully Issued' || hasIssue) {
      return { label: 'Fully Issued', badgeClass: 'badge-success', icon: CheckCircle2, code: 'FULLY_ISSUED' };
    }
    if (wo.status === 'Partially Issued' || linkedMR?.status === 'Partially Issued') {
      return { label: 'Partially Issued', badgeClass: 'badge-warning', icon: Clock, code: 'PARTIALLY_ISSUED' };
    }
    if (linkedMR) {
      return { label: `Sent to Store (${linkedMR.requestNumber})`, badgeClass: 'badge-secondary', icon: Clock, code: 'SENT_TO_STORE' };
    }
    return { label: 'Request Not Sent', badgeClass: 'badge-secondary', icon: AlertCircle, code: 'NOT_SENT' };
  };

  // Helper to find BOM for a product
  const getBOMForProduct = (prodId) => {
    return (boms || []).find(b => String(b.product?._id || b.product) === String(prodId));
  };

  // When SO is selected in Create Production Order modal
  const handleSelectSO = (soId) => {
    const so = (salesOrders || []).find(s => s._id === soId);
    if (!so) return;

    const firstItem = so.items && so.items[0];
    const prodId = firstItem?.product?._id || firstItem?.product || '';
    const prodName = firstItem?.productName || firstItem?.product?.productName || '';
    const matchingBOM = getBOMForProduct(prodId);

    setOrderForm(prev => ({
      ...prev,
      salesOrder: so._id,
      salesOrderNumber: so.soNumber,
      customer: so.customer?._id || so.customer || '',
      customerName: so.customer?.companyName || 'Confirmed Client',
      product: prodId,
      productName: prodName,
      orderQuantity: firstItem?.quantity || 1,
      productionQuantity: firstItem?.quantity || 1,
      bom: matchingBOM ? matchingBOM._id : ''
    }));
  };

  // When Product is selected directly in modal
  const handleSelectProduct = (prodId) => {
    const p = (products || []).find(prod => prod._id === prodId);
    const matchingBOM = getBOMForProduct(prodId);

    setOrderForm(prev => ({
      ...prev,
      product: prodId,
      productName: p ? p.productName : '',
      bom: matchingBOM ? matchingBOM._id : ''
    }));
  };

  // Action 1: Save Plan
  const handleSavePlan = async (e) => {
    if (e) e.preventDefault();
    if (!orderForm.product) {
      showToast('Please select a target Manufactured Product', 'error');
      return;
    }

    try {
      const payload = {
        ...orderForm,
        bom: orderForm.bom || undefined,
        salesOrder: orderForm.salesOrder || undefined,
        customer: orderForm.customer || undefined,
        product: orderForm.product || undefined,
        status: 'Planned'
      };

      await onSaveWorkOrder(payload);
      setIsCreateModalOpen(false);
      showToast('Production Order plan saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error saving Production Order', 'error');
    }
  };

  // Action 2: Save Plan & Request Materials immediately
  const handleSaveAndRequestMaterials = async () => {
    if (!orderForm.product) {
      showToast('Please select a target Manufactured Product', 'error');
      return;
    }

    try {
      // 1. Create Production Order
      const payload = {
        ...orderForm,
        bom: orderForm.bom || undefined,
        salesOrder: orderForm.salesOrder || undefined,
        customer: orderForm.customer || undefined,
        product: orderForm.product || undefined,
        status: 'Waiting for Materials'
      };

      const createdWO = await onSaveWorkOrder(payload);
      setIsCreateModalOpen(false);

      // 2. Automatically dispatch Material Request using BOM recipe
      const targetBOM = orderForm.bom
        ? (boms || []).find(b => b._id === orderForm.bom)
        : getBOMForProduct(orderForm.product);

      if (targetBOM && targetBOM.materials && onSaveMaterialRequest) {
        const orderQty = Number(orderForm.productionQuantity || 1);
        const reqItems = targetBOM.materials.map(bm => {
          const matId = bm.material?._id || bm.material;
          const storeStock = getStoreStock(matId);
          const required = Number(bm.quantityPerUnit || 1) * orderQty;
          return {
            material: matId,
            materialCode: bm.materialCode,
            materialName: bm.materialName,
            requiredQty: required,
            availableStock: storeStock,
            alreadyIssuedQty: 0,
            requestedQty: required,
            remainingQty: required,
            unit: bm.unit || 'Kg',
            status: 'Pending'
          };
        });

        await onSaveMaterialRequest({
          workOrder: createdWO?.data?._id || createdWO?._id,
          workOrderNumber: createdWO?.data?.workOrderNumber || createdWO?.workOrderNumber || 'WO-NEW',
          product: orderForm.product,
          productName: orderForm.productName,
          requiredDate: orderForm.plannedStartDate || new Date(),
          requestedBy: orderForm.productionManager || 'Senior Production Engineer',
          department: 'Assembly',
          remarks: `Material Requisition triggered from Production Plan for ${orderForm.productName}`,
          items: reqItems
        });

        showToast('Production Order created & Material Request sent to Store!', 'success');
      } else {
        showToast('Production Order saved! Please formulate a BOM to request materials.', 'warning');
      }
    } catch (err) {
      showToast(err.message || 'Error processing plan and request', 'error');
    }
  };

  // Send Material Request from Planning & BOM Tab
  const handleSendMRFromPlan = async (wo) => {
    if (!wo) return;
    const prodId = wo.product?._id || wo.product;
    const matchingBOM = wo.bom || getBOMForProduct(prodId);

    if (!matchingBOM || !matchingBOM.materials || matchingBOM.materials.length === 0) {
      showToast('No BOM recipe available for this product. Please define BOM first.', 'warning');
      return;
    }

    try {
      const orderQty = Number(wo.productionQuantity || wo.orderQuantity || 1);
      const reqItems = matchingBOM.materials.map(bm => {
        const matId = bm.material?._id || bm.material;
        const storeStock = getStoreStock(matId);
        const required = Number(bm.quantityPerUnit || 1) * orderQty;
        return {
          material: matId,
          materialCode: bm.materialCode,
          materialName: bm.materialName,
          requiredQty: required,
          availableStock: storeStock,
          alreadyIssuedQty: 0,
          requestedQty: required,
          remainingQty: required,
          unit: bm.unit || 'Kg',
          status: 'Pending'
        };
      });

      await onSaveMaterialRequest({
        workOrder: wo._id,
        workOrderNumber: wo.workOrderNumber,
        product: prodId,
        productName: wo.productName,
        requiredDate: wo.plannedStartDate || new Date(),
        requestedBy: wo.productionManager || 'Senior Production Engineer',
        department: 'Assembly',
        remarks: `Requisition dispatched for Work Order ${wo.workOrderNumber}`,
        items: reqItems
      });

      showToast(`Material Request sent to Store for ${wo.workOrderNumber}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Error sending Material Request', 'error');
    }
  };

  // When WO is selected in Daily Production Tab
  const handleSelectDailyWO = (woId) => {
    const wo = (workOrders || []).find(w => w._id === woId);
    if (!wo) return;

    setSelectedWOForDaily(wo);

    // Calculate previously completed quantity across all historical updates for this WO
    const previousLogs = (productionUpdates || []).filter(u =>
      u.workOrderNumber === wo.workOrderNumber || String(u.workOrder?._id || u.workOrder) === String(wo._id)
    );
    const sumCompleted = previousLogs.reduce((acc, log) => acc + Number(log.completedQuantity || 0), 0);
    const planned = Number(wo.productionQuantity || wo.orderQuantity || 1);

    setDailyForm({
      workOrder: wo._id,
      workOrderNumber: wo.workOrderNumber,
      productionDate: new Date().toISOString().split('T')[0],
      plannedQuantity: planned,
      previouslyCompletedQuantity: sumCompleted,
      completedQuantity: Math.max(1, planned - sumCompleted),
      rejectedQuantity: 0,
      remarks: ''
    });
  };

  // Daily Form: Save Daily Progress
  const handleSaveDailyProgress = async (e) => {
    if (e) e.preventDefault();
    if (!dailyForm.workOrder) {
      showToast('Please select an active Production Order', 'error');
      return;
    }

    try {
      await onSaveProductionUpdate({
        workOrder: dailyForm.workOrder,
        workOrderNumber: dailyForm.workOrderNumber,
        date: dailyForm.productionDate,
        shift: 'Shift 1 - Day Assembly',
        plannedQuantity: Number(dailyForm.plannedQuantity || 1),
        previouslyCompletedQuantity: Number(dailyForm.previouslyCompletedQuantity || 0),
        completedQuantity: Number(dailyForm.completedQuantity || 0),
        rejectedQuantity: Number(dailyForm.rejectedQuantity || 0),
        remarks: dailyForm.remarks || 'Daily shift output logged'
      });

      showToast(`Daily production progress logged for ${dailyForm.workOrderNumber}`, 'success');
      handleSelectDailyWO(dailyForm.workOrder);
    } catch (err) {
      showToast(err.message || 'Error saving daily progress', 'error');
    }
  };

  // Daily Form: Complete Production
  const handleCompleteProduction = async () => {
    if (!dailyForm.workOrder) {
      showToast('Please select an active Production Order', 'error');
      return;
    }

    const wo = selectedWOForDaily;
    if (!wo) return;

    try {
      // 1. Log final completion update
      await onSaveProductionUpdate({
        workOrder: dailyForm.workOrder,
        workOrderNumber: dailyForm.workOrderNumber,
        date: dailyForm.productionDate,
        shift: 'Final Shift - Completion',
        plannedQuantity: Number(dailyForm.plannedQuantity || 1),
        previouslyCompletedQuantity: Number(dailyForm.previouslyCompletedQuantity || 0),
        completedQuantity: Number(dailyForm.completedQuantity || 0),
        rejectedQuantity: Number(dailyForm.rejectedQuantity || 0),
        remarks: dailyForm.remarks || 'Production completed & verified',
        isCompleted: true
      });

      // 2. Mark completion and transfer to Finished Goods
      if (onSaveCompletion) {
        await onSaveCompletion({
          workOrder: wo._id,
          workOrderNumber: wo.workOrderNumber,
          product: wo.product?._id || wo.product,
          productName: wo.productName,
          plannedQuantity: Number(dailyForm.plannedQuantity || 1),
          completedQuantity: Number(dailyForm.previouslyCompletedQuantity || 0) + Number(dailyForm.completedQuantity || 0),
          rejectedQuantity: Number(dailyForm.rejectedQuantity || 0),
          actualCompletionDate: new Date(),
          remarks: 'Production completed from Daily Production dashboard'
        });
      }

      showToast(`Production Order ${dailyForm.workOrderNumber} marked Completed & goods transferred!`, 'success');
      setActiveTab('completed');
    } catch (err) {
      showToast(err.message || 'Error completing production order', 'error');
    }
  };

  // Table Columns for Tab 1: Production Orders
  const orderColumns = [
    {
      header: 'Order No',
      accessor: 'workOrderNumber',
      render: (row) => (
        <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>
          {row.workOrderNumber}
        </span>
      )
    },
    {
      header: 'Sales Order & Customer',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.82rem' }}>
            {row.salesOrderNumber || row.salesOrder?.soNumber || 'SO-Direct'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {row.customerName || row.customer?.companyName || 'Confirmed Client'}
          </div>
        </div>
      )
    },
    {
      header: 'Manufactured Product',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
            {row.productName || row.product?.productName || 'Cryo Machine'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Target: <strong>{row.productionQuantity || row.orderQuantity || 1} Units</strong>
          </div>
        </div>
      )
    },
    {
      header: 'BOM Status',
      render: (row) => {
        const prodId = row.product?._id || row.product;
        const matchingBOM = row.bom || getBOMForProduct(prodId);
        return matchingBOM ? (
          <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Layers size={11} /> BOM: {matchingBOM.bomNumber || 'Verified V1'}
          </span>
        ) : (
          <span className="badge badge-warning" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Layers size={11} /> Needs BOM
          </span>
        );
      }
    },
    {
      header: 'Materials Readiness',
      render: (row) => {
        const readiness = getMaterialReadiness(row);
        const IconComponent = readiness.icon;
        return (
          <span className={`badge ${readiness.badgeClass}`} style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconComponent size={11} /> {readiness.label}
          </span>
        );
      }
    },
    {
      header: 'Production Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Planned'} />
    },
    {
      header: 'Actions',
      render: (row) => {
        const readiness = getMaterialReadiness(row);
        const prodId = row.product?._id || row.product;
        const matchingBOM = row.bom || getBOMForProduct(prodId);

        return (
          <div className="action-btns" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="icon-btn"
              title="View Complete Particulars"
              onClick={() => setSelectedWODetails(row)}
            >
              <Eye size={15} />
            </button>

            {row.status === 'Completed' ? (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
                onClick={() => setActiveTab('completed')}
              >
                <PackageCheck size={12} /> Finished ➔
              </button>
            ) : row.status === 'Ready to Start' || row.status === 'Running' || row.status === 'Partially Issued' ? (
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
                title="Open Daily Production Process"
                onClick={() => {
                  setSelectedWOForDaily(row);
                  handleSelectDailyWO(row._id);
                  setActiveTab('daily');
                }}
              >
                <Wrench size={12} /> Daily Production ➔
              </button>
            ) : readiness.code === 'SENT_TO_STORE' ? (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4, color: 'var(--primary)' }}
                onClick={() => onNavigateToMaterials && onNavigateToMaterials(row)}
              >
                <ArrowDownLeft size={12} /> Store Issue ➔
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4 }}
                title="Plan & Request Materials"
                onClick={() => {
                  setSelectedWOForPlan(row);
                  setActiveTab('planning');
                }}
              >
                <ArrowDownLeft size={12} /> Plan & BOM ➔
              </button>
            )}
          </div>
        );
      }
    }
  ];

  // Table Columns for Tab 4: Completed Production
  const completedOrders = (workOrders || []).filter(w => w.status === 'Completed');

  const completedColumns = [
    {
      header: 'Order No',
      accessor: 'workOrderNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.workOrderNumber}</span>
    },
    {
      header: 'Customer & SO',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.customerName || 'Customer'}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.salesOrderNumber || 'SO-Direct'}</div>
        </div>
      )
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName || 'Cryo Unit'
    },
    {
      header: 'Units Produced',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#16A36A' }}>
          {row.productionQuantity || row.orderQuantity || 1} Units
        </span>
      )
    },
    {
      header: 'Finished Goods Batch',
      render: (row) => {
        const fg = (finishedGoods || []).find(f =>
          f.workOrderNumber === row.workOrderNumber || String(f.workOrder?._id || f.workOrder) === String(row._id)
        );
        return (
          <div>
            <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--cyan)' }}>
              {fg?.serialNumber || `SN-${row.workOrderNumber}-01`}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {fg?.stockLocation || 'Finished Goods Bay A'}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Completion Date',
      render: (row) => (
        <span style={{ fontSize: '0.78rem' }}>
          {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
        </span>
      )
    },
    {
      header: 'Status',
      render: () => (
        <span className="badge badge-success" style={{ gap: 4 }}>
          <CheckCircle2 size={11} /> Completed
        </span>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* 5-Stage Interactive Manufacturing Stepper */}
      <ProductionPipelineStepper
        currentModule="production-orders"
        onNavigate={onNavigateModule}
        counts={{
          workOrders: workOrders.length,
          materialRequests: materialRequests.length,
          executions: executions.length,
          finishedGoods: finishedGoods.length || completedOrders.length
        }}
      />

      {/* 4 Essential Production Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Calendar size={14} style={{ marginRight: 6 }} />
            1. Production Orders ({workOrders.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'planning' ? 'active' : ''}`}
            onClick={() => setActiveTab('planning')}
          >
            <Layers size={14} style={{ marginRight: 6 }} />
            2. Planning & BOM ({boms.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <Wrench size={14} style={{ marginRight: 6 }} />
            3. Daily Production ({workOrders.filter(w => w.status === 'Running' || w.status === 'Ready to Start' || w.status === 'Partially Issued').length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <PackageCheck size={14} style={{ marginRight: 6 }} />
            4. Completed Production ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PRODUCTION ORDERS                                 */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div>
          <DataTable
            title="Production Orders"
            subtitle="Manage production orders linked to confirmed Sales Orders, BOM recipes, and Store material readiness"
            columns={orderColumns}
            data={workOrders}
            onAdd={() => setIsCreateModalOpen(true)}
            addLabel="Create Production Order"
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PLANNING & BOM                                    */}
      {/* ======================================================== */}
      {activeTab === 'planning' && (() => {
        const wo = selectedWOForPlan || workOrders[0];
        const prodId = wo?.product?._id || wo?.product;
        const matchingBOM = wo?.bom || getBOMForProduct(prodId);
        const linkedMR = wo ? (materialRequests || []).find(mr =>
          mr.workOrderNumber === wo.workOrderNumber || String(mr.workOrder?._id || mr.workOrder) === String(wo._id)
        ) : null;
        const readiness = wo ? getMaterialReadiness(wo) : null;

        return (
          <div>
            {/* Top Bar with Order Selector */}
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Layers size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>Select Production Order to Plan & Verify BOM:</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Verify required raw materials and quantities, then send Material Request to Store.
                  </div>
                </div>
              </div>
              <div style={{ minWidth: 260 }}>
                <select
                  className="form-select"
                  value={wo?._id || ''}
                  onChange={(e) => {
                    const found = workOrders.find(w => w._id === e.target.value);
                    if (found) setSelectedWOForPlan(found);
                  }}
                >
                  {workOrders.map(w => (
                    <option key={w._id} value={w._id}>
                      {w.workOrderNumber} — {w.productName} ({w.customerName || 'Client'}) [{w.status}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {wo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Order Summary & Status Card */}
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    <div>
                      <span className="font-mono text-cyan" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {wo.workOrderNumber}
                      </span>
                      <span style={{ marginLeft: 10, fontSize: '0.9rem', fontWeight: 600 }}>
                        {wo.productName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <StatusBadge status={wo.status || 'Planned'} />
                      {readiness && (
                        <span className={`badge ${readiness.badgeClass}`} style={{ gap: 4 }}>
                          <readiness.icon size={11} /> {readiness.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Sales Order:</span>{' '}
                      <strong>{wo.salesOrderNumber || 'Direct'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Client:</span>{' '}
                      <strong>{wo.customerName || 'Confirmed Client'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Target Quantity:</span>{' '}
                      <strong style={{ color: 'var(--primary)' }}>{wo.productionQuantity || wo.orderQuantity || 1} Units</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Planned Timeline:</span>{' '}
                      <span>{wo.plannedStartDate ? new Date(wo.plannedStartDate).toLocaleDateString('en-GB') : '-'} to {wo.expectedCompletionDate ? new Date(wo.expectedCompletionDate).toLocaleDateString('en-GB') : '-'}</span>
                    </div>
                  </div>
                </div>

                {/* BOM Recipe & Materials Verification Card */}
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Boxes size={16} style={{ color: 'var(--cyan)' }} />
                      Raw Materials Specification ({matchingBOM ? `${matchingBOM.bomNumber} (${matchingBOM.version || 'V1'})` : 'No BOM Formulated'})
                    </div>
                    {matchingBOM && (
                      <span className="badge badge-success" style={{ gap: 4 }}>
                        <Check size={11} /> BOM Recipe Verified
                      </span>
                    )}
                  </div>

                  {matchingBOM && matchingBOM.materials && matchingBOM.materials.length > 0 ? (
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Material Code</th>
                            <th>Material Name</th>
                            <th>Qty / Unit</th>
                            <th>Total Required ({wo.productionQuantity || 1} Units)</th>
                            <th>Store Stock Available</th>
                            <th>Stock Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchingBOM.materials.map((m, idx) => {
                            const matId = m.material?._id || m.material;
                            const stock = getStoreStock(matId);
                            const totalReq = Number(m.quantityPerUnit || 1) * Number(wo.productionQuantity || 1);
                            const isShortage = stock < totalReq;

                            return (
                              <tr key={idx}>
                                <td><span className="code-badge">{m.materialCode || 'RM'}</span></td>
                                <td><strong>{m.materialName}</strong></td>
                                <td>{m.quantityPerUnit} {m.unit || 'Kg'}</td>
                                <td><strong style={{ color: 'var(--primary)' }}>{totalReq} {m.unit || 'Kg'}</strong></td>
                                <td>{stock} {m.unit || 'Kg'}</td>
                                <td>
                                  {stock >= totalReq ? (
                                    <span className="badge badge-success" style={{ fontSize: '0.72rem', gap: 4 }}>
                                      <CheckCircle2 size={11} /> Available in Store
                                    </span>
                                  ) : stock > 0 ? (
                                    <span className="badge badge-warning" style={{ fontSize: '0.72rem', gap: 4 }}>
                                      <AlertTriangle size={11} /> Partial (Short: {totalReq - stock})
                                    </span>
                                  ) : (
                                    <span className="badge badge-danger" style={{ fontSize: '0.72rem', gap: 4 }}>
                                      <AlertCircle size={11} /> Out of Stock (Short: {totalReq})
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                      <AlertCircle size={32} style={{ color: '#F59E0B', margin: '0 auto 8px' }} />
                      <p style={{ fontWeight: 600 }}>No BOM recipe linked to this product.</p>
                      <p style={{ fontSize: '0.78rem' }}>Please define raw materials for {wo.productName} before requesting materials from Store.</p>
                    </div>
                  )}

                  {/* Material Request to Store Dispatch Section */}
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      {linkedMR ? (
                        <div style={{ fontSize: '0.82rem', color: '#16A36A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={15} /> Material Request {linkedMR.requestNumber} Sent to Store (Status: {linkedMR.status || 'Pending'})
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Click below to automatically send this itemized Material Request to the Supply Chain Store.
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {linkedMR ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onNavigateToMaterials && onNavigateToMaterials(wo)}
                        >
                          <ArrowDownLeft size={13} /> View Store Requisitions ➔
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ gap: 6 }}
                          onClick={() => handleSendMRFromPlan(wo)}
                        >
                          <Send size={14} /> Send Material Request to Store ➔
                        </button>
                      )}

                      {(readiness?.code === 'FULLY_ISSUED' || wo.status === 'Ready to Start' || wo.status === 'Running') && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ gap: 6 }}
                          onClick={() => {
                            setSelectedWOForDaily(wo);
                            handleSelectDailyWO(wo._id);
                            setActiveTab('daily');
                          }}
                        >
                          <Wrench size={14} /> Start Daily Production ➔
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                No Production Orders available to plan.
              </div>
            )}
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* TAB 3: DAILY PRODUCTION                                  */}
      {/* ======================================================== */}
      {activeTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Daily Production Form Card */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wrench size={18} /> Daily Production Progress Entry
            </div>

            <form onSubmit={handleSaveDailyProgress}>
              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label className="form-label">Select Production Order <span className="req">*</span></label>
                  <select
                    className="form-select"
                    value={dailyForm.workOrder}
                    onChange={(e) => handleSelectDailyWO(e.target.value)}
                    required
                  >
                    <option value="">Select Production Order (Ready / In Assembly)</option>
                    {workOrders.map(w => (
                      <option key={w._id} value={w._id}>
                        {w.workOrderNumber} — {w.productName} ({w.customerName || 'Client'}) [{w.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Production Date <span className="req">*</span></label>
                  <input
                    type="date"
                    className="form-input"
                    value={dailyForm.productionDate}
                    onChange={(e) => setDailyForm({ ...dailyForm, productionDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Planned Total Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={dailyForm.plannedQuantity}
                    disabled
                    style={{ background: 'var(--bg-surface-elevated)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Previously Completed Units</label>
                  <input
                    type="number"
                    className="form-input"
                    value={dailyForm.previouslyCompletedQuantity}
                    disabled
                    style={{ background: 'var(--bg-surface-elevated)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Completed Today <span className="req">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={dailyForm.completedQuantity}
                    onChange={(e) => setDailyForm({ ...dailyForm, completedQuantity: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rejected Units Today</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={dailyForm.rejectedQuantity}
                    onChange={(e) => setDailyForm({ ...dailyForm, rejectedQuantity: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Remaining to Produce</label>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: 700,
                    color: Math.max(0, dailyForm.plannedQuantity - dailyForm.previouslyCompletedQuantity - dailyForm.completedQuantity) === 0 ? '#16A36A' : 'var(--primary)'
                  }}>
                    {Math.max(0, dailyForm.plannedQuantity - dailyForm.previouslyCompletedQuantity - dailyForm.completedQuantity)} Units
                  </div>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Daily Shift Remarks / Engineering Notes</label>
                  <textarea
                    rows="2"
                    className="form-textarea"
                    placeholder="e.g. Day shift assembly completed. Refrigeration wiring tested."
                    value={dailyForm.remarks}
                    onChange={(e) => setDailyForm({ ...dailyForm, remarks: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  style={{ gap: 6 }}
                >
                  <FileText size={14} /> Save Daily Progress
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ gap: 6 }}
                  onClick={handleCompleteProduction}
                >
                  <PackageCheck size={15} /> Complete Production ➔
                </button>
              </div>
            </form>
          </div>

          {/* Daily Progress Logs Table */}
          <div className="table-card">
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
              <strong style={{ fontSize: '0.88rem' }}>Daily Production History & Shift Logs</strong>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Log No</th>
                    <th>Date</th>
                    <th>Production Order</th>
                    <th>Shift Completed</th>
                    <th>Rejected</th>
                    <th>Cumulative Done</th>
                    <th>Remaining</th>
                    <th>Operator Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {productionUpdates.map((u, i) => (
                    <tr key={u._id || i}>
                      <td><span className="code-badge">{u.updateNumber || `PU-${i + 1}`}</span></td>
                      <td>{u.date ? new Date(u.date).toLocaleDateString('en-GB') : '-'}</td>
                      <td><strong>{u.workOrderNumber || u.workOrder?.workOrderNumber || 'WO'}</strong></td>
                      <td><strong style={{ color: '#16A36A' }}>+{u.completedQuantity} Units</strong></td>
                      <td>{u.rejectedQuantity || 0}</td>
                      <td>{u.totalCompletedQuantity || (Number(u.previouslyCompletedQuantity || 0) + Number(u.completedQuantity || 0))}</td>
                      <td>{u.pendingQuantity || 0}</td>
                      <td style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{u.remarks || '-'}</td>
                    </tr>
                  ))}
                  {productionUpdates.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                        No daily production logs recorded yet. Use the form above to record shift progress.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: COMPLETED PRODUCTION                              */}
      {/* ======================================================== */}
      {activeTab === 'completed' && (
        <div>
          <DataTable
            title="Completed Production Orders"
            subtitle="Archive of finished manufacturing orders, finished-goods inventory batches, and dispatch readiness"
            columns={completedColumns}
            data={completedOrders}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE PRODUCTION ORDER                           */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <Modal
          title="Create Production Order"
          subtitle="Generate an operational manufacturing order from confirmed Sales Order demand"
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSavePlan}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Order Info */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Factory size={15} /> 1. Order & Product Specification
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Linked Sales Order (Dropdown)</label>
                    <select
                      className="form-select"
                      value={orderForm.salesOrder}
                      onChange={(e) => handleSelectSO(e.target.value)}
                    >
                      <option value="">Select Confirmed Sales Order (or Direct Factory Order)</option>
                      {salesOrders.map(so => (
                        <option key={so._id} value={so._id}>
                          {so.soNumber} — {so.customer?.companyName || 'Customer'} (₹{(so.orderAmount || so.grandTotal || 0).toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Product (Auto-filled) <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={orderForm.product}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      required
                    >
                      <option value="">Select Manufactured Product</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.productCode} — {p.productName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Order Quantity <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={orderForm.productionQuantity}
                      onChange={(e) => setOrderForm({ ...orderForm, productionQuantity: Number(e.target.value), orderQuantity: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Planned Start Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={orderForm.plannedStartDate}
                      onChange={(e) => setOrderForm({ ...orderForm, plannedStartDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Planned End Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={orderForm.expectedCompletionDate}
                      onChange={(e) => setOrderForm({ ...orderForm, expectedCompletionDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">BOM Recipe (Select)</label>
                    <select
                      className="form-select"
                      value={orderForm.bom}
                      onChange={(e) => setOrderForm({ ...orderForm, bom: e.target.value })}
                    >
                      <option value="">Select BOM Recipe for this Product</option>
                      {boms
                        .filter(b => !orderForm.product || String(b.product?._id || b.product) === String(orderForm.product))
                        .map(b => (
                          <option key={b._id} value={b._id}>
                            {b.bomNumber} ({b.version || 'V1'}) — {b.product?.productName || 'Recipe'} ({b.materials?.length || 0} components)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Remarks (Optional)</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      placeholder="Special engineering instructions or customer requirements..."
                      value={orderForm.remarks}
                      onChange={(e) => setOrderForm({ ...orderForm, remarks: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-secondary">
                Save Plan
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ gap: 6 }}
                onClick={handleSaveAndRequestMaterials}
              >
                <Send size={14} /> Request Materials ➔
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW PRODUCTION ORDER DETAILS                     */}
      {/* ======================================================== */}
      {selectedWODetails && (
        <Modal
          title={`Production Order: ${selectedWODetails.workOrderNumber}`}
          subtitle={`Manufacturing details for ${selectedWODetails.customerName || 'Client'}`}
          isOpen={!!selectedWODetails}
          onClose={() => setSelectedWODetails(null)}
          size="lg"
        >
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Production Order</div>
                <div className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {selectedWODetails.workOrderNumber}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Sales Order</div>
                <div className="detail-value">{selectedWODetails.salesOrderNumber || 'Direct'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer</div>
                <div className="detail-value">{selectedWODetails.customerName || 'Client'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Target Product</div>
                <div className="detail-value">{selectedWODetails.productName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Quantity</div>
                <div className="detail-value" style={{ fontWeight: 700 }}>
                  {selectedWODetails.productionQuantity || selectedWODetails.orderQuantity || 1} Units
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Current Status</div>
                <div className="detail-value"><StatusBadge status={selectedWODetails.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Material Readiness</div>
                <div className="detail-value">
                  {(() => {
                    const r = getMaterialReadiness(selectedWODetails);
                    return <span className={`badge ${r.badgeClass}`}>{r.label}</span>;
                  })()}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Timeline</div>
                <div className="detail-value">
                  {selectedWODetails.plannedStartDate ? new Date(selectedWODetails.plannedStartDate).toLocaleDateString('en-GB') : '-'} to{' '}
                  {selectedWODetails.expectedCompletionDate ? new Date(selectedWODetails.expectedCompletionDate).toLocaleDateString('en-GB') : '-'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedWODetails(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const wo = selectedWODetails;
                  setSelectedWODetails(null);
                  setSelectedWOForPlan(wo);
                  setActiveTab('planning');
                }}
              >
                Plan & Verify BOM ➔
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
