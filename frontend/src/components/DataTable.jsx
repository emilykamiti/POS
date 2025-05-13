// src/components/DataTable.js
import React from 'react';

const DataTable = ({
  columns,
  data,
  isLoading,
  error,
  total,
  page,
  setPage,
  pageSize,
  setPageSize,
  sort,
  handleSort,
  rowsPerPageOptions = [20, 50, 100],
}) => {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {columns.map((col) => (
              <th
                key={col.field}
                className="px-4 py-3 text-left text-sm font-semibold"
              >
                <div
                  className={`flex items-center ${
                    col.sortable ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.field)}
                >
                  {col.headerName}
                  {col.sortable && (
                    <span className="ml-2">
                      {sort.field === col.field && sort.direction === 'asc'
                        ? '▲'
                        : sort.field === col.field && sort.direction === 'desc'
                        ? '▼'
                        : '⇅'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4 text-red-500">
                Error: {error}
              </td>
            </tr>
          ) : data?.length > 0 ? (
            data.map((row) => (
              <tr
                key={row.id || row._id} // Handle both id and _id for flexibility
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {columns.map((col) => (
                  <td key={col.field} className="px-4 py-3">
                    {col.render
                      ? col.render(row[col.field], row)
                      : row[col.field] || 'N/A'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="px-2 py-1 rounded border"
          >
            {rowsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;