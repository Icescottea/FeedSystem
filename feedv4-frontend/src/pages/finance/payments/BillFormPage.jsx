import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/bills`;

const calcDueDate = (billDate, paymentTerms) => {
  if (!billDate || !paymentTerms) return '';
  const date = new Date(billDate);
  const days = { DUE_ON_RECEIPT: 0, NET_15: 15, NET_30: 30, NET_45: 45, NET_60: 60, NET_90: 90 };
  date.setDate(date.getDate() + (days[paymentTerms] ?? 30));
  return date.toISOString().split('T')[0];
};

const BillFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    billNumber: '',
    orderNumber: '',
    referenceNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentTerms: 'NET_30',
    accountsPayable: 'ACCOUNTS_PAYABLE',
    subject: '',
    taxInclusive: false,
    discount: 0,
    discountType: 'PERCENTAGE',
    notes: '',
    status: 'DRAFT',
  });

  const [items, setItems] = useState([
    { tempId: Date.now(), itemDetails: '', account: '', quantity: 1, rate: 0, taxRate: 0, customerDetails: '', amount: 0, sequence: 0 },
  ]);

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
    if (isEditMode) {
      fetchBill();
    }
  }, [id]);

  // Auto-calculate due date when billDate or paymentTerms changes
  useEffect(() => {
    if (!isEditMode || !formData.billDate) return;
    setFormData(prev => ({ ...prev, dueDate: calcDueDate(prev.billDate, prev.paymentTerms) }));
  }, [formData.billDate, formData.paymentTerms]);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors/active`);
      if (!response.ok) return;
      const data = await response.json();
      // Vendor paymentTerms is stored as days string ("30", "15", etc.)
      // Map to Bill.PaymentTerms enum values
      const vendorTermsMap = {
        '0': 'DUE_ON_RECEIPT',
        '15': 'NET_15',
        '30': 'NET_30',
        '45': 'NET_45',
        '60': 'NET_60',
        '90': 'NET_90',
      };
      setVendors(data.map(v => ({
        id: v.id,
        name: v.vendorDisplayName || v.companyName || `Vendor #${v.id}`,
        paymentTerms: vendorTermsMap[v.paymentTerms] || 'NET_30',
      })));
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchBill = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch bill');
      const data = await response.json();

      setFormData({
        vendorId: data.vendorId?.toString() || '',
        vendorName: data.vendorName || '',
        billNumber: data.billNumber || '',
        orderNumber: data.orderNumber || '',
        referenceNumber: data.referenceNumber || '',
        billDate: data.billDate || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate || '',
        paymentTerms: data.paymentTerms || 'NET_30',
        accountsPayable: data.accountsPayable || 'ACCOUNTS_PAYABLE',
        subject: data.subject || '',
        taxInclusive: data.taxInclusive || false,
        discount: parseFloat(data.discount) || 0,
        discountType: data.discountType || 'PERCENTAGE',
        notes: data.notes || '',
        status: data.status || 'DRAFT',
      });

      if (data.items && data.items.length > 0) {
        setItems(data.items.map((item, i) => ({
          ...item,
          tempId: item.id || i,
          quantity: parseFloat(item.quantity) || 1,
          rate: parseFloat(item.rate) || 0,
          taxRate: parseFloat(item.taxRate) || 0,
          amount: parseFloat(item.amount) || 0,
        })));
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
      alert('Failed to load bill data.');
    } finally {
      setLoading(false);
    }
  };

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVendorChange = (e) => {
    const vendorId = e.target.value;
    const vendor = vendors.find(v => v.id.toString() === vendorId);
    setFormData(prev => ({
      ...prev,
      vendorId,
      vendorName: vendor ? vendor.name : '',
      paymentTerms: vendor ? vendor.paymentTerms : prev.paymentTerms,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(updated[index].quantity) || 0;
      const rate = parseFloat(updated[index].rate) || 0;
      updated[index].amount = qty * rate;
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, {
      tempId: Date.now(),
      itemDetails: '', account: '',
      quantity: 1, rate: 0, taxRate: 0, customerDetails: '', amount: 0,
      sequence: items.length,
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  // ─── CALCULATIONS ─────────────────────────────────────────────────────────

  const calcSubtotal = () => items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const calcDiscountAmount = () => {
    const subtotal = calcSubtotal();
    const d = parseFloat(formData.discount) || 0;
    return formData.discountType === 'PERCENTAGE' ? (subtotal * d) / 100 : d;
  };

  const calcTax = () => {
    if (formData.taxInclusive) return 0;
    const subtotal = calcSubtotal();
    const afterDiscount = subtotal - calcDiscountAmount();
    return items.reduce((sum, item) => {
      const itemAmount = parseFloat(item.amount) || 0;
      const taxRate = parseFloat(item.taxRate) || 0;
      const portion = subtotal > 0 ? itemAmount / subtotal : 0;
      return sum + (afterDiscount * portion * taxRate / 100);
    }, 0);
  };

  const calcTotal = () => calcSubtotal() - calcDiscountAmount() + calcTax();

  // ─── SUBMIT ───────────────────────────────────────────────────────────────

  const handleSubmit = async (saveType) => {
    if (!formData.vendorId) { alert('Please select a vendor.'); return; }
    if (!formData.dueDate) { alert('Please enter a due date.'); return; }

    try {
      setLoading(true);

      const subtotal = calcSubtotal();
      const taxAmount = calcTax();
      const discountVal = parseFloat(formData.discount) || 0;
      const totalVal = calcTotal();

      const payload = {
        // Only include billNumber on edit
        ...(isEditMode ? { billNumber: formData.billNumber } : {}),
        orderNumber: formData.orderNumber || '',
        referenceNumber: formData.referenceNumber || '',
        vendorId: parseInt(formData.vendorId),
        vendorName: formData.vendorName || '',
        billDate: formData.billDate,
        dueDate: formData.dueDate,
        paymentTerms: formData.paymentTerms,
        accountsPayable: formData.accountsPayable,
        subject: formData.subject || '',
        taxInclusive: Boolean(formData.taxInclusive),
        discount: discountVal,
        discountType: formData.discountType,
        subtotal,
        tax: taxAmount,
        total: totalVal,
        amountPaid: 0,
        balanceDue: totalVal,
        notes: formData.notes || '',
        status: saveType === 'draft' ? 'DRAFT' : 'OPEN',
        items: items.map((item, i) => ({
          ...(typeof item.id === 'number' ? { id: item.id } : {}),
          itemDetails: item.itemDetails || '',
          account: item.account || '',
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          taxRate: parseFloat(item.taxRate) || 0,
          customerDetails: item.customerDetails || '',
          amount: parseFloat(item.amount) || 0,
          sequence: i,
        })),
      };

      const url = isEditMode ? `${API_BASE}/${id}` : API_BASE;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save bill');
      }

      navigate('/finance/payments/bills');
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Error saving bill: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Bill' : 'New Bill'}</h1>
        <p className="text-gray-600 mt-1">{isEditMode ? 'Update bill information' : 'Create a new bill'}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <select name="vendorId" value={formData.vendorId} onChange={handleVendorChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Vendor</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id.toString()}>{v.name}</option>
                  ))}
                </select>
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bill Number</label>
                  <input type="text" value={formData.billNumber} readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Number</label>
                <input type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange}
                  placeholder="PO-2024-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange}
                  placeholder="REF-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bill Date <span className="text-red-500">*</span>
                </label>
                <input type="date" name="billDate" value={formData.billDate} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* Payment & Account Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment & Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                <select name="paymentTerms" value={formData.paymentTerms} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                  <option value="NET_15">Net 15</option>
                  <option value="NET_30">Net 30</option>
                  <option value="NET_45">Net 45</option>
                  <option value="NET_60">Net 60</option>
                  <option value="NET_90">Net 90</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accounts Payable</label>
                <select name="accountsPayable" value={formData.accountsPayable} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="ACCOUNTS_PAYABLE">Accounts Payable</option>
                  <option value="TRADE_PAYABLES">Trade Payables</option>
                  <option value="OTHER_PAYABLES">Other Payables</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange}
                  placeholder="Enter subject or description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="taxInclusive" name="taxInclusive"
                  checked={formData.taxInclusive} onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="taxInclusive" className="ml-2 text-sm text-gray-700">Tax Inclusive</label>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Items</h3>
              <button type="button" onClick={addItem}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium">+ Add Item</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {['Item Details', 'Account', 'Quantity', 'Rate', 'Tax (%)', 'Customer Details', 'Amount', 'Action'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={item.tempId || index}>
                      <td className="px-4 py-2">
                        <input type="text" value={item.itemDetails}
                          onChange={(e) => handleItemChange(index, 'itemDetails', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Item description" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="text" value={item.account}
                          onChange={(e) => handleItemChange(index, 'account', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Account" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" value={item.quantity} min="0"
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" value={item.rate} min="0" step="0.01"
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                      </td>
                      <td className="px-4 py-2">
                        <select value={item.taxRate}
                          onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input type="text" value={item.customerDetails}
                          onChange={(e) => handleItemChange(index, 'customerDetails', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Additional details" />
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-800">
                        LKR {(parseFloat(item.amount) || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="max-w-md ml-auto space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium text-gray-800">LKR {calcSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-700">Discount:</span>
                <div className="flex gap-2 items-center">
                  <input type="number" name="discount" value={formData.discount} onChange={handleChange}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    min="0" step="0.01" />
                  <select name="discountType" value={formData.discountType} onChange={handleChange}
                    className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                    <option value="PERCENTAGE">%</option>
                    <option value="AMOUNT">LKR</option>
                  </select>
                  <span className="font-medium text-gray-800 w-24 text-right">
                    LKR {calcDiscountAmount().toLocaleString()}
                  </span>
                </div>
              </div>
              {!formData.taxInclusive && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tax:</span>
                  <span className="font-medium text-gray-800">LKR {calcTax().toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-lg font-bold text-gray-800">LKR {calcTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                placeholder="Add any notes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/finance/payments/bills')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => handleSubmit('draft')} disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button type="button" onClick={() => handleSubmit('open')} disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : isEditMode ? 'Update and Save as Open' : 'Save as Open'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillFormPage;