import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentsMadePage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/payments-made');
      // const data = await response.json();
      
      // Mock data
      const mockData = [
        {
          id: 1,
          date: '2024-12-20',
          paymentNumber: 'PMT-2024-001',
          referenceNumber: 'REF-PMT-001',
          vendorName: 'Global Feed Supplies Ltd',
          billNumber: 'BILL-2024-001',
          mode: 'BANK_TRANSFER',
          status: 'PAID',
          amount: 478800,
          unusedAmount: 0
        },
        {
          id: 2,
          date: '2024-12-18',
          paymentNumber: 'PMT-2024-002',
          referenceNumber: 'REF-PMT-002',
          vendorName: 'Premium Ingredients Co.',
          billNumber: 'BILL-2024-002',
          mode: 'CHEQUE',
          status: 'PAID',
          amount: 200000,
          unusedAmount: 15600
        },
        {
          id: 3,
          date: '2024-12-15',
          paymentNumber: 'PMT-2024-003',
          referenceNumber: '',
          vendorName: 'ABC Raw Materials',
          billNumber: 'BILL-2024-003, BILL-2024-008',
          mode: 'CASH',
          status: 'PAID',
          amount: 250000,
          unusedAmount: 0
        },
        {
          id: 4,
          date: '2024-12-10',
          paymentNumber: 'PMT-2024-004',
          referenceNumber: 'REF-PMT-004',
          vendorName: 'Quality Nutrients Inc',
          billNumber: '-',
          mode: 'BANK_TRANSFER',
          status: 'DRAFT',
          amount: 300000,
          unusedAmount: 300000
        },
        {
          id: 5,
          date: '2024-12-05',
          paymentNumber: 'PMT-2024-005',
          referenceNumber: 'REF-PMT-005',
          vendorName: 'Local Supplier Network',
          billNumber: 'BILL-2024-005',
          mode: 'ONLINE_PAYMENT',
          status: 'VOID',
          amount: 106400,
          unusedAmount: 0
        },
        {
          id: 6,
          date: '2024-11-28',
          paymentNumber: 'PMT-2024-006',
          referenceNumber: '',
          vendorName: 'Global Feed Supplies Ltd',
          billNumber: 'BILL-2024-006',
          mode: 'BANK_TRANSFER',
          status: 'PAID',
          amount: 180000,
          unusedAmount: 5000
        }
      ];
      
      setPayments(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.billNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (id) => {
    navigate(`/finance/payments/payments-made/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/finance/payments/payments-made/${id}/edit`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      // TODO: Implement delete API call
      console.log('Deleting payment:', id);
      setPayments(payments.filter(p => p.id !== id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
      PAID: { bg: 'bg-green-100', text: 'text-green-800' },
      VOID: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`;
  };

  const getModeBadge = (mode) => {
    const modeLabels = {
      BANK_TRANSFER: 'Bank Transfer',
      CHEQUE: 'Cheque',
      CASH: 'Cash',
      ONLINE_PAYMENT: 'Online Payment',
      CREDIT_CARD: 'Credit Card'
    };
    return modeLabels[mode] || mode;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments Made</h1>
          <p className="text-gray-600 mt-1">Manage vendor payments and transactions</p>
        </div>
        <button
          onClick={() => navigate('/finance/payments/payments-made/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">+</span>
          New Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Payments</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{payments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Paid Payments</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {payments.filter(p => p.status === 'PAID').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Amount Paid</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            LKR {payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Unused Amount</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            LKR {payments.reduce((sum, p) => sum + p.unusedAmount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by payment number, reference, vendor, or bill number..."
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
              <option value="PAID">Paid</option>
              <option value="VOID">Void</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading payments...</div>
        ) : paginatedPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'No payments found matching your filters.' 
              : 'No payments yet. Create your first payment!'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unused Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">
                          {new Date(payment.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                             onClick={() => handleView(payment.id)}>
                          {payment.paymentNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {payment.referenceNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">{payment.vendorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{payment.billNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{getModeBadge(payment.mode)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(payment.status)}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">
                          LKR {payment.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${payment.unusedAmount > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                          LKR {payment.unusedAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(payment.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(payment.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(payment.id)}
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
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

export default PaymentsMadePage;