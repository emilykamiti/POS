import React, { useState } from "react";

const Dashboard = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Sample data for orders and menu items
  const orders = [
    { id: 1, name: "Yohana Rager", status: "Completed", table: "Table 2" },
    { id: 2, name: "Cheryl Arlena", status: "In Progress", table: "Table 3" },
    { id: 3, name: "Kylan Rex", status: "Pending", table: "Table 4" },
    { id: 4, name: "Rijal Ardianto", status: "Completed", table: "Table 5" },
    { id: 5, name: "Ed Bemi", status: "In Progress", table: "Table 6" },
  ];

  const menuCategories = [
    { name: "Appetizer", items: [
      { id: 1, name: "Crispy Day Sambal Matah", price: "$10.00", image: "https://via.placeholder.com/150" },
      { id: 2, name: "Dory in Oat", price: "$7.50", image: "https://via.placeholder.com/150" },
    ]},
    { name: "Main Course", items: [
      { id: 3, name: "Kopak Benedict", price: "$7.50", image: "https://via.placeholder.com/150" },
      { id: 4, name: "Lemon Butter Dory", price: "$5.00", image: "https://via.placeholder.com/150" },
      { id: 5, name: "Banana Wrap", price: "$10.00", image: "https://via.placeholder.com/150" },
    ]},
    { name: "Dessert", items: [
      { id: 6, name: "Holland Buttercake", price: "$5.00", image: "https://via.placeholder.com/150" },
      { id: 7, name: "Spicy Tuna Nachos", price: "$7.50", image: "https://via.placeholder.com/150" },
    ]},
    { name: "Beverage", items: [
      { id: 8, name: "Butterscotch", price: "$3.00", image: "https://via.placeholder.com/150" },
      { id: 9, name: "Altredo", price: "$7.50", image: "https://via.placeholder.com/150" },
      { id: 10, name: "Blackpepper Chicken", price: "$7.50", image: "https://via.placeholder.com/150" },
    ]},
  ];

  const handleAddItem = (item) => {
    setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id, delta) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const total = selectedItems.reduce((sum, item) => sum + parseFloat(item.price.replace("$", "")) * item.quantity, 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col gap-6">
      {/* Top Panel - Order List with Horizontal Cards */}
      <div className="w-full bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Order List</h2>
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col auto-cols-max gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-3 w-48 flex flex-col justify-between min-w-[12rem]"
              >
                <div>
                  <p className="font-medium text-sm truncate">{order.name}</p>
                  <p className="text-xs text-gray-500">
                    {order.status} - {order.table}
                  </p>
                </div>
                <span
                  className={`mt-2 px-2 py-1 text-xs rounded-full text-white inline-block w-fit ${
                    order.status === "Completed"
                      ? "bg-green-500"
                      : order.status === "In Progress"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
        <button className="mt-4 w-full bg-gray-200 text-white py-2 rounded hover:bg-purple-700">

        </button>
      {/* Middle and Right Panels - Menu and Order Details */}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Center Panel - Menu */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow p-4">
          <div className="flex space-x-4 mb-4">
            {["Appetizer", "Main Course", "Dessert", "Beverage"].map((category) => (
              <button
                key={category}
                className="text-sm font-medium px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                {category}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuCategories.flatMap((category) =>
              category.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="p-2">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-purple-600 font-semibold">{item.price}</p>
                    <div className="flex justify-between items-center mt-2">
                      <button className="text-gray-400 hover:text-gray-600">-</button>
                      <span className="text-gray-600">0</span>
                      <button
                        onClick={() => handleAddItem(item)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Order Details and Summary */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-4 flex flex-col justify-between">
          {/* Customer Information (Now Inside Right Panel) */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Customer Name"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Select Table"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
              Submit
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Order Details</h2>
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-2 border-b border-gray-200"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.price}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <h3 className="text-md font-semibold">Order Summary</h3>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm">Subtotal</p>
                <p className="text-sm">${total}</p>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm">Tax (0%)</p>
                <p className="text-sm">$0.00</p>
              </div>
              <div className="flex justify-between items-center mt-1 font-semibold">
                <p className="text-sm">Total</p>
                <p className="text-sm">${total}</p>
              </div>
            </div>
          </div>
          <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
            Process Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;