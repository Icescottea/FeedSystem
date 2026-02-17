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
    { id: Date.now(), itemName: '', quantity: 1, rate: 0, tax: 0, amount: 0 }
  ]);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  useEffect(() => {
    fetchCustomers();
    if (isEditMode) fetchSalesOrder();
  }, [id]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`);
      if (!res.ok) throw new Error('Failed to fetch customers');

      const data = await res.json();

      const normalized = data.map(c => ({
        id: c.id,
        name: c.name || c.customerName || c.companyName
      }));

      setCustomers(normalized);
    } catch (err) {
      console.error('Fetch customers error:', err);
      alert('Failed to load customers');
    }
  };

  const fetchSalesOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/sales-orders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch sales order');

      const data = await res.json();

      setFormData({
        customerId: data.customerId.toString(),
        customerName: data.customerName,
        salesOrderNumber: data.salesOrderNumber,
        referenceNumber: data.referenceNumber || '',
        date: data.salesOrderDate,
        expectedShipmentDate: data.expectedShipmentDate || '',
        paymentTerms: data.paymentTerms || '',
        deliveryMethod: data.deliveryMethod || '',
        salesPerson: data.salesPerson || '',
        shippingCharges: data.adjustment || 0,
        customerNotes: data.customerNotes || '',
        termsAndConditions: data.termsAndConditions || '',
        status: data.status
      });

      setItems(data.items.map((item, i) => ({
        id: item.id || i,
        itemName: item.itemName,
        quantity: item.quantity,
        rate: item.rate,
        tax: item.taxRate,
        amount: item.amount
      })));

    } catch (err) {
      console.error(err);
      alert('Failed to load sales order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'customerId') {
      const customer = customers.find(c => c.id.toString() === value);
      setFormData(prev => ({ ...prev, customerName: customer ? customer.name : '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    const qty = Number(newItems[index].quantity) || 0;
    const rate = Number(newItems[index].rate) || 0;
    const tax = Number(newItems[index].tax) || 0;
    const subtotal = qty * rate;

    newItems[index].amount = subtotal + (subtotal * tax / 100);
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

  const subTotal = items.reduce((sum, i) => sum + (i.quantity * i.rate), 0);
  const totalTax = items.reduce((sum, i) => sum + ((i.quantity * i.rate) * i.tax / 100), 0);
  const total = subTotal + totalTax + Number(formData.shippingCharges || 0);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (type) => {
    try {
      setLoading(true);

      const payload = {
        referenceNumber: formData.referenceNumber,
        customerId: Number(formData.customerId),
        customerName: formData.customerName,

        salesOrderDate: formData.salesOrderDate,
        expectedShipmentDate: formData.expectedShipmentDate || null,

        paymentTerms: formData.paymentTerms,
        deliveryMethod: formData.deliveryMethod,
        salesPerson: formData.salesPerson,

        shippingCharges: Number(formData.shippingCharges || 0),

        subtotal: subTotal,
        total: total,

        status: type === 'send' ? 'CONFIRMED' : 'DRAFT',
        orderStatus: type === 'send' ? 'PROCESSING' : 'PENDING',

        paymentStatus: 'UNPAID',
        invoicedStatus: 'NOT_INVOICED',

        customerNotes: formData.customerNotes,
        termsAndConditions: formData.termsAndConditions,
        attachments: null,

        items: items.map((item, i) => ({
          itemName: item.itemName,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          tax: Number(item.tax),
          amount: Number(item.amount),
          sequence: i + 1
        }))
      };

      const url = isEditMode 
        ? `${API_BASE_URL}/api/sales-orders/${id}`
        : `${API_BASE_URL}/api/sales-orders`;

      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Save failed');

      const savedSalesOrder = await res.json();

      setFormData(prev => ({ ...prev, salesOrderNumber: savedSalesOrder.salesOrderNumber}));

      alert(type === 'send' ? 'Sales order confirmed and sent!' : 'Sales order saved as draft!');
      navigate('/finance/sales/sales-orders');

    } catch (err) {
      console.error(err);
      alert('Error saving sales order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Sales Order' : 'New Sales Order'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update sales order information' : 'Create a new sales order'}
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
                  <option key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Order Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="salesOrderNumber"
                value={formData.salesOrderNumber || 'Auto Generated'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 cursor-not-allowed"
                readOnly
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
                placeholder="Enter reference number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Order Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="salesOrderDate"
                value={formData.salesOrderDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Shipment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expectedShipmentDate"
                value={formData.expectedShipmentDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms (Days)
              </label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">Due on Receipt</option>
                <option value="7">Net 7</option>
                <option value="15">Net 15</option>
                <option value="30">Net 30</option>
                <option value="45">Net 45</option>
                <option value="60">Net 60</option>
                <option value="90">Net 90</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Method <span className="text-red-500">*</span>
              </label>
              <select
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="COURIER">Courier</option>
                <option value="DELIVERY">Delivery</option>
                <option value="PICKUP">Customer Pickup</option>
                <option value="FREIGHT">Freight</option>
              </select>
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

          {/* Customer Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Notes
            </label>
            <textarea
              name="customerNotes"
              value={formData.customerNotes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notes visible to customer"
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
        </div>

        {/* Form Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/finance/sales/sales-orders')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
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
            onClick={() => handleSubmit('send')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Confirm Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderFormPage;