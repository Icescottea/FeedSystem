import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/payments-made`;

const MODE_LABELS = {
  BANK_TRANSFER: 'Bank Transfer', CHEQUE: 'Cheque', CASH: 'Cash',
  ONLINE_PAYMENT: 'Online Payment', CREDIT_CARD: 'Credit Card',
};

const getStatusBadge = (status) => {
  const config = { DRAFT: 'bg-gray-100 text-gray-800', PAID: 'bg-green-100 text-green-800', VOID: 'bg-red-100 text-red-800' };
  return `px-3 py-1 inline-flex text-sm font-semibold rounded-full ${config[status] || config.DRAFT}`;
};

const PaymentMadeDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPaymentDetails(); }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch payment details');
      setPayment(await response.json());
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── ACTIONS ─────────────────────────────────────────────────────────────

  const handleVoid = async () => {
    if (payment.status === 'VOID') { alert('Payment is already voided.'); return; }
    if (!window.confirm('Are you sure you want to void this payment? This will reverse all associated bill payments. This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}/void`, { method: 'POST' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to void payment');
      }
      setPayment(await response.json());
    } catch (error) {
      alert('Error voiding payment: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (payment.status === 'PAID') {
      alert('Cannot delete a paid payment. Please void it first.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete payment');
      }
      navigate('/finance/payments/payments-made');
    } catch (error) {
      alert('Error deleting payment: ' + error.message);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  if (loading) return <div className="p-6 text-center text-gray-500">Loading payment details...</div>;
  if (!payment) return <div className="p-6 text-center text-gray-500">Payment not found</div>;

  const billPayments = payment.billPayments || [];
  const accountingEntries = payment.accountingEntries || [];
  const amountInExcess = parseFloat(payment.amountInExcess) || 0;
  const amountRefunded = parseFloat(payment.amountRefunded) || 0;
  const totalDebit = accountingEntries.reduce((s, e) => s + (parseFloat(e.debit) || 0), 0);
  const totalCredit = accountingEntries.reduce((s, e) => s + (parseFloat(e.credit) || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 print:hidden">
        <button onClick={() => navigate('/finance/payments/payments-made')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1">
          ← Back to Payments Made
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{payment.paymentNumber}</h1>
            <p className="text-gray-600 mt-1">Payment Details</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={() => navigate(`/finance/payments/payments-made/${id}/edit`)}
              disabled={payment.status === 'VOID'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Edit
            </button>
            <button onClick={handleVoid} disabled={payment.status === 'VOID'}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Void
            </button>
            <button onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Print
            </button>
            <button onClick={handleDelete} disabled={payment.status === 'PAID'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 print:hidden">
        <span className={getStatusBadge(payment.status)}>{payment.status}</span>
      </div>

      {/* Document */}
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
              <p className="text-gray-800">
                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '—'}
              </p>
              <p className="text-sm text-gray-600 mt-2">Payment Mode</p>
              <p className="text-gray-800">{MODE_LABELS[payment.paymentMode] || payment.paymentMode}</p>
              <p className="text-sm text-gray-600 mt-2">Paid Through</p>
              <p className="text-gray-800">{payment.paidThroughAccountName || `Account #${payment.paidThroughAccountId}`}</p>
            </div>
          </div>
        </div>

        {/* Vendor */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Paid To</h3>
          <p className="font-semibold text-lg text-gray-800">
            {payment.vendorName || `Vendor #${payment.vendorId}`}
          </p>
        </div>

        {/* Bill Payments Table */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Bills Paid</h3>
          {billPayments.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No bills linked to this payment.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-y-2 border-gray-300">
                  {['Date','Bill Number','PO Number','Bill Amount','Amount Due','Payment Made On','Payment'].map(h => (
                    <th key={h} className={`px-4 py-3 text-sm font-semibold text-gray-700 ${h !== 'Date' && h !== 'Bill Number' && h !== 'PO Number' && h !== 'Payment Made On' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {billPayments.map((bp, i) => (
                  <tr key={bp.id || i} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {bp.billDate ? new Date(bp.billDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{bp.billNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{bp.poNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800">
                      LKR {(parseFloat(bp.billAmount) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800">
                      LKR {(parseFloat(bp.amountDue) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {bp.paymentMadeOn ? new Date(bp.paymentMadeOn).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                      LKR {(parseFloat(bp.paymentAmount) || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-80 space-y-2 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between py-2">
              <span className="text-gray-700">Amount Used for Payments:</span>
              <span className="font-medium text-gray-800">
                LKR {(parseFloat(payment.amountUsed) || 0).toLocaleString()}
              </span>
            </div>
            {amountRefunded > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Amount Refunded:</span>
                <span className="font-medium text-gray-800">LKR {amountRefunded.toLocaleString()}</span>
              </div>
            )}
            {amountInExcess > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Amount in Excess:</span>
                <span className="font-medium text-orange-600">LKR {amountInExcess.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-t border-gray-300">
              <span className="text-gray-700">Bank Charges:</span>
              <span className="font-medium text-gray-800">
                LKR {(parseFloat(payment.bankCharges) || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-400">
              <span className="text-lg font-semibold text-gray-800">Total Payment Made:</span>
              <span className="text-lg font-bold text-gray-800">
                LKR {(parseFloat(payment.paymentMade) || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Accounting Entries */}
        {accountingEntries.length > 0 && (
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
                {accountingEntries.map((entry, i) => (
                  <tr key={entry.id || i} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-800">{entry.accountName}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800">
                      {(parseFloat(entry.debit) || 0) > 0 ? (parseFloat(entry.debit)).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800">
                      {(parseFloat(entry.credit) || 0) > 0 ? (parseFloat(entry.credit)).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-800">Total</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">{totalDebit.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">{totalCredit.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2 italic">
              Note: Debits and Credits should balance in a proper accounting entry
            </p>
          </div>
        )}

        {/* Notes */}
        {payment.notes && (
          <div className="border-t border-gray-300 pt-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{payment.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-300 pt-6 mt-8 text-xs text-gray-500">
          <div className="flex justify-between">
            <div>
              {payment.createdBy && <p>Created by: {payment.createdBy}</p>}
              <p>Created on: {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '—'}</p>
            </div>
            <div className="text-right">
              <p>Last modified: {payment.updatedAt ? new Date(payment.updatedAt).toLocaleDateString() : '—'}</p>
              <p>Payment ID: #{payment.id}</p>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            {['Prepared by', 'Approved by'].map(label => (
              <div key={label}>
                <p className="text-sm text-gray-600 mb-8">{label}</p>
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm text-gray-800">Signature & Date</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMadeDetailsPage;