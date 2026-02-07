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
import FactoryPage from "./pages/FactoryPage";
import CustomerDetailsPage from './pages/finance/sales/CustomerDetailsPage';
import CustomerFormPage from './pages/finance/sales/CustomerFormPage';
import CustomersPage from './pages/finance/sales/CustomerPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QuotesPage from './pages/finance/sales/QuotesPage';
import QuoteDetailsPage from './pages/finance/sales/QuoteDetailsPage';
import QuoteFormPage from './pages/finance/sales/QuoteFormPage';
import SalesOrderDetailsPage from './pages/finance/sales/SalesOrderDetailsPage';
import SalesOrderFormPage from './pages/finance/sales/SalesOrderFormPage';
import SalesOrdersPage from './pages/finance/sales/SalesOrderPage';
import InvoiceDetailsPage from './pages/finance/sales/InvoiceDetailsPage';
import InvoiceFormPage from './pages/finance/sales/InvoiceFormPage';
import InvoicesPage from './pages/finance/sales/InvoicesPage';
import SalesReceiptsPage from './pages/finance/sales/SalesReceiptsPage';
import SalesReceiptDetailsPage from './pages/finance/sales/SalesReceiptDetailsPage';
import SalesReceiptFormPage from './pages/finance/sales/SalesReceiptFormPage';
import PaymentsReceivedPage from './pages/finance/sales/PaymentsReceivedPage';
import PaymentReceivedFormPage from './pages/finance/sales/PaymentReceivedFormPage';
import PaymentReceivedDetailsPage from './pages/finance/sales/PaymentReceivedDetailsPage';
import VendorsPage from './pages/finance/payments/VendorsPage';
import VendorsFormPage from './pages/finance/payments/VendorsFormPage';
import VendorsDetailsPage from './pages/finance/payments/VendorsDetailsPage';
import ExpensesPage from './pages/finance/payments/ExpensesPage';
import ExpenseFormPage from './pages/finance/payments/ExpenseFormPage';
import ExpenseDetailsPage from './pages/finance/payments/ExpenseDetailsPage';
import PurchaseOrdersPage from './pages/finance/payments/PurchaseOrdersPage';
import PurchaseOrderFormPage from './pages/finance/payments/PurchaseOrderFormPage';
import PurchaseOrderDetailsPage from './pages/finance/payments/PurchaseOrderDetailsPage';

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
            <Route path="/finance/config/*" element={<FeeConfigPage />} />
            <Route path="/finance/invoices" element={<InvoiceListPage />} />
            <Route path="/finance/invoices/new" element={<InvoiceForm />} />
            <Route path="/finance/payments" element={<PaymentListPage />} />
            <Route path="/finance/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/finance/payments/new" element={<NewPaymentPage />} />
            <Route path="/factories" element={<FactoryPage />} />

            <Route path="/finance/sales/customers" element={<CustomersPage />} />
            <Route path="/finance/sales/customers/new" element={<CustomerFormPage />} />
            <Route path="/finance/sales/customers/:id" element={<CustomerDetailsPage />} />
            <Route path="/finance/sales/customers/:id/edit" element={<CustomerFormPage />} />

            <Route path="/finance/sales/quotes" element={<QuotesPage />} />
            <Route path="/finance/sales/quotes/new" element={<QuoteFormPage />} />
            <Route path="/finance/sales/quotes/:id" element={<QuoteDetailsPage />} />
            <Route path="/finance/sales/quotes/:id/edit" element={<QuoteFormPage />} />

            <Route path="/finance/sales/sales-orders" element={<SalesOrdersPage />} />
            <Route path="/finance/sales/sales-orders/new" element={<SalesOrderFormPage />} />
            <Route path="/finance/sales/sales-orders/:id" element={<SalesOrderDetailsPage />} />
            <Route path="/finance/sales/sales-orders/:id/edit" element={<SalesOrderFormPage />} />

            <Route path="/finance/sales/invoices" element={<InvoicesPage />} />
            <Route path="/finance/sales/invoices/new" element={<InvoiceFormPage />} />
            <Route path="/finance/sales/invoices/:id" element={<InvoiceDetailsPage />} />
            <Route path="/finance/sales/invoices/:id/edit" element={<InvoiceFormPage />} />

            <Route path="/finance/sales/sales-receipts" element={<SalesReceiptsPage />} />
            <Route path="/finance/sales/sales-receipts/new" element={<SalesReceiptFormPage />} />
            <Route path="/finance/sales/sales-receipts/:id" element={<SalesReceiptDetailsPage />} />
            <Route path="/finance/sales/sales-receipts/:id/edit" element={<SalesReceiptFormPage />} />

            <Route path="/finance/sales/payments-received" element={<PaymentsReceivedPage />} />
            <Route path="/finance/sales/payments-received/new" element={<PaymentReceivedFormPage />} />
            <Route path="/finance/sales/payments-received/:id" element={<PaymentReceivedDetailsPage />} />
            <Route path="/finance/sales/payments-received/:id/edit" element={<PaymentReceivedFormPage />} />

            <Route path="/finance/payments/vendors" element={<VendorsPage/>}/>
            <Route path="/finance/payments/vendors/new" element={<VendorsFormPage/>}/>
            <Route path="/finance/payments/vendors/:id" element={<VendorsDetailsPage/>}/>
            <Route path="/finance/payments/vendors/:id/edit" element={<VendorsFormPage/>}/>

            <Route path="/finance/payments/expenses" element={<ExpensesPage />} />
            <Route path="/finance/payments/expenses/new" element={<ExpenseFormPage />} />
            <Route path="/finance/payments/expenses/:id" element={<ExpenseDetailsPage />} />
            <Route path="/finance/payments/expenses/:id/edit" element={<ExpenseFormPage />} />

            <Route path="/finance/payments/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/finance/payments/purchase-orders/new" element={<PurchaseOrderFormPage />} />
            <Route path="/finance/payments/purchase-orders/:id" element={<PurchaseOrderDetailsPage />} />
            <Route path="/finance/payments/purchase-orders/:id/edit" element={<PurchaseOrderFormPage />} />

            <Route path="/finance/payments/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/finance/payments/purchase-orders/new" element={<PurchaseOrderFormPage />} />
            <Route path="/finance/payments/purchase-orders/:id" element={<PurchaseOrderDetailsPage />} />
            <Route path="/finance/payments/purchase-orders/:id/edit" element={<PurchaseOrderFormPage />} />

            <Route path="/formulations/:formulationId/builder" element={<FormulationBuilderWrapper />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;
