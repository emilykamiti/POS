import React, { useState, useEffect } from 'react';
import api from '../../state/api';
import { useAppContext } from '../../context/AppContext';

const ProductForm = ({ product, onSubmit, onClose, mode }) => {
  const { token } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    status: 'AVAILABLE',
    stock: 0,
    description: '',
    categoryName: '',
    supplierName: '',
    imageUrl: '',
    lowStockThreshold: 0,
    lowStockMinimumOrder: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories and suppliers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      console.log('Fetching categories and suppliers with token:', token || 'No token');
      try {
        const [categoryResponse, supplierResponse] = await Promise.all([
          api.getCategories({ page: 0, pageSize: 100 }, token),
          api.getSuppliers({ page: 0, pageSize: 100 }, token),
        ]);
        console.log('Category response:', categoryResponse);
        console.log('Supplier response:', supplierResponse);
        const fetchedCategories = categoryResponse.content || [];
        const fetchedSuppliers = supplierResponse.content || [];
        setCategories(fetchedCategories);
        setSuppliers(fetchedSuppliers);
        if (fetchedCategories.length === 0) {
          setError('No categories found');
        }
        if (fetchedSuppliers.length === 0) {
          setError((prev) => prev ? `${prev}. No suppliers found` : 'No suppliers found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Populate form with product data for editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        status: product.status || 'AVAILABLE',
        stock: product.stock || 0,
        description: product.description || '',
        categoryName: product.categoryName || '',
        supplierName: product.supplierName || '',
        imageUrl: product.imageUrl || '',
        lowStockThreshold: product.lowStockThreshold || 0,
        lowStockMinimumOrder: product.lowStockMinimumOrder || 0,
      });
      setPreviewUrl(product.imageUrl || null);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' ||
        name === 'stock' ||
        name === 'lowStockThreshold' ||
        name === 'lowStockMinimumOrder'
          ? Number(value)
          : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setFormData((prev) => ({
        ...prev,
        imageUrl: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('product', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      await onSubmit(formDataToSend);
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (err) {
      setError('Error submitting form: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`rounded-lg shadow-lg w-full max-w-md ${
          mode === 'dark' ? 'bg-gray-800' : 'bg-white'
        } flex flex-col max-h-[80vh]`}
      >
        <div className="p-6 flex-shrink-0">
          <h2 className={`text-lg font-bold mb-4 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          {error && (
            <div
              className={`mb-4 p-2 rounded ${
                mode === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
              }`}
            >
              {error}
            </div>
          )}
        </div>
        <div className="px-6 py-2 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>
            <div className="mb-4">
              <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Price (KES)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              >
                <option value="AVAILABLE">Available</option>
                <option value="NOT_AVAILABLE">Not Available</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Low Stock Threshold
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Low Stock Minimum Order
              </label>
              <input
                type="number"
                name="lowStockMinimumOrder"
                value={formData.lowStockMinimumOrder}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                rows="3"
              />
            </div>
            <div className="mb-4">
              <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
                disabled={loading}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {loading && <p className="text-sm text-gray-500 mt-1">Loading categories...</p>}
            </div>
            <div className="mb-4">
              <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Supplier
              </label>
              <select
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
                disabled={loading}
              >
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {loading && <p className="text-sm text-gray-500 mt-1">Loading suppliers...</p>}
            </div>
            <div className="mb-4">
              <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-2 w-24 h-24 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                  }}
                />
              )}
            </div>
          </form>
        </div>
        <div className="p-6 flex-shrink-0 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded text-sm ${
              mode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className={`px-4 py-2 rounded text-sm bg-blue-600 text-white dark:bg-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {product ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;