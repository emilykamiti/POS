// src/scene/customers.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import DataTable from '../../components/DataTable';
import api from '../../state/api';
import useTableParams from '../../hooks/useTableParams';
import { useAppContext } from '../../context/AppContext';

const Customers = () => {
    const { mode, toggleMode, token } = useAppContext();
      const [data, setData] = useState({ products: [], total: 0 });
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(null);
      const [openForm, setOpenForm] = useState(false);
      const [currentProduct, setCurrentProduct] = useState(null);
      const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
      const [productToDelete, setProductToDelete] = useState(null);
      const [successMessage, setSuccessMessage] = useState(null);
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


 const fetchCustomers = async () => {
       setIsLoading(true);
       setError(null);
       try {
         const result = await api.getCustomers({ page, pageSize, sort, search }, token);
         setData({
           customers: result.content || [],
           total: result.totalElements || 0,
         });
       } catch (err) {
         setError(err.message);
       } finally {
         setIsLoading(false);
       }
     };

     useEffect(() => {
       fetchCustomers();
     }, [page, pageSize, sort, search, token]);

  const columns = [
    { field: 'id', headerName: 'ID', sortable: true },
    { field: 'name', headerName: 'Name', sortable: true },
    { field: 'email', headerName: 'Email', sortable: true },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      sortable: false,
      render: (value) =>
        value ? value.replace(/^(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : '',
    },
    { field: 'loyaltyPoints', headerName: 'LoyaltyPoints', sortable: true },
    { field: 'createdAt', headerName: 'CreatedAt', sortable: true },

  ];

  return (
    <div
      className={`p-6 min-h-screen `}
    >
      <div className='max-w-7xl mx-auto'>
        <Header title='CUSTOMERS' subtitle='List of customers' />


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