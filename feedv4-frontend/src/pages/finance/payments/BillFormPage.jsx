import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    status: 'DRAFT'
  });

  const [items, setItems] = useState([
    {
      id: 1,
      itemDetails: '',
      account: '',
      quantity: 1,
      rate: 0,
      tax: '0',
      customerDetails: '',
      amount: 0
    }
  ]);

  const [attachments, setAttachments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
    if (isEditMode) {
      fetchBill();
    } else {
      generateBillNumber();
    }
  }, [id]);

  useEffect(() => {
    // Calculate due date based on payment terms
    if (formData.billDate && formData.paymentTerms) {
      const billDate = new Date(formData.billDate);
      let daysToAdd = 0;

      switch (formData.paymentTerms) {
        case 'DUE_ON_RECEIPT':
          daysToAdd = 0;
          break;
        case 'NET_15':
          daysToAdd = 15;
          break;
        case 'NET_30':
          daysToAdd = 30;
          break;
        case 'NET_45':
          daysToAdd = 45;
          break;
        case 'NET_60':
          daysToAdd = 60;
          break;
        case 'NET_90':
          daysToAdd = 90;
          break;
        default:
          daysToAdd = 30;
      }

      const dueDate = new Date(billDate);
      dueDate.setDate(dueDate.getDate() + daysToAdd);
      
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.billDate, formData.paymentTerms]);

  const fetchVendors = async () => {
    try {
      // TODO: Replace with actual API call
      const mockVendors = [
        { id: 1, name: 'Global Feed Supplies Ltd', paymentTerms: 'NET_30' },
        { id: 2, name: 'Premium Ingredients Co.', paymentTerms: 'NET_45' },
        { id: 3, name: 'ABC Raw Materials', paymentTerms: 'NET_30' },
        { id: 4, name: 'Quality Nutrients Inc', paymentTerms: 'NET_60' },
        { id: 5, name: 'Local Supplier Network', paymentTerms: 'NET_15' }
      ];
      setVendors(mockVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const generateBillNumber = async () => {
    try {
      // TODO: Replace with actual API call to generate bill number
      const billNumber = `BILL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, billNumber }));
    } catch (error) {
      console.error('Error generating bill number:', error);
    }
  };

  const fetchBill = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockData = {
        vendorId: '1',
        vendorName: 'Global Feed Supplies Ltd',
        billNumber: 'BILL-2024-001',
        orderNumber: 'PO-2024-001',
        referenceNumber: 'REF-001',
        billDate: '2024-12-15',
        dueDate: '2025-01-14',
        paymentTerms: 'NET_30',
        accountsPayable: 'ACCOUNTS_PAYABLE',
        subject: 'Monthly raw materials purchase',
        taxInclusive: false,
        discount: 5,
        discountType: 'PERCENTAGE',
        notes: 'Payment due within 30 days of invoice date',
        status: 'DRAFT'
      };

      const mockItems = [
        {
          id: 1,
          itemDetails: 'Corn - Yellow Grade A',
          account: 'Raw Materials',
          quantity: 1000,
          rate: 250,
          tax: '12',
          customerDetails: 'For Batch #2024-12-001',
          amount: 250000
        },
        {
          id: 2,
          itemDetails: 'Wheat Bran',
          account: 'Raw Materials',
          quantity: 500,
          rate: 400,
          tax: '12',
          customerDetails: 'For Batch #2024-12-001',
          amount: 200000
        }
      ];

      setFormData(mockData);
      setItems(mockItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bill:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVendorChange = (e) => {
    const vendorId = e.target.value;
    const vendor = vendors.find(v => v.id === parseInt(vendorId));
    
    setFormData(prev => ({
      ...prev,
      vendorId: vendorId,
      vendorName: vendor ? vendor.name : '',
      paymentTerms: vendor ? vendor.paymentTerms : prev.paymentTerms
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Calculate amount
    if (field === 'quantity' || field === 'rate') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = quantity * rate;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now(),
      itemDetails: '',
      account: '',
      quantity: 1,
      rate: 0,
      tax: '0',
      customerDetails: '',
      amount: 0
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (formData.discountType === 'PERCENTAGE') {
      return (subtotal * parseFloat(formData.discount || 0)) / 100;
    }
    return parseFloat(formData.discount || 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const taxableAmount = subtotal - discount;
    
    return items.reduce((sum, item) => {
      const itemAmount = parseFloat(item.amount) || 0;
      const itemTaxRate = parseFloat(item.tax) || 0;
      const itemPortion = taxableAmount > 0 ? itemAmount / subtotal : 0;
      return sum + (taxableAmount * itemPortion * itemTaxRate / 100);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = formData.taxInclusive ? 0 : calculateTax();
    return subtotal - discount + tax;
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file: file
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSubmit = async (saveType) => {
    try {
      setLoading(true);

      const billData = {
        ...formData,
        items,
        attachments: attachments.map(a => a.name),
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        tax: calculateTax(),
        total: calculateTotal(),
        status: saveType === 'draft' ? 'DRAFT' : 'OPEN'
      };

      // TODO: Replace with actual API call
      console.log('Saving bill:', billData);

      await new Promise(resolve => setTimeout(resolve, 500));

      alert(
        isEditMode 
          ? 'Bill updated successfully!' 
          : saveType === 'draft'
            ? 'Bill saved as draft!'
            : 'Bill saved as open!'
      );
      navigate('/finance/payments/bills');

    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Error saving bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Bill' : 'New Bill'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update bill information' : 'Create a new bill'}
        </p>
      </div>

      {/* Form */}
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
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleVendorChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bill Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="billNumber"
                  value={formData.billNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="BILL-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="PO-2024-001"
                />
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
                  placeholder="REF-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bill Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="billDate"
                  value={formData.billDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Payment & Account Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment & Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms
                </label>
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                  <option value="NET_15">Net 15</option>
                  <option value="NET_30">Net 30</option>
                  <option value="NET_45">Net 45</option>
                  <option value="NET_60">Net 60</option>
                  <option value="NET_90">Net 90</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accounts Payable
                </label>
                <select
                  name="accountsPayable"
                  value={formData.accountsPayable}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACCOUNTS_PAYABLE">Accounts Payable</option>
                  <option value="TRADE_PAYABLES">Trade Payables</option>
                  <option value="OTHER_PAYABLES">Other Payables</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subject or description"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="taxInclusive"
                  name="taxInclusive"
                  checked={formData.taxInclusive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="taxInclusive" className="ml-2 block text-sm text-gray-700">
                  Tax Inclusive
                </label>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Details</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax (%)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer Details</th>
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
                          value={item.itemDetails}
                          onChange={(e) => handleItemChange(index, 'itemDetails', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Item description"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.account}
                          onChange={(e) => handleItemChange(index, 'account', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Account</option>
                          <option value="Raw Materials">Raw Materials</option>
                          <option value="Packaging">Packaging</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Supplies">Supplies</option>
                          <option value="Services">Services</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.tax}
                          onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.customerDetails}
                          onChange={(e) => handleItemChange(index, 'customerDetails', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Additional details"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-800">
                          LKR {item.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation Section */}
          <div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium text-gray-800">LKR {calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-700">Discount:</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                      className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PERCENTAGE">%</option>
                      <option value="AMOUNT">LKR</option>
                    </select>
                    <span className="font-medium text-gray-800 w-24 text-right">
                      LKR {calculateDiscount().toLocaleString()}
                    </span>
                  </div>
                </div>
                {!formData.taxInclusive && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Tax:</span>
                    <span className="font-medium text-gray-800">LKR {calculateTax().toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-lg font-bold text-gray-800">LKR {calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
            <div className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map(file => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.id)}
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
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/finance/payments/bills')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('open')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update and Save as Open' : 'Save as Open')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillFormPage;