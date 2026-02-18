import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PaymentReceivedDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/payments-received/${id}`);
      if (!response.ok) throw new Error('Failed to fetch payment details');
      const data = await response.json();
      setPayment(data);
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
    if (window.confirm('Are you sure you want to void this payment? This will reverse all invoice payments.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/payments-received/${id}/void`, {
          method: 'POST',
        });
        
        if (!response.ok) throw new Error('Failed to void payment');
        
        const data = await response.json();
        setPayment(data);
        alert('Payment voided successfully!');
      } catch (error) {
        console.error('Error voiding payment:', error);
        alert('Error voiding payment: ' + error.message);
      }
    }
  };

  const handleDelete = async () => {
    if (payment.invoicePayments && payment.invoicePayments.length > 0) {
      alert('Cannot delete a payment that has been applied to invoices. Please void it first.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/payments-received/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete payment');
        
        alert('Payment deleted successfully!');
        navigate('/finance/sales/payments-received');
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Error deleting payment: ' + error.message);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_USED':
        return 'bg-yellow-100 text-yellow-800';
      case 'VOID':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'INVOICE_PAYMENT':
        return 'bg-blue-100 text-blue-800';
      case 'PARTIAL_PAYMENT':
        return 'bg-purple-100 text-purple-800';
      case 'ADVANCE_PAYMENT':
        return 'bg-orange-100 text-orange-800';
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

  const netAmount = payment.amountReceived - payment.bankCharges - (payment.taxAmount || 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Details</h1>
          <p className="text-gray-600 mt-1">{payment.paymentNumber}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/finance/sales/payments-received')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to List
          </button>
          <button
            onClick={handleEdit}
            disabled={payment.status === 'VOID'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Edit
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Print
          </button>
          <button
            onClick={handleVoid}
            disabled={payment.status === 'VOID'}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Void
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Payment Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                {payment.status?.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(payment.type)}`}>
                {payment.type?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Payment Number</p>
              <p className="text-base font-medium text-gray-900">{payment.paymentNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reference Number</p>
              <p className="text-base font-medium text-gray-900">{payment.referenceNumber || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Date</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(payment.paymentDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="text-base font-medium text-gray-900">{payment.customerName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Mode</p>
              <p className="text-base font-medium text-gray-900">
                {payment.paymentMode?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deposited To</p>
              <p className="text-base font-medium text-gray-900">{payment.depositTo}</p>
            </div>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Amount Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount Received</span>
              <span className="text-base font-medium text-gray-900">
                LKR {payment.amountReceived.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Bank Charges</span>
              <span className="text-base font-medium text-gray-900">
                LKR {payment.bankCharges.toLocaleString()}
              </span>
            </div>
            {payment.taxDeducted && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax Deducted</span>
                <span className="text-base font-medium text-gray-900">
                  LKR {payment.taxAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-sm font-medium text-gray-700">Net Amount</span>
              <span className="text-base font-bold text-gray-900">
                LKR {netAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount Used</span>
              <span className="text-base font-medium text-green-600">
                LKR {payment.amountUsed.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-sm font-medium text-gray-700">Unused Amount</span>
              <span className="text-lg font-bold text-orange-600">
                LKR {payment.unusedAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Payments */}
      {payment.invoicePayments && payment.invoicePayments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Applied to Invoices</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payment.invoicePayments.map((invoicePayment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(invoicePayment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        {invoicePayment.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        LKR {invoicePayment.invoiceBalanceDue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        LKR {invoicePayment.paymentAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {payment.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{payment.notes}</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Created By</p>
              <p className="font-medium text-gray-900">{payment.createdBy || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Created Date</p>
              <p className="font-medium text-gray-900">
                {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Last Modified</p>
              <p className="font-medium text-gray-900">
                {payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceivedDetailsPage;