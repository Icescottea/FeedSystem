import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const round2 = n => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;

export default function PaymentForm({ invoiceId, onSuccess }) {
  const [invoice, setInvoice] = useState(null);
  const [form, setForm] = useState({
    invoiceId: invoiceId ? Number(invoiceId) : null,
    customerName: '',          // display-only
    baseAmount: '',            // remaining due
    taxRate: '',               // %
    discountAmount: '',        // Rs
    amountPaid: '',            // auto
    paymentMethod: '',
    paymentDate: '',
    notes: ''
  });

  // load the single invoice
  useEffect(() => {
    if (!invoiceId) return;
    fetch(`${API_BASE}/api/invoices/${invoiceId}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load invoice');
        return r.json();
      })
      .then(inv => {
        setInvoice(inv);
        const total = Number(inv.totalAmount ?? inv.amount ?? 0);
        const paid  = Number(inv.amountPaid ?? 0);
        const remaining = Math.max(0, total - paid);
        setForm(prev => ({
          ...prev,
          invoiceId: Number(invoiceId),
          customerName: inv.customerName || '',
          baseAmount: remaining.toString()
        }));
      })
      .catch(err => {
        console.error(err);
        // still render a minimal form
      });
  }, [invoiceId]);

  // compute amountPaid = base + base*tax% - discount
  useEffect(() => {
    const base = Number(form.baseAmount || 0);
    const taxP = Number(form.taxRate || 0);
    const disc = Number(form.discountAmount || 0);
    const calc = round2(base + (base * taxP / 100) - disc);
    setForm(prev => ({ ...prev, amountPaid: (calc > 0 ? calc : 0).toString() }));
  }, [form.baseAmount, form.taxRate, form.discountAmount]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async e => {
    e.preventDefault();
    const payload = {
      invoiceId: Number(form.invoiceId),
      amountPaid: Number(form.amountPaid || 0),
      paymentMethod: form.paymentMethod,
      paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : null,
      notes: form.notes || null,
      taxRate: form.taxRate === '' ? null : Number(form.taxRate),
      discountAmount: form.discountAmount === '' ? null : Number(form.discountAmount),
    };
    const res = await fetch(`${API_BASE}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      alert(`Payment failed. ${msg}`);
      return;
    }
    alert('✅ Payment recorded');
    onSuccess?.();
  };

  const remainingHint = useMemo(() => {
    if (!invoice) return '';
    const total = Number(invoice.totalAmount ?? invoice.amount ?? 0);
    const paid  = Number(invoice.amountPaid ?? 0);
    return `Remaining: Rs. ${round2(Math.max(0, total - paid)).toFixed(2)}`;
  }, [invoice]);

  return (
    <form onSubmit={submit} className="space-y-4 bg-white border rounded-md shadow p-6">
      {/* Customer (text) */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Customer</label>
        <input
          type="text"
          value={form.customerName}
          readOnly
          className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100"
        />
      </div>

      {/* Base Amount (remaining due) */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Base Amount (Rs.)</label>
        <input
          type="number"
          name="baseAmount"
          step="0.01"
          min="0"
          value={form.baseAmount}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm"
          required
        />
        {remainingHint && <p className="text-[11px] text-gray-500 mt-1">{remainingHint}</p>}
      </div>

      {/* Discount & Tax */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Discount (Rs.)</label>
          <input
            type="number"
            name="discountAmount"
            step="0.01"
            min="0"
            value={form.discountAmount}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Tax (%)</label>
          <input
            type="number"
            name="taxRate"
            step="0.01"
            min="0"
            value={form.taxRate}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Final Amount (auto) */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Final Amount (Rs.)</label>
        <input
          type="number"
          name="amountPaid"
          step="0.01"
          min="0"
          value={form.amountPaid}
          readOnly
          className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100"
        />
      </div>

      {/* Payment Date */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Payment Date</label>
        <input
          type="datetime-local"
          name="paymentDate"
          value={form.paymentDate}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* Method */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Method</label>
        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm"
          required
        >
          <option value="">Select Method</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="pt-2">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md">
          Submit Payment
        </button>
      </div>
    </form>
  );
}
