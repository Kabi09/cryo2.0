import React, { useState, useEffect } from 'react';
import ProductionQAModule from './ProductionQAModule';
import ReworkModule from './ReworkModule';
import ProductionPipelineStepper from './ProductionPipelineStepper';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { ShieldCheck, RotateCcw, Clock, CheckCircle2, AlertTriangle, ArrowRight, Eye, Wrench } from 'lucide-react';

export default function QualityReworkPage({
  qaTests = [],
  workOrders = [],
  completions = [],
  reworkOrders = [],
  onSaveQA,
  onSaveReworkOrder,
  onUpdateReworkStatus,
  onNavigateToFG,
  onNavigateModule,
  showToast,
  defaultTab = 'pending'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [preSelectedCompForQA, setPreSelectedCompForQA] = useState(null);

  useEffect(() => {
    if (defaultTab) {
      if (defaultTab === 'qa') setActiveTab('passed');
      else setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Derive lists
  const pendingCompletions = completions.filter(c => c.status === 'QA Pending' || !c.status);
  const passedQAs = qaTests.filter(q => q.overallResult === 'Pass' || q.decision === 'Finished Goods');
  const failedQAs = qaTests.filter(q => q.overallResult === 'Fail' || q.decision === 'Rework' || (q.failedQuantity > 0));

  // Columns for Pending QA Tab
  const pendingColumns = [
    {
      header: 'Completion No',
      accessor: 'completionNumber',
      render: (row) => <span className="code-badge" style={{ color: 'var(--primary)', fontWeight: 700 }}>{row.completionNumber}</span>
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
      header: 'Produced Quantity',
      accessor: 'producedQuantity',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#10B981' }}>
          {row.producedQuantity || row.plannedQuantity || 1} Units
        </span>
      )
    },
    {
      header: 'Completion Date',
      accessor: 'actualCompletionDate',
      render: (row) => (row.actualCompletionDate ? new Date(row.actualCompletionDate).toLocaleDateString('en-GB') : '-')
    },
    {
      header: 'Supervisor',
      accessor: 'productionSupervisor',
      render: (row) => row.productionSupervisor || 'Supervisor'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'QA Pending'} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ gap: 5 }}
          onClick={() => {
            setPreSelectedCompForQA(row);
            setActiveTab('passed'); // Opens QA testing
          }}
        >
          <ShieldCheck size={13} /> Start QA Test ➔
        </button>
      )
    }
  ];

  return (
    <div className="module-container">
      {/* 5-Stage Interactive Manufacturing Stepper */}
      <ProductionPipelineStepper
        currentModule="production-quality"
        onNavigate={onNavigateModule}
        counts={{ qaTests: pendingCompletions.length + passedQAs.length }}
      />

      {/* Sub-Tabs: Pending QA | Passed | Failed & Rework */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <Clock size={14} style={{ marginRight: 6 }} />
            Pending QA ({pendingCompletions.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'passed' ? 'active' : ''}`}
            onClick={() => setActiveTab('passed')}
          >
            <CheckCircle2 size={14} style={{ marginRight: 6 }} />
            Passed QA ({passedQAs.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'rework' ? 'active' : ''}`}
            onClick={() => setActiveTab('rework')}
          >
            <RotateCcw size={14} style={{ marginRight: 6 }} />
            Failed & Rework ({reworkOrders.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Pending QA */}
      {activeTab === 'pending' && (
        <div>
          <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(99, 102, 241, 0.05)' }}>
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Quarantine Quality Gate:</strong> Completed shopfloor units await official QA inspection. Click <strong>Start QA Test</strong> to evaluate electrical, mechanical, and temperature test parameters.
            </span>
          </div>

          <DataTable
            title="Completed Batches Awaiting Quality Check"
            subtitle="Batches finished by shopfloor technicians queued for inspection before warehouse storage"
            columns={pendingColumns}
            data={pendingCompletions}
          />
        </div>
      )}

      {/* Tab 2: Passed QA */}
      {activeTab === 'passed' && (
        <ProductionQAModule
          qaTests={passedQAs}
          allQaTests={qaTests}
          workOrders={workOrders}
          completions={completions}
          preSelectedCompletion={preSelectedCompForQA}
          onClearPreSelectedCompletion={() => setPreSelectedCompForQA(null)}
          onSave={onSaveQA}
          onNavigateToRework={() => setActiveTab('rework')}
          onNavigateToFG={onNavigateToFG}
          showToast={showToast}
        />
      )}

      {/* Tab 3: Failed & Rework */}
      {activeTab === 'rework' && (
        <ReworkModule
          reworkOrders={reworkOrders}
          workOrders={workOrders}
          onSave={onSaveReworkOrder}
          onUpdateStatus={onUpdateReworkStatus}
          onSendForReQA={() => setActiveTab('pending')}
          showToast={showToast}
        />
      )}
    </div>
  );
}
