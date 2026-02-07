import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PaymentMadeDetailsPage = () => {
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
        paymentNumber: 'PMT-2024-001',
        referenceNumber: 'REF-PMT-001',
        orderNumber: 'PO-2024-001',
        paymentDate: '2024-12-20',
        status: 'PAID',
        vendor: {
          name: 'Global Feed Supplies Ltd',
          companyName: 'Global Feed Supplies Ltd',
          email: 'info@globalfeed.com',
          phone: '+94 11 234 5678',
          address: '123 Industrial Zone, Colombo, Western 00100, Sri Lanka'
        },
        paymentMode: 'BANK_TRANSFER',
        paidThrough: 'Primary Bank Account - BOC',
        paymentMade: 478800,
        bankCharges: 500,
        billPayments: [
          {
            id: 1,
            date: '2024-12-15',
            billNumber: 'BILL-2024-001',
            poNumber: 'PO-2024-001',
            billAmount: 478800,
            amountDue: 478800,
            paymentMadeOn: '2024-12-20',
            payment: 478300
          }
        ],
        amountPaid: 478300,
        amountUsed: 478300,
        amountRefunded: 0,
        amountInExcess: 0,
        totalBankCharges: 500,
        notes: 'Payment for December supplies. Transfer completed via bank.',
        attachments: [
          { id: 1, name: 'bank_transfer_receipt.pdf', size: '245 KB' },
          { id: 2, name: 'bill_copy.pdf', size: '180 KB' }
        ],
        // Accounting entries
        accountingEntries: [
          {
            id: 1,
            account: 'Accounts Payable',
            debit: 478800,
            credit: 0
          },
          {
            id: 2,
            account: 'Primary Bank Account - BOC',
            debit: 0,
            credit: 478300
          },
          {
            id: 3,
            account: 'Bank Charges',
            debit: 500,
            credit: 0
          }
        ],
        createdDate: '2024-12-20',
        modifiedDate: '2024-12-20',
        createdBy: 'John Doe'
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
    navigate(`/finance/payments/payments-made/${id}/edit`);
  };

  const handleVoid = async () => {
    if (payment.status === 'VOID') {
      alert('Payment is already voided.');
      return;
    }
    if (window.confirm('Are you sure you want to void this payment? This will reverse all associated bill payments. This action cannot be undone.')) {
      try {
        // TODO: Implement void API call
        console.log('Voiding payment:', id);
        setPayment(prev => ({ ...prev, status: 'VOID' }));
        alert('Payment voided successfully! Associated bills have been updated.');
      } catch (error) {
        console.error('Error voiding payment:', error);
        alert('Error voiding payment.');
      }
    }
  };

  const handleDelete = async () => {
    if (payment.status === 'PAID') {
      alert('Cannot delete a paid payment. Please void it first.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      try {
        // TODO: Implement delete API call
        console.log('Deleting payment:', id);
        alert('Payment deleted successfully!');
        navigate('/finance/payments/payments-made');
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Error deleting payment.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
      PAID: { bg: 'bg-green-100', text: 'text-green-800' },
      VOID: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return `px-3 py-1 inline-flex text-sm font-semibold rounded-full ${config.bg} ${config.text}`;
  };

  const getModeBadge = (mode) => {
    const modeLabels = {
      BANK_TRANSFER: 'Bank Transfer',
      CHEQUE: 'Cheque',
      CASH: 'Cash',
      ONLINE_PAYMENT: 'Online Payment',
      CREDIT_CARD: 'Credit Card'
    };
    return modeLabels[mode] || mode;
  };

  const calculateTotalDebit = () => {
    return payment.accountingEntries.reduce((sum, entry) => sum + entry.debit, 0);
  };

  const calculateTotalCredit = () => {
    return payment.accountingEntries.reduce((sum, entry) => sum + entry.credit, 0);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 print:hidden">
        <button
          onClick={() => navigate('/finance/payments/payments-made')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Payments Made
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{payment.paymentNumber}</h1>
            <p className="text-gray-600 mt-1">Payment Details</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Print
            </button>
            <button
              onClick={handleDelete}
              disabled={payment.status === 'PAID'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6 print:hidden">
        <span className={getStatusBadge(payment.status)}>
          {payment.status}
        </span>
      </div>

      {/* PDF-Style Document */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-5xl mx-auto">
        {/* Document Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">PAYMENT VOUCHER</h2>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Payment Number</p>
              <p className="text-lg font-semibold text-gray-800">{payment.paymentNumber}</p>
              {payment.referenceNumber && (
                <>
                  <p className="text-sm text-gray-600 mt-2">Reference Number</p>
                  <p className="text-gray-800">{payment.referenceNumber}</p>
                </>
              )}
              {payment.orderNumber && (
                <>
                  <p className="text-sm text-gray-600 mt-2">Order Number</p>
                  <p className="text-gray-800">{payment.orderNumber}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Payment Date</p>
              <p className="text-gray-800">{new Date(payment.paymentDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mt-2">Payment Mode</p>
              <p className="text-gray-800">{getModeBadge(payment.paymentMode)}</p>
              <p className="text-sm text-gray-600 mt-2">Paid Through</p>
              <p className="text-gray-800">{payment.paidThrough}</p>
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Paid To</h3>
          <div className="text-gray-800">
            <p className="font-semibold text-lg">{payment.vendor.name}</p>
            <p className="text-sm">{payment.vendor.companyName}</p>
            <p className="text-sm mt-2">{payment.vendor.email}</p>
            <p className="text-sm">{payment.vendor.phone}</p>
            <p className="text-sm mt-2">{payment.vendor.address}</p>
          </div>
        </div>

        {/* Bill Payments Table */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Bills Paid</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y-2 border-gray-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bill Number</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">PO Number</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Bill Amount</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount Due</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Made On</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Payment</th>
              </tr>
            </thead>
            <tbody>
              {payment.billPayments.map((bp) => (
                <tr key={bp.id} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {new Date(bp.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{bp.billNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{bp.poNumber || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">
                    LKR {bp.billAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">
                    LKR {bp.amountDue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(bp.paymentMadeOn).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                    LKR {bp.payment.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Amount Paid:</span>
                <span className="font-medium text-gray-800">LKR {payment.amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Amount Used for Payments:</span>
                <span className="font-medium text-gray-800">LKR {payment.amountUsed.toLocaleString()}</span>
              </div>
              {payment.amountRefunded > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Amount Refunded:</span>
                  <span className="font-medium text-gray-800">LKR {payment.amountRefunded.toLocaleString()}</span>
                </div>
              )}
              {payment.amountInExcess > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Amount in Excess:</span>
                  <span className="font-medium text-orange-600">LKR {payment.amountInExcess.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-gray-300">
                <span className="text-gray-700">Bank Charges:</span>
                <span className="font-medium text-gray-800">LKR {payment.totalBankCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-400">
                <span className="text-lg font-semibold text-gray-800">Total Payment Made:</span>
                <span className="text-lg font-bold text-gray-800">LKR {payment.paymentMade.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accounting Entries */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Accounting Entries</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Account</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Debit (LKR)</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Credit (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {payment.accountingEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-800">{entry.account}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">
                    {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">
                    {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                <td className="px-4 py-3 text-sm text-gray-800">Total</td>
                <td className="px-4 py-3 text-sm text-right text-gray-800">
                  {calculateTotalDebit().toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-800">
                  {calculateTotalCredit().toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2 italic">
            Note: Debits and Credits should balance in a proper accounting entry
          </p>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className="border-t border-gray-300 pt-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{payment.notes}</p>
          </div>
        )}

        {/* Attachments */}
        {payment.attachments && payment.attachments.length > 0 && (
          <div className="border-t border-gray-300 pt-6 print:hidden">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Attachments</h3>
            <div className="space-y-2">
              {payment.attachments.map(file => (
                <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="border-t border-gray-300 pt-6 mt-8 text-xs text-gray-500">
          <div className="flex justify-between">
            <div>
              <p>Created by: {payment.createdBy}</p>
              <p>Created on: {new Date(payment.createdDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p>Last modified: {new Date(payment.modifiedDate).toLocaleDateString()}</p>
              <p>Payment ID: #{payment.id}</p>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-8">Prepared by</p>
              <div className="border-t border-gray-400 pt-2">
                <p className="text-sm text-gray-800">Signature & Date</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-8">Approved by</p>
              <div className="border-t border-gray-400 pt-2">
                <p className="text-sm text-gray-800">Signature & Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMadeDetailsPage;