import React, { useState, useEffect } from "react";
import axios from "axios";

const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";

const api = {
  getCategories: async ({ page, pageSize, sort, search }, token) => {
    const response = await axios.get(`${baseUrl}/api/categories`, {
      params: { page, size: pageSize, sort, search },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  getProducts: async ({ page, pageSize, sort, search }, token) => {
    const response = await axios.get(`${baseUrl}/api/products`, {
      params: { page, size: pageSize, sort, search },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  createSale: async (saleData, token) => {
    const response = await axios.post(`${baseUrl}/api/sales`, saleData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [change, setChange] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(16); // Default 16% tax

  const token = localStorage.getItem("token") || "";
  const [page] = useState(0);
  const [pageSize] = useState(100);
  const [sort] = useState("name,asc");
  const [search] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [categoryResult, productResult] = await Promise.all([
        api.getCategories({ page, pageSize, sort, search }, token).catch(() => ({ content: [] })),
        api.getProducts({ page, pageSize, sort, search }, token).catch(() => ({ content: [] })),
      ]);

      const uniqueCategories = [
        ...new Set(
          categoryResult.content
            ?.filter((cat) => cat.name)
            ?.map((cat) => cat.name) || []
        ),
      ];
      setCategories(uniqueCategories);

      const validProducts = productResult.content
        ?.filter((product) => product.id && product.name)
        ?.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price || 0,
          category: product.category?.name || "Uncategorized",
          image: product.image || "./assets/default.jpeg",
        })) || [];

      setProducts(validProducts);
    } catch (err) {
      setError("Failed to load data. Please check your connection.");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((product) => product.category === activeCategory);

  // Calculate totals with discount and tax
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
      setDiscountPercentage(prev => Math.max(0, Math.min(100, prev + delta)));
    } else {
      setTaxPercentage(prev => Math.max(0, prev + delta));
    }
  };

  const processPayment = async (paymentData) => {
    setIsLoading(true);
    setError(null);
    setSuccess("");

    try {
      const saleRequest = {
        items: selectedItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        paymentMethod: paymentData.method,
        ...(paymentData.method === "M-PESA" && { phoneNumber }),
        currency: "KES",
        discountPercentage: discountPercentage / 100,
        taxPercentage: taxPercentage / 100,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        total: parseFloat(total),
      };

      const response = await api.createSale(saleRequest, token);

      if (response.id) {
        setSuccess(`Payment successful! ${paymentData.method === "M-PESA" ?
          `Transaction ID: ${response.transactionId}` : `Sale ID: ${response.id}`}`);
        setSelectedItems([]);
        setPhoneNumber("");
        setAmountReceived("");
        setPaymentMethod(null);
        setDiscountPercentage(0);
      } else {
        throw new Error(response.message || "Payment processing failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to process payment");
      console.error("Payment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMpesaPayment = () => {
    if (!phoneNumber) {
      setError("Please enter a phone number for M-Pesa payment.");
      return;
    }
    if (!selectedItems.length) {
      setError("No items selected for payment.");
      return;
    }
    processPayment({ method: "M-PESA" });
  };

  const handleCashPayment = () => {
    const received = parseFloat(amountReceived) || 0;
    if (received < total) {
      setError("Amount received is less than the total.");
      return;
    }
    if (!selectedItems.length) {
      setError("No items selected for payment.");
      return;
    }
    processPayment({ method: "CASH" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col gap-6">
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
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white rounded-full p-2 shadow-md flex items-center overflow-x-auto">
        {["All", ...categories].map((category, index) => (
          <button
            key={`category-${index}`}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium mx-1 transition-colors ${
              activeCategory === category
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            disabled={isLoading}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          {filteredProducts.length === 0 && !isLoading ? (
            <p className="text-gray-500 text-center py-4">
              {products.length === 0 ? "No products available" : "No products in this category"}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((item) => {
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
                        e.target.src = "./assets/default.jpeg";
                      }}
                    />
                    <div className="p-3">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-purple-600 font-semibold">KES {item.price.toFixed(2)}</p>
                      <div className="flex justify-between items-center mt-2">
                        <button
                          onClick={() => handleAddItem(item)}
                          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
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
                            <span>{itemInCart.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="text-purple-600 hover:text-purple-800 disabled:opacity-50"
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
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="flex-1 overflow-y-auto max-h-64">
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No items selected</p>
            ) : (
              selectedItems.map((item) => (
                <div
                  key={`order-item-${item.id}`}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
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
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="text-purple-600 hover:text-purple-800 disabled:opacity-50"
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

          {/* Discount and Tax Controls */}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Discount:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePercentageChange('discount', -1)}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                  disabled={isLoading || discountPercentage <= 0}
                >
                  -
                </button>
                <span>{discountPercentage}%</span>
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
              <span className="text-sm">Tax:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePercentageChange('tax', -1)}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                  disabled={isLoading || taxPercentage <= 0}
                >
                  -
                </button>
                <span>{taxPercentage}%</span>
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

          {/* Order summary */}
          <div className="mt-2 border-t pt-2">
            <div className="flex justify-between text-sm">
              <p>Subtotal</p>
              <p>KES {subtotal.toFixed(2)}</p>
            </div>
            {discountPercentage > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <p>Discount ({discountPercentage}%)</p>
                <p>-KES {discountAmount.toFixed(2)}</p>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <p>Tax ({taxPercentage}%)</p>
              <p>KES {taxAmount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
              <p>Total</p>
              <p>KES {total}</p>
            </div>
          </div>

          {/* Payment methods */}
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Payment Method</h3>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="M-Pesa"
                  checked={paymentMethod === "M-Pesa"}
                  onChange={() => setPaymentMethod("M-Pesa")}
                  className="mr-2"
                  disabled={isLoading || selectedItems.length === 0}
                />
                M-Pesa
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash"
                  checked={paymentMethod === "Cash"}
                  onChange={() => setPaymentMethod("Cash")}
                  className="mr-2"
                  disabled={isLoading || selectedItems.length === 0}
                />
                Cash
              </label>
            </div>

            {paymentMethod === "M-Pesa" && (
              <div className="mt-2">
                <input
                  type="tel"
                  placeholder="Phone Number (e.g., 254712345678)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  disabled={isLoading}
                />
                <button
                  onClick={handleMpesaPayment}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={
                    isLoading ||
                    selectedItems.length === 0 ||
                    phoneNumber.length < 10
                  }
                >
                  {isLoading ? "Processing..." : "Initiate M-Pesa Payment"}
                </button>
              </div>
            )}

            {paymentMethod === "Cash" && (
              <div className="mt-2">
                <input
                  type="number"
                  placeholder="Amount Received (KES)"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                <p className="text-sm mb-2">Change: KES {change}</p>
                <button
                  onClick={handleCashPayment}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={
                    isLoading ||
                    selectedItems.length === 0 ||
                    parseFloat(amountReceived) < parseFloat(total)
                  }
                >
                  {isLoading ? "Processing..." : "Complete Cash Payment"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;