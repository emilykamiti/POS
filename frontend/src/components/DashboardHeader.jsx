import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiSettings,
  FiSearch,
  FiLogIn,
  FiUserPlus,
} from "react-icons/fi";

const DashboardHeader = ({ pageTitle }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState({
    name: "Guest",
    email: "guest@example.com",
    profileImage: "../assets/default.png",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/user");
        if (!response.ok) throw new Error("Failed to fetch user");
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
    <div className="flex justify-center">
    <header className="z-10 mt-5 flex items-center justify-between px-6 py-3 w-[95%] max-w-6xl bg-white-700 shadow-lg text-gray-800 rounded-full">

        {/* Left Side: Logo */}
        <h1 className="text-xl font-bold">POSS</h1>

        {/* Center: Navigation Links */}
        <nav className="flex-1 flex justify-center space-x-8">
          <Link to="/" className="text-gray-600 hover:text-gray-800">
            Home
          </Link>
          <Link to="/products" className="text-gray-600 hover:text-gray-800">
            Products
          </Link>
          <Link to="/sales" className="text-gray-600 hover:text-gray-800">
            Sales
          </Link>
          <Link to="/discounts" className="text-gray-600 hover:text-gray-800">
            Discounts
          </Link>
           <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
             Dashboard
          </Link>
        </nav>
     {/* Right Side: Profile Image, Dropdown, Settings, and Notifications */}
        <button className="p-4 hover:bg-gray-200 rounded-full">
            <FiSettings className="text-gray-800 text-xl" />
        </button>
        <button className="p-4 hover:bg-gray-200 rounded-full">
            <FiBell className="text-gray-800 text-xl" />
        </button>
        <div className="flex items-center space-x-4">
          {user.name === "Guest" ? (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src="../assets/default.png"
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-gray-300"
                  />
                  <FiChevronDown
                    className={`text-gray-800 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                    <Link
                      to="/login"
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Login <FiLogIn className="mr-2" />
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      SignUp <FiUserPlus className="mr-2" />
                    </Link>
                    <Link
                      to="/logout"
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      LogOut <FiLogOut className="mr-2" />
                    </Link>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={
                      user.profileImage && user.profileImage !== "default.png"
                        ? `../assets/${user.profileImage}`
                        : "../assets/default.png"
                    }
                    alt="User"
                    className="h-8 w-8 rounded-full object-cover border-2 border-gray-300"
                  />
                  <FiChevronDown
                    className={`text-gray-800 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-800">
                        {user.name}
                      </p>
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
              <button className="p-2 hover:bg-gray-200 rounded-full">
                <FiSettings className="text-gray-800 text-xl" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-full">
                <FiBell className="text-gray-800 text-xl" />
              </button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default DashboardHeader;