import React, { useState, useEffect } from 'react';
import { Plus, Eye, ShieldCheck, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import KpiCard from '../common/KpiCard';

export default function QCTestsModule({ qcTests, grns, onSave, showToast, preSelectedGRN }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedQC, setSelectedQC] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    qcNumber: '',
    grn: '',
    material: '',
    supplier: '',
    batchNumber: '',
    receivedQuantity: 0,
    testedQuantity: 0,
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    testDate: new Date().toISOString().split('T')[0],
    inspectorName: 'Anand Kumar (Sr QC Lead)',
    overallResult: 'Pass',
    remarks: '',
    parameters: [
      { parameter: 'Thickness / Dimension Check', standard: 'Standard Drawing Tolerance', actual: 'Verified within +/- 0.02', result: 'Pass' },
      { parameter: 'Visual Surface Finish', standard: 'Clean & Defect-Free', actual: 'Verified clean', result: 'Pass' },
      { parameter: 'Physical / Tensile Test', standard: 'Meets Specification Standard', actual: 'Passed load test', result: 'Pass' }
    ]
  });

  useEffect(() => {
    if (preSelectedGRN) {
      handleOpenAdd(preSelectedGRN);
    }
  }, [preSelectedGRN]);

  const handleOpenAdd = (targetGRN = null) => {
    // Look for QC Pending GRNs
    const pendingGRNs = grns.filter(g => g.status === 'QC Pending');
    const grnObj = targetGRN || pendingGRNs[0] || grns[0];

    const firstItem = grnObj?.items?.[0];
    const recQty = firstItem?.currentReceivedQty || 100;

    setFormData({
      qcNumber: '',
      grn: grnObj?._id || '',
      material: firstItem?.material?._id || firstItem?.material || '',
      supplier: grnObj?.supplier?._id || grnObj?.supplier || '',
      batchNumber: firstItem?.batchNumber || 'BAT-001',
      receivedQuantity: recQty,
      testedQuantity: recQty,
      acceptedQuantity: recQty,
      rejectedQuantity: 0,
      testDate: new Date().toISOString().split('T')[0],
      inspectorName: 'Anand Kumar (Sr QC Lead)',
      overallResult: 'Pass',
      remarks: 'All quality inspection parameters meet manufacturing specifications.',
      parameters: [
        { parameter: 'Thickness / Dimension Check', standard: 'Standard Drawing Tolerance', actual: 'Verified within +/- 0.02', result: 'Pass' },
        { parameter: 'Visual Surface Finish', standard: 'Clean & Defect-Free', actual: 'Verified clean', result: 'Pass' },
        { parameter: 'Physical / Tensile Test', standard: 'Meets Specification Standard', actual: 'Passed load test', result: 'Pass' }
      ]
    });
    setIsAddOpen(true);
  };

  const handleGRNChange = (grnId) => {
    const grnObj = grns.find(g => g._id === grnId);
    if (!grnObj) return;

    const firstItem = grnObj.items?.[0];
    const recQty = firstItem?.currentReceivedQty || 0;

    setFormData({
      ...formData,
      grn: grnId,
      material: firstItem?.material?._id || firstItem?.material || '',
      supplier: grnObj.supplier?._id || grnObj.supplier || '',
      batchNumber: firstItem?.batchNumber || 'BAT-001',
      receivedQuantity: recQty,
      testedQuantity: recQty,
      acceptedQuantity: recQty,
      rejectedQuantity: 0
    });
  };

  const handleAcceptedChange = (val) => {
    const accepted = Number(val) || 0;
    const tested = Number(formData.testedQuantity) || 0;
    const rejected = Math.max(0, tested - accepted);

    let result = 'Pass';
    if (rejected === 0) result = 'Pass';
    else if (accepted === 0) result = 'Reject';
    else result = 'Partial Pass';

    setFormData({
      ...formData,
      acceptedQuantity: accepted,
      rejectedQuantity: rejected,
      overallResult: result
    });
  };

  const handleParameterChange = (index, field, value) => {
    const newParams = [...formData.parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setFormData({ ...formData, parameters: newParams });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.grn) {
        showToast('Please select a GRN to inspect', 'error');
        return;
      }
      await onSave(formData);
      showToast(
        `QC Test saved! Approved ${formData.acceptedQuantity} added to Inventory. ${formData.rejectedQuantity} queued for returns.`,
        'success'
      );
      setIsAddOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'QC Report No',
      accessor: 'qcNumber',
      render: (row) => (
        <span 
          className="code-badge" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedQC(row);
          }}
        >
          {row.qcNumber}
        </span>
      )
    },
    {
      header: 'GRN Ref',
      accessor: 'grn',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', color: '#60A5FA' }}>
          {row.grn?.grnNumber || '—'}
        </span>
      )
    },
    {
      header: 'Material',
      accessor: 'material',
      render: (row) => (
        <div>
          <strong style={{ color: '#fff' }}>{row.material?.materialName || '—'}</strong>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Batch: {row.batchNumber}</div>
        </div>
      )
    },
    {
      header: 'Tested Qty',
      accessor: 'testedQuantity',
      render: (row) => `${row.testedQuantity} ${row.material?.unit || ''}`
    },
    {
      header: 'Accepted Stock',
      accessor: 'acceptedQuantity',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
          +{row.acceptedQuantity} {row.material?.unit || ''}
        </span>
      )
    },
    {
      header: 'Rejected Qty',
      accessor: 'rejectedQuantity',
      render: (row) => row.rejectedQuantity > 0 ? (
        <span style={{ fontWeight: 700, color: '#F87171', fontFamily: 'var(--font-mono)' }}>
          {row.rejectedQuantity} {row.material?.unit || ''}
        </span>
      ) : (
        <span style={{ color: 'var(--text-muted)' }}>0</span>
      )
    },
    {
      header: 'QC Result',
      accessor: 'overallResult',
      render: (row) => <StatusBadge status={row.overallResult} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-btns" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" title="View QC Certificate" onClick={() => setSelectedQC(row)}>
            <Eye size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total QC Inspections" value={qcTests.length} subtext="Batch Quality Checks" icon={ShieldCheck} color="#3B82F6" />
        <KpiCard title="Passed Quality" value={qcTests.filter(q => q.overallResult === 'Pass').length} subtext="100% Accepted" icon={CheckCircle} color="#10B981" />
        <KpiCard title="Partial / Rejected" value={qcTests.filter(q => q.overallResult !== 'Pass').length} subtext="Discrepancies Noted" icon={AlertTriangle} color="#F59E0B" />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={qcTests}
        searchPlaceholder="Search QC number, GRN, or material..."
        actions={
          <button className="btn btn-primary" onClick={() => handleOpenAdd()}>
            <Plus size={16} /> New Quality Test
          </button>
        }
      />

      {/* Create QC Test Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Execute Quality Inspection (QC)"
        subtitle="Test raw materials, record parameter measurements, and route accepted stock to inventory"
      >
        <form onSubmit={handleSubmit}>
          {/* Reference Info */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA', marginBottom: 12 }}>
            Section 1: Inspection & Batch Reference
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">QC Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. QC-2026-002)"
                value={formData.qcNumber}
                onChange={(e) => setFormData({ ...formData, qcNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GRN Reference <span className="req">*</span></label>
              <select
                className="form-select"
                required
                value={formData.grn}
                onChange={(e) => handleGRNChange(e.target.value)}
              >
                <option value="">Select Inward GRN</option>
                {grns.map(g => (
                  <option key={g._id} value={g._id}>
                    {g.grnNumber} — {g.supplier?.supplierName} ({g.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Batch / Lot Number</label>
              <input
                type="text"
                className="form-input"
                readOnly
                value={formData.batchNumber}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Inspector Name <span className="req">*</span></label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.inspectorName}
                onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
              />
            </div>
          </div>

          {/* Quantitative Disposition */}
          <div style={{ margin: '20px 0 10px', fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA' }}>
            Section 2: Quantity Disposition (Stock Routing)
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Total Inward Quantity</label>
              <input
                type="number"
                readOnly
                className="form-input"
                value={formData.receivedQuantity}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tested Sample / Batch Qty <span className="req">*</span></label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                className="form-input"
                value={formData.testedQuantity}
                onChange={(e) => {
                  const tested = Number(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    testedQuantity: tested,
                    acceptedQuantity: tested,
                    rejectedQuantity: 0,
                    overallResult: 'Pass'
                  });
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Accepted Quantity <span className="req">*</span> (Credits to Inventory Stock)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                className="form-input"
                style={{ borderColor: '#10B981', color: '#34D399', fontWeight: 700 }}
                value={formData.acceptedQuantity}
                onChange={(e) => handleAcceptedChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Rejected Quantity (Routes to Supplier Returns)
              </label>
              <input
                type="number"
                readOnly
                className="form-input"
                style={{ borderColor: formData.rejectedQuantity > 0 ? '#EF4444' : 'var(--border-subtle)', color: '#F87171', fontWeight: 700 }}
                value={formData.rejectedQuantity}
              />
            </div>
          </div>

          {/* Parameters checklist */}
          <div style={{ margin: '20px 0 10px', fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA' }}>
            Section 3: Quality Parameters Checklist
          </div>

          <div className="subtable-box">
            <table className="subtable">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Parameter</th>
                  <th style={{ width: '30%' }}>Specification Standard</th>
                  <th style={{ width: '25%' }}>Observed / Actual</th>
                  <th style={{ width: '15%' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {formData.parameters.map((p, idx) => (
                  <tr key={idx}>
                    <td><strong>{p.parameter}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.standard}</td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '4px 8px' }}
                        value={p.actual}
                        onChange={(e) => handleParameterChange(idx, 'actual', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', color: p.result === 'Pass' ? '#34D399' : '#F87171' }}
                        value={p.result}
                        onChange={(e) => handleParameterChange(idx, 'result', e.target.value)}
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          <div style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Overall Inspection Verdict & Remarks</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Inspection notes, deviation approvals, lab test observations..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Approve QC & Post to Inventory
            </button>
          </div>
        </form>
      </Modal>

      {/* View QC Certificate Modal */}
      <Modal
        isOpen={!!selectedQC}
        onClose={() => setSelectedQC(null)}
        size="lg"
        title={`Quality Inspection Certificate: ${selectedQC?.qcNumber}`}
        subtitle={`GRN: ${selectedQC?.grn?.grnNumber}`}
      >
        {selectedQC && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">QC Report Number</div>
                <div className="detail-value">{selectedQC.qcNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Overall Verdict</div>
                <div className="detail-value"><StatusBadge status={selectedQC.overallResult} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Material</div>
                <div className="detail-value">{selectedQC.material?.materialName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Batch Number</div>
                <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{selectedQC.batchNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Accepted into Stock</div>
                <div className="detail-value" style={{ color: '#34D399' }}>
                  {selectedQC.acceptedQuantity} {selectedQC.material?.unit}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Rejected Quantity</div>
                <div className="detail-value" style={{ color: selectedQC.rejectedQuantity > 0 ? '#EF4444' : 'var(--text-muted)' }}>
                  {selectedQC.rejectedQuantity} {selectedQC.material?.unit}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Inspector</div>
                <div className="detail-value">{selectedQC.inspectorName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Test Date</div>
                <div className="detail-value">{new Date(selectedQC.testDate).toLocaleDateString('en-GB')}</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>Test Parameter Results:</div>
              <div className="subtable-box">
                <table className="subtable">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Standard Spec</th>
                      <th>Actual Measured</th>
                      <th>Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQC.parameters?.map((p, idx) => (
                      <tr key={idx}>
                        <td><strong>{p.parameter}</strong></td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.standard}</td>
                        <td>{p.actual}</td>
                        <td>
                          <span style={{ color: p.result === 'Pass' ? '#34D399' : '#EF4444', fontWeight: 600 }}>
                            {p.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remarks</div>
              <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: 4 }}>
                {selectedQC.remarks || 'Standard pass certificate issued.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

