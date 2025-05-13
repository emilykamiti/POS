import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiSettings, FiHome, FiShoppingCart, FiUsers,
  FiFileText, FiDollarSign, FiCalendar,
  FiPieChart, FiTrendingUp, FiMenu, FiX
} from 'react-icons/fi';
import profileImage from '../assets/default.jpg';
import { useAppContext } from '../context/AppContext';

const navItems = [
  { text: 'Dashboard', icon: <FiHome /> },
  { text: 'Client Facing', icon: null },
  { text: 'Products', icon: <FiShoppingCart /> },
  {text: 'Sales', icon: <FiFileText /> },
  { text: 'Customers', icon: <FiUsers /> },
  { text: 'Transactions', icon: <FiFileText /> },
  { text: 'Sales', icon: null },
  { text: 'Overview', icon: <FiDollarSign /> },
  { text: 'Management', icon: null },
  { text: 'Performance', icon: <FiTrendingUp /> },
];

const Sidebar = ({ user, isNonMobile }) => {
  const { mode } = useAppContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(isNonMobile);
  const [active, setActive] = useState('');

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  return (
    <div className={`fixed top-0 left-0 h-full bg-gray-700 dark:bg-gray-800 text-gray-200 transition-all duration-300 z-40
      ${isOpen ? 'w-64' : 'w-20'}
    `}>
      {/* Toggle Button */}
      <div className="absolute -right-3 top-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-full bg-gray-600 dark:bg-gray-700 shadow-md hover:bg-gray-500 dark:hover:bg-gray-600"
        >
          {isOpen ? <FiX className="text-white" /> : <FiMenu className="text-white" />}
        </button>
      </div>

      <div className="flex flex-col h-full justify-between">
        {/* Header Section */}
        <div>
          <div className="p-4 flex items-center">
            {isOpen && (
              <h1 className="text-xl font-bold text-white ml-2">POSS</h1>
            )}
          </div>

          {/* Navigation Items */}
          <div className="mt-4">
            {navItems.map(({ text, icon }) => {
              if (!icon) {
                return isOpen && (
                  <div key={text} className="ml-6 my-2 text-gray-400 text-sm font-semibold">
                    {text}
                  </div>
                );
              }

              const lcText = text.toLowerCase();
              const isActive = active === lcText;

              return (
                <button
                  key={text}
                  onClick={() => {
                    navigate(`/${lcText}`);
                    setActive(lcText);
                  }}
                  className={`flex items-center w-full py-3 px-4 text-left transition-colors
                    ${isActive ? 'bg-gray-600 dark:bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-700'}
                  `}
                >
                  <span className={`text-lg ${isActive ? 'text-blue-300' : 'text-gray-400'}`}>
                    {icon}
                  </span>
                  {isOpen && (
                    <>
                      <span className="ml-3">{text}</span>
                      {isActive && (
                        <span className="ml-auto text-gray-400">
                          &gt;
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-gray-600 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <img
              src={profileImage}
              alt="profile"
              className="h-10 w-10 rounded-full object-cover"
            />
            {isOpen && (
              <div className="ml-3">
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;