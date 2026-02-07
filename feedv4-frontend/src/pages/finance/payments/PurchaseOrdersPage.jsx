import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [billedStatusFilter, setBilledStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/purchase-orders');
      // const data = await response.json();
      
      // Mock data
      const mockData = [
        {
          id: 1,
          date: '2024-12-15',
          purchaseOrderNumber: 'PO-2024-001',
          referenceNumber: 'REF-001',
          vendorName: 'Global Feed Supplies Ltd',
          status: 'CONFIRMED',
          billedStatus: 'NOT_BILLED',
          amount: 450000,
          deliveryDate: '2024-12-25'
        },
        {
          id: 2,
          date: '2024-12-10',
          purchaseOrderNumber: 'PO-2024-002',
          referenceNumber: 'REF-002',
          vendorName: 'Premium Ingredients Co.',
          status: 'SENT',
          billedStatus: 'PARTIALLY_BILLED',
          amount: 280000,
          deliveryDate: '2024-12-20'
        },
        {
          id: 3,
          date: '2024-12-08',
          purchaseOrderNumber: 'PO-2024-003',
          referenceNumber: 'REF-003',
          vendorName: 'ABC Raw Materials',
          status: 'DRAFT',
          billedStatus: 'NOT_BILLED',
          amount: 125000,
          deliveryDate: '2024-12-18'
        },
        {
          id: 4,
          date: '2024-11-28',
          purchaseOrderNumber: 'PO-2024-004',
          referenceNumber: 'REF-004',
          vendorName: 'Quality Nutrients Inc',
          status: 'CONFIRMED',
          billedStatus: 'FULLY_BILLED',
          amount: 350000,
          deliveryDate: '2024-12-05'
        },
        {
          id: 5,
          date: '2024-11-20',
          purchaseOrderNumber: 'PO-2024-005',
          referenceNumber: '',
          vendorName: 'Local Supplier Network',
          status: 'CANCELLED',
          billedStatus: 'NOT_BILLED',
          amount: 95000,
          deliveryDate: '2024-12-01'
        }
      ];
      
      setPurchaseOrders(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      setLoading(false);
    }
  };

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = 
      order.purchaseOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesBilledStatus = billedStatusFilter === 'all' || order.billedStatus === billedStatusFilter;
    
    return matchesSearch && matchesStatus && matchesBilledStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (id) => {
    navigate(`/finance/payments/purchase-orders/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/finance/payments/purchase-orders/${id}/edit`);
  };

  const handleClone = (id) => {
    // TODO: Implement clone API call
    console.log('Cloning purchase order:', id);
    navigate('/finance/payments/purchase-orders/new');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      // TODO: Implement delete API call
      console.log('Deleting purchase order:', id);
      setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
      SENT: { bg: 'bg-blue-100', text: 'text-blue-800' },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`;
  };

  const getBilledStatusBadge = (status) => {
    const statusConfig = {
      NOT_BILLED: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Not Billed' },
      PARTIALLY_BILLED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partially Billed' },
      FULLY_BILLED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Fully Billed' }
    };
    const config = statusConfig[status] || statusConfig.NOT_BILLED;
    return { className: `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`, label: config.label };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Manage your purchase orders</p>
        </div>
        <button
          onClick={() => navigate('/finance/payments/purchase-orders/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">+</span>
          New Purchase Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Purchase Orders</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{purchaseOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Draft Orders</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">
            {purchaseOrders.filter(o => o.status === 'DRAFT').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Awaiting Delivery</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {purchaseOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'SENT').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Amount (Current)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            LKR {purchaseOrders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by PO number, reference, or vendor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              value={billedStatusFilter}
              onChange={(e) => setBilledStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Billed Status</option>
              <option value="NOT_BILLED">Not Billed</option>
              <option value="PARTIALLY_BILLED">Partially Billed</option>
              <option value="FULLY_BILLED">Fully Billed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading purchase orders...</div>
        ) : paginatedOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || statusFilter !== 'all' || billedStatusFilter !== 'all' 
              ? 'No purchase orders found matching your filters.' 
              : 'No purchase orders yet. Create your first purchase order!'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billed Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOrders.map((order) => {
                    const billedBadge = getBilledStatusBadge(order.billedStatus);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-800">
                            {new Date(order.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                               onClick={() => handleView(order.id)}>
                            {order.purchaseOrderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {order.referenceNumber || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-800">{order.vendorName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={billedBadge.className}>
                            {billedBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800">
                            LKR {order.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(order.id)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(order.id)}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleClone(order.id)}
                              className="text-purple-600 hover:text-purple-800 font-medium"
                            >
                              Clone
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} purchase orders
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 border rounded ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;