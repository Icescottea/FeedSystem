import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/purchase-orders`;

const getStatusBadge = (status) => {
  const config = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return `px-3 py-1 inline-flex text-sm font-semibold rounded-full ${config[status] || config.DRAFT}`;
};

const getBilledStatusBadge = (status) => {
  const config = {
    NOT_BILLED: { cls: 'bg-orange-100 text-orange-800', label: 'Not Billed' },
    PARTIALLY_BILLED: { cls: 'bg-yellow-100 text-yellow-800', label: 'Partially Billed' },
    FULLY_BILLED: { cls: 'bg-green-100 text-green-800', label: 'Fully Billed' },
  };
  const c = config[status] || config.NOT_BILLED;
  return { className: `px-3 py-1 inline-flex text-sm font-semibold rounded-full ${c.cls}`, label: c.label };
};

const PurchaseOrderDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseOrderDetails();
  }, [id]);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchPurchaseOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch purchase order details');
      const data = await response.json();
      setPurchaseOrder(data);
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── ACTIONS ─────────────────────────────────────────────────────────────

  const handleClone = async () => {
    try {
      const response = await fetch(`${API_BASE}/${id}/clone`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to clone purchase order');
      const cloned = await response.json();
      navigate(`/finance/payments/purchase-orders/${cloned.id}/edit`);
    } catch (error) {
      alert('Error cloning purchase order: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (purchaseOrder.billedStatus !== 'NOT_BILLED') {
      alert('Cannot delete a purchase order that has been billed.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete purchase order');
      }
      navigate('/finance/payments/purchase-orders');
    } catch (error) {
      alert('Error deleting purchase order: ' + error.message);
    }
  };

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  const formatPaymentTerms = (terms) => {
    if (!terms) return '—';
    return terms.replace(/_/g, ' ');
  };

  const calcDiscountDisplay = (po) => {
    if (!po) return '—';
    const discountVal = parseFloat(po.discount) || 0;
    if (po.discountType === 'PERCENTAGE') {
      // discount field holds the percentage value; total discount shown via subtotal - (total + tax)
      return `${discountVal}%`;
    }
    return `LKR ${discountVal.toLocaleString()}`;
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading purchase order details...</div>;
  }
  if (!purchaseOrder) {
    return <div className="p-6 text-center text-gray-500">Purchase order not found</div>;
  }

  const billedBadge = getBilledStatusBadge(purchaseOrder.billedStatus);
  const items = purchaseOrder.items || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 print:hidden">
        <button onClick={() => navigate('/finance/payments/purchase-orders')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1">
          ← Back to Purchase Orders
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{purchaseOrder.purchaseOrderNumber}</h1>
            <p className="text-gray-600 mt-1">Purchase Order Details</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={() => navigate(`/finance/payments/purchase-orders/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Edit
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
              disabled={purchaseOrder.billedStatus !== 'NOT_BILLED'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="mb-6 print:hidden flex gap-2">
        <span className={getStatusBadge(purchaseOrder.status)}>{purchaseOrder.status}</span>
        <span className={billedBadge.className}>{billedBadge.label}</span>
      </div>

      {/* Document */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-5xl mx-auto">

        {/* Document Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">PURCHASE ORDER</h2>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-lg font-semibold text-gray-800">{purchaseOrder.purchaseOrderNumber}</p>
              {purchaseOrder.referenceNumber && (
                <>
                  <p className="text-sm text-gray-600 mt-2">Reference Number</p>
                  <p className="text-gray-800">{purchaseOrder.referenceNumber}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="text-gray-800">
                {purchaseOrder.orderDate ? new Date(purchaseOrder.orderDate).toLocaleDateString() : '—'}
              </p>
              <p className="text-sm text-gray-600 mt-2">Delivery Date</p>
              <p className="text-gray-800">
                {purchaseOrder.deliveryDate ? new Date(purchaseOrder.deliveryDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Vendor and Delivery */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Vendor</h3>
            <div className="text-gray-800">
              <p className="font-semibold">{purchaseOrder.vendorName || `Vendor #${purchaseOrder.vendorId}`}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Delivery Address</h3>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{purchaseOrder.deliveryAddress || '—'}</p>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Shipment Preference</p>
              <p className="text-gray-800">{purchaseOrder.shipmentPreference || '—'}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">Payment Terms</p>
              <p className="text-gray-800">{formatPaymentTerms(purchaseOrder.paymentTerms)}</p>
            </div>
          </div>
        </div>

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
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No items</td>
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
                LKR {(parseFloat(purchaseOrder.subtotal) || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-700">
                Discount {purchaseOrder.discountType === 'PERCENTAGE'
                  ? `(${parseFloat(purchaseOrder.discount) || 0}%)`
                  : ''}:
              </span>
              <span className="font-medium text-gray-800">
                - LKR {(
                  purchaseOrder.discountType === 'PERCENTAGE'
                    ? (parseFloat(purchaseOrder.subtotal) || 0) * (parseFloat(purchaseOrder.discount) || 0) / 100
                    : parseFloat(purchaseOrder.discount) || 0
                ).toLocaleString()}
              </span>
            </div>
            {!purchaseOrder.taxInclusive && (
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Tax:</span>
                <span className="font-medium text-gray-800">
                  LKR {(parseFloat(purchaseOrder.tax) || 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-gray-300">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-lg font-bold text-gray-800">
                LKR {(parseFloat(purchaseOrder.total) || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        {(purchaseOrder.notes || purchaseOrder.termsAndConditions) && (
          <div className="border-t border-gray-300 pt-6 space-y-4">
            {purchaseOrder.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{purchaseOrder.notes}</p>
              </div>
            )}
            {purchaseOrder.termsAndConditions && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Terms and Conditions</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{purchaseOrder.termsAndConditions}</p>
              </div>
            )}
          </div>
        )}

        {/* Document Footer */}
        <div className="border-t border-gray-300 pt-6 mt-8 text-xs text-gray-500">
          <div className="flex justify-between">
            <div>
              {purchaseOrder.createdBy && <p>Created by: {purchaseOrder.createdBy}</p>}
              <p>Created on: {purchaseOrder.createdAt ? new Date(purchaseOrder.createdAt).toLocaleDateString() : '—'}</p>
            </div>
            <div className="text-right">
              <p>Last modified: {purchaseOrder.updatedAt ? new Date(purchaseOrder.updatedAt).toLocaleDateString() : '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailsPage;