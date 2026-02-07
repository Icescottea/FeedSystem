import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    location: ''
  });

  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDropdownData();
    if (isEditMode) {
      fetchExpense();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    // TODO: Replace with actual API calls
    setVendors([
      { id: 1, name: 'Global Feed Supplies Ltd' },
      { id: 2, name: 'Local Transport Co.' },
      { id: 3, name: 'Equipment Services Ltd' }
    ]);

    setCustomers([
      { id: 1, name: 'ABC Farms Ltd' },
      { id: 2, name: 'Green Valley Poultry' }
    ]);

    setAccounts([
      { id: 1, name: 'Main Bank Account' },
      { id: 2, name: 'Cash on Hand' },
      { id: 3, name: 'Petty Cash' }
    ]);

    setExpenseAccounts([
      { id: 1, name: 'Office Supplies' },
      { id: 2, name: 'Transportation' },
      { id: 3, name: 'Utilities' },
      { id: 4, name: 'Maintenance' },
      { id: 5, name: 'Fuel' },
      { id: 6, name: 'Rent' }
    ]);
  };

  const fetchExpense = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockData = {
        date: '2024-12-20',
        expenseAccount: 'Office Supplies',
        amount: 25000,
        taxInclusive: false,
        paidThrough: 'Main Bank Account',
        tax: 0,
        vendorId: '1',
        vendorName: 'Global Feed Supplies Ltd',
        referenceNumber: 'EXP-001',
        notes: 'Office supplies for December',
        customerId: '',
        customerName: '',
        department: 'Administration',
        location: 'Head Office'
      };

      setFormData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expense:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'vendorId') {
      const vendor = vendors.find(v => v.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        vendorName: vendor ? vendor.name : ''
      }));
    }

    if (name === 'customerId') {
      const customer = customers.find(c => c.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        customerName: customer ? customer.name : ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // TODO: Replace with actual API call
      console.log('Saving expense:', formData);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert(isEditMode ? 'Expense updated successfully!' : 'Expense created successfully!');
      navigate('/finance/payments/expenses');
      
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const netAmount = formData.taxInclusive 
    ? parseFloat(formData.amount) || 0
    : (parseFloat(formData.amount) || 0) + (parseFloat(formData.tax) || 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Expense' : 'New Expense'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update expense information' : 'Record a new expense'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Account <span className="text-red-500">*</span>
                </label>
                <select
                  name="expenseAccount"
                  value={formData.expenseAccount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select expense account</option>
                  {expenseAccounts.map(account => (
                    <option key={account.id} value={account.name}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  name="taxInclusive"
                  id="taxInclusive"
                  checked={formData.taxInclusive}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="taxInclusive" className="text-sm font-medium text-gray-700">
                  Amount is Tax Inclusive
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Through <span className="text-red-500">*</span>
                </label>
                <select
                  name="paidThrough"
                  value={formData.paidThrough}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select account</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.name}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reference number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select customer (optional)</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reporting Tags */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reporting Tags</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Administration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Head Office"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes about this expense..."
              />
            </div>

            {/* Total Summary */}
            <div className="border-t pt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold text-gray-800">Net Amount:</span>
                  <span className="font-bold text-blue-600">LKR {netAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t mt-6 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/finance/payments/expenses')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Expense' : 'Save Expense')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseFormPage;