// src/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiShoppingCart,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiPieChart,
  FiTrendingUp,
} from 'react-icons/fi';
import profileImage from '../assets/default.jpg';
import { useAppContext } from '../context/AppContext';

const navItems = [
  { text: 'Dashboard', icon: <FiHome /> },
  { text: 'Client Facing', icon: null },
  { text: 'Products', icon: <FiShoppingCart /> },
  { text: 'Customers', icon: <FiUsers /> },
  { text: 'Transactions', icon: <FiFileText /> },
  { text: 'Sales', icon: null },
  { text: 'Overview', icon: <FiDollarSign /> },
  { text: 'Daily', icon: <FiCalendar /> },
  { text: 'Monthly', icon: <FiCalendar /> },
  { text: 'Breakdown', icon: <FiPieChart /> },
  { text: 'Management', icon: null },
  { text: 'Performance', icon: <FiTrendingUp /> },
];

const Sidebar = ({
  user,
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { mode } = useAppContext();
  const { pathname } = useLocation();
  const [active, setActive] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  return (
    <nav>
      {isSidebarOpen && (
        <div
          className={`fixed top-0 left-0 h-full bg-gray-800 dark:bg-gray-900 text-gray-200 dark:text-gray-100 box-border transition-all duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            width: drawerWidth,
            borderWidth: isNonMobile ? 0 : '2px',
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className='flex flex-col h-full justify-between'>
            {/* Header Section */}
            <div>
              <div className='flex items-center justify-between p-4 pl-6'>
                <div className='flex items-center gap-2'>
                  <h1 className='text-xl font-bold text-gray-100 dark:text-gray-50'>
                    POSS
                  </h1>
                </div>
                {!isNonMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className='text-gray-200 dark:text-gray-100 hover:bg-gray-700 dark:hover:bg-gray-800 p-1 rounded-full'
                  >
                    <FiChevronLeft className='text-xl' />
                  </button>
                )}
              </div>
              {/* Navigation Items */}
              <div className='mt-4'>
                {navItems.map(({ text, icon }) => {
                  if (!icon) {
                    return (
                      <div
                        key={text}
                        className='ml-6 my-2 text-gray-400 dark:text-gray-500 text-sm font-semibold'
                      >
                        {text}
                      </div>
                    );
                  }
                  const lcText = text.toLowerCase();
                  const isActive = active === lcText;
                  return (
                    <div key={text}>
                      <button
                        onClick={() => {
                          navigate(`/${lcText}`);
                          setActive(lcText);
                        }}
                        className={`flex items-center w-full py-2 px-4 text-left ${
                          isActive
                            ? 'bg-gray-700 dark:bg-gray-800 text-gray-100 dark:text-gray-50'
                            : 'text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span
                          className={`mr-3 ${
                            isActive
                              ? 'text-blue-400 dark:text-blue-300'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {icon}
                        </span>
                        <span className='flex-1'>{text}</span>
                        {isActive && (
                          <FiChevronRight className='text-gray-400 dark:text-gray-500 ml-auto' />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* User Profile Section */}
            <div>
              <div className='border-t border-gray-600 dark:border-gray-700' />
              <div className='flex items-center gap-4 p-4'>
                <img
                  src={profileImage}
                  alt='profile'
                  className='h-10 w-10 rounded-full object-cover'
                />
                <div className='flex-1 text-left'>
                  <p className='text-sm font-bold text-gray-100 dark:text-gray-50'>
                    {user.name}
                  </p>
                  <p className='text-xs text-gray-400 dark:text-gray-500'>
                    {user.email}
                  </p>
                </div>
                <FiSettings className='text-gray-400 dark:text-gray-500 text-xl' />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;