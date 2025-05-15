import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, onSubmit, onClose, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    status: 'AVAILABLE',
    stock: 0,
    description: '',
    categoryId: '',
    supplierId: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        status: product.status || 'AVAILABLE',
        stock: product.stock || 0,
        description: product.description || '',
        categoryId: product.category?.id || '',
        supplierId: product.supplier?.id || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    onSubmit(formData);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`p-6 rounded-lg shadow-lg w-full max-w-md ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold mb-4 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            >
              <option value="AVAILABLE">Available</option>
              <option value="NOT_AVAILABLE">Not Available</option>
            </select>
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Category ID</label>
            <input
              type="number"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
              min="1"
            />
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Supplier ID</label>
            <input
              type="number"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
              min="1"
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded ${
                mode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded dark:bg-blue-500"
            >
              {product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;