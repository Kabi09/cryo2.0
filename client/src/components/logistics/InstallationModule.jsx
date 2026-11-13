import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Wrench, Calendar, MapPin, User, CheckCircle2, AlertTriangle, Clock, ShieldCheck, Phone, FileText } from 'lucide-react';

export default function InstallationModule({
  installations = [],
  deliveryPlans = [],
  onSave,
  onUpdateStatus,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    deliveryPlan: '',
    deliveryNumber: '',
    salesOrder: '',
    soNumber: '',
    customer: '',
    customerName: '',
    installationAddress: '',
    contactPerson: '',
    mobileNumber: '',
    product: '',
    productName: '',
    serialNumber: '',
    installationQuantity: 1,
    assignedTechnician: 'Er. Rajesh Kumar (Senior Field Engineer)',
    plannedInstallationDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    requiredTools: 'Multimeter, Torque Wrench Set, Fluke Thermal Camera, Software Dongle, Grounding Tester',
    installationInstructions: 'Verify 3-phase 415V power stability, test pneumatic connections, ensure dust-free cleanroom environment before powering on.',
    customerRequirements: 'Ensure customer engineering lead is available for handover training.',
    remarks: ''
  });

  const handleOpenModal = () => {
    // Attempt auto-populate with first eligible delivery plan
    if (deliveryPlans.length > 0 && !formData.deliveryPlan) {
      handleSelectDelivery(deliveryPlans[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectDelivery = (planId) => {
    const plan = deliveryPlans.find(p => p._id === planId);
    if (!plan) return;

    setFormData(prev => ({
      ...prev,
      deliveryPlan: plan._id,
      deliveryNumber: plan.deliveryNumber || '',
      salesOrder: plan.salesOrder?._id || plan.salesOrder || '',
      soNumber: plan.soNumber || '',
      customer: plan.customer?._id || plan.customer || '',
      customerName: plan.customerName || '',
      installationAddress: plan.deliveryAddress || '',
      contactPerson: plan.contactPerson || '',
      mobileNumber: plan.mobileNumber || '',
      product: plan.product?._id || plan.product || '',
      productName: plan.productName || '',
      serialNumber: plan.serialNumber || 'SN-PENDING',
      installationQuantity: plan.plannedDeliveryQuantity || 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deliveryNumber || !formData.customerName || !formData.productName) {
      showToast?.('Please link a valid delivery and customer record', 'error');
      return;
    }
    try {
      await onSave?.(formData);
      setIsModalOpen(false);
      showToast?.('Installation scheduled successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Error scheduling installation', 'error');
    }
  };

  // Status counters
  const totalCount = installations.length;
  const scheduledCount = installations.filter(i => i.status === 'Scheduled').length;
  const inProgressCount = installations.filter(i => i.status === 'In Progress').length;
  const completedCount = installations.filter(i => i.status === 'Completed').length;
  const failedCount = installations.filter(i => i.status === 'Failed' || i.status === 'Rescheduled').length;

  const columns = [
    {
      header: 'INSTALLATION NO',
      accessor: 'installationNumber',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-cyan-400 block">{row.installationNumber}</span>
            <span className="text-[10px] text-slate-400">Ref: {row.deliveryNumber}</span>
          </div>
        </div>
      )
    },
    {
      header: 'CUSTOMER',
      accessor: 'customerName',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-200">{row.customerName}</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-500" /> {row.contactPerson || 'N/A'} • {row.mobileNumber || ''}
          </div>
        </div>
      )
    },
    {
      header: 'PRODUCT & SERIAL',
      accessor: 'productName',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-300">{row.productName}</div>
          <div className="text-[10px] font-mono text-cyan-400/80">SN: {row.serialNumber || 'N/A'} (Qty: {row.installationQuantity})</div>
        </div>
      )
    },
    {
      header: 'TECHNICIAN',
      accessor: 'assignedTechnician',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-cyan-400 font-bold">
            {row.assignedTechnician ? row.assignedTechnician[0] : 'T'}
          </div>
          <span className="text-xs text-slate-300 truncate max-w-[150px]">{row.assignedTechnician}</span>
        </div>
      )
    },
    {
      header: 'PLANNED DATE',
      accessor: 'plannedInstallationDate',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>{row.plannedInstallationDate ? new Date(row.plannedInstallationDate).toLocaleDateString() : 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'ACTIONS',
      accessor: '_id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedItem(row);
              setIsViewModalOpen(true);
            }}
            className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
          >
            View Details
          </button>
          {row.status === 'Scheduled' && (
            <button
              onClick={() => onUpdateStatus?.(row._id, 'In Progress')}
              className="px-2 py-1 text-xs rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition"
              title="Start On-Site Work"
            >
              Start
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wrench className="w-6 h-6" />
            </span>
            Installation & Commissioning
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Schedule on-site technical deployment and assign service engineers for delivered machinery
          </p>
        </div>

        {/* Single Add Button */}
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition"
        >
          <Wrench className="w-4 h-4" />
          + Schedule Installation
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#0E131F] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Scheduled</div>
            <div className="text-xl font-bold text-white mt-1">{totalCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0E131F] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Scheduled</div>
            <div className="text-xl font-bold text-cyan-400 mt-1">{scheduledCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0E131F] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">In Progress</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{inProgressCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0E131F] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Completed</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{completedCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0E131F] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Failed / Resched</div>
            <div className="text-xl font-bold text-rose-400 mt-1">{failedCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <div className="bg-[#0E131F] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <DataTable
          columns={columns}
          data={installations}
          searchPlaceholder="Search by installation no, customer, technician, serial..."
        />
      </div>

      {/* Schedule Installation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Machine Installation & Handover"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Delivery Reference <span className="text-cyan-400">*</span>
              </label>
              <select
                value={formData.deliveryPlan}
                onChange={(e) => handleSelectDelivery(e.target.value)}
                className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                required
              >
                <option value="">-- Select Delivery Plan --</option>
                {deliveryPlans.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.deliveryNumber} - {p.customerName} ({p.productName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">SO Number (Auto-fill)</label>
              <input
                type="text"
                value={formData.soNumber}
                readOnly
                className="w-full bg-[#161D2E]/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name</label>
              <input
                type="text"
                value={formData.customerName}
                readOnly
                className="w-full bg-[#161D2E]/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number</label>
              <input
                type="text"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Customer Site Delivery Address</label>
            <input
              type="text"
              value={formData.installationAddress}
              onChange={(e) => setFormData({ ...formData, installationAddress: e.target.value })}
              className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Product Model</label>
              <input
                type="text"
                value={formData.productName}
                readOnly
                className="w-full bg-[#161D2E]/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.installationQuantity}
                onChange={(e) => setFormData({ ...formData, installationQuantity: Number(e.target.value) })}
                className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Assigned Lead Technician <span className="text-cyan-400">*</span>
              </label>
              <select
                value={formData.assignedTechnician}
                onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              >
                <option value="Er. Rajesh Kumar (Senior Field Engineer)">Er. Rajesh Kumar (Senior Field Engineer)</option>
                <option value="Er. Vinoth S (Automation Specialist)">Er. Vinoth S (Automation Specialist)</option>
                <option value="Er. Dinesh K (Electrical Engineer)">Er. Dinesh K (Electrical Engineer)</option>
                <option value="Er. Anandhan M (Pneumatics Lead)">Er. Anandhan M (Pneumatics Lead)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Planned Installation Date</label>
              <input
                type="date"
                value={formData.plannedInstallationDate}
                onChange={(e) => setFormData({ ...formData, plannedInstallationDate: e.target.value })}
                className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Required Tools & Specialized Equipment</label>
            <input
              type="text"
              value={formData.requiredTools}
              onChange={(e) => setFormData({ ...formData, requiredTools: e.target.value })}
              className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Pre-Installation Site Instructions</label>
            <textarea
              rows="2"
              value={formData.installationInstructions}
              onChange={(e) => setFormData({ ...formData, installationInstructions: e.target.value })}
              className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/20 transition"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Installation Details - ${selectedItem.installationNumber}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Status</span>
                <div className="mt-1"><StatusBadge status={selectedItem.status} /></div>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Delivery Ref</span>
                <div className="text-sm font-mono text-cyan-400 font-bold mt-1">{selectedItem.deliveryNumber}</div>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">SO Reference</span>
                <div className="text-sm font-mono text-slate-200 mt-1">{selectedItem.soNumber || 'N/A'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-500 uppercase block font-semibold mb-1">Customer & Location</span>
                <div className="text-slate-200 font-medium text-sm">{selectedItem.customerName}</div>
                <div className="text-slate-400 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{selectedItem.installationAddress}</span>
                </div>
                <div className="text-slate-400 mt-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{selectedItem.contactPerson} ({selectedItem.mobileNumber})</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-500 uppercase block font-semibold mb-1">Equipment & Tech</span>
                <div className="text-slate-200 font-medium text-sm">{selectedItem.productName}</div>
                <div className="text-cyan-400 font-mono mt-1">SN: {selectedItem.serialNumber} (Qty: {selectedItem.installationQuantity})</div>
                <div className="text-slate-400 mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{selectedItem.assignedTechnician}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs">
              <span className="text-slate-500 uppercase block font-semibold mb-1">Required Tools</span>
              <div className="text-slate-300 font-mono text-[11px]">{selectedItem.requiredTools || 'Standard tool kit'}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs">
              <span className="text-slate-500 uppercase block font-semibold mb-1">Instructions</span>
              <div className="text-slate-300">{selectedItem.installationInstructions || 'None'}</div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

