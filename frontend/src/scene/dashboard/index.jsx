import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../utils/AuthContext';

const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = {
  getCategories: async ({ page, pageSize, sort, search }) => {
    const response = await axios.get(`${baseUrl}/api/categories`, {
      params: { page, size: pageSize, sort, search },
    });
    return response.data;
  },
  getProducts: async ({ page, pageSize, sort, search, category }) => {
    const params = { page, size: pageSize, sort, search };
    if (category && category !== 'All') {
      params.category = category;
    }
    console.log('Fetching products with params:', params); // Debug API call
    const response = await axios.get(`${baseUrl}/api/products`, { params });
    return response.data;
  },
  createSale: async (saleData) => {
    const response = await axios.post(`${baseUrl}/api/sales`, saleData);
    return response.data;
  },
};

const Dashboard = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(16);

  const [page] = useState(0);
  const [pageSize] = useState(100);
  const [sort] = useState('name,asc');
  const [search] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch categories
      const categoryResult = await api.getCategories({ page, pageSize, sort, search }).catch((err) => {
        console.error('Categories fetch error:', err.response?.data || err);
        throw err;
      });
      const uniqueCategories = [
        ...new Set(
          categoryResult.content
            ?.filter((cat) => cat?.name)
            ?.map((cat) => cat.name) || []
        ),
      ];
      console.log('Fetched categories:', uniqueCategories); // Debug
      setCategories(uniqueCategories);

      // Fetch products
      const productResult = await api.getProducts({
        page,
        pageSize,
        sort,
        search,
        category: activeCategory,
      }).catch((err) => {
        console.error('Products fetch error:', err.response?.data || err);
        throw err;
      });

      const validProducts = productResult.content
        ?.filter((product) => product?.id && product?.name)
        ?.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price || 0,
          category: product.category || 'Uncategorized',
          image: product.image || './assets/default.jpeg',
        })) || [];
      console.log('Fetched products:', validProducts); // Debug
      setProducts(validProducts);
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? 'Unauthorized access. Please log in again.'
          : err.response?.status === 403
          ? 'You lack the required permissions to perform this action.'
          : err.response?.data?.message || 'Failed to load data. Please try again.';
      setError(errorMessage);
      console.error('Fetch error:', err);
      setProducts([]); // Reset products on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeCategory]); // Re-fetch on category change

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = subtotal * (discountPercentage / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxPercentage / 100);
  const total = (taxableAmount + taxAmount).toFixed(2);

  useEffect(() => {
    const received = parseFloat(amountReceived) || 0;
    setChange(received >= total ? (received - total).toFixed(2) : 0);
  }, [amountReceived, total]);

  const handleAddItem = (item) => {
    const existingItem = selectedItems.find((i) => i.id === item.id);
    if (existingItem) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id, delta) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handlePercentageChange = (type, delta) => {
    if (type === 'discount') {
      setDiscountPercentage((prev) => Math.max(0, Math.min(100, prev + delta)));
    } else {
      setTaxPercentage((prev) => Math.max(0, prev + delta));
    }
  };

  const processPayment = async (paymentData) => {
    setIsLoading(true);
    setError(null);
    setSuccess('');

    try {
      if (!customerId) {
        throw new Error('Please enter a customer ID.');
      }
      const saleRequest = {
        items: selectedItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod: paymentData.method,
        ...(paymentData.method === 'M-PESA' && { phoneNumber }),
        currency: 'KES',
        discountPercentage: discountPercentage / 100,
        taxPercentage: taxPercentage / 100,
        customerId: parseInt(customerId),
      };

      const response = await api.createSale(saleRequest);

      if (response.id) {
        setSuccess(
          `Payment successful! ${
            paymentData.method === 'M-PESA'
              ? `Transaction ID: ${response.transactionId || 'N/A'}`
              : `Sale ID: ${response.id}`
          }`
        );
        setSelectedItems([]);
        setPhoneNumber('');
        setCustomerId('');
        setAmountReceived('');
        setPaymentMethod(null);
        setDiscountPercentage(0);
      } else {
        throw new Error(response.message || 'Payment processing failed');
      }
    } catch (err) {
      const errorMessage =
        err.message === 'Please enter a customer ID.'
          ? err.message
          : err.response?.status === 400
          ? err.response?.data?.message || 'Invalid sale request. Please check the customer ID, payment method, and items.'
          : err.response?.status === 401
          ? 'Unauthorized access. Please log in again.'
          : err.response?.status === 403
          ? 'You lack the required permissions to process sales.'
          : err.response?.data?.message || 'Failed to process payment';
      setError(errorMessage);
      console.error('Payment error:', err.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMpesaPayment = () => {
    if (!phoneNumber) {
      setError('Please enter a phone number for M-PESA payment.');
      return;
    }
    if (!selectedItems.length) {
      setError('No items selected for payment.');
      return;
    }
    processPayment({ method: 'M-PESA' });
  };

  const handleVisaCardPayment = () => {
    const received = parseFloat(amountReceived) || 0;
    if (received < total) {
      setError('Amount received is less than the total.');
      return;
    }
    if (!selectedItems.length) {
      setError('No items selected for payment.');
      return;
    }
    processPayment({ method: 'VISA-CARD' });
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col gap-6 box-border">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-blue-600">Processing, please wait...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-gray-100 border-l-4 border-gray-500 text-gray-700 p-4 rounded">
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white rounded-full p-2 shadow-md flex items-center overflow-x-auto">
        {['All', ...categories].map((category, index) => (
          <button
            key={`category-${index}`}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium mx-1 transition-colors ${
              activeCategory === category
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={isLoading}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Menu</h2>
          {products.length === 0 && !isLoading ? (
            <p className="text-gray-500 text-center py-4">
              {activeCategory === 'All'
                ? 'No products available'
                : `No products in ${activeCategory}`}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((item) => {
                const itemInCart = selectedItems.find((i) => i.id === item.id);
                return (
                  <div
                    key={`product-${item.id}`}
                    className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.src = './assets/default.jpeg';
                      }}
                    />
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-600 font-semibold">
                        KES {item.price.toFixed(2)}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <button
                          onClick={() => handleAddItem(item)}
                          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-grey-100 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          Add
                        </button>
                        {itemInCart && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              disabled={isLoading}
                            >
                              -
                            </button>
                            <span className="text-gray-900">{itemInCart.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              disabled={isLoading}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Order Details</h2>
          <div className="mb-4">
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
              Customer ID
            </label>
            <input
              id="customerId"
              type="number"
              placeholder="Enter Customer ID"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1 bg-white text-gray-900"
              disabled={isLoading}
              required
            />
          </div>
          <div className="flex-1 overflow-y-auto max-h-64">
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No items selected
              </p>
            ) : (
              selectedItems.map((item) => (
                <div
                  key={`order-item-${item.id}`}
                  className="flex justify-between items-center p-2 border-b border-gray-200"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">
                      KES {item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      -
                    </button>
                    <span className="text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Discount:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePercentageChange('discount', -1)}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                  disabled={isLoading || discountPercentage <= 0}
                >
                  -
                </button>
                <span className="text-gray-900">{discountPercentage}%</span>
                <button
                  onClick={() => handlePercentageChange('discount', 1)}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                  disabled={isLoading || discountPercentage >= 100}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Tax:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePercentageChange('tax', -1)}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                  disabled={isLoading || taxPercentage <= 0}
                >
                  -
                </button>
                <span className="text-gray-900">{taxPercentage}%</span>
                <button
                  onClick={() => handlePercentageChange('tax', 1)}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                  disabled={isLoading}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 border-t border-gray-200 pt-2">
            <div className="flex justify-between text-sm text-gray-700">
              <p>Subtotal</p>
              <p>KES {subtotal.toFixed(2)}</p>
            </div>
            {discountPercentage > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <p>Discount ({discountPercentage}%)</p>
                <p>-KES {discountAmount.toFixed(2)}</p>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-700">
              <p>Tax ({taxPercentage}%)</p>
              <p>KES {taxAmount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200 text-gray-900">
              <p>Total</p>
              <p>KES {total}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2 text-gray-900">Payment Method</h3>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="M-PESA"
                  checked={paymentMethod === 'M-PESA'}
                  onChange={() => setPaymentMethod('M-PESA')}
                  className="mr-2"
                  disabled={isLoading || selectedItems.length === 0}
                />
                <span className="text-gray-700">M-PESA</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="VISA-CARD"
                  checked={paymentMethod === 'VISA-CARD'}
                  onChange={() => setPaymentMethod('VISA-CARD')}
                  className="mr-2"
                  disabled={isLoading || selectedItems.length === 0}
                />
                <span className="text-gray-700">Cash/Card</span>
              </label>
            </div>

            {paymentMethod === 'M-PESA' && (
              <div className="mt-2">
                <input
                  type="tel"
                  placeholder="Phone Number (e.g., 254712345678)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-2 bg-white text-gray-900"
                  disabled={isLoading}
                />
                <button
                  onClick={handleMpesaPayment}
                  className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                  disabled={
                    isLoading ||
                    selectedItems.length === 0 ||
                    phoneNumber.length < 10 ||
                    !customerId
                  }
                >
                  {isLoading ? 'Processing...' : 'Initiate M-PESA Payment'}
                </button>
              </div>
            )}

            {paymentMethod === 'VISA-CARD' && (
              <div className="mt-2">
                <input
                  type="number"
                  placeholder="Amount Received (KES)"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-2 bg-white text-gray-900"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                <p className="text-sm mb-2 text-gray-700">Change: KES {change}</p>
                <button
                  onClick={handleVisaCardPayment}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={
                    isLoading ||
                    selectedItems.length === 0 ||
                    parseFloat(amountReceived) < parseFloat(total) ||
                    !customerId
                  }
                >
                  {isLoading ? 'Processing...' : 'Complete Payment'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ProtectedRoute wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default () => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
);