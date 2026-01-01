import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SalesReceiptFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    receiptDate: new Date().toISOString().split('T')[0],
    salesReceiptNumber: '',
    salesPerson: '',
    shippingCharges: 0,
    notes: '',
    termsAndConditions: '',
    // Payment Details
    paymentMode: 'BANK_TRANSFER',
    referenceNumber: '',
    depositTo: '',
    status: 'DRAFT'
  });

  const [items, setItems] = useState([
    { id: 1, itemName: '', quantity: 1, rate: 0, tax: 0, amount: 0 }
  ]);

  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchAccounts();
    if (isEditMode) {
      fetchSalesReceipt();
    } else {
      generateReceiptNumber();
    }
  }, [id]);

  const fetchCustomers = async () => {
    // TODO: Replace with actual API call
    const mockCustomers = [
      { id: 1, name: 'ABC Farms Ltd' },
      { id: 2, name: 'Green Valley Poultry' },
      { id: 3, name: 'Royal Livestock Co.' }
    ];
    setCustomers(mockCustomers);
  };

  const fetchAccounts = async () => {
    // TODO: Replace with actual API call
    const mockAccounts = [
      { id: 1, name: 'Cash on Hand' },
      { id: 2, name: 'Main Bank Account - Commercial Bank' },
      { id: 3, name: 'Savings Account - Sampath Bank' },
      { id: 4, name: 'Petty Cash' }
    ];
    setAccounts(mockAccounts);
  };

  const generateReceiptNumber = () => {
    // TODO: Replace with actual API call to get next receipt number
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, salesReceiptNumber: `SR-${year}-${random}` }));
  };

  const fetchSalesReceipt = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockData = {
        customerId: '1',
        customerName: 'ABC Farms Ltd',
        receiptDate: '2024-12-20',
        salesReceiptNumber: 'SR-2024-001',
        salesPerson: 'John Doe',
        shippingCharges: 3000,
        notes: 'Payment received in full',
        termsAndConditions: 'All sales are final',
        paymentMode: 'BANK_TRANSFER',
        referenceNumber: 'TXN123456',
        depositTo: '2',
        status: 'DRAFT'
      };

      const mockItems = [
        { id: 1, itemName: 'Broiler Feed - Starter', quantity: 50, rate: 1500, tax: 0, amount: 75000 },
        { id: 2, itemName: 'Layer Feed - Grower', quantity: 25, rate: 1800, tax: 0, amount: 45000 }
      ];

      setFormData(mockData);
      setItems(mockItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales receipt:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'customerId') {
      const customer = customers.find(c => c.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        customerName: customer ? customer.name : ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'quantity' || field === 'rate' || field === 'tax') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      const tax = parseFloat(newItems[index].tax) || 0;
      const subtotal = qty * rate;
      newItems[index].amount = subtotal + (subtotal * tax / 100);
    }

    setItems(newItems);
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subTotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return sum + (qty * rate);
  }, 0);

  const totalTax = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const tax = parseFloat(item.tax) || 0;
    return sum + ((qty * rate) * tax / 100);
  }, 0);

  const shippingCharges = parseFloat(formData.shippingCharges) || 0;
  const total = subTotal + totalTax + shippingCharges;

  const handleSubmit = async (saveType) => {
    try {
      setLoading(true);

      const receiptData = {
        ...formData,
        items,
        subTotal,
        totalTax,
        total,
        status: saveType === 'void' ? 'VOID' : (saveType === 'save' ? 'COMPLETED' : 'DRAFT')
      };

      // TODO: Replace with actual API call
      console.log('Saving sales receipt:', receiptData);
      console.log('Attached files:', attachedFiles);

      await new Promise(resolve => setTimeout(resolve, 500));

      if (saveType === 'void') {
        alert('Sales receipt voided!');
      } else if (saveType === 'save') {
        alert('Sales receipt completed and saved!');
      } else {
        alert('Sales receipt saved as draft!');
      }
      
      navigate('/finance/sales/sales-receipts');

    } catch (error) {
      console.error('Error saving sales receipt:', error);
      alert('Error saving sales receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Sales Receipt' : 'New Sales Receipt'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update sales receipt information' : 'Create a new sales receipt with payment'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="receiptDate"
                value={formData.receiptDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Receipt Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="salesReceiptNumber"
                value={formData.salesReceiptNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Person
              </label>
              <input
                type="text"
                name="salesPerson"
                value={formData.salesPerson}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter sales person name"
              />
            </div>
          </div>

          {/* Items Table */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax (%)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Item name"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.tax}
                          onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <span className="font-medium">LKR {item.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Calculation */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Sub Total:</span>
                <span className="font-medium">LKR {subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Tax:</span>
                <span className="font-medium">LKR {totalTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Shipping Charges:</span>
                <input
                  type="number"
                  name="shippingCharges"
                  value={formData.shippingCharges}
                  onChange={handleChange}
                  className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-lg font-bold text-blue-600">LKR {total.toLocaleString()}</span>
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
              placeholder="Add any notes..."
            />
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms and Conditions
            </label>
            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter terms and conditions"
            />
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <span className="text-blue-600 hover:text-blue-800">Click to upload files</span>
                <span className="text-sm text-gray-500 mt-1">or drag and drop</span>
              </label>
              
              {attachedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="MOBILE_PAYMENT">Mobile Payment</option>
                  <option value="OTHER">Other</option>
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
                  placeholder="Transaction/Cheque number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit To <span className="text-red-500">*</span>
                </label>
                <select
                  name="depositTo"
                  value={formData.depositTo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select account to deposit</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/finance/sales/sales-receipts')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          {isEditMode && formData.status !== 'VOID' && (
            <button
              type="button"
              onClick={() => handleSubmit('void')}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Voiding...' : 'Void'}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('save')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save and Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesReceiptFormPage;