import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SalesOrderDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [salesOrder, setSalesOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelItemsModal, setShowCancelItemsModal] = useState(false);
  const [itemsToCancel, setItemsToCancel] = useState([]);

  useEffect(() => {
    fetchSalesOrderDetails();
  }, [id]);

  const fetchSalesOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch (`${API_BASE_URL}/api/sales-orders/${id}`);
      if(!response.ok) throw new Error('Failed to fetch sales order');
      const data  = await response.json();

      setSalesOrder({
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
          tax: item.tax || 0,
          amount: item.amount || 0
        })),
        isLocked: data.status === 'ACCEPTED' || data.status === 'DECLINED'
      })
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales order details:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (salesOrder.isLocked) {
      alert('This sales order is locked and cannot be edited.');
      return;
    }
    navigate(`/finance/sales/sales-orders/${id}/edit`);
  };

  const handleConvertToPurchaseOrder = async () => {
    if (window.confirm('Are you sure you want to convert this sales order to a purchase order?')) {
      try {
        // TODO: Implement convert to purchase order API call
        console.log('Converting to purchase order:', id);
        alert('Sales order converted to purchase order!');
        // Navigate to purchase order if needed
      } catch (error) {
        console.error('Error converting to purchase order:', error);
        alert('Error converting to purchase order.');
      }
    }
  };

  const handleCancelItems = () => {
    setShowCancelItemsModal(true);
    setItemsToCancel(salesOrder.items.map(item => ({ ...item, cancelQty: 0 })));
  };

  const handleCancelItemsSubmit = async () => {
    const itemsWithCancellation = itemsToCancel.filter(item => item.cancelQty > 0);
    
    if (itemsWithCancellation.length === 0) {
      alert('Please select at least one item to cancel.');
      return;
    }

    try {
      // TODO: Implement cancel items API call
      console.log('Cancelling items:', itemsWithCancellation);
      alert('Items cancelled successfully!');
      setShowCancelItemsModal(false);
      fetchSalesOrderDetails();
    } catch (error) {
      console.error('Error cancelling items:', error);
      alert('Error cancelling items.');
    }
  };

  const handleVoid = async () => {
    if (salesOrder.isLocked) {
      alert('This sales order is locked and cannot be voided.');
      return;
    }
    if (window.confirm('Are you sure you want to void this sales order? This action cannot be undone.')) {
      try {
        // TODO: Implement void API call
        console.log('Voiding sales order:', id);
        setSalesOrder(prev => ({ ...prev, status: 'VOID' }));
        alert('Sales order voided successfully!');
      } catch (error) {
        console.error('Error voiding sales order:', error);
        alert('Error voiding sales order.');
      }
    }
  };

  const handleClone = async () => {
    try {
      const response = await fetch (`${API_BASE_URL}/api/sales-order/${id}/clone`, { method: 'POST'});
      if (!response.ok) throw new Error('Failed to clone quote');
      const newSalesOrder = await response.json();
      alert('Sales Order cloned! Redirecting to new sales order...');
      navigate(`/finance/sales/sales-orders/${newSalesOrder.id}/edit`);
    } catch (error) {
      console.error('Error cloning sales order', error);
      alert('Error cloning sales order');
    }
  };

  const handleDelete = async () => {
    if (salesOrder.isLocked) {
      alert('This sales order is locked and cannot be deleted.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this sales order? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/sales-orders/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete sales order');
        alert('Sales order deleted successfully!');
        navigate('/finance/sales/sales-orders');
      } catch (error) {
        console.error('Error deleting sales order:', error);
        alert('Error deleting sales order.');
      }
    }
  };

  const handleLock = async () => {
    const action = salesOrder.isLocked ? 'unlock' : 'lock';
    if (window.confirm(`Are you sure you want to ${action} this sales order?`)) {
      try {
        // TODO: Implement lock/unlock API call
        console.log(`${action}ing sales order:`, id);
        setSalesOrder(prev => ({ ...prev, isLocked: !prev.isLocked }));
        alert(`Sales order ${action}ed successfully!`);
      } catch (error) {
        console.error(`Error ${action}ing sales order:`, error);
        alert(`Error ${action}ing sales order.`);
      }
    }
  };

  const handleCreateInvoice = () => {
    navigate(`/finance/sales/invoices/new?salesOrderId=${id}`);
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Downloading PDF for sales order:', id);
    alert('PDF download will be implemented with backend integration.');
  };

  const handleSendEmail = () => {
    // TODO: Implement email functionality
    console.log('Sending sales order via email:', id);
    alert('Email functionality will be implemented with backend integration.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      case 'VOID':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading sales order details...</div>
      </div>
    );
  }

  if (!salesOrder) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Sales order not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/finance/sales/sales-orders')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Sales Orders
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{salesOrder.salesOrderNumber}</h1>
            <p className="text-gray-600 mt-1">Customer: {salesOrder.customerName}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handleEdit}
              disabled={salesOrder.isLocked}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              onClick={handleConvertToPurchaseOrder}
              disabled={salesOrder.isLocked || salesOrder.status === 'VOID'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Convert to PO
            </button>
            <button
              onClick={handleCancelItems}
              disabled={salesOrder.isLocked || salesOrder.status === 'VOID'}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel Items
            </button>
            <button
              onClick={handleVoid}
              disabled={salesOrder.isLocked || salesOrder.status === 'VOID'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Void
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
              {salesOrder.isLocked ? 'Unlock' : 'Lock'}
            </button>
            <button
              onClick={handleDelete}
              disabled={salesOrder.isLocked}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(salesOrder.status)}`}>
          {salesOrder.status}
        </span>
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getOrderStatusColor(salesOrder.orderStatus)}`}>
          {salesOrder.orderStatus}
        </span>
        {salesOrder.isLocked && (
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
              onClick={handleCreateInvoice}
              disabled={salesOrder.status === 'VOID' || salesOrder.invoiced === 'FULLY_INVOICED'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Invoice
            </button>
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

      {/* Sales Order Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sales Order Number:</span>
                <span className="font-medium text-gray-800">{salesOrder.salesOrderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference Number:</span>
                <span className="font-medium text-gray-800">{salesOrder.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium text-gray-800">
                  {new Date(salesOrder.salesOrderDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Shipment:</span>
                <span className="font-medium text-gray-800">
                  {new Date(salesOrder.expectedShipmentDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Method:</span>
                <span className="font-medium text-gray-800">{salesOrder.deliveryMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Terms:</span>
                <span className="font-medium text-gray-800">Net {salesOrder.paymentTerms} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sales Person:</span>
                <span className="font-medium text-gray-800">{salesOrder.salesPerson}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer & Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-medium text-gray-800">{salesOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Status:</span>
                <span className="font-medium text-gray-800">{salesOrder.invoiced?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium text-gray-800">{salesOrder.payment}</span>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/finance/sales/customers/${salesOrder.customerId}`)}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesOrder.items.map((item) => (
                  <tr key={item.id} className={item.cancelled ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.itemName}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">LKR {item.rate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.tax}%</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      LKR {item.amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {item.cancelled ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          CANCELLED
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ACTIVE
                        </span>
                      )}
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
              <span className="font-medium">LKR {salesOrder.subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Tax:</span>
              <span className="font-medium">LKR {salesOrder.totalTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Shipping Charges:</span>
              <span className="font-medium">LKR {salesOrder.shippingCharges.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-lg font-bold text-blue-600">LKR {salesOrder.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Customer Notes */}
        {salesOrder.customerNotes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Customer Notes</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{salesOrder.customerNotes}</p>
          </div>
        )}

        {/* Terms and Conditions */}
        {salesOrder.termsAndConditions && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Terms and Conditions</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{salesOrder.termsAndConditions}</p>
          </div>
        )}

        {/* Attachments */}
        {salesOrder.attachments && salesOrder.attachments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Attachments</h3>
            <div className="space-y-2">
              {salesOrder.attachments.map((file) => (
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
              <span className="text-gray-800">{new Date(salesOrder.createdDate).toLocaleString()}</span>
            </div>
            <div>
              <span>Last Modified: </span>
              <span className="text-gray-800">{new Date(salesOrder.modifiedDate).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Items Modal */}
      {showCancelItemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Cancel Items</h2>
            <p className="text-gray-600 mb-4">Select the quantity to cancel for each item:</p>
            
            <div className="space-y-3 mb-6">
              {itemsToCancel.map((item, index) => (
                <div key={item.id} className="border border-gray-300 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{item.itemName}</p>
                      <p className="text-sm text-gray-600">Available: {item.quantity} units</p>
                    </div>
                    <p className="font-medium text-gray-800">LKR {item.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Quantity to cancel:</label>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={item.cancelQty}
                      onChange={(e) => {
                        const newItems = [...itemsToCancel];
                        newItems[index].cancelQty = Math.min(parseInt(e.target.value) || 0, item.quantity);
                        setItemsToCancel(newItems);
                      }}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelItemsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelItemsSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrderDetailsPage;