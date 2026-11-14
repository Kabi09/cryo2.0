import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
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
  showToast,
  preSelectedInstallation
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (preSelectedInstallation) {
      handleSelectInstallation(preSelectedInstallation._id || preSelectedInstallation);
      setIsModalOpen(true);
    }
  }, [preSelectedInstallation]);

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

  const getPassCount = (checklist) => {
    if (!checklist) return 0;
    return Object.values(checklist).filter(v => v === 'Pass').length;
  };

  const columns = [
    {
      header: 'Completion No',
      accessor: 'completionNumber',
      render: (row) => <span className="font-mono text-cyan" style={{ fontWeight: 700 }}>{row.completionNumber}</span>
    },
    {
      header: 'Installation Ref',
      accessor: 'installationNumber',
      render: (row) => <span className="code-badge">{row.installationNumber}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.customerName}</strong>
    },
    {
      header: 'Equipment & Serial',
      accessor: 'productName',
      render: (row) => (
        <div>
          <span>{row.productName}</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
            SN: {row.serialNumber || 'N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'Lead Technician',
      accessor: 'technician',
      render: (row) => row.technician
    },
    {
      header: '7-Point Checklist',
      accessor: 'checklist',
      render: (row) => {
        const passed = getPassCount(row.checklist);
        return (
          <span className={`badge ${passed === 7 ? 'badge-success' : 'badge-danger'}`}>
            {passed} / 7 Pass
          </span>
        );
      }
    },
    {
      header: 'Overall Result',
      accessor: 'overallResult',
      render: (row) => (
        <span className={`badge ${row.overallResult === 'Pass' ? 'badge-success' : 'badge-danger'}`}>
          {row.overallResult === 'Pass' ? 'PASSED' : 'RETEST REQUIRED'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <button
          onClick={() => setSelectedItem(row)}
          className="btn btn-secondary btn-sm"
        >
          View Report
        </button>
      )
    }
  ];

  return (
    <div className="module-container">
      <DataTable
        title="Installation Completion & Quality Sign-Off"
        subtitle="Mandatory 7-point technical verification checklist, operational telemetry, and customer handover protocol"
        columns={columns}
        data={completions}
        onAdd={handleOpenModal}
        addLabel="Record Completion Report"
      />

      {/* Add Completion Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Installation Completion Report"
          subtitle="Mandatory 7-point technical verification protocol & mutual customer acceptance"
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Linked Job Details */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wrench size={16} /> 1. Installation Job Reference & Unit Particulars
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Link Scheduled Installation <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={formData.installation}
                      onChange={(e) => handleSelectInstallation(e.target.value)}
                      required
                    >
                      <option value="">Select Installation Record</option>
                      {installations.map(inst => (
                        <option key={inst._id} value={inst._id}>
                          {inst.installationNumber} — {inst.customerName} ({inst.productName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.customerName}
                      readOnly
                      style={{ opacity: 0.8 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.productName}
                      readOnly
                      style={{ opacity: 0.8 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Serial Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.serialNumber}
                      readOnly
                      style={{ opacity: 0.8, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lead Commissioning Engineer <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.technician}
                      onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 7-Point Mandatory Quality Checklist */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={16} /> 2. Mandatory 7-Point Quality Checklist
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>All 7 points must pass for commissioning</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {checklistItems.map((item) => (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-surface)',
                        borderRadius: 8,
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {item.label}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleChecklistChange(item.key, 'Pass')}
                          className={`btn btn-sm ${formData.checklist[item.key] === 'Pass' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            padding: '4px 12px',
                            background: formData.checklist[item.key] === 'Pass' ? '#10B981' : undefined,
                            borderColor: formData.checklist[item.key] === 'Pass' ? '#10B981' : undefined
                          }}
                        >
                          Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChecklistChange(item.key, 'Fail')}
                          className={`btn btn-sm ${formData.checklist[item.key] === 'Fail' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            padding: '4px 12px',
                            background: formData.checklist[item.key] === 'Fail' ? '#EF4444' : undefined,
                            borderColor: formData.checklist[item.key] === 'Fail' ? '#EF4444' : undefined
                          }}
                        >
                          Fail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Functional Telemetry Values */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    3. Functional Telemetry & Live Readings
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTestRow}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} /> Add Metric
                  </button>
                </div>

                <div className="subtable-box">
                  <table className="subtable">
                    <thead>
                      <tr>
                        <th>Parameter Metric</th>
                        <th>Expected Value</th>
                        <th>Actual Live Value</th>
                        <th>Result</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.testingDetails.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Parameter name"
                              value={row.parameter}
                              onChange={(e) => handleTestRowChange(idx, 'parameter', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Expected spec"
                              value={row.expectedValue}
                              onChange={(e) => handleTestRowChange(idx, 'expectedValue', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Actual reading"
                              value={row.actualValue}
                              onChange={(e) => handleTestRowChange(idx, 'actualValue', e.target.value)}
                            />
                          </td>
                          <td>
                            <select
                              className="form-select"
                              value={row.result}
                              onChange={(e) => handleTestRowChange(idx, 'result', e.target.value)}
                            >
                              <option value="Pass">Pass</option>
                              <option value="Fail">Fail</option>
                            </select>
                          </td>
                          <td>
                            {formData.testingDetails.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTestRow(idx)}
                                className="icon-btn"
                                style={{ color: 'var(--danger)' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Sign-off Section */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                  4. Customer Acceptance & Mutual Sign-Off
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Customer Signatory Name <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.customerConfirmation.customerName}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerConfirmation: { ...formData.customerConfirmation, customerName: e.target.value }
                      })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Feedback / Acceptance Remarks</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.customerConfirmation.customerFeedback}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerConfirmation: { ...formData.customerConfirmation, customerFeedback: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Submit Completion Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Detail Report Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Commissioning Certificate: ${selectedItem.completionNumber}`}
          subtitle={`Installation Ref: ${selectedItem.installationNumber} • ${selectedItem.customerName}`}
          size="lg"
        >
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Report Number</div>
                <div className="detail-value font-mono text-cyan">{selectedItem.completionNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Overall Verdict</div>
                <div className="detail-value">
                  <span className={`badge ${selectedItem.overallResult === 'Pass' ? 'badge-success' : 'badge-danger'}`}>
                    {selectedItem.overallResult === 'Pass' ? 'PASSED & COMMISSIONED' : 'FAILED - RETEST REQUIRED'}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer Name</div>
                <div className="detail-value">{selectedItem.customerName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Equipment Model</div>
                <div className="detail-value">{selectedItem.productName} (SN: {selectedItem.serialNumber})</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Commissioning Tech</div>
                <div className="detail-value">{selectedItem.technician}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Sign-Off Status</div>
                <div className="detail-value"><StatusBadge status={selectedItem.status} /></div>
              </div>
            </div>

            {/* Checklist Results Grid */}
            <div style={{ marginTop: 18, background: 'var(--bg-surface-elevated)', borderRadius: 10, padding: 16, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 12, color: 'var(--cyan)' }}>
                7-Point Inspection Audit:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
                {checklistItems.map(item => {
                  const passed = selectedItem.checklist?.[item.key] === 'Pass';
                  return (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: 6,
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                        {passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Telemetry Readings */}
            {selectedItem.testingDetails && selectedItem.testingDetails.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>Recorded Telemetry:</div>
                <div className="subtable-box">
                  <table className="subtable">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Target Specification</th>
                        <th>Actual Verified</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.testingDetails.map((td, i) => (
                        <tr key={i}>
                          <td><strong>{td.parameter}</strong></td>
                          <td>{td.expectedValue}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{td.actualValue}</td>
                          <td>
                            <span className={`badge ${td.result === 'Pass' ? 'badge-success' : 'badge-danger'}`}>
                              {td.result}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Signatures */}
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customer Sign-Off</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: 4 }}>
                  {selectedItem.customerConfirmation?.customerName || selectedItem.customerName}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 4 }}>
                  "{selectedItem.customerConfirmation?.customerFeedback}"
                </div>
                <div style={{ marginTop: 8, fontSize: '0.74rem', color: '#16A36A', fontFamily: 'var(--font-mono)' }}>
                  ✓ {selectedItem.customerConfirmation?.customerSignature}
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Service Engineer Sign-Off</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: 4 }}>{selectedItem.technician}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>Lead Field Service Engineer</div>
                <div style={{ marginTop: 8, fontSize: '0.74rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  ✓ {selectedItem.customerConfirmation?.technicianSignature}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedItem(null)}
              >
                Close Certificate
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
