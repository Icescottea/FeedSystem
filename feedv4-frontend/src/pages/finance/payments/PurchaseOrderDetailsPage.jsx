import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PurchaseOrderDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseOrderDetails();
  }, [id]);

  const fetchPurchaseOrderDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      
      const mockData = {
        id: 1,
        purchaseOrderNumber: 'PO-2024-001',
        referenceNumber: 'REF-001',
        date: '2024-12-15',
        deliveryDate: '2024-12-25',
        status: 'CONFIRMED',
        billedStatus: 'NOT_BILLED',
        vendor: {
          name: 'Global Feed Supplies Ltd',
          companyName: 'Global Feed Supplies Ltd',
          email: 'info@globalfeed.com',
          phone: '+94 11 234 5678',
          address: '123 Industrial Zone, Colombo, Western 00100, Sri Lanka'
        },
        deliveryAddress: '456 Manufacturing Plant, Negombo, Western 11500, Sri Lanka',
        shipmentPreference: 'SEA',
        paymentTerms: 'NET_30',
        taxInclusive: false,
        items: [
          {
            id: 1,
            itemDetails: 'Corn - Yellow Grade A',
            account: 'Raw Materials',
            quantity: 1000,
            rate: 250,
            tax: 12,
            amount: 250000
          },
          {
            id: 2,
            itemDetails: 'Wheat Bran',
            account: 'Raw Materials',
            quantity: 500,
            rate: 400,
            tax: 12,
            amount: 200000
          }
        ],
        subtotal: 450000,
        discount: 22500, // 5%
        discountType: 'PERCENTAGE',
        discountValue: 5,
        tax: 51300,
        total: 478800,
        notes: 'Urgent order - please expedite delivery',
        termsAndConditions: 'Standard payment terms apply. Delivery to be made within 10 days of order confirmation.',
        attachments: [
          { id: 1, name: 'specifications.pdf', size: '245 KB' },
          { id: 2, name: 'quality_cert.pdf', size: '128 KB' }
        ],
        createdDate: '2024-12-15',
        modifiedDate: '2024-12-15',
        createdBy: 'John Doe'
      };
      
      setPurchaseOrder(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/finance/payments/purchase-orders/${id}/edit`);
  };

  const handleClone = async () => {
    try {
      // TODO: Implement clone API call
      console.log('Cloning purchase order:', id);
      alert('Purchase order cloned! Redirecting to new purchase order...');
      navigate('/finance/payments/purchase-orders/new');
    } catch (error) {
      console.error('Error cloning purchase order:', error);
      alert('Error cloning purchase order.');
    }
  };

  const handleDelete = async () => {
    if (purchaseOrder.billedStatus === 'FULLY_BILLED') {
      alert('Cannot delete a purchase order that has been fully billed.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      try {
        // TODO: Implement delete API call
        console.log('Deleting purchase order:', id);
        alert('Purchase order deleted successfully!');
        navigate('/finance/payments/purchase-orders');
      } catch (error) {
        console.error('Error deleting purchase order:', error);
        alert('Error deleting purchase order.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading purchase order details...</div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Purchase order not found</div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
      SENT: { bg: 'bg-blue-100', text: 'text-blue-800' },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return `px-3 py-1 inline-flex text-sm font-semibold rounded-full ${config.bg} ${config.text}`;
  };

  const getBilledStatusBadge = (status) => {
    const statusConfig = {
      NOT_BILLED: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Not Billed' },
      PARTIALLY_BILLED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partially Billed' },
      FULLY_BILLED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Fully Billed' }
    };
    const config = statusConfig[status] || statusConfig.NOT_BILLED;
    return { className: `px-3 py-1 inline-flex text-sm font-semibold rounded-full ${config.bg} ${config.text}`, label: config.label };
  };

  const billedBadge = getBilledStatusBadge(purchaseOrder.billedStatus);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 print:hidden">
        <button
          onClick={() => navigate('/finance/payments/purchase-orders')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Purchase Orders
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{purchaseOrder.purchaseOrderNumber}</h1>
            <p className="text-gray-600 mt-1">Purchase Order Details</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleClone}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clone
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Print
            </button>
            <button
              onClick={handleDelete}
              disabled={purchaseOrder.billedStatus === 'FULLY_BILLED'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="mb-6 print:hidden flex gap-2">
        <span className={getStatusBadge(purchaseOrder.status)}>
          {purchaseOrder.status}
        </span>
        <span className={billedBadge.className}>
          {billedBadge.label}
        </span>
      </div>

      {/* PDF-Style Document */}
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
              <p className="text-sm text-gray-600">Date</p>
              <p className="text-gray-800">{new Date(purchaseOrder.date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mt-2">Delivery Date</p>
              <p className="text-gray-800">{new Date(purchaseOrder.deliveryDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Vendor and Delivery Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Vendor</h3>
            <div className="text-gray-800">
              <p className="font-semibold">{purchaseOrder.vendor.name}</p>
              <p className="text-sm">{purchaseOrder.vendor.companyName}</p>
              <p className="text-sm mt-2">{purchaseOrder.vendor.email}</p>
              <p className="text-sm">{purchaseOrder.vendor.phone}</p>
              <p className="text-sm mt-2">{purchaseOrder.vendor.address}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Delivery Address</h3>
            <div className="text-gray-800">
              <p className="text-sm">{purchaseOrder.deliveryAddress}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Shipment Preference</p>
              <p className="text-gray-800">{purchaseOrder.shipmentPreference}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">Payment Terms</p>
              <p className="text-gray-800">{purchaseOrder.paymentTerms.replace('_', ' ')}</p>
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
              {purchaseOrder.items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-800">{item.itemDetails}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.account}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">{item.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">LKR {item.rate.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{item.tax}%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                    LKR {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium text-gray-800">LKR {purchaseOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-700">
                  Discount {purchaseOrder.discountType === 'PERCENTAGE' ? `(${purchaseOrder.discountValue}%)` : ''}:
                </span>
                <span className="font-medium text-gray-800">- LKR {purchaseOrder.discount.toLocaleString()}</span>
              </div>
              {!purchaseOrder.taxInclusive && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Tax:</span>
                  <span className="font-medium text-gray-800">LKR {purchaseOrder.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-gray-300">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-lg font-bold text-gray-800">LKR {purchaseOrder.total.toLocaleString()}</span>
              </div>
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

        {/* Attachments */}
        {purchaseOrder.attachments && purchaseOrder.attachments.length > 0 && (
          <div className="border-t border-gray-300 pt-6 mt-6 print:hidden">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Attachments</h3>
            <div className="space-y-2">
              {purchaseOrder.attachments.map(file => (
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
              <p>Created by: {purchaseOrder.createdBy}</p>
              <p>Created on: {new Date(purchaseOrder.createdDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p>Last modified: {new Date(purchaseOrder.modifiedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailsPage;