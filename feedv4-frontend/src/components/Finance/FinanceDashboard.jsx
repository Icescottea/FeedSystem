import React from 'react';

const FinanceDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-gray-800 py-6">
      <div className="bg-white border rounded-md shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">💼 Financial Management</h2>
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/finance/config"
            className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md p-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium shadow-sm"
          >
            Fee Configuration
          </a>
          <a
            href="/finance/invoices"
            className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md p-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium shadow-sm"
          >
            Invoices
          </a>
          <a
            href="/finance/payments"
            className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md p-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium shadow-sm"
          >
            Payments
          </a>
          <a
            href="/finance/reports"
            className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md p-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium shadow-sm"
          >
            Reports
          </a>
        </nav>
      </div>
    </div>
  );
};

export default FinanceDashboard;
