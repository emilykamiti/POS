import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, onSubmit, onClose, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    status: 'AVAILABLE',
    stock: 0,
    description: '',
    categoryName: '',
    supplierName: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Generate a URL for preview
      setFormData((prev) => ({
        ...prev,
        imageUrl: `/assets/${file.name}`,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (imageFile) {
        // Simulate uploading image to src/assets folder
        // In a real app, you'd use a server-side API to handle file uploads
        const formDataWithImage = new FormData();
        formDataWithImage.append('file', imageFile);
        // For demo, we assume the image is saved to src/assets
        // Update formData.imageUrl to reflect the path
        const updatedFormData = {
          ...formData,
          imageUrl: `/assets/${imageFile.name}`,
        };
        onSubmit(updatedFormData);
      } else {
        onSubmit(formData);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`p-4 rounded-lg shadow-lg w-full max-w-md ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-bold mb-3 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-2 py-1 border rounded text-sm ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          <div className="mb-3">
            <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Price (KES)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-2 py-1 border rounded text-sm ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-3">
            <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-2 py-1 border rounded text-sm ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            >
              <option value="AVAILABLE">Available</option>
              <option value="NOT_AVAILABLE">Not Available</option>
            </select>
          </div>
          <div className="mb-3">
            <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={`w-full px-2 py-1 border rounded text-sm ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
              min="0"
            />
          </div>
          <div className="mb-3">
            <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-2 py-1 border rounded text-sm ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              rows="3"
            />
          </div>
          <div className="mb-3">
            <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Category Name</label>
            <input
              type="text"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              className={`w-full px-2 py-1 border rounded text-sm ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          <div className="mb-3">
            <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Supplier Name</label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              className={`w-full px-2 py-1 border rounded text-sm ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          <div className="mb-3">
            <label className={`block mb-1 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full px-2 py-1 border rounded text-sm ${
                mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                }}
              />
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1 rounded text-sm ${
                mode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm dark:bg-blue-500"
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