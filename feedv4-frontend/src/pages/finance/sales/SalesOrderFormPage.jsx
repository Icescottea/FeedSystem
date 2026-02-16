import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SalesOrderFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    salesOrderNumber: '',
    referenceNumber: '',
    salesOrderDate: new Date().toISOString().split('T')[0],
    expectedShipmentDate: '',
    paymentTerms: '30',
    deliveryMethod: 'COURIER',
    salesPerson: '',
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
    if (isEditMode) {
      fetchSalesOrder();
    } else {
      generateSalesOrderNumber();
    }
  }, [id]);

  // ---------------- API ----------------

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error('Customer load error:', err);
    }
  };

  const generateSalesOrderNumber = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales-orders/next-number`);
      const data = await res.text();
      setFormData(prev => ({ ...prev, salesOrderNumber: data }));
    } catch (err) {
      console.error('SO number error:', err);
    }
  };

  const fetchSalesOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/sales-orders/${id}`);
      const data = await res.json();

      setFormData(data);
      setItems(data.items || []);
    } catch (err) {
      console.error('Load sales order error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- HANDLERS ----------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'customerId') {
      const selected = customers.find(c => c.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        customerName: selected?.name || ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    const qty = parseFloat(updated[index].quantity || 0);
    const rate = parseFloat(updated[index].rate || 0);
    const tax = parseFloat(updated[index].tax || 0);

    const base = qty * rate;
    updated[index].amount = base + (base * tax / 100);

    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now(),
      itemName: '',
      quantity: 1,
      rate: 0,
      tax: 0,
      amount: 0
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // ---------------- TOTALS ----------------

  const subTotal = items.reduce((sum, i) => sum + (i.quantity * i.rate), 0);
  const totalTax = items.reduce((sum, i) => sum + ((i.quantity * i.rate) * i.tax / 100), 0);
  const shippingCharges = Number(formData.shippingCharges || 0);
  const total = subTotal + totalTax + shippingCharges;

  // ---------------- SUBMIT ----------------

  const handleSubmit = async (saveType) => {
    try {
      setLoading(true);

      const payload = {
        ...formData,
        items,
        subTotal,
        totalTax,
        total,
        status: saveType === 'send' ? 'CONFIRMED' : 'DRAFT'
      };

      const url = isEditMode
        ? `${API_BASE_URL}/api/sales-orders/${id}`
        : `${API_BASE_URL}/api/sales-orders`;

      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      alert(saveType === 'send'
        ? 'Sales order confirmed successfully!'
        : 'Sales order saved as draft.'
      );

      navigate('/finance/sales/sales-orders');

    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save sales order.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {isEditMode ? 'Edit Sales Order' : 'New Sales Order'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <select
          name="customerId"
          value={formData.customerId}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          value={formData.salesOrderNumber}
          readOnly
          className="border p-2 rounded bg-gray-100"
        />

        <input
          name="referenceNumber"
          value={formData.referenceNumber}
          onChange={handleChange}
          placeholder="Reference Number"
          className="border p-2 rounded"
        />

        <input
          type="date"
          name="salesOrderDate"
          value={formData.salesOrderDate}
          onChange={handleChange}
          className="border p-2 rounded"
        />

      </div>

      {/* Items */}
      <div className="mt-6">
        <button onClick={addItem} className="text-blue-600 mb-2">+ Add Item</button>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Item</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Rate</th>
              <th className="border p-2">Tax %</th>
              <th className="border p-2">Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td className="border p-1">
                  <input
                    value={item.itemName}
                    onChange={e => handleItemChange(idx, 'itemName', e.target.value)}
                    className="w-full border p-1"
                  />
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-20 border p-1"
                  />
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={e => handleItemChange(idx, 'rate', e.target.value)}
                    className="w-24 border p-1"
                  />
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    value={item.tax}
                    onChange={e => handleItemChange(idx, 'tax', e.target.value)}
                    className="w-16 border p-1"
                  />
                </td>
                <td className="border p-1 text-right">
                  {item.amount.toFixed(2)}
                </td>
                <td className="p-1">
                  <button onClick={() => removeItem(idx)} className="text-red-600">X</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-6 text-right space-y-1">
        <div>SubTotal: {subTotal.toFixed(2)}</div>
        <div>Tax: {totalTax.toFixed(2)}</div>
        <div>Total: <strong>{total.toFixed(2)}</strong></div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => handleSubmit('draft')}
          className="border px-4 py-2 rounded"
        >
          Save Draft
        </button>

        <button
          onClick={() => handleSubmit('send')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
};

export default SalesOrderFormPage;