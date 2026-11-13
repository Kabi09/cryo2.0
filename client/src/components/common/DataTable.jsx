import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export default function DataTable({
  columns,
  data = [],
  searchPlaceholder = 'Search records...',
  searchField = null,
  filters = null,
  actions = null,
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

  return (
    <div className="table-card">
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
        <div className="toolbar-right">
          {actions}
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
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <Inbox className="empty-state-icon" size={40} />
                    <h4>No records found</h4>
                    <p style={{ fontSize: '0.8rem' }}>
                      {searchTerm ? 'Try adjusting your search query or filters.' : 'Click "Add New" to create the first record.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredData.length > 0 && (
        <div style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            Showing <strong style={{ color: '#fff' }}>{Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong style={{ color: '#fff' }}>{Math.min(filteredData.length, currentPage * pageSize)}</strong> of{' '}
            <strong style={{ color: '#fff' }}>{filteredData.length}</strong> records
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

