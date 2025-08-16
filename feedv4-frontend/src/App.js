import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import FeeConfigPage from './pages/finance/FeeConfigPage';
import InvoiceListPage from './pages/finance/InvoiceListPage';
import UserManagementPage from './pages/UserManagementPage';
import PaymentListPage from './pages/finance/PaymentListPage';
import ReportsPage from './pages/finance/ReportsPage';
import InvoiceForm from './pages/finance/InvoiceForm';
import RequireAuth from './RequireAuth';
import NewPaymentPage from './pages/finance/NewPaymentPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [user, setUser] = useState(undefined); 

  const FormulationBuilderWrapper = () => {
    const { formulationId } = useParams();
    return <FormulationBuilderPage formulationId={formulationId} />;
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  if (user === undefined) return <div className="p-4 text-gray-500">Loading...</div>;
  if (!user) return <Login setUser={setUser} />;

  return (
    <>
      <ToastContainer />
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
            {/* FIX: allow nested routes under /finance/config */}
            <Route path="/finance/config/*" element={<FeeConfigPage />} />
            <Route path="/finance/invoices" element={<InvoiceListPage />} />
            <Route path="/finance/invoices/new" element={<InvoiceForm />} />
            <Route path="/finance/payments" element={<PaymentListPage />} />
            <Route path="/finance/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
             <Route path="/finance/payments/new" element={<NewPaymentPage />} />
            <Route path="/formulations/:formulationId/builder" element={<FormulationBuilderWrapper />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;
