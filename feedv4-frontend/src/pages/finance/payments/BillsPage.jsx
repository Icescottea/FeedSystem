import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BillsPage = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/bills');
      // const data = await response.json();
      
      // Mock data
      const mockData = [
        {
          id: 1,
          date: '2024-12-15',
          billNumber: 'BILL-2024-001',
          referenceNumber: 'REF-001',
          vendorName: 'Global Feed Supplies Ltd',
          status: 'OPEN',
          dueDate: '2025-01-14',
          amount: 478800,
          balanceDue: 478800
        },
        {
          id: 2,
          date: '2024-12-10',
          billNumber: 'BILL-2024-002',
          referenceNumber: 'REF-002',
          vendorName: 'Premium Ingredients Co.',
          status: 'PARTIALLY_PAID',
          dueDate: '2025-01-09',
          amount: 315600,
          balanceDue: 150000
        },
        {
          id: 3,
          date: '2024-12-08',
          billNumber: 'BILL-2024-003',
          referenceNumber: '',
          vendorName: 'ABC Raw Materials',
          status: 'PAID',
          dueDate: '2025-01-07',
          amount: 140000,
          balanceDue: 0
        },
        {
          id: 4,
          date: '2024-11-28',
          billNumber: 'BILL-2024-004',
          referenceNumber: 'REF-004',
          vendorName: 'Quality Nutrients Inc',
          status: 'OVERDUE',
          dueDate: '2024-12-28',
          amount: 392000,
          balanceDue: 392000
        },
        {
          id: 5,
          date: '2024-11-20',
          billNumber: 'BILL-2024-005',
          referenceNumber: 'REF-005',
          vendorName: 'Local Supplier Network',
          status: 'DRAFT',
          dueDate: '2024-12-20',
          amount: 106400,
          balanceDue: 106400
        },
        {
          id: 6,
          date: '2024-11-15',
          billNumber: 'BILL-2024-006',
          referenceNumber: '',
          vendorName: 'Global Feed Supplies Ltd',
          status: 'VOID',
          dueDate: '2024-12-15',
          amount: 225000,
          balanceDue: 0
        }
      ];
      
      setBills(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (id) => {
    navigate(`/finance/payments/bills/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/finance/payments/bills/${id}/edit`);
  };

  const handleClone = (id) => {
    // TODO: Implement clone API call
    console.log('Cloning bill:', id);
    navigate('/finance/payments/bills/new');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      // TODO: Implement delete API call
      console.log('Deleting bill:', id);
      setBills(bills.filter(b => b.id !== id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
      OPEN: { bg: 'bg-blue-100', text: 'text-blue-800' },
      PARTIALLY_PAID: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partially Paid' },
      PAID: { bg: 'bg-green-100', text: 'text-green-800' },
      OVERDUE: { bg: 'bg-red-100', text: 'text-red-800' },
      VOID: { bg: 'bg-gray-100', text: 'text-gray-600' }
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return { 
      className: `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`,
      label: config.label || status
    };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bills</h1>
          <p className="text-gray-600 mt-1">Manage your bills and payables</p>
        </div>
        <button
          onClick={() => navigate('/finance/payments/bills/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">+</span>
          New Bill
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Bills</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{bills.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Open Bills</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {bills.filter(b => b.status === 'OPEN').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Overdue Bills</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {bills.filter(b => b.status === 'OVERDUE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Balance Due</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            LKR {bills.reduce((sum, b) => sum + b.balanceDue, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by bill number, reference, or vendor name..."
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
              <option value="OPEN">Open</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="VOID">Void</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading bills...</div>
        ) : paginatedBills.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'No bills found matching your filters.' 
              : 'No bills yet. Create your first bill!'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBills.map((bill) => {
                    const statusBadge = getStatusBadge(bill.status);
                    const isOverdue = new Date(bill.dueDate) < new Date() && bill.balanceDue > 0 && bill.status !== 'PAID' && bill.status !== 'VOID';
                    
                    return (
                      <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-800">
                            {new Date(bill.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                               onClick={() => handleView(bill.id)}>
                            {bill.billNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {bill.referenceNumber || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-800">{bill.vendorName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={statusBadge.className}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            {new Date(bill.dueDate).toLocaleDateString()}
                            {isOverdue && <span className="ml-1">⚠</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800">
                            LKR {bill.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${bill.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            LKR {bill.balanceDue.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(bill.id)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(bill.id)}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleClone(bill.id)}
                              className="text-purple-600 hover:text-purple-800 font-medium"
                            >
                              Clone
                            </button>
                            <button
                              onClick={() => handleDelete(bill.id)}
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBills.length)} of {filteredBills.length} bills
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

export default BillsPage;