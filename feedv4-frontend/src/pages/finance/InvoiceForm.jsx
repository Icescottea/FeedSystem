import React, { useState, useEffect } from 'react';

const serviceTypes = ['Formulation','Pelleting','Raw Material Supply','Consulting'];

const InvoiceForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    customerId: '', batchId: '', serviceType: '', amount: ''
  });
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch('/api/customers') // or invoices list if needed
      .then(r => r.json())
      .then(d => setCustomers(Array.isArray(d)?d:[]))
      .catch(() => setCustomers([]));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit?.(form);
    setForm({ customerId:'',batchId:'',serviceType:'',amount:'' });
  };

  return (
    <form onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white border rounded-md shadow p-6 space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-800">Create New Invoice</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <select
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
          <input
            name="batchId"
            value={form.batchId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
          <select
            name="serviceType"
            value={form.serviceType}
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
            value={form.amount}
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
