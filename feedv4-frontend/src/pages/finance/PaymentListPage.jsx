import React, { useState, useEffect } from 'react';
import PaymentForm from '../../components/Finance/PaymentForm';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const PaymentListPage = () => {
  const [payments, setPayments] = useState([]);

  const fetchPayments = () => {
    fetch(`${API_BASE}/api/payments`)
      .then(res => res.json())
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setPayments([]));
  };

  const exportReceipt = async (id) => {
    const res = await fetch(`${API_BASE}/api/payments/${id}/export/pdf`);
    if (!res.ok) return alert('Failed to export receipt');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(fetchPayments, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-gray-800 space-y-8">
      {/* Page Header & Form */}
      <div className="bg-white border rounded-md shadow p-6 space-y-6">
        <h1 className="text-2xl font-semibold">💰 Payments</h1>
        <PaymentForm onSuccess={fetchPayments} />
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white border rounded-md shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[800px] table-auto text-sm w-full">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Invoice ID</th>
                <th className="px-3 py-2 text-left">Amount Paid</th>
                <th className="px-3 py-2 text-left">Method</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Notes</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-50 whitespace-nowrap">
                  <td className="px-3 py-2">{p.invoice?.id ?? '-'}</td>
                  <td className="px-3 py-2">Rs. {p.amountPaid?.toFixed(2) ?? '-'}</td>
                  <td className="px-3 py-2">{p.paymentMethod || '-'}</td>
                  <td className="px-3 py-2">
                    {new Date(p.paidAt || p.paymentDate || '').toLocaleString() || '-'}
                  </td>
                  <td className="px-3 py-2 truncate max-w-[200px]">{p.notes || '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-3 text-xs items-center">
                      <button onClick={() => exportReceipt(payment.id)} className="text-red-600 hover:underline px-1">
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <p className="mt-4 text-sm text-gray-600">No payments yet.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentListPage;
