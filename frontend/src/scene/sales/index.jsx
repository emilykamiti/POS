// src/pages/Sales.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import DataTable from '../../components/DataTable';
import api from '../../state/api';
import useTableParams from '../../hooks/useTableParams';
import { useAppContext } from '../../context/AppContext';

const Sales = () => {
  const { mode, token } = useAppContext();
  const [data, setData] = useState({ sales: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchSales = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getSales({ page, pageSize, sort, search }, token);
      console.log('Sales response:', result); // Debug
      setData({
        sales: result.content || [],
        total: result.totalElements || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, pageSize, sort, search, token]);

  const columns = [
    { field: 'id', headerName: 'ID', sortable: true },
    {
      field: 'saleDate',
      headerName: 'Sale Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      field: 'subtotalPrice',
      headerName: 'Subtotal Price',
      sortable: true,
      render: (value) => `${value.toFixed(2)} KES`,
    },
    {
      field: 'discountAmount',
      headerName: 'Discount Amount',
      sortable: true,
      render: (value) => `${value.toFixed(2)} KES`,
    },
    {
      field: 'taxAmount',
      headerName: 'Tax Amount',
      sortable: true,
      render: (value) => `${value.toFixed(2)} KES`,
    },
    {
      field: 'totalPrice',
      headerName: 'Total Price',
      sortable: true,
      render: (value) => `${value.toFixed(2)} KES`,
    },
    {
      field: 'customer.id',
      headerName: 'CustomerID',
      sortable: true,
      render: (_, row) => row.customer?.id || 'N/A',
    },

   {
         field: 'paymentMethod',
         headerName: 'Payment Method',
         sortable: true,
       },
  ];

  return (
    <div className={`p-6 min-h-screen '}`}>
      <div className="max-w-7xl mx-auto">
        <Header title="SALES" subtitle="List of all sales" />
        {error && (
          <div className={`mb-4 p-3 rounded ${mode === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'}`}>
            Error: {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={data.sales}
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

export default Sales;