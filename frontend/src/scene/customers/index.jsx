// src/scene/customers.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import DataTable from '../../components/DataTable';
import api from '../../state/api';
import useTableParams from '../../hooks/useTableParams';
import { useAppContext } from '../../context/AppContext';

const Customers = () => {
  const { mode, toggleMode } = useAppContext();
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    search,
    searchInput,
    setSearchInput,
    handleSearch,
    handleSort,
  } = useTableParams();

  const [data, setData] = useState({ customers: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getCustomers({
          page,
          pageSize,
          sort,
          search,
        });
        setData({
          customers: result.customers || [],
          total: result.total || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [page, pageSize, sort, search]);

  const columns = [
    { field: '_id', headerName: 'ID', sortable: false },
    { field: 'name', headerName: 'Name', sortable: true },
    { field: 'email', headerName: 'Email', sortable: true },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      sortable: false,
      render: (value) =>
        value ? value.replace(/^(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : '',
    },
    { field: 'country', headerName: 'Country', sortable: true },
    { field: 'occupation', headerName: 'Occupation', sortable: true },
    { field: 'role', headerName: 'Role', sortable: true },
  ];

  return (
    <div
      className={`p-6 min-h-screen ${mode === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}
    >
      <div className='max-w-7xl mx-auto'>
        <Header title='CUSTOMERS' subtitle='List of customers' />
        <button
          onClick={toggleMode}
          className='mb-4 px-4 py-2 bg-blue-600 text-white rounded dark:bg-blue-500 dark:hover:bg-blue-600'
        >
          Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        <div className='flex items-center space-x-4 mb-6'>
          <input
            type='text'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Search customers...'
            className='px-4 py-2 rounded border w-full max-w-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'
          />
          <button
            onClick={handleSearch}
            className='px-4 py-2 bg-blue-600 text-white rounded dark:bg-blue-500 dark:hover:bg-blue-600'
          >
            Search
          </button>
        </div>
        <DataTable
          columns={columns}
          data={data.customers}
          total={data.total}
          isLoading={isLoading}
          error={error}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          sort={sort}
          handleSort={handleSort}
        />
      </div>
    </div>
  );
};

export default Customers;