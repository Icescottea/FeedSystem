import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = 'https://feedv4-backend.onrender.com/api/quotes';

const QuoteDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuoteDetails();
  }, [id]);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch quote');
      const data = await response.json();

      // Map backend fields to frontend-friendly ones
      setQuote({
        ...data,
        subTotal: data.subtotal || 0,
        totalTax: data.tax || 0,
        shippingCharges: data.shippingCharges || 0,
        total: data.total || 0,
        date: data.quoteDate,
        modifiedDate: data.updatedAt,
        createdDate: data.createdAt,
        items: data.items.map(item => ({
          ...item,
          tax: item.taxRate || 0,
          amount: item.amount || 0
        })),
        isLocked: data.status === 'ACCEPTED' || data.status === 'DECLINED' // lock after final
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quote details:', error);
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (action) => {
    if (quote.isLocked) {
      alert('This quote is locked and cannot be modified.');
      return;
    }
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this quote?`)) return;

    try {
      const url = `${API_BASE}/${id}/${action.toLowerCase()}`;
      const response = await fetch(url, { method: 'POST' });
      if (!response.ok) throw new Error(`Failed to ${action.toLowerCase()} quote`);
      const updated = await response.json();
      setQuote(prev => ({ ...prev, status: updated.status }));
      alert(`Quote marked as ${action}!`);
    } catch (error) {
      console.error(`Error updating quote:`, error);
      alert(`Error updating quote status.`);
    }
  };

  const handleClone = async () => {
    if (!window.confirm('Are you sure you want to clone this quote?')) return;

    try {
      const response = await fetch(`${API_BASE}/${id}/clone`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to clone quote');
      const newQuote = await response.json();
      alert('Quote cloned! Redirecting to new quote...');
      navigate(`/finance/sales/quotes/${newQuote.id}/edit`);
    } catch (error) {
      console.error('Error cloning quote:', error);
      alert('Error cloning quote.');
    }
  };

  const handleDelete = async () => {
    if (quote.isLocked) {
      alert('This quote is locked and cannot be deleted.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this quote? This action cannot be undone.')) return;

    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete quote');
      alert('Quote deleted successfully!');
      navigate('/finance/sales/quotes');
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Error deleting quote.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading quote details...</div>;
  }

  if (!quote) {
    return <div className="p-6 text-center text-gray-500">Quote not found</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <button
          onClick={() => navigate('/finance/sales/quotes')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Quotes
        </button>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => navigate(`/finance/sales/quotes/${id}/edit`)}
            disabled={quote.isLocked}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Edit
          </button>
          <button
            onClick={() => updateQuoteStatus('Accepted')}
            disabled={quote.isLocked || quote.status === 'ACCEPTED'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark as Accepted
          </button>
          <button
            onClick={() => updateQuoteStatus('Declined')}
            disabled={quote.isLocked || quote.status === 'DECLINED'}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark as Declined
          </button>
          <button
            onClick={handleClone}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clone
          </button>
          <button
            onClick={handleDelete}
            disabled={quote.isLocked}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 flex gap-2">
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(quote.status)}`}>
          {quote.status}
        </span>
        {quote.isLocked && (
          <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
            🔒 LOCKED
          </span>
        )}
      </div>

      {/* Quote Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Quote Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Quote Number:</span>
                <span className="font-medium text-gray-800">{quote.quoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference Number:</span>
                <span className="font-medium text-gray-800">{quote.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-800">{new Date(quote.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiry Date:</span>
                <span className="font-medium text-gray-800">{new Date(quote.expiryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sales Person:</span>
                <span className="font-medium text-gray-800">{quote.salesPerson}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-medium text-gray-800">{quote.customerName}</span>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/finance/sales/customers/${quote.customerId}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Customer Details →
                </button>
              </div>
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
                {quote.items.map((item) => (
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

        {/* Total */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/2 space-y-3 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Sub Total:</span>
              <span className="font-medium">LKR {quote.subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Tax:</span>
              <span className="font-medium">LKR {quote.totalTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Shipping Charges:</span>
              <span className="font-medium">LKR {quote.shippingCharges.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-lg font-bold text-blue-600">LKR {quote.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.customerNotes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Customer Notes</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{quote.customerNotes}</p>
          </div>
        )}
        {quote.termsAndConditions && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Terms and Conditions</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{quote.termsAndConditions}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteDetailsPage;