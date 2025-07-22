import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
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
import UserManagementPage from './pages/UserManagementPage';
import PaymentListPage from './pages/finance/PaymentListPage';
import ReportsPage from './pages/finance/ReportsPage';

const App = () => {
  const [user, setUser] = useState(null);
 
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // 1. Show login if no user
  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout user={user} />}>
        {/* 2. Redirect base path to /dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 3. Authenticated routes */}
        <Route path="/dashboard" element={<DashboardPage user={user} />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/feed-profiles" element={<FeedProfilePage />} />
        <Route path="/formulations" element={<FormulationEnginePage />} />
        <Route path="/formulation-library" element={<FormulationLibraryPage />} />
        <Route path="/formulation-builder" element={<FormulationBuilderPage />} />
        <Route path="/pelleting" element={<PelletingQueuePage />} />
        <Route path="/finance" element={<FinanceDashboard />} />
        <Route path="/finance/config" element={<FeeConfigPage />} />
        <Route path="/finance/invoices" element={<InvoiceListPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/finance/payments" element={<PaymentListPage />} />
        <Route path="/finance/reports" element={<ReportsPage />} />

        {/* 4. Catch-all redirect */}
      </Route>
    </Routes>
  );
};

export default App;
