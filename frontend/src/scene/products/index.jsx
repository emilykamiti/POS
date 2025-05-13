// src/pages/Products.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import DataTable from '../../components/DataTable';
import api from '../../state/api';
import useTableParams from '../../hooks/useTableParams';
import { useAppContext } from '../../context/AppContext';

const Products = () => {
  const { mode, toggleMode } = useAppContext(); // Use context for theme

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

  const [data, setData] = useState({ products: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getProducts({ page, pageSize, sort, search });
        setData({
          products: result.products || [],
          total: result.total || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [page, pageSize, sort, search]);

  const columns = [
    { field: 'id', headerName: 'ID', sortable: true },
    { field: 'name', headerName: 'Name', sortable: true },
    {
      field: 'price',
      headerName: 'Price',
      sortable: true,
      render: (value) => `${value?.toFixed(2)} KES`,
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'AVAILABLE'
              ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      field: 'stock',
      headerName: 'Stock',
      sortable: true,
      render: (value, row) => `${value} (Reserved: ${row.reservedStock || 0})`,
    },
    {
      field: 'category',
      headerName: 'Category',
      render: (value) => value?.name || 'N/A',
    },
    {
      field: 'supplier',
      headerName: 'Supplier',
      render: (value) => value?.name || 'N/A',
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div
      className={`p-6 min-h-screen ${
        mode === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <Header title="PRODUCTS" subtitle="View your inventory of products" />
        <button
          onClick={toggleMode}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        <div className="flex items-center space-x-4 mb-6">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="px-4 py-2 rounded border w-full max-w-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Search
          </button>
        </div>
        <DataTable
          columns={columns}
          data={data.products}
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

export default Products;