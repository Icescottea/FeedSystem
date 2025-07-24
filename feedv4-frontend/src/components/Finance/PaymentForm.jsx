import React, { useState, useEffect } from 'react';

const PaymentForm = ({ onSuccess }) => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setInvoices([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: selectedInvoiceId,
        amountPaid: parseFloat(amount),
        paymentMethod: method,
        notes
      })
    });
    if (res.ok) {
      alert('✅ Payment recorded');
      onSuccess?.();
      setAmount('');
      setNotes('');
      setSelectedInvoiceId('');
    } else {
      alert('Failed to record payment');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6 bg-white border rounded-md shadow p-6 space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-800">Record Payment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Invoice Select */}
        <div>
          <label htmlFor="invoice" className="block text-sm font-medium text-gray-700 mb-1">
            Invoice
          </label>
          <select
            id="invoice"
            value={selectedInvoiceId}
            onChange={e => setSelectedInvoiceId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select Invoice --</option>
            {invoices.map(i => (
              <option key={i.id} value={i.id}>
                #{i.id} – {i.customerName} – Rs. {i.amount} ({i.serviceType})
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount Paid
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        {/* Method Select */}
        <div>
          <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            id="method"
            value={method}
            onChange={e => setMethod(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {['Cash', 'Bank Transfer', 'Online', 'Cheque'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none h-24 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional comments..."
          />
        </div>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-md shadow-sm"
        >
          Save Payment
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
