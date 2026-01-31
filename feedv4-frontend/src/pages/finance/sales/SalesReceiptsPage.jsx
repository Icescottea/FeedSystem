import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SalesReceiptsPage = () => {
  const navigate = useNavigate();
  const [salesReceipts, setSalesReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSalesReceipts();
  }, []);

  const fetchSalesReceipts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/sales-receipts');
      // const data = await response.json();
      
      // Mock data
      const mockData = [
        {
          id: 1,
          salesReceiptNumber: 'SR-2024-001',
          referenceNumber: 'REF-SR-001',
          date: '2024-12-20',
          customerName: 'ABC Farms Ltd',
          paymentMode: 'BANK_TRANSFER',
          status: 'COMPLETED',
          amount: 150000,
          createdBy: 'John Doe'
        },
        {
          id: 2,
          salesReceiptNumber: 'SR-2024-002',
          referenceNumber: 'REF-SR-002',
          date: '2024-12-18',
          customerName: 'Green Valley Poultry',
          paymentMode: 'CASH',
          status: 'DRAFT',
          amount: 85000,
          createdBy: 'Jane Smith'
        },
        {
          id: 3,
          salesReceiptNumber: 'SR-2024-003',
          referenceNumber: 'REF-SR-003',
          date: '2024-12-15',
          customerName: 'Royal Livestock Co.',
          paymentMode: 'CHEQUE',
          status: 'COMPLETED',
          amount: 220000,
          createdBy: 'Mike Johnson'
        },
        {
          id: 4,
          salesReceiptNumber: 'SR-2024-004',
          referenceNumber: 'REF-SR-004',
          date: '2024-12-12',
          customerName: 'ABC Farms Ltd',
          paymentMode: 'CREDIT_CARD',
          status: 'VOID',
          amount: 95000,
          createdBy: 'John Doe'
        },
        {
          id: 5,
          salesReceiptNumber: 'SR-2024-005',
          referenceNumber: '',
          date: '2024-12-10',
          customerName: 'Green Valley Poultry',
          paymentMode: 'BANK_TRANSFER',
          status: 'COMPLETED',
          amount: 175000,
          createdBy: 'Jane Smith'
        }
      ];
      
      setSalesReceipts(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales receipts:', error);
      setLoading(false);
    }
  };

  const filteredReceipts = salesReceipts.filter(receipt => {
    const matchesSearch = 
      receipt.salesReceiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'VOID':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentModeColor = (mode) => {
    switch (mode) {
      case 'CASH':
        return 'bg-green-100 text-green-800';
      case 'BANK_TRANSFER':
        return 'bg-blue-100 text-blue-800';
      case 'CHEQUE':
        return 'bg-purple-100 text-purple-800';
      case 'CREDIT_CARD':
        return 'bg-indigo-100 text-indigo-800';
      case 'DEBIT_CARD':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleView = (id) => {
    navigate(`/finance/sales/sales-receipts/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/finance/sales/sales-receipts/${id}/edit`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this sales receipt?')) {
      // TODO: Implement delete API call
      console.log('Deleting sales receipt:', id);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Receipts</h1>
          <p className="text-gray-600 mt-1">Manage your sales receipts and payments</p>
        </div>
        <button
          onClick={() => navigate('/finance/sales/sales-receipts/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">+</span>
          New Sales Receipt
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Receipts</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{salesReceipts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {salesReceipts.filter(r => r.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Draft</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">
            {salesReceipts.filter(r => r.status === 'DRAFT').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            LKR {salesReceipts.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by receipt number, reference, or customer..."
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
              <option value="COMPLETED">Completed</option>
              <option value="VOID">Void</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Receipts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading sales receipts...</div>
        ) : paginatedReceipts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || statusFilter !== 'all' ? 'No sales receipts found matching your filters.' : 'No sales receipts yet. Create your first sales receipt!'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {new Date(receipt.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{receipt.salesReceiptNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {receipt.referenceNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{receipt.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentModeColor(receipt.paymentMode)}`}>
                          {receipt.paymentMode.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(receipt.status)}`}>
                          {receipt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          LKR {receipt.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {receipt.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(receipt.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(receipt.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(receipt.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReceipts.length)} of {filteredReceipts.length} sales receipts
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

export default SalesReceiptsPage;