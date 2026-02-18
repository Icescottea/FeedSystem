import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/payments-received`;

const PaymentReceivedFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    customerId: '',
    amountReceived: 0,
    bankCharges: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentNumber: '',
    paymentMode: 'BANK_TRANSFER',
    depositTo: '',
    referenceNumber: '',
    taxDeducted: false,
    taxAmount: 0,
    notes: '',
  });

  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [invoicePayments, setInvoicePayments] = useState({});
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    if (isEditMode) {
      fetchPayment();
    } else {
      fetchNextPaymentNumber();
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (formData.customerId) {
      fetchUnpaidInvoices(formData.customerId);
    } else {
      setUnpaidInvoices([]);
      setInvoicePayments({});
    }
  }, [formData.customerId]);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchNextPaymentNumber = async () => {
    try {
      const response = await fetch(`${API_BASE}/next-number`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setFormData(prev => ({ ...prev, paymentNumber: data.paymentNumber }));
    } catch {
      // Fallback client-side
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({ ...prev, paymentNumber: `PAY-${year}-${random}` }));
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      // Normalize — handle whichever field name the API returns
      const normalized = data.map(c => ({
        id: c.id,
        name: c.name || c.customerName || c.companyName || `Customer #${c.id}`,
      }));
      setCustomers(normalized);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchUnpaidInvoices = async (customerId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invoices/customer/${customerId}/outstanding`
      );
      if (!response.ok) throw new Error('Failed to fetch unpaid invoices');
      const data = await response.json();
      setUnpaidInvoices(data);
    } catch (error) {
      console.error('Error fetching unpaid invoices:', error);
      setUnpaidInvoices([]);
    }
  };

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch payment');
      const data = await response.json();

      setFormData({
        customerId: data.customerId?.toString() || '',
        amountReceived: parseFloat(data.amountReceived) || 0,
        bankCharges: parseFloat(data.bankCharges) || 0,
        paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
        paymentNumber: data.paymentNumber || '',
        paymentMode: data.paymentMode || 'BANK_TRANSFER',
        depositTo: data.depositTo || '',
        referenceNumber: data.referenceNumber || '',
        taxDeducted: data.taxDeducted || false,
        taxAmount: parseFloat(data.taxAmount) || 0,
        notes: data.notes || '',
      });

      if (data.invoicePayments && data.invoicePayments.length > 0) {
        const payments = {};
        data.invoicePayments.forEach(ip => {
          payments[ip.invoiceId] = parseFloat(ip.paymentAmount) || 0;
        });
        setInvoicePayments(payments);
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
      alert('Failed to load payment data.');
    } finally {
      setLoading(false);
    }
  };

  // ─── FORM HANDLERS ────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleInvoicePaymentChange = (invoiceId, amount) => {
    setInvoicePayments(prev => ({
      ...prev,
      [invoiceId]: parseFloat(amount) || 0,
    }));
  };

  // ─── TOTALS ───────────────────────────────────────────────────────────────

  const totalInvoicePayments = Object.values(invoicePayments).reduce((sum, a) => sum + a, 0);
  const netReceived =
    parseFloat(formData.amountReceived || 0) -
    parseFloat(formData.bankCharges || 0) -
    (formData.taxDeducted ? parseFloat(formData.taxAmount || 0) : 0);
  const unusedAmount = netReceived - totalInvoicePayments;

  // ─── SUBMIT ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }
    if (parseFloat(formData.amountReceived) <= 0) {
      alert('Amount received must be greater than zero');
      return;
    }

    try {
      setLoading(true);

      const invoicePaymentsArray = Object.entries(invoicePayments)
        .filter(([_, amount]) => amount > 0)
        .map(([invoiceId, paymentAmount]) => ({
          invoiceId: parseInt(invoiceId),
          paymentAmount: parseFloat(paymentAmount),
          paymentDate: formData.paymentDate,
        }));

      const payload = {
        ...formData,
        customerId: parseInt(formData.customerId),
        amountReceived: parseFloat(formData.amountReceived),
        bankCharges: parseFloat(formData.bankCharges),
        taxAmount: parseFloat(formData.taxAmount || 0),
        invoicePayments: invoicePaymentsArray,
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
        throw new Error(err.message || 'Failed to save payment');
      }

      navigate('/finance/sales/payments-received');
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Error saving payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Payment' : 'Record Payment Received'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update payment information' : 'Record a new payment from customer'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Customer */}
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
                    <option key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Number (read-only, auto-generated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Number
                </label>
                <input
                  type="text"
                  name="paymentNumber"
                  value={formData.paymentNumber}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              {/* Payment Date */}
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

              {/* Amount Received */}
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
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Bank Charges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Charges
                </label>
                <input
                  type="number"
                  name="bankCharges"
                  value={formData.bankCharges}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Payment Mode */}
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
                  <option value="ONLINE_PAYMENT">Online Payment</option>
                </select>
              </div>

              {/* Deposit To — free text, no /api/accounts call */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit To <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="depositTo"
                  value={formData.depositTo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Main Bank Account - Commercial Bank"
                />
              </div>

              {/* Reference Number */}
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

              {/* Tax Deducted checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="taxDeducted"
                  checked={formData.taxDeducted}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Tax Deducted at Source
                </label>
              </div>

              {/* Tax Amount — shown only when taxDeducted is checked */}
              {formData.taxDeducted && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    name="taxAmount"
                    value={formData.taxAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            {/* Unpaid Invoices Section */}
            {unpaidInvoices.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Apply to Invoices</h3>
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-600">
                        <th className="pb-2">Invoice Date</th>
                        <th className="pb-2">Invoice Number</th>
                        <th className="pb-2">Invoice Amount</th>
                        <th className="pb-2">Amount Due</th>
                        <th className="pb-2">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unpaidInvoices.map(invoice => (
                        <tr key={invoice.id} className="border-t border-gray-200">
                          <td className="py-2 text-sm">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </td>
                          <td className="py-2 text-sm font-medium">{invoice.invoiceNumber}</td>
                          <td className="py-2 text-sm">
                            LKR {parseFloat(invoice.total || 0).toLocaleString()}
                          </td>
                          <td className="py-2 text-sm font-medium text-red-600">
                            LKR {parseFloat(invoice.balanceDue || 0).toLocaleString()}
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={invoicePayments[invoice.id] || 0}
                              onChange={(e) => handleInvoicePaymentChange(invoice.id, e.target.value)}
                              className="w-32 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                              min="0"
                              max={invoice.balanceDue}
                              step="0.01"
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
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount Received:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      LKR {parseFloat(formData.amountReceived || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank Charges:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      LKR {parseFloat(formData.bankCharges || 0).toLocaleString()}
                    </p>
                  </div>
                  {formData.taxDeducted && (
                    <div>
                      <p className="text-sm text-gray-600">Tax Deducted:</p>
                      <p className="text-lg font-semibold text-gray-900">
                        LKR {parseFloat(formData.taxAmount || 0).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Applied to Invoices:</p>
                    <p className="text-lg font-semibold text-green-600">
                      LKR {totalInvoicePayments.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-blue-200 pt-4">
                    <p className="text-sm text-gray-600">Unused Amount:</p>
                    <p className="text-2xl font-bold text-orange-600">
                      LKR {unusedAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/finance/sales/payments-received')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Payment' : 'Record Payment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentReceivedFormPage;