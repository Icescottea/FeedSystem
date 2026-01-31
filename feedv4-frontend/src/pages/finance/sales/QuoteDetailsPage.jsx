import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/quotes/${id}`);
      // const data = await response.json();
      
      // Mock data
      const mockData = {
        id: 1,
        quoteNumber: 'QT-2024-001',
        referenceNumber: 'REF-001',
        date: '2024-12-15',
        expiryDate: '2025-01-15',
        customerName: 'ABC Farms Ltd',
        customerId: 1,
        salesPerson: 'John Doe',
        subject: 'Feed Supply Quote for Q1 2025',
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
        customerNotes: 'Please confirm delivery date before processing',
        termsAndConditions: 'Payment due within 30 days. Delivery within 7 days of order confirmation.',
        attachments: [
          { id: 1, name: 'feed_specifications.pdf', size: '2.5 MB' },
          { id: 2, name: 'delivery_schedule.xlsx', size: '156 KB' }
        ],
        createdDate: '2024-12-15',
        modifiedDate: '2024-12-16'
      };
      
      setQuote(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quote details:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (quote.isLocked) {
      alert('This quote is locked and cannot be edited.');
      return;
    }
    navigate(`/finance/sales/quotes/${id}/edit`);
  };

  const handleMarkAsAccepted = async () => {
    if (quote.isLocked) {
      alert('This quote is locked.');
      return;
    }
    if (window.confirm('Are you sure you want to mark this quote as accepted?')) {
      try {
        // TODO: Replace with actual API call
        console.log('Marking quote as accepted:', id);
        setQuote(prev => ({ ...prev, status: 'ACCEPTED' }));
        alert('Quote marked as accepted!');
      } catch (error) {
        console.error('Error updating quote:', error);
        alert('Error updating quote status.');
      }
    }
  };

  const handleMarkAsDeclined = async () => {
    if (quote.isLocked) {
      alert('This quote is locked.');
      return;
    }
    if (window.confirm('Are you sure you want to mark this quote as declined?')) {
      try {
        // TODO: Replace with actual API call
        console.log('Marking quote as declined:', id);
        setQuote(prev => ({ ...prev, status: 'DECLINED' }));
        alert('Quote marked as declined!');
      } catch (error) {
        console.error('Error updating quote:', error);
        alert('Error updating quote status.');
      }
    }
  };

  const handleClone = () => {
    // TODO: Implement clone functionality
    console.log('Cloning quote:', id);
    alert('Quote cloned! Redirecting to new quote...');
    navigate('/finance/sales/quotes/new');
  };

  const handleDelete = async () => {
    if (quote.isLocked) {
      alert('This quote is locked and cannot be deleted.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      try {
        // TODO: Replace with actual API call
        console.log('Deleting quote:', id);
        alert('Quote deleted successfully!');
        navigate('/finance/sales/quotes');
      } catch (error) {
        console.error('Error deleting quote:', error);
        alert('Error deleting quote.');
      }
    }
  };

  const handleLock = async () => {
    const action = quote.isLocked ? 'unlock' : 'lock';
    if (window.confirm(`Are you sure you want to ${action} this quote?`)) {
      try {
        // TODO: Replace with actual API call
        console.log(`${action}ing quote:`, id);
        setQuote(prev => ({ ...prev, isLocked: !prev.isLocked }));
        alert(`Quote ${action}ed successfully!`);
      } catch (error) {
        console.error(`Error ${action}ing quote:`, error);
        alert(`Error ${action}ing quote.`);
      }
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Downloading PDF for quote:', id);
    alert('PDF download will be implemented with backend integration.');
  };

  const handleSendEmail = () => {
    // TODO: Implement email functionality
    console.log('Sending quote via email:', id);
    alert('Email functionality will be implemented with backend integration.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading quote details...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Quote not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/finance/sales/quotes')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Quotes
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{quote.quoteNumber}</h1>
            <p className="text-gray-600 mt-1">{quote.subject}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handleEdit}
              disabled={quote.isLocked}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              onClick={handleMarkAsAccepted}
              disabled={quote.isLocked || quote.status === 'ACCEPTED'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark as Accepted
            </button>
            <button
              onClick={handleMarkAsDeclined}
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
              onClick={handleLock}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {quote.isLocked ? 'Unlock' : 'Lock'}
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
      </div>

      {/* Status and Lock Badge */}
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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

      {/* Quote Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Basic Information */}
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
                <span className="font-medium text-gray-800">
                  {new Date(quote.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiry Date:</span>
                <span className="font-medium text-gray-800">
                  {new Date(quote.expiryDate).toLocaleDateString()}
                </span>
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

        {/* Customer Notes */}
        {quote.customerNotes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Customer Notes</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{quote.customerNotes}</p>
          </div>
        )}

        {/* Terms and Conditions */}
        {quote.termsAndConditions && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Terms and Conditions</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{quote.termsAndConditions}</p>
          </div>
        )}

        {/* Attachments */}
        {quote.attachments && quote.attachments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Attachments</h3>
            <div className="space-y-2">
              {quote.attachments.map((file) => (
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
              <span className="text-gray-800">{new Date(quote.createdDate).toLocaleString()}</span>
            </div>
            <div>
              <span>Last Modified: </span>
              <span className="text-gray-800">{new Date(quote.modifiedDate).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailsPage;