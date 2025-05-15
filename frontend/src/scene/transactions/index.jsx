// src/pages/Transactions.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import DataTable from '../../components/DataTable';
import api from '../../state/api'; // Import the fetch-based API client
import useTableParams from '../../hooks/useTableParams';
import { useAppContext } from '../../context/AppContext';

const Transactions = () => {
   const { mode, toggleMode, token } = useAppContext();
   const [data, setData] = useState({ products: [], total: 0 });
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);
   const [openForm, setOpenForm] = useState(false);
   const [currentProduct, setCurrentProduct] = useState(null);
   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
   const [productToDelete, setProductToDelete] = useState(null);
   const [successMessage, setSuccessMessage] = useState(null);

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



  // Fetch transactions when parameters change
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getTransactions({ page, pageSize, sort, search }, token);
        setData({
          transactions: result.content || [],
          total: result.totalElements || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchTransactions();
    }, [page, pageSize, sort, search, token]);

  // Table columns (same as before)
  const columns = [
    { field: 'id', headerName: 'ID', sortable: true },
    { field: 'checkoutRequestId',
     headerName: 'Checkout Request ID',
     sortable: true
     },

    {
      field: 'amount',
      headerName: 'Amount',
      sortable: true,
      render: (value, row) => `${value.toFixed(2)} ${row.currency || 'KES'}`,
    },

   { field: 'phoneNumber', headerName: 'Phone Number', sortable: true },
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

  ];

  return (
    <div
      className={`p-6 min-h-screen `}
    >
      <div className="max-w-7xl mx-auto">
        <Header title="TRANSACTIONS" subtitle="List of all M-Pesa transactions" />


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