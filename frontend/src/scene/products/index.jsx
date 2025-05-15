import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import api from '../../state/api';
import useTableParams from '../../hooks/useTableParams';
import { useAppContext } from '../../context/AppContext';
import ProductForm from './ProductForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const Products = () => {
  const { mode, token } = useAppContext();
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
      setError(err.message || 'Failed to fetch products');
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
      setError(err.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
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
      setError(err.message || 'Failed to delete product');
    } finally {
      setIsLoading(false);
      setOpenDeleteDialog(false);
      setProductToDelete(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        status === 'AVAILABLE'
          ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
          : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
      }`}
    >
      {status}
    </span>
  );

  // Stock indicator component
  const StockIndicator = ({ stock, lowStockThreshold }) => {
    const isLowStock = stock <= lowStockThreshold;
    return (
      <div className="flex items-center">
        <span className="mr-2">Stock:</span>
        <span className={`font-medium ${
          isLowStock ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
        }`}>
          {stock}
          {isLowStock && (
            <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">(Low)</span>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className={`p-6 min-h-screen ${mode === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto">
        <Header title="PRODUCTS" subtitle="Manage your inventory of products" />

        {/* Success/Error Messages */}
        {successMessage && (
          <div
            className={`mb-4 p-3 rounded ${
              mode === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
            }`}
          >
            {successMessage}
          </div>
        )}
        {error && (
          <div
            className={`mb-4 p-3 rounded ${
              mode === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
            }`}
          >
            Error: {error}
          </div>
        )}

        {/* Search and Add Product */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full px-4 py-2 rounded border ${
                mode === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>
          <button
            onClick={() => {
              setCurrentProduct(null);
              setOpenForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Add New Product
          </button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : data.products.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.products.map((product) => (
                <div
                  key={product.id}
                  className={`rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] ${
                    mode === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  {/* Product Image */}
                  <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        No Image Available
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg truncate">{product.name}</h3>
                      <span className="text-sm opacity-75">#{product.id}</span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {product.price?.toFixed(2)} KES
                      </span>
                      <StatusBadge status={product.status} />
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <StockIndicator
                        stock={product.stock}
                        lowStockThreshold={product.lowStockThreshold}
                      />
                      <div>
                        <span className="font-medium">Reserved:</span> {product.reservedStock || 0}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {product.categoryName || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Supplier:</span> {product.supplierName || 'N/A'}
                      </div>
                      {product.lowStockThreshold && (
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">
                          Low stock threshold: {product.lowStockThreshold}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setCurrentProduct(product);
                          setOpenForm(true);
                        }}
                        className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(product);
                          setOpenDeleteDialog(true);
                        }}
                        className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors dark:bg-red-500 dark:hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span>Products per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className={`px-2 py-1 rounded border ${
                    mode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  {[4, 8, 12, 16].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded ${
                    page === 1
                      ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  }`}
                >
                  Previous
                </button>

                <span>
                  Page {page} of {Math.ceil(data.total / pageSize)}
                </span>

                <button
                  onClick={() => setPage(p => (p < Math.ceil(data.total / pageSize) ? p + 1 : p))}
                  disabled={page >= Math.ceil(data.total / pageSize)}
                  className={`px-3 py-1 rounded ${
                    page >= Math.ceil(data.total / pageSize)
                      ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

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
        {openDeleteDialog && (
          <ConfirmationDialog
            open={openDeleteDialog}
            onClose={() => {
              setOpenDeleteDialog(false);
              setProductToDelete(null);
            }}
            onConfirm={handleDelete}
            title="Delete Product"
            message={`Are you sure you want to delete "${productToDelete?.name}"?`}
          />
        )}
      </div>
    </div>
  );
};

export default Products;