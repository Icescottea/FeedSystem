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
      .then(setInvoices)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invoice = invoices.find(i => i.id === Number(selectedInvoiceId));
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: selectedInvoiceId,
        amountPaid: amount,
        paymentMethod: method,
        notes
      })
    });

    if (res.ok) {
      alert('✅ Payment recorded');
      onSuccess?.();
      setAmount('');
      setNotes('');
    }
  };

  return (
    <form className="bg-white p-6 rounded shadow w-full max-w-xl" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold mb-4">Record Payment</h2>

      <div className="mb-3">
        <label className="block font-medium mb-1">Invoice</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={selectedInvoiceId}
          onChange={(e) => setSelectedInvoiceId(e.target.value)}
          required
        >
          <option value="">-- Select Invoice --</option>
          {invoices.map(i => (
            <option key={i.id} value={i.id}>
              #{i.id} - {i.customerName} - Rs. {i.amount} ({i.serviceType})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="block font-medium mb-1">Amount Paid</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block font-medium mb-1">Payment Method</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Online">Online</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block font-medium mb-1">Notes</label>
        <textarea
          className="w-full border px-3 py-2 rounded"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Payment
      </button>
    </form>
  );
};

export default PaymentForm;
