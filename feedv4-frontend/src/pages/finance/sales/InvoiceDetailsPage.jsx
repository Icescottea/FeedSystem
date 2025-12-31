import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const InvoiceDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      
      const mockData = {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        orderNumber: 'SO-2024-001',
        invoiceDate: '2024-12-20',
        dueDate: '2025-01-19',
        customerName: 'ABC Farms Ltd',
        customerId: 1,
        salesPerson: 'John Doe',
        subject: 'Feed Supply Invoice for December',
        status: 'SENT',
        isLocked: false,
        items: [
          {
            id: 1,
            itemName: 'Broiler Feed - Starter',
            quantity: 100,
            rate: 1500,
            tax: 0,
            amount: 150000
          },
          {
            id: 2,
            itemName: 'Layer Feed - Grower',
            quantity: 50,
            rate: 1800,
            tax: 0,
            amount: 90000
          }
        ],
        subTotal: 240000,
        totalTax: 0,
        shippingCharges: 5000,
        total: 245000,
        amountPaid: 0,
        balanceDue: 245000,
        customerNotes: 'Thank you for your business',
        termsAndConditions: 'Payment due within 30 days. Late payments may incur interest charges.',
        attachments: [
          { id: 1, name: 'invoice_details.pdf', size: '1.5 MB' }
        ],
        payments: [],
        journalEntries: [
          {
            id: 1,
            date: '2024-12-20',
            account: 'Accounts Receivable',
            debit: 245000,
            credit: 0
          },
          {
            id: 2,
            date: '2024-12-20',
            account: 'Sales Revenue',
            debit: 0,
            credit: 240000
          },
          {
            id: 3,
            date: '2024-12-20',
            account: 'Shipping Revenue',
            debit: 0,
            credit: 5000
          }
        ],
        createdDate: '2024-12-20',
        modifiedDate: '2024-12-20'
      };
      
      setInvoice(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (invoice.isLocked) {
      alert('This invoice is locked and cannot be edited.');
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
    // Display journal entries in the view
    const journalSection = document.getElementById('journal-section');
    if (journalSection) {
      journalSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClone = () => {
    // TODO: Implement clone functionality
    console.log('Cloning invoice:', id);
    alert('Invoice cloned! Redirecting to new invoice...');
    navigate('/finance/sales/invoices/new');
  };

  const handleDelete = async () => {
    if (invoice.isLocked) {
      alert('This invoice is locked and cannot be deleted.');
      return;
    }
    if (invoice.amountPaid > 0) {
      alert('Cannot delete an invoice with payments. Please void the invoice instead.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        // TODO: Implement delete API call
        console.log('Deleting invoice:', id);
        alert('Invoice deleted successfully!');
        navigate('/finance/sales/invoices');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Error deleting invoice.');
      }
    }
  };

  const handleLock = async () => {
    const action = invoice.isLocked ? 'unlock' : 'lock';
    if (window.confirm(`Are you sure you want to ${action} this invoice?`)) {
      try {
        // TODO: Implement lock/unlock API call
        console.log(`${action}ing invoice:`, id);
        setInvoice(prev => ({ ...prev, isLocked: !prev.isLocked }));
        alert(`Invoice ${action}ed successfully!`);
      } catch (error) {
        console.error(`Error ${action}ing invoice:`, error);
        alert(`Error ${action}ing invoice.`);
      }
    }
  };

  const handleRecordPayment = () => {
    setPaymentAmount(invoice.balanceDue.toString());
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
      // TODO: Implement record payment API call
      console.log('Recording payment:', { invoiceId: id, amount });
      
      const newAmountPaid = invoice.amountPaid + amount;
      const newBalanceDue = invoice.balanceDue - amount;
      
      let newStatus = invoice.status;
      if (newBalanceDue === 0) {
        newStatus = 'PAID';
      } else if (newAmountPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      setInvoice(prev => ({
        ...prev,
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
        payments: [
          ...prev.payments,
          {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            method: 'Bank Transfer'
          }
        ]
      }));

      setShowPaymentModal(false);
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment.');
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Downloading PDF for invoice:', id);
    alert('PDF download will be implemented with backend integration.');
  };

  const handleSendEmail = () => {
    // TODO: Implement email functionality
    console.log('Sending invoice via email:', id);
    alert('Email functionality will be implemented with backend integration.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'VOID':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading invoice details...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Invoice not found</div>
      </div>
    );
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
            <p className="text-gray-600 mt-1">{invoice.subject}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handleEdit}
              disabled={invoice.isLocked}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              onClick={handleCreateCreditNote}
              disabled={invoice.status === 'DRAFT' || invoice.status === 'VOID'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Credit Note
            </button>
            <button
              onClick={handleCreateDebitNote}
              disabled={invoice.status === 'DRAFT' || invoice.status === 'VOID'}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Debit Note
            </button>
            <button
              onClick={handleViewJournal}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Journal
            </button>
            <button
              onClick={handleClone}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clone
            </button>
            <button
              onClick={handleLock}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {invoice.isLocked ? 'Unlock' : 'Lock'}
            </button>
            <button
              onClick={handleDelete}
              disabled={invoice.isLocked || invoice.amountPaid > 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status and Lock Badge */}
      <div className="mb-6 flex gap-2">
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
          {invoice.status.replace('_', ' ')}
        </span>
        {invoice.isLocked && (
          <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
            🔒 LOCKED
          </span>
        )}
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            LKR {invoice.total.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Amount Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            LKR {invoice.amountPaid.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Balance Due</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            LKR {invoice.balanceDue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRecordPayment}
              disabled={invoice.balanceDue === 0 || invoice.status === 'VOID'}
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
        {/* Basic Information */}
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
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium text-gray-800">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sales Person:</span>
                <span className="font-medium text-gray-800">{invoice.salesPerson}</span>
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
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/finance/sales/customers/${invoice.customerId}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Customer Details →
                </button>
              </div>
              {invoice.orderNumber && (
                <div className="mt-2">
                  <button
                    onClick={() => navigate(`/finance/sales/sales-orders/${invoice.orderNumber.split('-')[2]}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Related Sales Order →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
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
                    <td className="px-4 py-3 text-sm text-gray-800">LKR {item.rate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.tax}%</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      LKR {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Section */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/2 space-y-3 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Sub Total:</span>
              <span className="font-medium">LKR {invoice.subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Tax:</span>
              <span className="font-medium">LKR {invoice.totalTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Shipping Charges:</span>
              <span className="font-medium">LKR {invoice.shippingCharges.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-lg font-bold text-blue-600">LKR {invoice.total.toLocaleString()}</span>
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
                        LKR {payment.amount.toLocaleString()}
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
                      {entry.debit > 0 ? `LKR ${entry.debit.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {entry.credit > 0 ? `LKR ${entry.credit.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

        {/* Attachments */}
        {invoice.attachments && invoice.attachments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Attachments</h3>
            <div className="space-y-2">
              {invoice.attachments.map((file) => (
                <div key={file.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({file.size})</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Information */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Audit Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span>Created: </span>
              <span className="text-gray-800">{new Date(invoice.createdDate).toLocaleString()}</span>
            </div>
            <div>
              <span>Last Modified: </span>
              <span className="text-gray-800">{new Date(invoice.modifiedDate).toLocaleString()}</span>
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
                <p className="text-lg font-bold text-red-600">LKR {invoice.balanceDue.toLocaleString()}</p>
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailsPage;