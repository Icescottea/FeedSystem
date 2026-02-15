import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const QuoteFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    quoteNumber: '',
    referenceNumber: '',
    date: new Date().toISOString().split('T')[0],
    expiryDate: '',
    salesPerson: '',
    subject: '',
    shippingCharges: 0,
    customerNotes: '',
    termsAndConditions: '',
    status: 'DRAFT'
  });

  const [items, setItems] = useState([
    { id: 1, itemName: '', quantity: 1, rate: 0, tax: 0, amount: 0 }
  ]);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    if (isEditMode) fetchQuote();
    else generateQuoteNumber();
  }, [id]);

  // ---------------- API ----------------

  const fetchCustomers = async () => {
    const res = await fetch(`${API_BASE_URL}/api/customers`);
    const data = await res.json();
    setCustomers(data);
  };

  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, quoteNumber: `QT-${year}-${rand}` }));
  };

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/quotes/${id}`);
      const data = await res.json();

      setFormData({
        customerId: data.customerId?.toString() || '',
        customerName: data.customerName || '',
        quoteNumber: data.quoteNumber || '',
        referenceNumber: data.referenceNumber || '',
        date: data.quoteDate || '',
        expiryDate: data.expiryDate || '',
        salesPerson: data.salesPerson || '',
        subject: data.subject || '',
        shippingCharges: data.adjustment || 0,
        customerNotes: data.customerNotes || '',
        termsAndConditions: data.termsAndConditions || '',
        status: data.status || 'DRAFT'
      });

      setItems(data.items.map(item => ({
        id: item.id,
        itemName: item.itemName,
        quantity: item.quantity,
        rate: item.rate,
        tax: item.taxRate,
        amount: item.amount
      })));

    } catch (err) {
      console.error('Fetch quote failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- HANDLERS ----------------

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'customerId') {
      const cust = customers.find(c => c.id.toString() === value);
      setFormData(prev => ({ ...prev, customerName: cust?.customerName || '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (['quantity', 'rate', 'tax'].includes(field)) {
      const q = Number(updated[index].quantity || 0);
      const r = Number(updated[index].rate || 0);
      const t = Number(updated[index].tax || 0);
      const sub = q * r;
      updated[index].amount = sub + (sub * t) / 100;
    }

    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), itemName: '', quantity: 1, rate: 0, tax: 0, amount: 0 }]);
  };

  const removeItem = idx => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
  };

  // ---------------- TOTALS ----------------

  const subTotal = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.rate)), 0);
  const totalTax = items.reduce((s, i) => s + ((Number(i.quantity) * Number(i.rate)) * Number(i.tax) / 100), 0);
  const shipping = Number(formData.shippingCharges || 0);
  const total = subTotal + totalTax + shipping;

  // ---------------- SUBMIT ----------------

  const handleSubmit = async (type) => {
    try {
      setLoading(true);

      const payload = {
        id: isEditMode ? Number(id) : null,
        quoteNumber: formData.quoteNumber,
        referenceNumber: formData.referenceNumber,
        customerId: Number(formData.customerId),
        customerName: formData.customerName,
        quoteDate: formData.date,
        expiryDate: formData.expiryDate || null,
        subject: formData.subject,
        salesPerson: formData.salesPerson,
        taxInclusive: false,
        subtotal: subTotal,
        discount: 0,
        discountType: null,
        tax: totalTax,
        adjustment: shipping,
        total,
        status: type === 'send' ? 'SENT' : 'DRAFT',
        customerNotes: formData.customerNotes,
        termsAndConditions: formData.termsAndConditions,
        attachments: '',
        items: items.map((i, idx) => ({
          itemName: i.itemName,
          description: null,
          quantity: Number(i.quantity),
          rate: Number(i.rate),
          taxRate: Number(i.tax),
          amount: Number(i.amount),
          sequence: idx + 1
        }))
      };

      const url = isEditMode
        ? `${API_BASE_URL}/api/quotes/${id}`
        : `${API_BASE_URL}/api/quotes`;

      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      navigate('/finance/sales/quotes');

    } catch (err) {
      console.error('Save failed:', err);
      alert('Save failed. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {isEditMode ? 'Edit Quote' : 'New Quote'}
      </h1>

      <div className="bg-white p-6 rounded shadow space-y-6">

        <select name="customerId" value={formData.customerId} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.customerName}</option>
          ))}
        </select>

        {items.map((item, idx) => (
          <div key={item.id} className="grid grid-cols-6 gap-2">
            <input value={item.itemName} onChange={e => handleItemChange(idx, 'itemName', e.target.value)} className="border p-2 rounded col-span-2" />
            <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="border p-2 rounded" />
            <input type="number" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} className="border p-2 rounded" />
            <input type="number" value={item.tax} onChange={e => handleItemChange(idx, 'tax', e.target.value)} className="border p-2 rounded" />
            <div className="p-2">{item.amount.toFixed(2)}</div>
          </div>
        ))}

        <button onClick={addItem} className="text-blue-600">+ Add Item</button>

        <div className="text-right space-y-1">
          <div>Subtotal: {subTotal.toFixed(2)}</div>
          <div>Tax: {totalTax.toFixed(2)}</div>
          <div>Total: {total.toFixed(2)}</div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => handleSubmit('draft')} className="px-4 py-2 border rounded">
            Save Draft
          </button>
          <button onClick={() => handleSubmit('send')} className="px-4 py-2 bg-blue-600 text-white rounded">
            Save & Send
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuoteFormPage;