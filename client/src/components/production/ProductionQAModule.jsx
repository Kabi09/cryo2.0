import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { ShieldCheck, Plus, Trash2, CheckCircle2, AlertTriangle, RotateCcw, Eye, ArrowRight, PackageCheck } from 'lucide-react';

export default function ProductionQAModule({
  qaTests = [],
  allQaTests = [],
  workOrders = [],
  completions = [],
  preSelectedCompletion = null,
  onClearPreSelectedCompletion,
  onSave,
  onNavigateToRework,
  onNavigateToFG,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQA, setSelectedQA] = useState(null);

  const [formData, setFormData] = useState({
    workOrder: '',
    workOrderNumber: '',
    completion: '',
    completionNumber: '',
    product: '',
    productName: '',
    batchSerialNumber: 'BATCH-MA-001',
    testedQuantity: 10,
    passedQuantity: 10,
    failedQuantity: 0,
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

  useEffect(() => {
    if (preSelectedCompletion) {
      handleSelectCompletion(preSelectedCompletion._id);
      setIsModalOpen(true);
      onClearPreSelectedCompletion?.();
    }
  }, [preSelectedCompletion]);

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

    // Auto-update overall result if any test parameter fails
    const hasFail = updated.some(p => p.result === 'Fail');
    const overall = hasFail ? 'Fail' : 'Pass';
    const dec = hasFail ? 'Rework' : 'Finished Goods';

    setFormData(prev => ({
      ...prev,
      testParameters: updated,
      overallResult: overall,
      decision: dec
    }));
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
        showToast('QA Inspection recorded! Defective units routed to Rework & Repair bay.', 'warning');
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
      render: (row) => (
        <span
          className="code-badge"
          style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }}
          onClick={() => setSelectedQA(row)}
        >
          {row.qaNumber}
        </span>
      )
    },
    {
      header: 'WO No',
      accessor: 'workOrderNumber',
      render: (row) => <span className="font-mono">{row.workOrderNumber || 'WO-001'}</span>
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName || 'Cryo Unit'
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
      render: (row) => (row.testDate ? new Date(row.testDate).toLocaleDateString('en-GB') : '-')
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
    },
    {
      header: 'Actions',
      render: (row) => {
        const isPassed = row.overallResult === 'Pass' || row.decision === 'Finished Goods';
        return (
          <div className="action-btns" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="icon-btn"
              title="View Test Parameters & Report"
              onClick={() => setSelectedQA(row)}
            >
              <Eye size={15} />
            </button>
            {isPassed && onNavigateToFG && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4, color: 'var(--success)', borderColor: 'var(--success-border)' }}
                title="Transfer Approved Units to Finished Goods"
                onClick={() => onNavigateToFG(row)}
              >
                <PackageCheck size={12} /> Send to FG ➔
              </button>
            )}
            {!isPassed && onNavigateToRework && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', height: 26, gap: 4, color: 'var(--warning)', borderColor: 'var(--warning-border)' }}
                title="Send Defective Units for Rework"
                onClick={() => onNavigateToRework(row)}
              >
                <RotateCcw size={12} /> Rework ➔
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="module-container">
      {/* QA Decision Branches Visual */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(99, 102, 241, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <strong style={{ fontSize: '0.86rem' }}>Quality Assurance Decision Tree:</strong>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Pass → <span style={{ color: 'var(--success)', fontWeight: 700 }}>Finished Goods Warehouse</span> |
                Fail → <span style={{ color: 'var(--warning)', fontWeight: 700 }}>Rework & Re-Test Loop</span> |
                Reject → <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Engineering Review</span>
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

      {/* Modal: New QA Test */}
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
              <div className="form-group col-span-2">
                <label className="form-label">Select Production Completion Batch <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={formData.completion}
                  onChange={(e) => handleSelectCompletion(e.target.value)}
                  required
                >
                  <option value="">Select Completed Production Batch</option>
                  {completions.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.completionNumber} — {c.workOrderNumber} ({c.productName}) • [{c.producedQuantity} Units Produced]
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Batch Serial Number <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.batchSerialNumber}
                  onChange={(e) => setFormData({ ...formData, batchSerialNumber: e.target.value })}
                  placeholder="e.g. BATCH-MA-001"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inspector Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.inspectorName}
                  onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Tested Quantity <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={formData.testedQuantity}
                  onChange={(e) => {
                    const tested = Number(e.target.value);
                    setFormData({
                      ...formData,
                      testedQuantity: tested,
                      passedQuantity: Math.min(tested, formData.passedQuantity),
                      failedQuantity: Math.max(0, tested - formData.passedQuantity)
                    });
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Passed Quantity <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max={formData.testedQuantity}
                  value={formData.passedQuantity}
                  onChange={(e) => {
                    const passed = Number(e.target.value);
                    const failed = Math.max(0, formData.testedQuantity - passed);
                    setFormData({
                      ...formData,
                      passedQuantity: passed,
                      failedQuantity: failed,
                      overallResult: failed > 0 ? 'Fail' : 'Pass',
                      decision: failed > 0 ? 'Rework' : 'Finished Goods'
                    });
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inspection Date <span className="req">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.testDate}
                  onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Overall QA Result</label>
                <select
                  className="form-select"
                  value={formData.overallResult}
                  onChange={(e) => {
                    const res = e.target.value;
                    setFormData({
                      ...formData,
                      overallResult: res,
                      decision: res === 'Pass' ? 'Finished Goods' : 'Rework'
                    });
                  }}
                >
                  <option value="Pass">Pass (Meets Benchmarks)</option>
                  <option value="Fail">Fail (Requires Rework)</option>
                  <option value="Conditional Pass">Conditional Pass</option>
                </select>
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">QA Disposition Decision</label>
                <select
                  className="form-select"
                  value={formData.decision}
                  onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
                >
                  <option value="Finished Goods">Route to Finished Goods Warehouse</option>
                  <option value="Rework">Route to Rework / Repair Bay</option>
                  <option value="Scrap">Scrap / Material Reclaim</option>
                </select>
              </div>
            </div>

            {/* Test Parameter Checklist */}
            <div style={{ marginTop: 18, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Inspection Test Parameters & Engineering Benchmarks:</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  onClick={handleAddParam}
                >
                  + Add Check
                </button>
              </div>

              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Test Parameter</th>
                      <th>Expected Value / Standard</th>
                      <th>Observed Value</th>
                      <th style={{ width: 100 }}>Result</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.testParameters.map((p, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            value={p.parameter}
                            onChange={(e) => handleParamChange(idx, 'parameter', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            value={p.expected}
                            onChange={(e) => handleParamChange(idx, 'expected', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            value={p.actual}
                            onChange={(e) => handleParamChange(idx, 'actual', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={p.result}
                            onChange={(e) => handleParamChange(idx, 'result', e.target.value)}
                          >
                            <option value="Pass">Pass</option>
                            <option value="Fail">Fail</option>
                          </select>
                        </td>
                        <td>
                          {formData.testParameters.length > 1 && (
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => handleRemoveParam(idx)}
                              title="Remove"
                            >
                              <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20, padding: '16px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Certify QA Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View QA Test Report Details */}
      {selectedQA && (
        <Modal
          title={`QA Inspection Certificate: ${selectedQA.qaNumber}`}
          subtitle={`Inspection report for Work Order ${selectedQA.workOrderNumber}`}
          isOpen={!!selectedQA}
          onClose={() => setSelectedQA(null)}
          size="lg"
        >
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">QA Certificate No</div>
                <div className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedQA.qaNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Overall Result</div>
                <div className="detail-value"><StatusBadge status={selectedQA.overallResult || 'Pass'} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Work Order Ref</div>
                <div className="detail-value">{selectedQA.workOrderNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Target Product</div>
                <div className="detail-value">{selectedQA.productName || 'Cryo Unit'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Batch Serial No</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{selectedQA.batchSerialNumber || 'STANDARD-BATCH'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Inspector</div>
                <div className="detail-value">{selectedQA.inspectorName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Tested vs Passed</div>
                <div className="detail-value" style={{ fontWeight: 600 }}>
                  {selectedQA.testedQuantity} Tested • <span style={{ color: 'var(--success)' }}>{selectedQA.passedQuantity} Passed</span>
                  {selectedQA.failedQuantity > 0 && <span style={{ color: 'var(--danger)', marginLeft: 6 }}>({selectedQA.failedQuantity} Failed)</span>}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Inspection Date</div>
                <div className="detail-value">{selectedQA.testDate ? new Date(selectedQA.testDate).toLocaleDateString('en-GB') : '-'}</div>
              </div>
            </div>

            {/* Test Parameters */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                Certified Engineering Check Results:
              </div>
              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Test Parameter</th>
                      <th>Specification Standard</th>
                      <th>Observed Value</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedQA.testParameters || []).map((tp, idx) => (
                      <tr key={idx}>
                        <td><strong>{tp.parameter}</strong></td>
                        <td>{tp.expected}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{tp.actual}</td>
                        <td><StatusBadge status={tp.result || 'Pass'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedQA(null)}
              >
                Close Report
              </button>
              {(selectedQA.overallResult === 'Pass' || selectedQA.decision === 'Finished Goods') && onNavigateToFG && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const qa = selectedQA;
                    setSelectedQA(null);
                    onNavigateToFG(qa);
                  }}
                >
                  <PackageCheck size={14} /> Send to Finished Goods ➔
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
