import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/invoices`);
      setInvoices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  const getStatus = (inv) =>
    inv.amountPaid >= inv.totalAmount ? 'Paid' : 'Unpaid';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Invoices</h2>
        <button
          onClick={() => (window.location.href = '/finance/invoices/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md shadow-sm"
        >
          + Create New Invoice
        </button>
      </div>

      <div className="bg-white border rounded-md shadow p-4 overflow-x-auto">
        <table className="min-w-[800px] table-auto text-sm w-full">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Paid</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50 whitespace-nowrap">
                <td className="px-3 py-2">{inv.id}</td>
                <td className="px-3 py-2">{inv.customerName || 'N/A'}</td>
                <td className="px-3 py-2">Rs. {inv.totalAmount.toFixed(2)}</td>
                <td className="px-3 py-2">Rs. {inv.amountPaid.toFixed(2)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      getStatus(inv) === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {getStatus(inv)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => window.location.href = `/finance/invoices/${inv.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {/* implement delete logic */}}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceListPage;
