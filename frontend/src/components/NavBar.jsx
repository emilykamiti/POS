// src/NavBar.jsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import profileImage from '../assets/default.jpg';
import { FaBars, FaSearch, FaMoon, FaSun, FaCog, FaChevronDown } from 'react-icons/fa';

const Navbar = ({ user, isSidebarOpen, setIsSidebarOpen }) => {
  const { mode, toggleMode } = useAppContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSidebarOpen ? 'ml-[250px] w-[calc(100%-250px)]' : 'w-full'
      } bg-white dark:bg-gray-900 shadow`}
    >
      <div className='flex items-center justify-between px-4 py-2'>
        {/* LEFT: Sidebar toggle and search */}
        <div className='flex items-center gap-4'>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className='text-gray-700 dark:text-gray-200'
          >
            <FaBars size={20} />
          </button>
          <div className='flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded px-3 py-1'>
            <input
              type='text'
              placeholder='Search...'
              className='bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200'
            />
            <FaSearch className='text-gray-500 dark:text-gray-300' />
          </div>
        </div>
        {/* RIGHT: Actions */}
        <div className='flex items-center gap-6'>
          <button onClick={toggleMode} className='text-gray-700 dark:text-gray-200'>
            {mode === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
          <button className='text-gray-700 dark:text-gray-200'>
            <FaCog size={20} />
          </button>
          <div className='relative'>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className='flex items-center gap-2 focus:outline-none'
            >
              <img
                src={profileImage}
                alt='Profile'
                className='w-8 h-8 rounded-full object-cover'
              />
              <div className='text-left hidden sm:block'>
                <p className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
                  {user?.name || 'User Name'}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {user?.email || 'Email'}
                </p>
              </div>
              <FaChevronDown className='text-gray-600 dark:text-gray-300' />
            </button>
            {dropdownOpen && (
              <div className='absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded shadow-lg z-10'>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;