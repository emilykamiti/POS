// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import Layout from './scene/layout';
import Dashboard from './scene/dashboard';
import Products from './scene/products';
import Customers from './scene/customers';
import Transactions from './scene/transactions';
import Login from './scene/login';
import SignUp from './scene/signup';
import Home from './scene/home';
import Overview from './scene/overview';
import VerifyEmail from './scene/verifyemail'
import Sales from './scene/sales';

function App() {
  const { mode } = useAppContext(); // Access theme mode from context

  return (
    <div className={`min-h-screen ${mode === 'dark' ? 'dark' : ''}`}>
      <BrowserRouter>
        <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
         <Route path="/signup" element={<SignUp />} />
         <Route path="/verifyemail" element={<VerifyEmail />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/sales" element={<Sales />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;