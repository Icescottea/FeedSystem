import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/expenses`;

const ExpenseFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    expenseAccount: '',
    amount: 0,
    taxInclusive: false,
    paidThrough: '',
    tax: 0,
    vendorId: '',
    vendorName: '',
    referenceNumber: '',
    notes: '',
    customerId: '',
    customerName: '',
    department: '',
    location: '',
    status: 'PAID',
  });

  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDropdownData();
    if (isEditMode) fetchExpense();
  }, [id]);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchDropdownData = async () => {
    try {
      const [vendorRes, customerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/vendors/active`),
        fetch(`${API_BASE_URL}/api/customers`),
      ]);

      if (vendorRes.ok) {
        const data = await vendorRes.json();
        setVendors(data.map(v => ({
          id: v.id,
          name: v.vendorDisplayName || v.companyName || `Vendor #${v.id}`,
        })));
      }

      if (customerRes.ok) {
        const data = await customerRes.json();
        setCustomers(data.map(c => ({
          id: c.id,
          name: c.name || c.customerName || c.companyName || `Customer #${c.id}`,
        })));
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch expense');
      const data = await response.json();

      setFormData({
        date: data.date || new Date().toISOString().split('T')[0],
        expenseAccount: data.expenseAccount || '',
        amount: parseFloat(data.amount) || 0,
        taxInclusive: data.taxInclusive || false,
        paidThrough: data.paidThrough || '',
        tax: parseFloat(data.tax) || 0,
        vendorId: data.vendorId?.toString() || '',
        vendorName: data.vendorName || '',
        referenceNumber: data.referenceNumber || '',
        notes: data.notes || '',
        customerId: data.customerId?.toString() || '',
        customerName: data.customerName || '',
        department: data.department || '',
        location: data.location || '',
        status: data.status || 'PAID',
      });
    } catch (error) {
      console.error('Error fetching expense:', error);
      alert('Failed to load expense data.');
    } finally {
      setLoading(false);
    }
  };

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };

      // Sync vendor name when vendor dropdown changes
      if (name === 'vendorId') {
        const vendor = vendors.find(v => v.id.toString() === value);
        updated.vendorName = vendor ? vendor.name : '';
      }

      // Sync customer name when customer dropdown changes
      if (name === 'customerId') {
        const customer = customers.find(c => c.id.toString() === value);
        updated.customerName = customer ? customer.name : '';
      }

      return updated;
    });
  };

  // ─── SUBMIT ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        tax: parseFloat(formData.tax) || 0,
        vendorId: formData.vendorId ? parseInt(formData.vendorId) : null,
        customerId: formData.customerId ? parseInt(formData.customerId) : null,
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
        throw new Error(err.message || 'Failed to save expense');
      }

      navigate('/finance/payments/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── COMPUTED ─────────────────────────────────────────────────────────────

  const netAmount = formData.taxInclusive
    ? parseFloat(formData.amount) || 0
    : (parseFloat(formData.amount) || 0) + (parseFloat(formData.tax) || 0);

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Expense' : 'New Expense'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update expense information' : 'Record a new expense'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              {/* Expense Account — free text, matches entity column */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Account <span className="text-red-500">*</span>
                </label>
                <input type="text" name="expenseAccount" value={formData.expenseAccount}
                  onChange={handleChange} required placeholder="e.g. Office Supplies, Transportation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange}
                  required min="0.01" step="0.01" placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              {/* Tax Inclusive checkbox */}
              <div className="flex items-center pt-8">
                <input type="checkbox" name="taxInclusive" id="taxInclusive"
                  checked={formData.taxInclusive} onChange={handleChange} className="mr-2" />
                <label htmlFor="taxInclusive" className="text-sm font-medium text-gray-700">
                  Amount is Tax Inclusive
                </label>
              </div>

              {/* Paid Through — free text, matches entity column */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Through <span className="text-red-500">*</span>
                </label>
                <input type="text" name="paidThrough" value={formData.paidThrough}
                  onChange={handleChange} required placeholder="e.g. Main Bank Account, Petty Cash"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              {/* Tax */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax</label>
                <input type="number" name="tax" value={formData.tax} onChange={handleChange}
                  min="0" step="0.01" placeholder="0.00"
                  disabled={formData.taxInclusive}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed" />
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <select name="vendorId" value={formData.vendorId} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select vendor (optional)</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id.toString()}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                <input type="text" name="referenceNumber" value={formData.referenceNumber}
                  onChange={handleChange} placeholder="Enter reference number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer (optional)</label>
                <select name="customerId" value={formData.customerId} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select customer (optional)</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                </select>
              </div>
            </div>

            {/* Reporting Tags */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reporting Tags</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input type="text" name="department" value={formData.department}
                    onChange={handleChange} placeholder="e.g. Administration"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input type="text" name="location" value={formData.location}
                    onChange={handleChange} placeholder="e.g. Head Office"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                placeholder="Add any notes about this expense..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            {/* Net Amount summary */}
            <div className="border-t pt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold text-gray-800">Net Amount:</span>
                  <span className="font-bold text-blue-600">LKR {netAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t mt-6 pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/finance/payments/expenses')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Saving...' : isEditMode ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseFormPage;