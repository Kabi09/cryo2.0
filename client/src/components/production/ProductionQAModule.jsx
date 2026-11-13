import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { ShieldCheck, Plus, Trash2, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

export default function ProductionQAModule({
  qaTests = [],
  workOrders = [],
  completions = [],
  onSave,
  onNavigateToRework,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workOrder: '',
    workOrderNumber: '',
    completion: '',
    completionNumber: '',
    product: '',
    productName: '',
    batchSerialNumber: 'BATCH-MA-001',
    testedQuantity: 10,
    passedQuantity: 8,
    failedQuantity: 2,
    inspectorName: 'Devanathan (Senior QA Engineer)',
    testDate: new Date().toISOString().split('T')[0],
    testParameters: [
      { parameter: 'Sensor Calibration', expected: 'Working +/- 0.01mm', actual: 'Working', result: 'Pass' },
      { parameter: 'Heat & Thermal Load Test', expected: '< 55°C', actual: '48°C (Normal)', result: 'Pass' },
      { parameter: 'Motor RPM & Torque', expected: '3000 RPM @ 45Nm', actual: '3000 RPM @ 45Nm', result: 'Pass' },
      { parameter: 'Electrical Insulation & Earth', expected: '> 100 MΩ', actual: '150 MΩ', result: 'Pass' },
      { parameter: 'Overall Mechanical Function', expected: 'Smooth operation', actual: 'Smooth operation', result: 'Pass' }
    ],
    overallResult: 'Pass',
    decision: 'Finished Goods',
    defectDescription: '',
    failureReason: '',
    remarks: 'Product passes all mechanical, electrical, and sensor quality benchmarks.'
  });

  const handleOpenModal = () => {
    if (completions.length > 0 && !formData.completion) {
      handleSelectCompletion(completions[0]._id);
    }
    setIsModalOpen(true);
  };

  const handleSelectCompletion = (compId) => {
    const comp = completions.find(c => c._id === compId);
    if (!comp) return;

    setFormData(prev => ({
      ...prev,
      completion: comp._id,
      completionNumber: comp.completionNumber,
      workOrder: comp.workOrder?._id || comp.workOrder,
      workOrderNumber: comp.workOrderNumber,
      product: comp.product?._id || comp.product,
      productName: comp.productName,
      testedQuantity: comp.producedQuantity || 10,
      passedQuantity: comp.producedQuantity || 10,
      failedQuantity: 0
    }));
  };

  const handleAddParam = () => {
    setFormData(prev => ({
      ...prev,
      testParameters: [
        ...prev.testParameters,
        { parameter: 'Functional Check', expected: 'Normal', actual: 'Normal', result: 'Pass' }
      ]
    }));
  };

  const handleRemoveParam = (idx) => {
    setFormData(prev => ({
      ...prev,
      testParameters: prev.testParameters.filter((_, i) => i !== idx)
    }));
  };

  const handleParamChange = (idx, field, val) => {
    const updated = [...formData.testParameters];
    updated[idx] = { ...updated[idx], [field]: val };
    setFormData(prev => ({ ...prev, testParameters: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workOrder) {
      showToast('Please select a Work Order or Completion record', 'error');
      return;
    }

    try {
      await onSave(formData);
      setIsModalOpen(false);
      if (formData.decision === 'Rework') {
        showToast('QA Inspection recorded! Defective units routed automatically to Rework/Rebuild bay.', 'warning');
      } else {
        showToast('QA Passed! Product approved for Finished Goods warehouse storage.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Error saving QA test', 'error');
    }
  };

  const columns = [
    {
      header: 'QA No',
      accessor: 'qaNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.qaNumber}</span>
    },
    {
      header: 'WO No',
      accessor: 'workOrderNumber',
      render: (row) => <span className="font-mono">{row.workOrderNumber || 'WO-001'}</span>
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName
    },
    {
      header: 'Tested / Passed',
      accessor: 'testedQuantity',
      render: (row) => (
        <span>
          <strong>{row.testedQuantity} Tested</strong> | <span style={{ color: 'var(--success)' }}>{row.passedQuantity} Pass</span>
          {row.failedQuantity > 0 && <span style={{ color: 'var(--danger)', marginLeft: 6 }}>({row.failedQuantity} Fail)</span>}
        </span>
      )
    },
    {
      header: 'Inspector',
      accessor: 'inspectorName',
      render: (row) => row.inspectorName
    },
    {
      header: 'Test Date',
      accessor: 'testDate',
      render: (row) => (row.testDate ? new Date(row.testDate).toLocaleDateString() : '-')
    },
    {
      header: 'Result',
      accessor: 'overallResult',
      render: (row) => <StatusBadge status={row.overallResult || 'Pass'} />
    },
    {
      header: 'Decision',
      accessor: 'decision',
      render: (row) => <StatusBadge status={row.decision || 'Finished Goods'} />
    }
  ];

  return (
    <div className="module-container">
      {/* QA Decision Branches Visual */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(99, 102, 241, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={20} style={{ color: 'var(--cyan)' }} />
            <div>
              <strong style={{ fontSize: '0.86rem' }}>Quality Assurance Decision Tree:</strong>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Pass → <span style={{ color: 'var(--success)', fontWeight: 700 }}>Finished Goods Stock</span> |
                Fail → <span style={{ color: 'var(--warning)', fontWeight: 700 }}>Rework & Re-QA Cycle</span> |
                Reject → <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Scrap Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        title="Quality Assurance (QA) Inspection"
        subtitle="Electrical, mechanical, thermal, and sensor calibration testing before warehouse dispatch"
        columns={columns}
        data={qaTests}
        onAdd={handleOpenModal}
        addLabel="New QA Test"
      />

      {isModalOpen && (
        <Modal
          title="Product Quality Assurance (QA) Test"
          subtitle="Audit finished batches against engineering tolerances, function testing, and defect classification"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Select Production Completion</label>
                <select
                  value={formData.completion}
                  onChange={(e) => handleSelectCompletion(e.target.value)}
                  required
                >
                  <option value="">Select Completion Batch</option>
                  {completions.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.completionNumber} - {c.workOrderNumber} ({c.productName}) - {c.producedQuantity} Units
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={formData.productName}
                  readOnly
                  style={{ opacity: 0.8 }}
                />
              </div>

              <div className="form-group">
                <label>Batch / Serial Number</label>
                <input
                  type="text"
                  value={formData.batchSerialNumber}
                  onChange={(e) => setFormData({ ...formData, batchSerialNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tested Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.testedQuantity}
                  onChange={(e) => setFormData({ ...formData, testedQuantity: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Passed Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.passedQuantity}
                  onChange={(e) => {
                    const pass = Number(e.target.value);
                    const tested = Number(formData.testedQuantity);
                    const fail = Math.max(0, tested - pass);
                    setFormData({
                      ...formData,
                      passedQuantity: pass,
                      failedQuantity: fail,
                      overallResult: fail === 0 ? 'Pass' : pass === 0 ? 'Fail' : 'Partial Pass',
                      decision: fail === 0 ? 'Finished Goods' : 'Rework'
                    });
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Failed Quantity (Auto)</label>
                <input
                  type="number"
                  value={formData.failedQuantity}
                  readOnly
                  style={{
                    opacity: 0.8,
                    color: formData.failedQuantity > 0 ? 'var(--danger)' : 'var(--success)',
                    fontWeight: 700
                  }}
                />
              </div>

              <div className="form-group">
                <label>QA Inspector Name</label>
                <input
                  type="text"
                  value={formData.inspectorName}
                  onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Test Date</label>
                <input
                  type="date"
                  value={formData.testDate}
                  onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Test Parameter Multi-Rows */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Detailed Quality & Calibration Parameters
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddParam}
                >
                  <Plus size={14} /> Add Parameter
                </button>
              </div>

              <table className="custom-table" style={{ fontSize: '0.78rem' }}>
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Test Parameter</th>
                    <th style={{ width: '25%' }}>Expected Value</th>
                    <th style={{ width: '25%' }}>Actual Measured</th>
                    <th style={{ width: '15%' }}>Result</th>
                    <th style={{ width: '10%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.testParameters.map((p, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          value={p.parameter}
                          onChange={(e) => handleParamChange(idx, 'parameter', e.target.value)}
                          placeholder="e.g. Sensor, Heat Test"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={p.expected}
                          onChange={(e) => handleParamChange(idx, 'expected', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={p.actual}
                          onChange={(e) => handleParamChange(idx, 'actual', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <select
                          value={p.result}
                          onChange={(e) => handleParamChange(idx, 'result', e.target.value)}
                          style={{ color: p.result === 'Pass' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}
                        >
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-icon btn-sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleRemoveParam(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final QA Decision */}
            <div className="form-grid" style={{ marginTop: 18 }}>
              <div className="form-group">
                <label>Overall QA Result</label>
                <select
                  value={formData.overallResult}
                  onChange={(e) => setFormData({ ...formData, overallResult: e.target.value })}
                >
                  <option value="Pass">Pass (All Parameters Cleared)</option>
                  <option value="Partial Pass">Partial Pass (Some Units Failed)</option>
                  <option value="Fail">Fail (Critical Defect)</option>
                </select>
              </div>

              <div className="form-group">
                <label>QA Final Decision</label>
                <select
                  value={formData.decision}
                  onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
                  style={{ fontWeight: 700 }}
                >
                  <option value="Finished Goods">Approve for Finished Goods Warehouse</option>
                  <option value="Rework">Send Failed Units for Rework / Rebuild</option>
                  <option value="Reject / Scrap">Permanently Scrap / Engineering Review</option>
                </select>
              </div>

              {formData.failedQuantity > 0 && (
                <>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ color: 'var(--danger)' }}>Defect Description & Failure Reason</label>
                    <textarea
                      rows="2"
                      value={formData.defectDescription}
                      onChange={(e) => setFormData({ ...formData, defectDescription: e.target.value, failureReason: e.target.value })}
                      placeholder="Specify thermal trip, sensor deviation, loose connection for rework technician..."
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Inspector Final Remarks</label>
                <textarea
                  rows="2"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0', background: 'transparent' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save QA Decision & Route Batch
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

