// src/pages/Products.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import DataTable from '../../components/DataTable';
import api from '../../state/api';
import useTableParams from '../../hooks/useTableParams';
import { useAppContext } from '../../context/AppContext';
import ProductForm from './ProductForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const Products = () => {
  const { mode, toggleMode, token } = useAppContext();
  const [data, setData] = useState({ products: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getProducts({ page, pageSize, sort, search }, token);
      setData({
        products: result.content || [],
        total: result.totalElements || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, sort, search, token]);

  // Handle create/update product
  const handleSubmit = async (productData) => {
    try {
      setIsLoading(true);
      setError(null);
      if (currentProduct) {
        await api.updateProduct(currentProduct.id, productData, token);
        setSuccessMessage('Product updated successfully');
      } else {
        await api.createProduct(productData, token);
        setSuccessMessage('Product created successfully');
      }
      setOpenForm(false);
      setCurrentProduct(null);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Handle delete product
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.deleteProduct(productToDelete.id, token);
      setSuccessMessage('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setOpenDeleteDialog(false);
      setProductToDelete(null);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', sortable: true },
    { field: 'name', headerName: 'Name', sortable: true },
     { field: 'category', headerName: 'Category', sortable: true },
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
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value === 'AVAILABLE'
            ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
            : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
        }`}>
          {value}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setCurrentProduct(row);
              setOpenForm(true);
            }}
            className="px-2 py-1 bg-blue-600 text-white rounded text-sm dark:bg-blue-500"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setProductToDelete(row);
              setOpenDeleteDialog(true);
            }}
            className="px-2 py-1 bg-red-600 text-white rounded text-sm dark:bg-red-500"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`p-6 min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <Header title="PRODUCTS" subtitle="Manage your inventory of products" />

        {/* Success/Error Messages */}
        {successMessage && (
          <div className={`mb-4 p-3 rounded ${mode === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'}`}>
            {successMessage}
          </div>
        )}
        {error && (
          <div className={`mb-4 p-3 rounded ${mode === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'}`}>
            Error: {error}
          </div>
        )}

        <div className="flex items-center space-x-4 mb-6">


            <button
             onClick={() => {
               setCurrentProduct(null);
               setOpenForm(true);
             }}
             className="px-4 py-2 bg-gray-300 text-white rounded dark:bg-gray-500"
           >
             Add New Product
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

        {/* Product Form Modal */}
        {openForm && (
          <ProductForm
            product={currentProduct}
            onSubmit={handleSubmit}
            onClose={() => {
              setOpenForm(false);
              setCurrentProduct(null);
            }}
            mode={mode}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete?.name}"?`}
        />
      </div>
    </div>
  );
};

export default Products;