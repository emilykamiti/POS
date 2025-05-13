// src/components/DataTable.js
import React from 'react';

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
}) => {
  if (isLoading) return <div className="text-center py-4" aria-live="polite">Loading...</div>;
  if (error) return <div className="text-red-600 py-4" role="alert">Error: {error}</div>;
  if (!data || data.length === 0) return <div className="text-center py-4" aria-live="polite">No records found</div>;

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse" role="grid">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            {columns.map((col) => (
              <th
                key={col.field}
                onClick={() => col.sortable && handleSort(col.field)}
                className={`px-4 py-2 text-left font-semibold cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition ${
                  sort?.field === col.field ? 'bg-gray-300 dark:bg-gray-600' : ''
                }`}
                role="columnheader"
                aria-sort={sort?.field === col.field ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                {col.headerName}
                {sort?.field === col.field && (
                  <span aria-hidden="true">{sort.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {columns.map((col) => (
                <td key={col.field} className="px-4 py-2">
                  {col.render ? col.render(row[col.field], row) : row[col.field] || 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
          aria-label="Previous page"
        >
          Previous
        </button>
        <span aria-live="polite">
          Page {page + 1} of {Math.ceil(total / pageSize)}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= Math.ceil(total / pageSize) - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataTable;