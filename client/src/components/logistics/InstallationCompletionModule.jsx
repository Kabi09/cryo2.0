import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileCheck, 
  User, 
  Calendar, 
  Wrench, 
  ShieldCheck, 
  Plus, 
  Trash2,
  FileText
} from 'lucide-react';

export default function InstallationCompletionModule({
  completions = [],
  installations = [],
  onSave,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    installation: '',
    installationNumber: '',
    customer: '',
    customerName: '',
    product: '',
    productName: '',
    serialNumber: '',
    technician: '',
    installationDate: new Date().toISOString().split('T')[0],
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
      { parameter: 'Input Voltage Stability', expectedValue: '415V ±5%', actualValue: '414.2V', result: 'Pass', defectDescription: '', correctiveAction: '' },
      { parameter: 'Cooling Chamber Temp', expectedValue: '< -80°C', actualValue: '-82.4°C', result: 'Pass', defectDescription: '', correctiveAction: '' },
      { parameter: 'PLC Communication Ping', expectedValue: '< 5ms', actualValue: '2ms', result: 'Pass', defectDescription: '', correctiveAction: '' }
    ],
    customerConfirmation: {
      customerName: '',
      customerFeedback: 'All systems verified in full operational state. Team received operator manual & initial training.',
      customerSignature: 'Confirmed & Accepted by Lead Engineer',
      technicianSignature: 'Signed by Certified Field Tech'
    },
    remarks: ''
  });

  const handleOpenModal = () => {
    // Select first installation if available
    if (installations.length > 0 && !formData.installation) {
      handleSelectInstallation(installations[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectInstallation = (instId) => {
    const inst = installations.find(i => i._id === instId);
    if (!inst) return;

    setFormData(prev => ({
      ...prev,
      installation: inst._id,
      installationNumber: inst.installationNumber,
      customer: inst.customer?._id || inst.customer || '',
      customerName: inst.customerName,
      product: inst.product?._id || inst.product || '',
      productName: inst.productName,
      serialNumber: inst.serialNumber,
      technician: inst.assignedTechnician,
      customerConfirmation: {
        ...prev.customerConfirmation,
        customerName: inst.contactPerson || inst.customerName
      }
    }));
  };

  const handleChecklistChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: value
      }
    }));
  };

  const handleAddTestRow = () => {
    setFormData(prev => ({
      ...prev,
      testingDetails: [
        ...prev.testingDetails,
        { parameter: '', expectedValue: '', actualValue: '', result: 'Pass', defectDescription: '', correctiveAction: '' }
      ]
    }));
  };

  const handleRemoveTestRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      testingDetails: prev.testingDetails.filter((_, i) => i !== idx)
    }));
  };

  const handleTestRowChange = (idx, field, value) => {
    const updated = [...formData.testingDetails];
    updated[idx][field] = value;
    setFormData(prev => ({ ...prev, testingDetails: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.installationNumber || !formData.customerName) {
      showToast?.('Please link an installation record', 'error');
      return;
    }

    try {
      await onSave?.(formData);
      setIsModalOpen(false);
      showToast?.('Installation completion report recorded successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Error recording installation completion', 'error');
    }
  };

  const checklistItems = [
    { key: 'productFixedProperly', label: '1. Machine Bed & Structural Base Fixed Properly' },
    { key: 'electricalConnection', label: '2. 3-Phase Electrical Wiring & Grounding Safe' },
    { key: 'powerSupplyTest', label: '3. Regulated Power Supply & Surge Protection Test' },
    { key: 'sensorConnection', label: '4. Cryo Sensor & Thermocouple Calibrations Verified' },
    { key: 'temperatureTest', label: '5. Operating Chamber Temperature Pulldown Test' },
    { key: 'softwareConfiguration', label: '6. Embedded Firmware & HMI Profile Setup Complete' },
    { key: 'overallWorkingCondition', label: '7. Overall Functional Operation & Emergency Stop Test' }
  ];

  // Helper to count passed checkpoints
  const getPassCount = (checklist) => {
    if (!checklist) return 0;
    return Object.values(checklist).filter(v => v === 'Pass').length;
  };

  const columns = [
    {
      header: 'COMPLETION NO',
      accessor: 'completionNumber',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-emerald-400 block">{row.completionNumber}</span>
            <span className="text-[10px] text-slate-400">Inst: {row.installationNumber}</span>
          </div>
        </div>
      )
    },
    {
      header: 'CUSTOMER & PRODUCT',
      accessor: 'customerName',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-200">{row.customerName}</div>
          <div className="text-[10px] text-cyan-400/80 font-mono">
            {row.productName} • SN: {row.serialNumber}
          </div>
        </div>
      )
    },
    {
      header: 'TECHNICIAN',
      accessor: 'technician',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-300 truncate max-w-[140px]">{row.technician}</span>
        </div>
      )
    },
    {
      header: 'CHECKLIST',
      accessor: 'checklist',
      render: (row) => {
        const passed = getPassCount(row.checklist);
        const isPerfect = passed === 7;
        return (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
              isPerfect 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {passed}/7 Pass
            </span>
          </div>
        );
      }
    },
    {
      header: 'OVERALL RESULT',
      accessor: 'overallResult',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          row.overallResult === 'Pass'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {row.overallResult === 'Pass' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {row.overallResult}
        </span>
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
        <button
          onClick={() => {
            setSelectedItem(row);
            setIsViewModalOpen(true);
          }}
          className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
        >
          View Report
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ClipboardCheck className="w-6 h-6" />
            </span>
            Installation Completion & Quality Sign-Off
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Mandatory 7-point technical verification checklist, functional telemetry, and customer sign-off protocol
          </p>
        </div>

        {/* Single Add Button */}
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
        >
          <ClipboardCheck className="w-4 h-4" />
          + Record Completion Report
        </button>
      </div>

      {/* Main DataTable */}
      <div className="bg-[#0E131F] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <DataTable
          columns={columns}
          data={completions}
          searchPlaceholder="Search completion reports, customer, serial, technician..."
        />
      </div>

      {/* Add / Record Completion Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Installation Completion Report"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Linked Installation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Link Installation Job <span className="text-emerald-400">*</span>
              </label>
              <select
                value={formData.installation}
                onChange={(e) => handleSelectInstallation(e.target.value)}
                className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="">-- Select Installation --</option>
                {installations.map(inst => (
                  <option key={inst._id} value={inst._id}>
                    {inst.installationNumber} - {inst.customerName} ({inst.productName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Lead Field Technician</label>
              <input
                type="text"
                value={formData.technician}
                onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Product & Customer Info Read-only Summary */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
            <div>
              <span className="text-slate-500 block">Customer</span>
              <span className="text-slate-200 font-semibold">{formData.customerName || 'None selected'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Equipment</span>
              <span className="text-slate-200 font-semibold">{formData.productName || 'None selected'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Serial Number</span>
              <span className="text-emerald-400 font-mono font-bold">{formData.serialNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Test Date</span>
              <span className="text-slate-300">{formData.installationDate}</span>
            </div>
          </div>

          {/* 7-Point Mandatory Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                7-Point Mandatory Quality Checklist
              </h3>
              <span className="text-[11px] text-slate-400">All 7 points must pass for successful commissioning</span>
            </div>

            <div className="bg-[#161D2E] border border-slate-800 rounded-xl p-3 divide-y divide-slate-800">
              {checklistItems.map((item) => (
                <div key={item.key} className="py-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChecklistChange(item.key, 'Pass')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        formData.checklist[item.key] === 'Pass'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChecklistChange(item.key, 'Fail')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        formData.checklist[item.key] === 'Fail'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Fail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Functional Parameter Testing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Functional Telemetry & Test Values
              </h3>
              <button
                type="button"
                onClick={handleAddTestRow}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Metric
              </button>
            </div>

            <div className="space-y-2">
              {formData.testingDetails.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#161D2E]/60 p-2 rounded-lg border border-slate-800">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Parameter (e.g. Temp)"
                      value={row.parameter}
                      onChange={(e) => handleTestRowChange(idx, 'parameter', e.target.value)}
                      className="w-full bg-[#0E131F] border border-slate-700/60 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Expected"
                      value={row.expectedValue}
                      onChange={(e) => handleTestRowChange(idx, 'expectedValue', e.target.value)}
                      className="w-full bg-[#0E131F] border border-slate-700/60 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Actual"
                      value={row.actualValue}
                      onChange={(e) => handleTestRowChange(idx, 'actualValue', e.target.value)}
                      className="w-full bg-[#0E131F] border border-slate-700/60 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <select
                      value={row.result}
                      onChange={(e) => handleTestRowChange(idx, 'result', e.target.value)}
                      className="bg-[#0E131F] border border-slate-700/60 rounded px-1.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                    {formData.testingDetails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTestRow(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Sign-off Section */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Customer Sign-Off & Acceptance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Customer Signatory Name</label>
                <input
                  type="text"
                  value={formData.customerConfirmation.customerName}
                  onChange={(e) => setFormData({
                    ...formData,
                    customerConfirmation: { ...formData.customerConfirmation, customerName: e.target.value }
                  })}
                  className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Customer Feedback / Observations</label>
                <input
                  type="text"
                  value={formData.customerConfirmation.customerFeedback}
                  onChange={(e) => setFormData({
                    ...formData,
                    customerConfirmation: { ...formData.customerConfirmation, customerFeedback: e.target.value }
                  })}
                  className="w-full bg-[#161D2E] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 transition"
            >
              Submit Completion Report
            </button>
          </div>
        </form>
      </Modal>

      {/* View Completion Report Modal */}
      {selectedItem && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Installation Report - ${selectedItem.completionNumber}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Overall Verdict</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    selectedItem.overallResult === 'Pass'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {selectedItem.overallResult === 'Pass' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {selectedItem.overallResult === 'Pass' ? 'PASSED & COMMISSIONED' : 'FAILED - RETEST REQUIRED'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Job Reference</span>
                <div className="text-sm font-mono text-cyan-400 font-bold mt-1">{selectedItem.installationNumber}</div>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Sign-off Status</span>
                <div className="mt-1"><StatusBadge status={selectedItem.status} /></div>
              </div>
            </div>

            {/* Checklist Results */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Checkpoints Result
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {checklistItems.map(item => {
                  const passed = selectedItem.checklist?.[item.key] === 'Pass';
                  return (
                    <div key={item.key} className="flex items-center justify-between p-2 rounded bg-[#161D2E]/40 border border-slate-800/60">
                      <span className="text-slate-300">{item.label}</span>
                      <span className={`font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test Telemetry */}
            {selectedItem.testingDetails && selectedItem.testingDetails.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-3">Live Test Parameters</h4>
                <div className="space-y-1.5 text-xs">
                  {selectedItem.testingDetails.map((td, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-[#161D2E]/40">
                      <span className="text-slate-300 font-medium">{td.parameter}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">Exp: {td.expectedValue}</span>
                        <span className="text-cyan-400 font-mono">Act: {td.actualValue}</span>
                        <span className={td.result === 'Pass' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {td.result}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Signatures */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                <span className="text-slate-500 uppercase block font-semibold mb-1">Customer Sign-Off</span>
                <div className="text-slate-200 font-semibold">{selectedItem.customerConfirmation?.customerName || selectedItem.customerName}</div>
                <div className="text-slate-400 italic text-[11px] mt-1">"{selectedItem.customerConfirmation?.customerFeedback}"</div>
                <div className="text-emerald-400 font-mono text-[11px] mt-2 border-t border-slate-800 pt-1">
                  ✓ {selectedItem.customerConfirmation?.customerSignature}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                <span className="text-slate-500 uppercase block font-semibold mb-1">Service Engineer Sign-Off</span>
                <div className="text-slate-200 font-semibold">{selectedItem.technician}</div>
                <div className="text-slate-400 text-[11px] mt-1">Commissioning Engineer / Quality Inspector</div>
                <div className="text-cyan-400 font-mono text-[11px] mt-2 border-t border-slate-800 pt-1">
                  ✓ {selectedItem.customerConfirmation?.technicianSignature}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

