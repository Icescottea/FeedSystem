import React, { useState, useEffect } from 'react';
import PaymentForm from '../../components/Finance/PaymentForm';

const PaymentListPage = () => {
  const [payments, setPayments] = useState([]);

  const fetchPayments = () => {
    fetch('/api/payments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPayments(data);
        } else {
          console.error('Unexpected response:', data);
          setPayments([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch payments:', err);
        setPayments([]);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">💰 Payments</h1>

      <PaymentForm onSuccess={fetchPayments} />

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Recent Payments</h2>
        <div className="overflow-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Invoice ID</th>
                <th className="px-4 py-2 text-left">Amount Paid</th>
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">{p.invoice?.id || '-'}</td>
                  <td className="px-4 py-2">Rs. {p.amountPaid}</td>
                  <td className="px-4 py-2">{p.paymentMethod}</td>
                  <td className="px-4 py-2">{new Date(p.paidAt || p.paymentDate).toLocaleString()}</td>
                  <td className="px-4 py-2">{p.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <p className="mt-3">No payments yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default PaymentListPage;
