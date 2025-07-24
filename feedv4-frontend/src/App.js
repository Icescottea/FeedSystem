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
import InvoiceForm from './pages/finance/InvoiceForm';
import RequireAuth from './RequireAuth';

const App = () => {
  const [user, setUser] = useState(undefined); 

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  if (user === undefined) return <div className="p-4 text-gray-500">Loading...</div>;
  if (!user) return <Login setUser={setUser} />;

  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<MainLayout user={user} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/feed-profiles" element={<FeedProfilePage />} />
          <Route path="/formulations" element={<FormulationEnginePage />} />
          <Route path="/formulation-library" element={<FormulationLibraryPage />} />
          <Route path="/formulation-builder" element={<FormulationBuilderPage />} />
          <Route path="/pelleting" element={<PelletingQueuePage />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/finance/config" element={<FeeConfigPage />} />
          <Route path="/finance/invoices" element={<InvoiceListPage />} />
          <Route path="/finance/invoices/new" element={<InvoiceForm />} />
          <Route path="/finance/payments" element={<PaymentListPage />} />
          <Route path="/finance/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UserManagementPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
