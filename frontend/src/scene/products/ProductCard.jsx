import React from 'react';

const ProductCard = ({ product, onEdit, onDelete, mode }) => {
  return (
    <div className={`rounded-lg shadow-md p-4 ${mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="relative h-48 mb-4">
        <img
          src={product.imageUrl || '/assets/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover rounded"
        />
      </div>
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-sm mb-2">{product.description || 'No description'}</p>
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{product.price.toFixed(2)} KES</span>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          product.status === 'AVAILABLE'
            ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
            : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
        }`}>
          {product.status}
        </span>
      </div>
      <p className="text-sm mb-4">Stock: {product.stock}</p>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(product)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm dark:bg-blue-500"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(product)}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm dark:bg-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;