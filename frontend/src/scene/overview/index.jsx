import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DashboardHeader from "../../components/DashboardHeader"; // Assuming Tailwind-styled header

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Mock data (replace with real data from your backend)
const mockData = {
  sales: [
    { month: "Jan", value: 12000 },
    { month: "Feb", value: 15000 },
    { month: "Mar", value: 13000 },
    { month: "Apr", value: 17000 },
    { month: "May", value: 16000 },
    { month: "Jun", value: 14000 },
    { month: "Jul", value: 18000 },
    { month: "Aug", value: 19000 },
    { month: "Sep", value: 16500 },
    { month: "Oct", value: 17500 },
    { month: "Nov", value: 20000 },
    { month: "Dec", value: 21000 },
  ],
  units: [
    { month: "Jan", value: 300 },
    { month: "Feb", value: 450 },
    { month: "Mar", value: 350 },
    { month: "Apr", value: 500 },
    { month: "May", value: 480 },
    { month: "Jun", value: 400 },
    { month: "Jul", value: 550 },
    { month: "Aug", value: 600 },
    { month: "Sep", value: 520 },
    { month: "Oct", value: 540 },
    { month: "Nov", value: 650 },
    { month: "Dec", value: 700 },
  ],
  totalSales: 150000,
  totalUnits: 4200,
};

const Overview = () => {
  const { mode } = useSelector((state) => state.global); // Access theme mode
  const [view, setView] = useState("sales");

  // Prepare chart data
  const chartData = {
    labels: mockData[view].map((item) => item.month),
    datasets: [
      {
        label: view === "sales" ? "Sales (KES)" : "Units Sold",
        data: mockData[view].map((item) => item.value),
        borderColor: view === "sales" ? "rgb(75, 192, 192)" : "rgb(255, 99, 132)",
        backgroundColor: view === "sales" ? "rgba(75, 192, 192, 0.2)" : "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: mode === "dark" ? "#ffffff" : "#000000",
        },
      },
      title: {
        display: true,
        text: view === "sales" ? "Monthly Sales (KES)" : "Monthly Units Sold",
        color: mode === "dark" ? "#ffffff" : "#000000",
      },
    },
    scales: {
      x: {
        ticks: {
          color: mode === "dark" ? "#ffffff" : "#000000",
        },
        grid: {
          color: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        ticks: {
          color: mode === "dark" ? "#ffffff" : "#000000",
        },
        grid: {
          color: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  return (
    <div className={`p-6 min-h-screen ${mode === "dark" ? "dark" : ""} bg-gray-100 dark:bg-gray-900`}>
      <div className="max-w-7xl mx-auto">
        <DashboardHeader  />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Total Sales
            </h3>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {mockData.totalSales.toLocaleString()} KES
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Total Units Sold
            </h3>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {mockData.totalUnits.toLocaleString()}
            </p>
          </div>
        </div>

        {/* View Selector and Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Sales Trend
            </h3>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sales">Sales</option>
              <option value="units">Units</option>
            </select>
          </div>
          <div className="h-[500px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;