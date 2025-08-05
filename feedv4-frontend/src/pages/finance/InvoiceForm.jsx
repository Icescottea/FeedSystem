import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const serviceTypes = ['Formulation', 'Pelleting', 'Raw Material Supply', 'Consulting'];

const InvoiceForm = () => {
  const [form, setForm] = useState({
    customerName: '',
    batchId: '',
    serviceType: '',
    amount: 0,
    discount: 0,
    taxRate: 0,
    quantityKg: 0,
    unitRate: 0,
    referenceId: null
  });

  const handleChange = e => {
    const { name, value } = e.target;
    const numeric = ['amount', 'discount', 'taxRate', 'quantityKg', 'unitRate'];
    const converted =
      name === 'batchId'
        ? Number(value)
        : numeric.includes(name)
        ? parseFloat(value) || 0
        : value;

    setForm(prev => ({ ...prev, [name]: converted }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log('Submitting invoice:', form);

    fetch(`${API_BASE}/api/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create invoice');
        return res.json();
      })
      .then(() => {
        console.log('Invoice created successfully');
        setForm({
          customerName: '',
          batchId: '',
          serviceType: '',
          amount: 0,
          discount: 0,
          taxRate: 0,
          quantityKg: 0,
          unitRate: 0,
          referenceId: null
        });
      })
      .catch(err => {
        console.error('Error creating invoice:', err);
      });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white border rounded-md shadow p-6 space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-800">Create New Invoice</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
          <input
            name="customerName"
            value={form.customerName ?? ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter Customer Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
          <input
            name="batchId"
            type="number"
            value={form.batchId ?? ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter Batch ID (number)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
          <select
            name="serviceType"
            value={form.serviceType ?? ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            {serviceTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (LKR)</label>
          <input
            name="amount"
            type="number"
            value={form.amount ?? ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="text-right">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-md shadow-sm"
        >
          Create Invoice
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;
