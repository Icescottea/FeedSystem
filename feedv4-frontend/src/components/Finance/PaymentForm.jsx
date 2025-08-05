import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const PaymentForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    paymentDate: '',
    method: '',
    tax: '',
    discount: '',
  });

  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/invoices/unpaid-customers`)
      .then(res => res.json())
      .then(setCustomers)
      .catch(err => console.error('Failed to fetch customers:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${API_BASE}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (res.ok) {
          setFormData({
            customerName: '',
            amount: '',
            paymentDate: '',
            method: '',
            tax: '',
            discount: '',
          });
          onSuccess?.();
        } else {
          throw new Error('Failed to submit payment');
        }
      })
      .catch(err => console.error('Submission error:', err));
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 space-y-6 border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-700">New Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Customer</label>
          <select
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select Customer --</option>
            {customers.map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Amount (Rs.)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Payment Date</label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Method</label>
          <input
            type="text"
            name="method"
            value={formData.method}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Tax (%)</label>
            <input
              type="number"
              name="tax"
              value={formData.tax}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Submit Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
