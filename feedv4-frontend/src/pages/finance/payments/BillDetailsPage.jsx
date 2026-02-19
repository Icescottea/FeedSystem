import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/bills`;

const getStatusBadge = (status) => {
  const config = {
    DRAFT: { cls: 'bg-gray-100 text-gray-800', label: 'DRAFT' },
    OPEN: { cls: 'bg-blue-100 text-blue-800', label: 'OPEN' },
    PARTIALLY_PAID: { cls: 'bg-yellow-100 text-yellow-800', label: 'Partially Paid' },
    PAID: { cls: 'bg-green-100 text-green-800', label: 'PAID' },
    OVERDUE: { cls: 'bg-red-100 text-red-800', label: 'OVERDUE' },
    VOID: { cls: 'bg-gray-100 text-gray-600', label: 'VOID' },
  };
  const c = config[status] || config.DRAFT;
  return { className: `px-3 py-1 inline-flex text-sm font-semibold rounded-full ${c.cls}`, label: c.label };
};

const BillDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillDetails();
  }, [id]);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch bill details');
      const data = await response.json();
      setBill(data);
    } catch (error) {
      console.error('Error fetching bill details:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── ACTIONS ─────────────────────────────────────────────────────────────

  const handleVoid = async () => {
    if (bill.status === 'VOID') { alert('Bill is already voided.'); return; }
    if ((parseFloat(bill.amountPaid) || 0) > 0) {
      alert('Cannot void a bill with payments. Please reverse the payments first.');
      return;
    }
    if (!window.confirm('Are you sure you want to void this bill? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}/void`, { method: 'POST' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to void bill');
      }
      const updated = await response.json();
      setBill(updated);
    } catch (error) {
      alert('Error voiding bill: ' + error.message);
    }
  };

  const handleClone = async () => {
    try {
      const response = await fetch(`${API_BASE}/${id}/clone`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to clone bill');
      const cloned = await response.json();
      navigate(`/finance/payments/bills/${cloned.id}/edit`);
    } catch (error) {
      alert('Error cloning bill: ' + error.message);
    }
  };

  const handleDelete = async () => {
    const amountPaid = parseFloat(bill.amountPaid) || 0;
    if (amountPaid > 0) {
      alert('Cannot delete a bill with payments. Please void the bill instead.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete bill');
      }
      navigate('/finance/payments/bills');
    } catch (error) {
      alert('Error deleting bill: ' + error.message);
    }
  };

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  const formatPaymentTerms = (terms) => terms ? terms.replace(/_/g, ' ') : '—';

  const formatAccountsPayable = (ap) => ap ? ap.replace(/_/g, ' ') : '—';

  const calcDiscountLKR = (b) => {
    if (!b) return 0;
    const d = parseFloat(b.discount) || 0;
    if (b.discountType === 'PERCENTAGE') {
      return (parseFloat(b.subtotal) || 0) * d / 100;
    }
    return d;
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  if (loading) return <div className="p-6 text-center text-gray-500">Loading bill details...</div>;
  if (!bill) return <div className="p-6 text-center text-gray-500">Bill not found</div>;

  const statusBadge = getStatusBadge(bill.status);
  const amountPaid = parseFloat(bill.amountPaid) || 0;
  const balanceDue = parseFloat(bill.balanceDue) || 0;
  const isOverdue = bill.dueDate && new Date(bill.dueDate) < new Date()
    && balanceDue > 0 && bill.status !== 'PAID' && bill.status !== 'VOID';
  const items = bill.items || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 print:hidden">
        <button onClick={() => navigate('/finance/payments/bills')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1">
          ← Back to Bills
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{bill.billNumber}</h1>
            <p className="text-gray-600 mt-1">Bill Details</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {balanceDue > 0 && bill.status !== 'VOID' && (
              <button onClick={() => navigate(`/finance/payments/payments-made/new?billId=${id}`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Record Payment
              </button>
            )}
            <button onClick={() => navigate(`/finance/payments/bills/${id}/edit`)}
              disabled={bill.status === 'VOID'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Edit
            </button>
            <button onClick={handleVoid}
              disabled={bill.status === 'VOID' || amountPaid > 0}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Void
            </button>
            <button onClick={handleClone}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Clone
            </button>
            <button onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Print
            </button>
            <button onClick={handleDelete}
              disabled={amountPaid > 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status & Balance */}
      <div className="mb-6 print:hidden flex items-center gap-4 flex-wrap">
        <span className={statusBadge.className}>{statusBadge.label}</span>
        {isOverdue && (
          <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-red-100 text-red-800">OVERDUE</span>
        )}
        {balanceDue > 0 && bill.status !== 'VOID' && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Balance Due:</span>
            <span className="font-bold text-red-600">LKR {balanceDue.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Document */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-5xl mx-auto">

        {/* Document Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">BILL</h2>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Bill Number</p>
              <p className="text-lg font-semibold text-gray-800">{bill.billNumber}</p>
              {bill.orderNumber && (
                <>
                  <p className="text-sm text-gray-600 mt-2">Order Number</p>
                  <p className="text-gray-800">{bill.orderNumber}</p>
                </>
              )}
              {bill.referenceNumber && (
                <>
                  <p className="text-sm text-gray-600 mt-2">Reference Number</p>
                  <p className="text-gray-800">{bill.referenceNumber}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Bill Date</p>
              <p className="text-gray-800">
                {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : '—'}
              </p>
              <p className="text-sm text-gray-600 mt-2">Due Date</p>
              <p className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-800'}>
                {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '—'}
              </p>
              <p className="text-sm text-gray-600 mt-2">Payment Terms</p>
              <p className="text-gray-800">{formatPaymentTerms(bill.paymentTerms)}</p>
            </div>
          </div>
        </div>

        {/* Vendor */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Bill From</h3>
          <div className="text-gray-800">
            <p className="font-semibold text-lg">{bill.vendorName || `Vendor #${bill.vendorId}`}</p>
          </div>
        </div>

        {/* Subject */}
        {bill.subject && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">Subject</p>
            <p className="text-gray-800 font-medium">{bill.subject}</p>
          </div>
        )}

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y-2 border-gray-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Details</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Account</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Quantity</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Rate</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tax</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Details</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">No items</td>
                </tr>
              ) : items.map((item, i) => (
                <tr key={item.id || i} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-800">{item.itemDetails}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.account}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">
                    {(parseFloat(item.quantity) || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">
                    LKR {(parseFloat(item.rate) || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {parseFloat(item.taxRate) || 0}%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.customerDetails || '—'}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                    LKR {(parseFloat(item.amount) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80 space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium text-gray-800">
                LKR {(parseFloat(bill.subtotal) || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-700">
                Discount{bill.discountType === 'PERCENTAGE' ? ` (${parseFloat(bill.discount) || 0}%)` : ''}:
              </span>
              <span className="font-medium text-gray-800">
                - LKR {calcDiscountLKR(bill).toLocaleString()}
              </span>
            </div>
            {!bill.taxInclusive && (
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Tax:</span>
                <span className="font-medium text-gray-800">
                  LKR {(parseFloat(bill.tax) || 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-gray-300">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-lg font-bold text-gray-800">
                LKR {(parseFloat(bill.total) || 0).toLocaleString()}
              </span>
            </div>
            {amountPaid > 0 && (
              <>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Amount Paid:</span>
                  <span className="font-medium text-green-600">
                    - LKR {amountPaid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t border-gray-300">
                  <span className="text-lg font-semibold text-gray-800">Balance Due:</span>
                  <span className="text-lg font-bold text-red-600">
                    LKR {balanceDue.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        {bill.notes && (
          <div className="border-t border-gray-300 pt-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{bill.notes}</p>
          </div>
        )}

        {/* Document Footer */}
        <div className="border-t border-gray-300 pt-6 mt-8 text-xs text-gray-500">
          <div className="flex justify-between">
            <div>
              {bill.createdBy && <p>Created by: {bill.createdBy}</p>}
              <p>Created on: {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : '—'}</p>
            </div>
            <div className="text-right">
              <p>Last modified: {bill.updatedAt ? new Date(bill.updatedAt).toLocaleDateString() : '—'}</p>
              <p>Accounts Payable: {formatAccountsPayable(bill.accountsPayable)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailsPage;