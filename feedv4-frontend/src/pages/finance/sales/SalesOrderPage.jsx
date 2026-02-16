import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://feedv4-backend.onrender.com/api/sales-orders';

const SalesOrdersPage = () => {
  const navigate = useNavigate();
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch sales orders');

      const data = await response.json();

      // Normalize backend response
      const normalized = data.map(o => ({
        id: o.id,
        salesOrderNumber: o.salesOrderNumber,
        referenceNumber: o.referenceNumber || '-',
        date: o.orderDate || o.createdAt,
        customerName: o.customer?.name || o.customerName || '—',
        status: o.status,
        invoiced: o.invoiceStatus || 'NOT_INVOICED',
        payment: o.paymentStatus || 'UNPAID',
        amount: o.total || 0,
        expectedShipmentDate: o.expectedShipmentDate,
        orderStatus: o.orderStatus || 'PENDING',
        deliveryMethod: o.deliveryMethod || '—'
      }));

      setSalesOrders(normalized);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sales order?')) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setSalesOrders(prev => prev.filter(o => o.id !== id));
      alert('Sales order deleted');
    } catch (error) {
      console.error('Error deleting sales order:', error);
      alert('Failed to delete sales order');
    }
  };

  const filteredSalesOrders = salesOrders.filter(order => {
    const matchesSearch =
      order.salesOrderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSalesOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredSalesOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      case 'VOID': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvoiceStatusColor = (status) => {
    switch (status) {
      case 'NOT_INVOICED': return 'bg-gray-100 text-gray-800';
      case 'PARTIALLY_INVOICED': return 'bg-yellow-100 text-yellow-800';
      case 'FULLY_INVOICED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'UNPAID': return 'bg-red-100 text-red-800';
      case 'PARTIALLY_PAID': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Orders</h1>
          <p className="text-gray-600 mt-1">Manage your sales orders</p>
        </div>
        <button
          onClick={() => navigate('/finance/sales/sales-orders/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">+</span>
          New Sales Order
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading sales orders...</div>
        ) : paginatedOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No sales orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-blue-600">{order.salesOrderNumber}</td>
                    <td className="px-4 py-3 text-sm">{order.referenceNumber}</td>
                    <td className="px-4 py-3 text-sm">{order.customerName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">LKR {order.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/finance/sales/sales-orders/${order.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/finance/sales/sales-orders/${order.id}/edit`)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOrdersPage;