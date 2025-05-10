import React, { useState, useEffect, useRef } from "react";

const Dashboard = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Sample data for orders and menu items
  const orders = [
    { id: 1, name: "Yohana Rager", status: "Completed", table: "Table 2" },
    { id: 2, name: "Cheryl Arlena", status: "In Progress", table: "Table 3" },
    { id: 3, name: "Kylan Rex", status: "Pending", table: "Table 4" },
    { id: 4, name: "Rijal Ardianto", status: "Completed", table: "Table 5" },
    { id: 5, name: "Ed Bemi", status: "In Progress", table: "Table 6" },
    { id: 5, name: "nasinza", status: "Completed", table: "Table 6" },
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

  const allCategories = ["All", ...menuCategories.map(cat => cat.name),"Electronics","Food", "Specials", "Sides", "Snacks"];

  const handleAddItem = (item) => {
    const existingItem = selectedItems.find(i => i.id === item.id);
    if (existingItem) {
      setSelectedItems(
        selectedItems.map(i =>
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
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const handleSearchClick = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = allCategories.filter(category =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMenuItems = menuCategories.flatMap(category => {
    if (activeCategory === "All" || activeCategory === category.name) {
      return category.items;
    }
    return [];
  });

  const total = selectedItems.reduce(
    (sum, item) => sum + parseFloat(item.price.replace("$", "")) * item.quantity,
    0
  ).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-6 rounded-lg">
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

      {/* Category Filter with Search */}
      <div className="bg-gray-100 rounded-full p-2 inline-flex mb-4">
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          {filteredCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-sm font-medium px-4 py-1 rounded-full whitespace-nowrap ${
                activeCategory === category
                  ? "bg-purple-600 text-white"
                  : "bg-white hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}

          {/* Search input that expands */}
          <div
            ref={searchRef}
            className={`ml-2 flex items-center ${searchOpen ? "bg-white rounded-full px-3" : ""}`}
          >
            {searchOpen ? (
              <input
                ref={inputRef}
                type="text"
                placeholder="Search categories..."
                className="text-sm bg-transparent border-none focus:ring-0 outline-none py-1 w-32"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            ) : null}
            <button
              onClick={handleSearchClick}
              className={`p-2 rounded-full ${searchOpen ? "bg-white" : "bg-white hover:bg-gray-200"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Middle and Right Panels - Menu and Order Details */}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Center Panel - Menu */}
        <div className="w-full w-[95%] bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map((item) => {
              const itemInCart = selectedItems.find(i => i.id === item.id);
              return (
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
                      <button
                        onClick={() => itemInCart && handleQuantityChange(item.id, -1)}
                        className={`${itemInCart ? "text-gray-600" : "text-gray-300"} hover:text-gray-800`}
                        disabled={!itemInCart}
                      >
                        -
                      </button>
                      <span className="text-gray-600">{itemInCart?.quantity || 0}</span>
                      <button
                        onClick={() => handleAddItem(item)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Order Details and Summary */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-4 flex flex-col justify-between">
          {/* Customer Information */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
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

          <div className="flex-grow overflow-y-auto">
            <h2 className="text-lg font-semibold">Order Details</h2>
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-sm mt-2">No items selected</p>
            ) : (
              selectedItems.map((item) => (
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
              ))
            )}
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
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

          <button
            className={`mt-4 w-full py-2 rounded ${
              selectedItems.length > 0
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={selectedItems.length === 0}
          >
            Process Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;