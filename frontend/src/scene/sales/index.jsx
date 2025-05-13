import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import api from '../../state/api';
import { useAppContext } from '../../context/AppContext';

const Sale = ({
  id,
  saleDate,
  user,
  customer,
  paymentMethod,
  subtotalAmount,
  discountAmount,
  taxAmount,
  totalAmount,
  saleItems,
  transaction,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Customer: {customer?.name || 'N/A'}
        </span>
        <h3 className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
          Sale #{id}
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Date: {new Date(saleDate).toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
          Payment Method: {paymentMethod || 'N/A'}
        </p>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
          Total: {totalAmount.toFixed(2)} KES
        </p>
      </div>
      <div className="px-6 pb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isExpanded ? 'See Less' : 'See More'}
        </button>
      </div>
      <div
        className={`px-6 pb-6 transition-all duration-300 ease-in-out ${
          isExpanded ? 'block' : 'hidden'
        }`}
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Subtotal: {subtotalAmount.toFixed(2)} KES
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Discount: {discountAmount.toFixed(2)} KES
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Tax: {taxAmount.toFixed(2)} KES
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Transaction ID: {transaction?.id || 'N/A'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Items: {saleItems.length} items
        </p>
      </div>
    </div>
  );
};

const Sales = () => {
  const { mode, toggleMode } = useAppContext(); // Use context for theme
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getSales({
          page: 0,
          pageSize: 100,
          sort: { field: 'saleDate', direction: 'desc' },
          search: '',
        });
        setData(result.sales || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  return (
    <div
      className={`p-6 min-h-screen ${
        mode === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <Header title="SALES" subtitle="List of all sales" />
        <button
          onClick={toggleMode}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        {isLoading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 dark:text-red-400">
            Error: {error}
          </p>
        ) : data?.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((sale) => (
              <Sale
                key={sale.id}
                id={sale.id}
                saleDate={sale.saleDate}
                user={sale.user}
                customer={sale.customer}
                paymentMethod={sale.paymentMethod}
                subtotalAmount={sale.subtotalAmount}
                discountAmount={sale.discountAmount}
                taxAmount={sale.taxAmount}
                totalAmount={sale.totalAmount}
                saleItems={sale.saleItems}
                transaction={sale.transaction}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No sales found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Sales;