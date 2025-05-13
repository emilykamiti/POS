// src/pages/Transactions.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import DataTable from '../../components/DataTable';
import api from '../../state/api'; // Import the fetch-based API client
import useTableParams from '../../hooks/useTableParams';

const Transactions = () => {
  // Local state for theme mode (replacing useSelector)
  const [mode, setMode] = useState('light');

  // Table parameters from custom hook
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    search,
    searchInput,
    setSearchInput,
    handleSearch,
    handleSort,
  } = useTableParams();

  // State for API data
  const [data, setData] = useState({ transactions: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch transactions when parameters change
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getTransactions({
          page,
          pageSize,
          sort,
          search,
        });
        setData({
          transactions: result.transactions || [],
          total: result.total || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [page, pageSize, sort, search]);

  // Toggle theme mode (optional, for demo purposes)
  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Table columns (same as before)
  const columns = [
    { field: 'id', headerName: 'ID', sortable: true },
    { field: 'checkoutRequestId', headerName: 'Checkout Request ID', sortable: true },
    { field: 'transactionId', headerName: 'Transaction ID', sortable: true },
    { field: 'phoneNumber', headerName: 'Phone Number', sortable: true },
    {
      field: 'amount',
      headerName: 'Amount',
      sortable: true,
      render: (value, row) => `${value.toFixed(2)} ${row.currency || 'KES'}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'SUCCESS'
              ? 'bg-green-100 text-green-800'
              : value === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      sortable: true,
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      field: 'sale',
      headerName: 'Sale ID',
      render: (value) => value?.id || 'N/A',
    },
  ];

  return (
    <div
      className={`p-6 min-h-screen ${
        mode === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <Header title="TRANSACTIONS" subtitle="List of all M-Pesa transactions" />
        {/* Optional: Button to toggle theme */}
        <button
          onClick={toggleMode}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        {/* Search */}
        <div className="flex items-center space-x-4 mb-6">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search transactions..."
            className="px-4 py-2 rounded border w-full max-w-md"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Search
          </button>
        </div>
        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data.transactions}
          total={data.total}
          isLoading={isLoading}
          error={error}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          sort={sort}
          handleSort={handleSort}
        />
      </div>
    </div>
  );
};

export default Transactions;