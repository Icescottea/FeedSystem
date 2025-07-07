import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Login from './pages/Login';
import InventoryPage from './pages/InventoryPage';
import FeedProfilePage from './pages/FeedProfilePage';
import FormulationEnginePage from './pages/FormulationEnginePage';
import FormulationLibraryPage from './pages/FormulationLibraryPage';
import FormulationBuilderPage from './pages/FormulationBuilderPage';
import PelletingQueuePage from './pages/PelletingQueuePage';
import FinanceDashboard from './components/Finance/FinanceDashboard';
import FeeConfigPage from './components/Finance/FeeConfigPage';
import InvoiceListPage from './pages/finance/InvoiceListPage';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout user={user} />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/feed-profiles" element={<FeedProfilePage />} />
        <Route path="/formulations" element={<FormulationEnginePage />} />
        <Route path="/formulation-library" element={<FormulationLibraryPage />} />   
        <Route path="/formulation-builder" element={<FormulationBuilderPage />} /> 
        <Route path="/pelleting" element={<PelletingQueuePage />} />
        <Route path="/finance" element={<FinanceDashboard />} />
        <Route path="/finance/config" element={<FeeConfigPage />} />
        <Route path="/finance/invoices" element={<InvoiceListPage />} />
      </Route>
    </Routes>
  );
};

export default App;
