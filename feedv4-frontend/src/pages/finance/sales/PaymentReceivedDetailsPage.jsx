import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PaymentReceivedDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      
      const mockData = {
        id: 1,
        paymentNumber: 'PAY-2024-001',
        referenceNumber: 'REF-001',
        type: 'INVOICE_PAYMENT',
        paymentDate: '2024-12-20',
        customerName: 'ABC Farms Ltd',
        customerId: 1,
        amountReceived: 250000,
        bankCharges: 500,
        taxDeducted: false,
        taxAmount: 0,
        netAmount: 249500,
        paymentMode: 'BANK_TRANSFER',
        depositedTo: 'Main Bank Account - Commercial Bank',
        status: 'COMPLETED',
        invoicePayments: [
          {
            invoiceId: 1,
            invoiceNumber: 'INV-2024-001',
            invoiceDate: '2024-12-01',
            invoiceAmount: 250000,
            amountDue: 250000,
            paymentApplied: 249500
          }
        ],
        totalPaymentsApplied: 249500,
        amountRefunded: 0,
        amountInExcess: 0,
        notes: 'Payment received for invoice INV-2024-001',
        attachments: [
          { id: 1, name: 'payment_receipt.pdf', size: '1.2 MB' }
        ],
        createdBy: 'John Doe',
        createdDate: '2024-12-20T14:30:00',
        modifiedDate: '2024-12-20T14:30:00'
      };
      
      setPayment(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (payment.status === 'VOID') {
      alert('Cannot edit a voided payment.');
      return;
    }
    navigate(`/finance/sales/payments-received/${id}/edit`);
  };

  const handleVoid = async () => {
    if (payment.status === 'VOID') {
      alert('Payment is already voided.');
      return;
    }
    if (window.confirm('Are you sure you want to void this payment? This action cannot be undone.')) {
      try {
        // TODO: Implement void API call
        console.log('Voiding payment:', id);
        setPayment(prev => ({ ...prev, status: 'VOID' }));
        alert('Payment voided successfully!');
      } catch (error) {
        console.error('Error voiding payment:', error);
        alert('Error voiding payment.');
      }
    }
  };

  const handleDelete = async () => {
    if (payment.status === 'COMPLETED' && payment.totalPaymentsApplied > 0) {
      alert('Cannot delete a payment that has been applied to invoices. Please void it first.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      try {
        // TODO: Implement delete API call
        console.log('Deleting payment:', id);
        alert('Payment deleted successfully!');
        navigate('/finance/sales/payments-received');
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Error deleting payment.');
      }
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Downloading PDF for payment:', id);
    alert('PDF download will be implemented with backend integration.');
  };

  const handleSendEmail = () => {
    // TODO: Implement email functionality
    console.log('Sending payment receipt via email:', id);
    alert('Email functionality will be implemented with backend integration.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_USED':
        return 'bg-yellow-100 text-yellow-800';
      case 'VOID':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentModeColor = (mode) => {
    switch (mode) {
      case 'CASH':
        return 'bg-green-100 text-green-800';
      case 'BANK_TRANSFER':
        return 'bg-blue-100 text-blue-800';
      case 'CHEQUE':
        return 'bg-purple-100 text-purple-800';
      case 'CREDIT_CARD':
        return 'bg-indigo-100 text-indigo-800';
      case 'DEBIT_CARD':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'INVOICE_PAYMENT':
        return 'bg-blue-100 text-blue-800';
      case 'ADVANCE_PAYMENT':
        return 'bg-purple-100 text-purple-800';
      case 'PARTIAL_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading payment details...</div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Payment not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/finance/sales/payments-received')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Payments Received
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{payment.paymentNumber}</h1>
            <p className="text-gray-600 mt-1">Customer: {payment.customerName}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handleEdit}
              disabled={payment.status === 'VOID'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              onClick={handleVoid}
              disabled={payment.status === 'VOID'}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Void
            </button>
            <button
              onClick={handleDelete}
              disabled={payment.status === 'COMPLETED' && payment.totalPaymentsApplied > 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(payment.status)}`}>
          {payment.status.replace('_', ' ')}
        </span>
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getTypeColor(payment.type)}`}>
          {payment.type.replace('_', ' ')}
        </span>
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getPaymentModeColor(payment.paymentMode)}`}>
          {payment.paymentMode.replace('_', ' ')}
        </span>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Amount Received</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            LKR {payment.amountReceived.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Net Amount</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            LKR {payment.netAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Amount Used</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            LKR {payment.totalPaymentsApplied.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Amount in Excess</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            LKR {payment.amountInExcess.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
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

      {/* Payment Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Number:</span>
                <span className="font-medium text-gray-800">{payment.paymentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference Number:</span>
                <span className="font-medium text-gray-800">{payment.referenceNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date:</span>
                <span className="font-medium text-gray-800">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span className="font-medium text-gray-800">{payment.paymentMode.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposited To:</span>
                <span className="font-medium text-gray-800">{payment.depositedTo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created By:</span>
                <span className="font-medium text-gray-800">{payment.createdBy}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-medium text-gray-800">{payment.customerName}</span>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/finance/sales/customers/${payment.customerId}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Customer Details →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Breakdown</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Amount Received:</span>
              <span className="font-medium text-gray-900">LKR {payment.amountReceived.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Bank Charges:</span>
              <span className="font-medium text-gray-900">LKR {payment.bankCharges.toLocaleString()}</span>
            </div>
            {payment.taxDeducted && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tax Deducted:</span>
                <span className="font-medium text-gray-900">LKR {payment.taxAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Net Amount:</span>
              <span className="font-bold text-blue-600 text-lg">LKR {payment.netAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Invoice Payments Applied */}
        {payment.invoicePayments && payment.invoicePayments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Applied to Invoices</h3>
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Due</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payment.invoicePayments.map((inv) => (
                    <tr key={inv.invoiceId}>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        <button
                          onClick={() => navigate(`/finance/sales/invoices/${inv.invoiceId}`)}
                          className="hover:underline"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        LKR {inv.invoiceAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-red-600">
                        LKR {inv.amountDue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        LKR {inv.paymentApplied.toLocaleString()}
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
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary</h3>
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Amount Used:</span>
              <span className="font-medium text-gray-900">LKR {payment.totalPaymentsApplied.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Amount Refunded:</span>
              <span className="font-medium text-gray-900">LKR {payment.amountRefunded.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Amount in Excess:</span>
              <span className={`font-bold text-lg ${payment.amountInExcess > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                LKR {payment.amountInExcess.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{payment.notes}</p>
          </div>
        )}

        {/* Attachments */}
        {payment.attachments && payment.attachments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Attachments</h3>
            <div className="space-y-2">
              {payment.attachments.map((file) => (
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
              <span className="text-gray-800">{new Date(payment.createdDate).toLocaleString()}</span>
            </div>
            <div>
              <span>Last Modified: </span>
              <span className="text-gray-800">{new Date(payment.modifiedDate).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceivedDetailsPage;