import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const round2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;

const PaymentForm = ({ onSuccess }) => {
  const [invoices, setInvoices] = useState([]); // [{id, customerName, totalAmount, amountPaid}]
  const [form, setForm] = useState({
    invoiceId: '',
    baseAmount: '',          // remaining due (editable if you want)
    taxRate: '',             // %
    discountAmount: '',      // Rs
    amountPaid: '',          // auto-computed
    paymentMethod: '',
    paymentDate: '',         // datetime-local
    notes: '',
  });

  // Load unpaid invoices (adjust endpoint if yours differs)
  useEffect(() => {
    fetch(`${API_BASE}/api/invoices/unpaid`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setInvoices(data) : setInvoices([]))
      .catch(() => setInvoices([]));
  }, []);

  // When invoice changes, set baseAmount to remaining due
  useEffect(() => {
    if (!form.invoiceId) return;
    const inv = invoices.find(i => String(i.id) === String(form.invoiceId));
    if (!inv) return;
    const total = Number(inv.totalAmount ?? inv.amount ?? 0);
    const paid  = Number(inv.amountPaid ?? 0);
    const remaining = Math.max(0, total - paid);
    setForm(prev => ({ ...prev, baseAmount: remaining.toString() }));
  }, [form.invoiceId, invoices]);

  // Auto compute amountPaid = base + base*tax% - discount
  useEffect(() => {
    const base = Number(form.baseAmount || 0);
    const taxP = Number(form.taxRate || 0);
    const disc = Number(form.discountAmount || 0);
    const calc = round2(base + (base * taxP / 100) - disc);
    setForm(prev => ({ ...prev, amountPaid: (calc > 0 ? calc : 0).toString() }));
  }, [form.baseAmount, form.taxRate, form.discountAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
    setForm({
      invoiceId: '',
      baseAmount: '',
      taxRate: '',
      discountAmount: '',
      amountPaid: '',
      paymentMethod: '',
      paymentDate: '',
      notes: '',
    });
    onSuccess?.();
  };

  const selectedInvoice = useMemo(
    () => invoices.find(i => String(i.id) === String(form.invoiceId)),
    [invoices, form.invoiceId]
  );

  const remainingHint = useMemo(() => {
    if (!selectedInvoice) return '';
    const total = Number(selectedInvoice.totalAmount ?? selectedInvoice.amount ?? 0);
    const paid  = Number(selectedInvoice.amountPaid ?? 0);
    return `Remaining: Rs. ${round2(Math.max(0, total - paid)).toFixed(2)}`;
  }, [selectedInvoice]);

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 space-y-6 border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-700">New Payment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Invoice</label>
          <select
            name="invoiceId"
            value={form.invoiceId}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select Invoice --</option>
            {invoices.map(inv => {
              const total = Number(inv.totalAmount ?? inv.amount ?? 0);
              const paid  = Number(inv.amountPaid ?? 0);
              const remain = Math.max(0, total - paid);
              return (
                <option key={inv.id} value={inv.id}>
                  #{inv.id} · {inv.customerName || 'N/A'} · Due Rs. {round2(remain).toFixed(2)}
                </option>
              );
            })}
          </select>
          {selectedInvoice && (
            <p className="text-[11px] text-gray-500 mt-1">{remainingHint}</p>
          )}
        </div>

        {/* Base Amount (remaining) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Base Amount (Rs.)</label>
          <input
            type="number"
            name="baseAmount"
            step="0.01"
            min="0"
            value={form.baseAmount}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
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
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
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
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
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
            className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-700"
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
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Method */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Method</label>
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
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
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
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
