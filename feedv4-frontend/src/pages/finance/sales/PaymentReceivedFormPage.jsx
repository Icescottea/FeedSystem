import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PaymentReceivedFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    amountReceived: 0,
    bankCharges: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentNumber: '',
    paymentMode: 'BANK_TRANSFER',
    depositTo: '',
    referenceNumber: '',
    taxDeducted: false,
    taxAmount: 0,
    notes: ''
  });

  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [invoicePayments, setInvoicePayments] = useState({});
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchAccounts();
    if (isEditMode) {
      fetchPayment();
    } else {
      generatePaymentNumber();
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (formData.customerId) {
      fetchUnpaidInvoices(formData.customerId);
    }
  }, [formData.customerId]);

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
      { id: 3, name: 'Savings Account - Sampath Bank' }
    ];
    setAccounts(mockAccounts);
  };

  const generatePaymentNumber = () => {
    // TODO: Replace with actual API call
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, paymentNumber: `PAY-${year}-${random}` }));
  };

  const fetchUnpaidInvoices = async (customerId) => {
    // TODO: Replace with actual API call
    const mockInvoices = [
      {
        id: 1,
        date: '2024-12-01',
        invoiceNumber: 'INV-2024-001',
        invoiceAmount: 250000,
        amountDue: 250000
      },
      {
        id: 2,
        date: '2024-12-10',
        invoiceNumber: 'INV-2024-004',
        invoiceAmount: 150000,
        amountDue: 75000
      },
      {
        id: 3,
        date: '2024-12-15',
        invoiceNumber: 'INV-2024-007',
        invoiceAmount: 95000,
        amountDue: 95000
      }
    ];
    
    setUnpaidInvoices(mockInvoices);
    
    // Initialize payment amounts to 0
    const initialPayments = {};
    mockInvoices.forEach(inv => {
      initialPayments[inv.id] = 0;
    });
    setInvoicePayments(initialPayments);
  };

  const fetchPayment = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockData = {
        customerId: '1',
        customerName: 'ABC Farms Ltd',
        amountReceived: 250000,
        bankCharges: 500,
        paymentDate: '2024-12-20',
        paymentNumber: 'PAY-2024-001',
        paymentMode: 'BANK_TRANSFER',
        depositTo: '2',
        referenceNumber: 'TXN123456',
        taxDeducted: false,
        taxAmount: 0,
        notes: 'Payment for December invoices'
      };

      setFormData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'customerId') {
      const customer = customers.find(c => c.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        customerName: customer ? customer.name : ''
      }));
    }
  };

  const handleInvoicePaymentChange = (invoiceId, amount) => {
    const invoice = unpaidInvoices.find(inv => inv.id === invoiceId);
    const maxAmount = invoice ? invoice.amountDue : 0;
    const validAmount = Math.min(Math.max(0, parseFloat(amount) || 0), maxAmount);
    
    setInvoicePayments(prev => ({
      ...prev,
      [invoiceId]: validAmount
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const amountReceived = parseFloat(formData.amountReceived) || 0;
  const bankCharges = parseFloat(formData.bankCharges) || 0;
  const taxAmount = formData.taxDeducted ? (parseFloat(formData.taxAmount) || 0) : 0;
  const netAmount = amountReceived - bankCharges - taxAmount;
  
  const totalPaymentsApplied = Object.values(invoicePayments).reduce((sum, val) => sum + val, 0);
  const amountInExcess = netAmount - totalPaymentsApplied;
  const amountRefunded = 0; // TODO: Implement refund logic

  const handleSubmit = async (saveType) => {
    try {
      setLoading(true);

      const paymentData = {
        ...formData,
        netAmount,
        invoicePayments,
        totalPaymentsApplied,
        amountInExcess,
        amountRefunded,
        status: saveType === 'paid' ? 'COMPLETED' : 'DRAFT'
      };

      // TODO: Replace with actual API call
      console.log('Saving payment:', paymentData);
      console.log('Attached files:', attachedFiles);

      await new Promise(resolve => setTimeout(resolve, 500));

      alert(saveType === 'paid' ? 'Payment recorded successfully!' : 'Payment saved as draft!');
      navigate('/finance/sales/payments-received');

    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Error saving payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Payment' : 'Record Payment Received'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update payment information' : 'Record a new payment from customer'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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
                Amount Received <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amountReceived"
                value={formData.amountReceived}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Charges
              </label>
              <input
                type="number"
                name="bankCharges"
                value={formData.bankCharges}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="paymentNumber"
                value={formData.paymentNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

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
                Deposit To <span className="text-red-500">*</span>
              </label>
              <select
                name="depositTo"
                value={formData.depositTo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
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
                placeholder="Transaction/Cheque number"
              />
            </div>

            {/* Tax Deducted */}
            <div className="md:col-span-2 border-t pt-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  name="taxDeducted"
                  id="taxDeducted"
                  checked={formData.taxDeducted}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="taxDeducted" className="text-sm font-medium text-gray-700">
                  Tax Deducted at Source (TDS)
                </label>
              </div>
              
              {formData.taxDeducted && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="taxAmount"
                    value={formData.taxAmount}
                    onChange={handleChange}
                    required={formData.taxDeducted}
                    className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Unpaid Invoices Table */}
          {formData.customerId && unpaidInvoices.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Apply Payment to Invoices</h3>
              
              <div className="overflow-x-auto border border-gray-300 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Number</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Due</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {unpaidInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          LKR {invoice.invoiceAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-red-600">
                          LKR {invoice.amountDue.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={invoicePayments[invoice.id] || 0}
                            onChange={(e) => handleInvoicePaymentChange(invoice.id, e.target.value)}
                            max={invoice.amountDue}
                            min="0"
                            step="0.01"
                            className="w-40 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Amount Received:</span>
                <span className="font-medium text-gray-900">LKR {amountReceived.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Bank Charges:</span>
                <span className="font-medium text-gray-900">LKR {bankCharges.toLocaleString()}</span>
              </div>
              {formData.taxDeducted && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tax Deducted:</span>
                  <span className="font-medium text-gray-900">LKR {taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-800">Net Amount:</span>
                <span className="font-bold text-blue-600 text-lg">LKR {netAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Amount Used for Payments:</span>
                <span className="font-medium text-green-600">LKR {totalPaymentsApplied.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Amount Refunded:</span>
                <span className="font-medium text-gray-900">LKR {amountRefunded.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-800">Amount in Excess:</span>
                <span className={`font-bold text-lg ${amountInExcess > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                  LKR {amountInExcess.toLocaleString()}
                </span>
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
              placeholder="Add any notes about this payment..."
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
            onClick={() => navigate('/finance/sales/payments-received')}
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
            onClick={() => handleSubmit('paid')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save as Paid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceivedFormPage;