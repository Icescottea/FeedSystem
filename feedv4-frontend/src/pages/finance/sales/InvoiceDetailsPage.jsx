import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const InvoiceDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/invoices/${id}`);
      if (!res.ok) throw new Error('Failed to fetch invoice');
      const data = await res.json();

      setInvoice({
        ...data,
        subtotal:        data.subtotal        ?? 0,
        tax:             data.tax             ?? 0,
        shippingCharges: data.shippingCharges ?? 0,
        total:           data.total           ?? 0,
        balanceDue:      data.balanceDue      ?? data.total ?? 0,
        amountPaid:      (data.total ?? 0) - (data.balanceDue ?? data.total ?? 0),
        items:           (data.items || []).map(item => ({
          ...item,
          tax:    item.tax    ?? 0,
          amount: item.amount ?? 0
        })),
        isLocked:       data.status === 'VOID',
        payments:       data.payments       || [],
        journalEntries: data.journalEntries || []
      });
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---- Actions ---- */

  const handleEdit = () => {
    if (invoice.isLocked) {
      alert('This invoice is voided and cannot be edited.');
      return;
    }
    navigate(`/finance/sales/invoices/${id}/edit`);
  };

  const handleCreateCreditNote = () => {
    navigate(`/finance/sales/credit-notes/new?invoiceId=${id}`);
  };

  const handleCreateDebitNote = () => {
    navigate(`/finance/sales/debit-notes/new?invoiceId=${id}`);
  };

  const handleViewJournal = () => {
    document.getElementById('journal-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClone = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/invoices/${id}/clone`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to clone invoice');
      const cloned = await res.json();
      alert('Invoice cloned! Redirecting to new invoice...');
      navigate(`/finance/sales/invoices/${cloned.id}/edit`);
    } catch (error) {
      console.error('Error cloning invoice:', error);
      alert('Error cloning invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVoid = async () => {
    if (invoice.isLocked) {
      alert('This invoice is already voided.');
      return;
    }
    if (!window.confirm('Are you sure you want to void this invoice? This action cannot be undone.')) return;
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/invoices/${id}/void`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to void invoice');
      setInvoice(prev => ({ ...prev, status: 'VOID', isLocked: true }));
      alert('Invoice voided successfully!');
    } catch (error) {
      console.error('Error voiding invoice:', error);
      alert('Error voiding invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (invoice.isLocked) {
      alert('This invoice is voided and cannot be deleted.');
      return;
    }
    if (invoice.amountPaid > 0) {
      alert('Cannot delete an invoice with payments. Please void the invoice instead.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete invoice');
      alert('Invoice deleted successfully!');
      navigate('/finance/sales/invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = () => {
    setPaymentAmount(String(invoice.balanceDue));
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    if (amount > invoice.balanceDue) {
      alert('Payment amount cannot exceed balance due.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/invoices/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (!res.ok) throw new Error('Failed to record payment');
      const updated = await res.json();

      setInvoice(prev => ({
        ...prev,
        balanceDue:    updated.balanceDue,
        paymentStatus: updated.paymentStatus,
        amountPaid:    (updated.total ?? prev.total) - (updated.balanceDue ?? 0),
        payments: [
          ...prev.payments,
          {
            id:     Date.now(),
            date:   new Date().toISOString().split('T')[0],
            amount,
            method: 'Bank Transfer'
          }
        ]
      }));

      setShowPaymentModal(false);
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = () => alert('PDF download will be implemented with backend integration.');
  const handleSendEmail  = () => alert('Email functionality will be implemented with backend integration.');

  /* ---- Status colours ---- */

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':          return 'bg-gray-100 text-gray-800';
      case 'SENT':           return 'bg-blue-100 text-blue-800';
      case 'VOID':           return 'bg-red-100 text-red-800';
      default:               return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAID':           return 'bg-green-100 text-green-800';
      case 'PARTIALLY_PAID': return 'bg-yellow-100 text-yellow-800';
      case 'UNPAID':         return 'bg-red-100 text-red-800';
      default:               return 'bg-gray-100 text-gray-800';
    }
  };

  /* ---- Render ---- */

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div className="p-6 text-center text-gray-500">Invoice not found</div>;
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/finance/sales/invoices')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Invoices
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{invoice.invoiceNumber}</h1>
            {invoice.subject && <p className="text-gray-600 mt-1">{invoice.subject}</p>}
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handleEdit}
              disabled={invoice.isLocked || actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              onClick={handleCreateCreditNote}
              disabled={invoice.status === 'DRAFT' || invoice.status === 'VOID'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Credit Note
            </button>
            <button
              onClick={handleCreateDebitNote}
              disabled={invoice.status === 'DRAFT' || invoice.status === 'VOID'}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Debit Note
            </button>
            <button
              onClick={handleViewJournal}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Journal
            </button>
            <button
              onClick={handleClone}
              disabled={actionLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Clone
            </button>
            <button
              onClick={handleVoid}
              disabled={invoice.isLocked || actionLoading}
              className="px-4 py-2 border border-orange-400 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Void
            </button>
            <button
              onClick={handleDelete}
              disabled={invoice.isLocked || invoice.amountPaid > 0 || actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status badges */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
          {invoice.status}
        </span>
        {invoice.paymentStatus && (
          <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getPaymentStatusColor(invoice.paymentStatus)}`}>
            {invoice.paymentStatus.replace('_', ' ')}
          </span>
        )}
        {invoice.isLocked && (
          <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
            VOIDED
          </span>
        )}
      </div>

      {/* Payment summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">LKR {Number(invoice.total).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Amount Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1">LKR {Number(invoice.amountPaid).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Balance Due</p>
          <p className="text-2xl font-bold text-red-600 mt-1">LKR {Number(invoice.balanceDue).toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRecordPayment}
              disabled={Number(invoice.balanceDue) === 0 || invoice.status === 'VOID' || actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Record Payment
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={handleSendEmail}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send via Email
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-medium text-gray-800">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium text-gray-800">{invoice.orderNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date:</span>
                <span className="font-medium text-gray-800">
                  {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium text-gray-800">
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sales Person:</span>
                <span className="font-medium text-gray-800">{invoice.salesPerson || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Terms:</span>
                <span className="font-medium text-gray-800">{invoice.terms ? `Net ${invoice.terms}` : '-'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-medium text-gray-800">{invoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                  {invoice.paymentStatus?.replace('_', ' ') || '-'}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => navigate(`/finance/sales/customers/${invoice.customerId}`)}
                  className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Customer Details →
                </button>
                {invoice.orderNumber && (
                  <button
                    onClick={() => navigate(`/finance/sales/sales-orders?search=${invoice.orderNumber}`)}
                    className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Related Sales Order →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Items</h3>
          <div className="overflow-x-auto border border-gray-300 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax (%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.itemName}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">LKR {Number(item.rate).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.tax}%</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      LKR {Number(item.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/2 space-y-3 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Sub Total:</span>
              <span className="font-medium">LKR {Number(invoice.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Tax:</span>
              <span className="font-medium">LKR {Number(invoice.tax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Shipping Charges:</span>
              <span className="font-medium">LKR {Number(invoice.shippingCharges).toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-lg font-bold text-blue-600">LKR {Number(invoice.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment History</h3>
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        LKR {Number(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{payment.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Journal Entries */}
        <div id="journal-section">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Journal Entries</h3>
          {invoice.journalEntries && invoice.journalEntries.length > 0 ? (
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.journalEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{entry.account}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {entry.debit > 0 ? `LKR ${Number(entry.debit).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {entry.credit > 0 ? `LKR ${Number(entry.credit).toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg">No journal entries yet.</p>
          )}
        </div>

        {/* Customer Notes */}
        {invoice.customerNotes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Customer Notes</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{invoice.customerNotes}</p>
          </div>
        )}

        {/* Terms and Conditions */}
        {invoice.termsAndConditions && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Terms and Conditions</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{invoice.termsAndConditions}</p>
          </div>
        )}

        {/* Audit Information */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Audit Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span>Created: </span>
              <span className="text-gray-800">
                {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Record Payment</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="font-medium text-gray-800">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Balance Due</p>
                <p className="text-lg font-bold text-red-600">LKR {Number(invoice.balanceDue).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={invoice.balanceDue}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailsPage;