import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/invoices`);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'Delete failed');
      }
      fetchInvoices();
    } catch (e) {
      alert(`Failed to delete invoice. ${e.message || ''}`);
    }
  };

  const getStatus = (inv) =>
    (Number(inv.amountPaid ?? 0) >= Number(inv.totalAmount ?? inv.amount ?? 0)) ? 'Paid' : 'Unpaid';

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '-' : d.toLocaleString();
  };

  const asCurrency = (n) =>
    `Rs. ${Number(n ?? 0).toFixed(2)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Invoices</h2>
        <button
          onClick={() => navigate('/finance/invoices/new')}
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
            {invoices.map(inv => {
              const total = inv.totalAmount ?? inv.amount; // support either getter or raw field
              return (
                <tr key={inv.id} className="hover:bg-gray-50 whitespace-nowrap">
                  <td className="px-3 py-2">{inv.id}</td>
                  <td className="px-3 py-2">{inv.customerName || 'N/A'}</td>
                  <td className="px-3 py-2">{asCurrency(total)}</td>
                  <td className="px-3 py-2">{asCurrency(inv.amountPaid)}</td>
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
                    {/* ✅ Use dateIssued, not createdAt */}
                    {formatDate(inv.dateIssued)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-3 text-xs items-center">
                      <button
                        onClick={() => navigate(`/finance/payments/new?invoiceId=${inv.id}`)}
                        className="text-indigo-600 hover:underline"
                      >
                        Pay
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => window.open(`${API_BASE}/api/invoices/${inv.id}/export/pdf`, '_blank')}
                        className="text-red-600 hover:underline"
                      >
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
