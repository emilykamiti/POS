import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiSettings,
  FiSearch,
} from "react-icons/fi";

const DashboardHeader = ({ pageTitle }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState({ name: "", email: "", profileImage: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/user");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      navigate(`/dashboard/search?q=${searchQuery}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 right-0 z-10 flex items-center justify-between p-4 w-[calc(100%-250px)]">
      {/* Page Title */}
      <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-200 transition-all">
          <FiBell className="text-gray-700 text-xl" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="p-2 rounded-full hover:bg-gray-200 transition-all">
          <FiSettings className="text-gray-700 text-xl" />
        </button>

        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-200 transition-all"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <FiSearch className="text-gray-700 text-xl" />
          </button>

          {isSearchOpen && (
            <form onSubmit={handleSearch} className="absolute right-10 top-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="border border-gray-300 rounded px-2 py-1 w-48 focus:outline-none focus:ring focus:border-blue-300"
              />
            </form>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <img
              src={
                user.profileImage && user.profileImage !== "default.png"
                  ? `/uploads/${user.profileImage}`
                  : "/uploads/default.png"
              }
              alt="User"
              className="h-8 w-8 rounded-full object-cover border border-gray-300"
            />
            <FiChevronDown
              className={`text-gray-600 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <FiLogOut className="mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;