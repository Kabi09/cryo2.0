import React, { useState } from 'react';
import MaterialIssueModule from './MaterialIssueModule';
import StatusBadge from '../common/StatusBadge';
import { ClipboardList, ArrowUpRight, CheckCircle2, AlertTriangle, Eye, ArrowRight } from 'lucide-react';

export default function MaterialRequestsPage({
  materialIssues = [],
  materials = [],
  inventory = [],
  materialRequests = [],
  onSaveMaterialIssue,
  showToast,
  defaultTab = 'requests'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [preSelectedMR, setPreSelectedMR] = useState(null);

  const getMaterialAvailableStock = (matId) => {
    const inv = inventory.find(i => (i.material?._id || i.material) === matId);
    return inv ? inv.availableStock : 0;
  };

  const handleIssueFromRequest = (req) => {
    setPreSelectedMR(req);
    setActiveTab('issues');
  };

  return (
    <div className="module-container">
      {/* Sub-Tabs Switcher */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <ClipboardList size={14} style={{ marginRight: 6 }} />
            Factory Requisitions ({materialRequests.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <ArrowUpRight size={14} style={{ marginRight: 6 }} />
            Issue History ({materialIssues.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Factory Material Requests */}
      {activeTab === 'requests' && (
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
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Production Store Requisitions
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Automated material demands triggered by Work Order BOMs. Verify SCM inventory availability before issuing batch slips.
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request No</th>
                  <th>Work Order</th>
                  <th>Product Assembly</th>
                  <th>Requested Items</th>
                  <th>Stock Availability</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {materialRequests.map(req => {
                  const items = req.items || [];
                  const allInStock = items.every(item => {
                    const avail = getMaterialAvailableStock(item.material?._id || item.material);
                    return avail >= (item.requestedQty || 1);
                  });

                  return (
                    <tr key={req._id}>
                      <td><span className="code-badge">{req.requestNumber}</span></td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{req.workOrderNumber || 'WO-001'}</strong>
                      </td>
                      <td>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{req.productName || 'Cryo Unit'}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Required by: {req.requiredByDate ? new Date(req.requiredByDate).toLocaleDateString('en-GB') : 'Immediate'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {items.slice(0, 2).map((it, idx) => (
                            <span key={idx} style={{ fontSize: '0.76rem' }}>
                              • {it.materialName || 'Raw Material'}: <strong>{it.requestedQty} {it.unit}</strong>
                            </span>
                          ))}
                          {items.length > 2 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{items.length - 2} more items</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {allInStock ? (
                          <span className="badge badge-success" style={{ fontSize: '0.72rem', gap: 4 }}>
                            <CheckCircle2 size={11} /> Fully In Stock
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '0.72rem', gap: 4 }}>
                            <AlertTriangle size={11} /> Stock Shortage
                          </span>
                        )}
                      </td>
                      <td><StatusBadge status={req.status} /></td>
                      <td>
                        {req.status !== 'Issued' ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 10px', fontSize: '0.74rem', gap: 4 }}
                            onClick={() => handleIssueFromRequest(req)}
                          >
                            <ArrowUpRight size={13} /> Issue Material ➔
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Already Issued</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {materialRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                      No open production requisitions. All factory demands satisfied.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Material Issues History */}
      {activeTab === 'issues' && (
        <MaterialIssueModule
          materialIssues={materialIssues}
          materials={materials}
          inventory={inventory}
          onSave={onSaveMaterialIssue}
          showToast={showToast}
          preSelectedRequest={preSelectedMR}
        />
      )}
    </div>
  );
}
