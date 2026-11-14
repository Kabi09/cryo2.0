import React, { useState } from 'react';
import InstallationModule from './InstallationModule';
import InstallationCompletionModule from './InstallationCompletionModule';
import StatusBadge from '../common/StatusBadge';
import { Calendar, Clock, CheckCircle2, AlertTriangle, Wrench, Award, Eye, FileText, Plus } from 'lucide-react';

export default function InstallationServicePage({
  installations = [],
  installationCompletions = [],
  deliveryPlans = [],
  onSaveInstallation,
  onUpdateInstallationStatus,
  onSaveInstallationCompletion,
  showToast,
  defaultTab = 'scheduled'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [preSelectedInst, setPreSelectedInst] = useState(null);

  // Segment installations by status
  const scheduledList = installations.filter(i => i.status === 'Scheduled');
  const inProgressList = installations.filter(i => i.status === 'In Progress');
  const completedList = installations.filter(i => i.status === 'Completed');
  const failedList = installations.filter(i => i.status === 'Failed / Rework' || i.status === 'Failed' || i.status === 'Cancelled');

  const handleStartCommissioning = (inst) => {
    setPreSelectedInst(inst);
    setActiveTab('completion-checklist');
  };

  return (
    <div className="module-container">
      {/* 7-Point Commissioning Quality Gate Banner */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: 'linear-gradient(90deg, rgba(36, 81, 197, 0.05), rgba(16, 185, 129, 0.05))', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Award size={20} style={{ color: 'var(--primary)' }} />
          <div>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Mandatory 7-Point Commissioning Quality Gate
            </span>
            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Every cryo unit requires verified checks for mounting, power, voltage, sensors, thermal delta, software, and operational sign-off before completion.
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setActiveTab('completion-checklist')}
        >
          <Award size={13} /> 7-Point Checklist ({installationCompletions.length})
        </button>
      </div>

      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
          >
            <Calendar size={14} style={{ marginRight: 6 }} />
            Scheduled ({scheduledList.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'in-progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('in-progress')}
          >
            <Clock size={14} style={{ marginRight: 6 }} />
            In Progress ({inProgressList.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <CheckCircle2 size={14} style={{ marginRight: 6 }} />
            Completed ({completedList.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'failed' ? 'active' : ''}`}
            onClick={() => setActiveTab('failed')}
          >
            <AlertTriangle size={14} style={{ marginRight: 6, color: failedList.length > 0 ? 'var(--danger)' : 'inherit' }} />
            Failed / Retest ({failedList.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Wrench size={14} style={{ marginRight: 6 }} />
            All Deployments ({installations.length})
          </button>
        </div>
      </div>

      {/* Tab: Scheduled Installations */}
      {activeTab === 'scheduled' && (
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>Scheduled On-Site Installations</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Assigned field engineers and planned site deployment dates</p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('all')}
            >
              <Plus size={14} /> Schedule Installation
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Installation No</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Technician</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledList.map(inst => (
                  <tr key={inst._id}>
                    <td><span className="code-badge">{inst.installationNumber}</span></td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{inst.customerName}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inst.installationAddress}</div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{inst.productName}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SN: {inst.serialNumber}</div>
                    </td>
                    <td>
                      <span>{inst.assignedTechnician}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inst.contactPerson} ({inst.mobileNumber})</div>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>
                      {inst.plannedInstallationDate ? new Date(inst.plannedInstallationDate).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td><StatusBadge status={inst.status} /></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.72rem', gap: 4 }}
                        onClick={async () => {
                          if (onUpdateStatus) {
                            await onUpdateStatus(inst._id, 'In Progress');
                          }
                          setActiveTab('in-progress');
                        }}
                      >
                        <Clock size={12} /> Start Work ➔
                      </button>
                    </td>
                  </tr>
                ))}
                {scheduledList.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                      No installations currently in Scheduled status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: In Progress Installations */}
      {activeTab === 'in-progress' && (
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>Active On-Site Installation Jobs</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Engineers on site executing setup. Complete the 7-point commissioning QA checklist to finalize.</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Installation No</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inProgressList.map(inst => (
                  <tr key={inst._id}>
                    <td><span className="code-badge">{inst.installationNumber}</span></td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{inst.customerName}</strong>
                    </td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{inst.productName}</span>
                    </td>
                    <td>{inst.assignedTechnician}</td>
                    <td><StatusBadge status={inst.status} /></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ padding: '3px 10px', fontSize: '0.74rem', gap: 4 }}
                        onClick={() => handleStartCommissioning(inst)}
                      >
                        <Award size={13} /> 7-Point QA Checklist ➔
                      </button>
                    </td>
                  </tr>
                ))}
                {inProgressList.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                      No installations currently marked in progress.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Completed Installations */}
      {activeTab === 'completed' && (
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>Successfully Commissioned Units</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>All 7 technical commissioning criteria certified and signed off by client</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Installation No</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Engineer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedList.map(inst => (
                  <tr key={inst._id}>
                    <td><span className="code-badge">{inst.installationNumber}</span></td>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{inst.customerName}</strong></td>
                    <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{inst.productName}</span></td>
                    <td>{inst.assignedTechnician}</td>
                    <td><StatusBadge status="Completed" /></td>
                  </tr>
                ))}
                {completedList.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                      No completed installations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Failed / Retest Installations */}
      {activeTab === 'failed' && (
        <div className="table-card">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>Failed QA / Retest Required</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Units where one or more of the 7 commissioning checkpoints failed inspection</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Installation No</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Assigned Tech</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {failedList.map(inst => (
                  <tr key={inst._id}>
                    <td><span className="code-badge">{inst.installationNumber}</span></td>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{inst.customerName}</strong></td>
                    <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{inst.productName}</span></td>
                    <td>{inst.assignedTechnician}</td>
                    <td><StatusBadge status="Failed / Rework" /></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.72rem', gap: 4 }}
                        onClick={() => handleStartCommissioning(inst)}
                      >
                        <Wrench size={12} /> Re-inspect & Test ➔
                      </button>
                    </td>
                  </tr>
                ))}
                {failedList.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                      No failed installations. All commissioning tests passing!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: All Deployments (Reuses InstallationModule) */}
      {activeTab === 'all' && (
        <InstallationModule
          installations={installations}
          deliveryPlans={deliveryPlans}
          onSave={onSaveInstallation}
          onUpdateStatus={onUpdateInstallationStatus}
          showToast={showToast}
        />
      )}

      {/* Tab: 7-Point Commissioning QA Checklist Module */}
      {activeTab === 'completion-checklist' && (
        <InstallationCompletionModule
          completions={installationCompletions}
          installations={installations}
          onSave={onSaveInstallationCompletion}
          showToast={showToast}
          preSelectedInstallation={preSelectedInst}
        />
      )}
    </div>
  );
}
