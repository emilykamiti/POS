import React, { useState, useMemo } from 'react';
import { Search, Download, Printer } from 'lucide-react'; // For search, export, and print icons
import { FaCog, FaChevronDown } from 'react-icons/fa'; // For action menu icons
import Papa from 'papaparse'; // For CSV export

const DataTable = ({
  columns,
  data,
  total,
  isLoading,
  error,
  page,
  setPage,
  pageSize,
  setPageSize,
  sort,
  handleSort,
  className = '',
  actions = [], // Array of action objects: [{ label, handler, className }]
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenu, setActionMenu] = useState(null);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) =>
        String(row[col.field] || '')
          .toLowerCase()
          .includes(lowerQuery)
      )
    );
  }, [data, searchQuery, columns]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0); // Reset to first page on search
  };

  const handleExport = (format) => {
    if (format === 'csv') {
      const csvData = filteredData.map((row) =>
        columns.reduce((obj, col) => {
          obj[col.headerName] = col.render ? col.render(row[col.field], row) : row[col.field] || 'N/A';
          return obj;
        }, {})
      );
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'table-data.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleActionMenu = (id) => {
    setActionMenu(actionMenu === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="text-center p-4 text-gray-500" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600 mx-auto"></div>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center font-medium" role="alert">
        Error: {error}
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500" aria-live="polite">
        No records found
      </div>
    );
  }

  // Calculate paginated data
  const paginatedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className={`space-y-4 p-4 ${className}`}>
      {/* Search and Action Buttons */}
      <div className="flex items-center justify-end p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition"
              aria-label="Search data"
            />
          </div>
          <div className="flex gap-2">
            <div className="group relative">
              <button
                onClick={() => handleExport('csv')}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 shadow-sm transition transform hover:scale-105"
                aria-label="Export as CSV"
              >
                <Download className="h-5 w-5 text-gray-600" />
              </button>
              <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Export CSV
              </span>
            </div>
            <div className="group relative">
              <button
                onClick={handlePrint}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 shadow-sm transition transform hover:scale-105"
                aria-label="Print data"
              >
                <Printer className="h-5 w-5 text-gray-600" />
              </button>
              <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Print
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-4 bg-gray-100 p-4 rounded-t-lg">
          {columns.map((col) => (
            <div
              key={col.field}
              onClick={() => col.sortable && handleSort(col.field)}
              className={`text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-200 transition flex items-center justify-center ${
                sort?.field === col.field ? 'bg-gray-200' : ''
              }`}
              role="columnheader"
              aria-sort={sort?.field === col.field ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              {col.headerName}
              {sort?.field === col.field && (
                <span aria-hidden="true">{sort.direction === 'asc' ? ' ↑' : ' ↓'}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data as Card-like Rows */}
      <div className="overflow-x-auto">
        <div className="space-y-4">
          {paginatedData.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-7 gap-4 bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:bg-gray-200 hover:shadow-lg hover:scale-105 transition duration-200 transform"
              role="row"
            >
              {columns.map((col) => (
                <div key={col.field} className="text-sm flex items-center justify-center">
                  {col.render ? col.render(row[col.field], row) : row[col.field] || 'N/A'}
                </div>
              ))}
              <div className="relative flex items-center justify-center">
                {actions.length > 0 && (
                  <>
                    <button
                      onClick={() => toggleActionMenu(row.id)}
                      className="flex items-center space-x-2"
                      aria-label="Toggle actions menu"
                    >
                      <FaCog />
                      <FaChevronDown />
                    </button>
                    {actionMenu === row.id && (
                      <div className="absolute right-0 bottom-full mb-2 bg-white shadow-lg rounded-lg p-2 z-50">
                        {actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => action.handler(row.id)}
                            className={`block px-4 py-2 text-sm ${action.className || 'text-gray-700 hover:bg-gray-100'}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8 px-4 py-2">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
          className={`px-4 py-2 rounded-lg text-sm ${
            page === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page + 1} of {Math.ceil(filteredData.length / pageSize)}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(filteredData.length / pageSize) - 1))}
          disabled={page >= Math.ceil(filteredData.length / pageSize) - 1}
          className={`px-4 py-2 rounded-lg text-sm ${
            page >= Math.ceil(filteredData.length / pageSize) - 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataTable;