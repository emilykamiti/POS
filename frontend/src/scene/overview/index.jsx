
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import DataTable from '../../components/DataTable';
import api from '../../state/api';
import useTableParams from '../../hooks/useTableParams';
import { useAppContext } from '../../context/AppContext';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Overview = () => {
  const { mode, token } = useAppContext();
  const [data, setData] = useState({ sales: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([subDays(new Date(), 7), new Date()]);
  const [startDate, endDate] = dateRange;

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

  // Fetch sales data
  const fetchSales = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        pageSize,
        sort,
        search,
        ...(startDate && { startDate: format(startOfDay(startDate), 'yyyy-MM-dd') }),
        ...(endDate && { endDate: format(endOfDay(endDate), 'yyyy-MM-dd') }),
      };
      const result = await api.getSales(params, token);
      console.log('Reports response:', result);
      setData({
        sales: result.content || [],
        total: result.totalElements || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, pageSize, sort, search, startDate, endDate, token]);

  // Calculate metrics
  const totalSales = data.sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalItemsSold = data.sales.reduce((sum, sale) => sum + sale.items.reduce((s, item) => s + item.quantity, 0), 0);
  const averageSale = data.sales.length > 0 ? totalSales / data.sales.length : 0;

  // Sales by date for bar chart
  const salesByDate = data.sales.reduce((acc, sale) => {
    const date = sale.saleDate.split(' ')[0];
    acc[date] = (acc[date] || 0) + sale.totalPrice;
    return acc;
  }, {});
  const barData = {
    labels: Object.keys(salesByDate),
    datasets: [
      {
        label: 'Sales by Date (KES)',
        data: Object.values(salesByDate),
        backgroundColor: '#14B8A6',
        borderColor: '#0D9488',
        borderWidth: 1,
      },
    ],
  };

  // Sales by payment method for pie chart
  const salesByPayment = data.sales.reduce((acc, sale) => {
    const method = sale.paymentMethod;
    acc[method] = (acc[method] || 0) + sale.totalPrice;
    return acc;
  }, {});
  const pieData = {
    labels: Object.keys(salesByPayment),
    datasets: [
      {
        data: Object.values(salesByPayment),
        backgroundColor: ['#2563EB', '#14B8A6', '#FBBF24', '#EF4444'],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  // Top 5 customers
  const salesByCustomer = data.sales.reduce((acc, sale) => {
    const customer = sale.customer?.name || 'Unknown';
    acc[customer] = (acc[customer] || 0) + sale.totalPrice;
    return acc;
  }, {});
  const topCustomers = Object.entries(salesByCustomer)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const customerBarData = {
    labels: topCustomers.map(([name]) => name),
    datasets: [
      {
        label: 'Top Customers (KES)',
        data: topCustomers.map(([, amount]) => amount),
        backgroundColor: '#2563EB',
        borderColor: '#1D4ED8',
        borderWidth: 1,
      },
    ],
  };

  // Table columns
  const columns = [
    { field: 'id', headerName: 'ID', sortable: true },
    {
      field: 'saleDate',
      headerName: 'Sale Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      field: 'subtotalPrice',
      headerName: 'Subtotal Price',
      sortable: true,
      render: (value) => `${value.toFixed(2)} KES`,
    },
    {
      field: 'discountAmount',
      headerName: 'Discount Amount',
      sortable: true,
      render: (value) => `${value.toFixed(2)} KES`,
    },
    {
      field: 'taxAmount',
      headerName: 'Tax Amount',
      sortable: true,
      render: (value) => `${value.toFixed(2)} KES`,
    },
    {
      field: 'totalPrice',
      headerName: 'Total Price',
      sortable: true,
      render: (value) => `${value.toFixed(2)} KES`,
    },
    {
      field: 'customer.name',
      headerName: 'Customer',
      sortable: true,
      render: (_, row) => row.customer?.name || 'N/A',
    },
    {
      field: 'paymentMethod',
      headerName: 'Payment Method',
      sortable: true,
    },
  ];

  return (

    <div className={`p-8 min-h-screen ${mode === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <Header title="Sales Reports"  />
      <div className="max-w-7xl mx-auto">
{/*         <Header title="Sales Reports"  /> */}

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className={`mb-6 p-4 rounded-lg border ${mode === 'dark' ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-400 text-red-800'}`}
          >
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}



        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div
            className={`p-6 rounded-lg shadow-lg ${
              mode === 'dark' ? 'bg-gray-800' : 'bg-white'
            } hover:shadow-xl transition-shadow`}
          >
            <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
            <p className="text-2xl font-bold text-blue-600">{totalSales.toFixed(2)} KES</p>
          </div>
          <div
            className={`p-6 rounded-lg shadow-lg ${
              mode === 'dark' ? 'bg-gray-800' : 'bg-white'
            } hover:shadow-xl transition-shadow`}
          >
            <h3 className="text-lg font-semibold mb-2">Total Items Sold</h3>
            <p className="text-2xl font-bold text-blue-600">{totalItemsSold}</p>
          </div>
          <div
            className={`p-6 rounded-lg shadow-lg ${
              mode === 'dark' ? 'bg-gray-800' : 'bg-white'
            } hover:shadow-xl transition-shadow`}
          >
            <h3 className="text-lg font-semibold mb-2">Average Sale</h3>
            <p className="text-2xl font-bold text-blue-600">{averageSale.toFixed(2)} KES</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div
            className={`p-6 rounded-lg shadow-lg ${
              mode === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">Sales by Date</h3>
            <div className="h-64">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { backgroundColor: mode === 'dark' ? '#1F2A44' : '#FFFFFF' },
                  },
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Amount (KES)' } },
                    x: { title: { display: true, text: 'Date' } },
                  },
                }}
                aria-label="Bar chart showing sales by date"
              />
            </div>
          </div>
          <div
            className={`p-6 rounded-lg shadow-lg ${
              mode === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">Sales by Payment Method</h3>
            <div className="h-64">
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'right' },
                    tooltip: { backgroundColor: mode === 'dark' ? '#1F2A44' : '#FFFFFF' },
                  },
                }}
                aria-label="Pie chart showing sales distribution by payment method"
              />
            </div>
          </div>
          <div
            className={`p-6 rounded-lg shadow-lg ${
              mode === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">Top 5 Customers</h3>
            <div className="h-64">
              <Bar
                data={customerBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { backgroundColor: mode === 'dark' ? '#1F2A44' : '#FFFFFF' },
                  },
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Amount (KES)' } },
                    x: { title: { display: true, text: 'Customer' } },
                  },
                }}
                aria-label="Bar chart showing top 5 customers by purchase amount"
              />
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Overview;