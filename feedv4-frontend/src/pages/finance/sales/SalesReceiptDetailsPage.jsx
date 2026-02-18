import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = '/api/sales-receipts';

const SalesReceiptDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [salesReceipt, setSalesReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesReceiptDetails();
  }, [id]);

  const fetchSalesReceiptDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch sales receipt');
      const data = await response.json();

      // Normalise numeric fields coming from backend as strings/BigDecimal
      setSalesReceipt({
        ...data,
        subtotal: parseFloat(data.subtotal) || 0,
        total: parseFloat(data.total) || 0,
        shippingCharges: parseFloat(data.shippingCharges) || 0,
        items: (data.items || []).map(item => ({
          ...item,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          tax: parseFloat(item.tax) || 0,
          amount: parseFloat(item.amount) || 0,
        })),
      });
    } catch (error) {
      console.error('Error fetching sales receipt details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (salesReceipt.status === 'VOID') {
      alert('Cannot edit a voided sales receipt.');
      return;
    }
    navigate(`/finance/sales/sales-receipts/${id}/edit`);
  };

  const handleDelete = async () => {
    if (salesReceipt.status === 'COMPLETED') {
      alert('Cannot delete a completed sales receipt. Please void it first.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this sales receipt? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete sales receipt');
      }
      navigate('/finance/sales/sales-receipts');
    } catch (error) {
      console.error('Error deleting sales receipt:', error);
      alert(error.message || 'Error deleting sales receipt.');
    }
  };

  const handleVoid = async () => {
    if (!window.confirm('Are you sure you want to void this sales receipt?')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}/void`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to void sales receipt');
      const updated = await response.json();
      setSalesReceipt(prev => ({ ...prev, status: updated.status }));
    } catch (error) {
      console.error('Error voiding sales receipt:', error);
      alert('Error voiding sales receipt.');
    }
  };

  const handleDownloadPDF = () => {
    alert('PDF download will be implemented with backend integration.');
  };

  const handleSendEmail = () => {
    alert('Email functionality will be implemented with backend integration.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':     return 'bg-gray-100 text-gray-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'VOID':      return 'bg-red-100 text-red-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentModeColor = (mode) => {
    switch (mode) {
      case 'CASH':          return 'bg-green-100 text-green-800';
      case 'BANK_TRANSFER': return 'bg-blue-100 text-blue-800';
      case 'CHEQUE':        return 'bg-purple-100 text-purple-800';
      case 'CREDIT_CARD':   return 'bg-indigo-100 text-indigo-800';
      case 'DEBIT_CARD':    return 'bg-cyan-100 text-cyan-800';
      default:              return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading sales receipt details...</div>;
  }

  if (!salesReceipt) {
    return <div className="p-6 text-center text-gray-500">Sales receipt not found.</div>;
  }

  // Derive totalTax from items for display (not stored separately on the model)
  const totalTax = salesReceipt.items.reduce((sum, item) => {
    const base = item.quantity * item.rate;
    return sum + (base * item.tax / 100);
  }, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/finance/sales/sales-receipts')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Sales Receipts
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{salesReceipt.salesReceiptNumber}</h1>
            <p className="text-gray-600 mt-1">Customer: {salesReceipt.customerName || `Customer #${salesReceipt.customerId}`}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handleEdit}
              disabled={salesReceipt.status === 'VOID'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            {salesReceipt.status !== 'VOID' && (
              <button
                onClick={handleVoid}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Void
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={salesReceipt.status === 'COMPLETED'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="mb-6 flex gap-2">
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(salesReceipt.status)}`}>
          {salesReceipt.status}
        </span>
        {salesReceipt.paymentMode && (
          <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getPaymentModeColor(salesReceipt.paymentMode)}`}>
            {salesReceipt.paymentMode.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Amount Summary */}
      <div className="mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Total Amount Received</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                LKR {salesReceipt.total.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm">Receipt Date</p>
              <p className="text-lg font-medium text-gray-800 mt-1">
                {salesReceipt.receiptDate ? new Date(salesReceipt.receiptDate).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDownloadPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Download PDF
            </button>
            <button onClick={handleSendEmail} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Send via Email
            </button>
            <button onClick={() => window.print()} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">

        {/* Receipt & Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Receipt Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt Number:</span>
                <span className="font-medium text-gray-800">{salesReceipt.salesReceiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference Number:</span>
                <span className="font-medium text-gray-800">{salesReceipt.referenceNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt Date:</span>
                <span className="font-medium text-gray-800">
                  {salesReceipt.receiptDate ? new Date(salesReceipt.receiptDate).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sales Person:</span>
                <span className="font-medium text-gray-800">{salesReceipt.salesPerson || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created By:</span>
                <span className="font-medium text-gray-800">{salesReceipt.createdBy || '-'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-medium text-gray-800">
                  {salesReceipt.customerName || `Customer #${salesReceipt.customerId}`}
                </span>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/finance/sales/customers/${salesReceipt.customerId}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Customer Details →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Payment Mode</p>
              <p className="text-lg font-semibold text-gray-800">
                {(salesReceipt.paymentMode || '').replace('_', ' ')}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Reference Number</p>
              <p className="text-lg font-semibold text-gray-800">
                {salesReceipt.referenceNumber || '-'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Deposited To</p>
              <p className="text-lg font-semibold text-gray-800">
                {salesReceipt.depositTo || '-'}
              </p>
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
                {salesReceipt.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.itemName}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">LKR {item.rate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.tax}%</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">LKR {item.amount.toLocaleString()}</td>
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
              <span className="font-medium">LKR {salesReceipt.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Tax:</span>
              <span className="font-medium">LKR {totalTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Shipping Charges:</span>
              <span className="font-medium">LKR {salesReceipt.shippingCharges.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-lg font-bold text-green-600">LKR {salesReceipt.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {salesReceipt.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{salesReceipt.notes}</p>
          </div>
        )}

        {/* Terms and Conditions */}
        {salesReceipt.termsAndConditions && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Terms and Conditions</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{salesReceipt.termsAndConditions}</p>
          </div>
        )}

        {/* Audit Information */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Audit Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span>Created: </span>
              <span className="text-gray-800">
                {salesReceipt.createdAt ? new Date(salesReceipt.createdAt).toLocaleString() : '-'}
              </span>
            </div>
            <div>
              <span>Last Modified: </span>
              <span className="text-gray-800">
                {salesReceipt.updatedAt ? new Date(salesReceipt.updatedAt).toLocaleString() : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReceiptDetailsPage;