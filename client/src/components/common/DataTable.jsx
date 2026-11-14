import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox, Plus } from 'lucide-react';

export default function DataTable({
  title = null,
  subtitle = null,
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  searchField = null,
  filters = null,
  actions = null,
  toolbarAction = null,
  onAdd = null,
  addLabel = 'Add New',
  pageSize = 8,
  onRowClick = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchField && item[searchField]) {
        return String(item[searchField]).toLowerCase().includes(term);
      }
      // Otherwise check all string/number fields in item
      return Object.values(item).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(term);
        }
        if (typeof val === 'object' && val !== null) {
          return Object.values(val).some(v => String(v).toLowerCase().includes(term));
        }
        return false;
      });
    });
  }, [data, searchTerm, searchField]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Safe cell renderer supporting both (row) and (val, row) signatures
  const renderCell = (col, row) => {
    if (!col.render) {
      const val = col.accessor ? row[col.accessor] : undefined;
      return val !== undefined && val !== null ? val : '-';
    }

    try {
      // First try standard row signature
      const out = col.render(row);
      if (out !== undefined) return out;
      // Fallback to val, row
      return col.render(col.accessor ? row[col.accessor] : row, row);
    } catch {
      return col.render(col.accessor ? row[col.accessor] : row, row);
    }
  };

  return (
    <div className="table-card">
      {/* Optional Card Title & Subtitle */}
      {(title || subtitle) && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            {title && <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Table Toolbar */}
      <div className="toolbar" style={{ border: 'none', borderRadius: 0, borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {filters}
        </div>
        <div className="toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {actions || toolbarAction}
          {onAdd && (
            <button className="btn btn-primary" onClick={onAdd}>
              <Plus size={16} /> {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row._id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={{ textAlign: col.align || 'left' }}>
                      {renderCell(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <Inbox className="empty-state-icon" size={32} />
                    <h4>No records found</h4>
                    <p>Try adjusting your search criteria or register a new record.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing <span>{filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
          <span>{Math.min(currentPage * pageSize, filteredData.length)}</span> of <span>{filteredData.length}</span> entries
        </div>
        <div className="pagination-controls">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.8rem', padding: '0 8px', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
