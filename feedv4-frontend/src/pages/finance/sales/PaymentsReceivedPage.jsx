import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentsReceivedPage = () => {
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
      // const response = await fetch('/api/payments-received');
      // const data = await response.json();
      
      // Mock data
      const mockData = [
        {
          id: 1,
          paymentNumber: 'PAY-2024-001',
          type: 'INVOICE_PAYMENT',
          referenceNumber: 'REF-001',
          date: '2024-12-20',
          customerName: 'ABC Farms Ltd',
          invoiceNumber: 'INV-2024-001',
          mode: 'BANK_TRANSFER',
          amount: 250000,
          unusedAmount: 0,
          status: 'COMPLETED'
        },
        {
          id: 2,
          paymentNumber: 'PAY-2024-002',
          type: 'ADVANCE_PAYMENT',
          referenceNumber: 'REF-002',
          date: '2024-12-18',
          customerName: 'Green Valley Poultry',
          invoiceNumber: '-',
          mode: 'CASH',
          amount: 100000,
          unusedAmount: 100000,
          status: 'COMPLETED'
        },
        {
          id: 3,
          paymentNumber: 'PAY-2024-003',
          type: 'INVOICE_PAYMENT',
          referenceNumber: 'REF-003',
          date: '2024-12-15',
          customerName: 'Royal Livestock Co.',
          invoiceNumber: 'INV-2024-003',
          mode: 'CHEQUE',
          amount: 320000,
          unusedAmount: 0,
          status: 'COMPLETED'
        },
        {
          id: 4,
          paymentNumber: 'PAY-2024-004',
          type: 'PARTIAL_PAYMENT',
          referenceNumber: 'REF-004',
          date: '2024-12-12',
          customerName: 'ABC Farms Ltd',
          invoiceNumber: 'INV-2024-004',
          mode: 'CREDIT_CARD',
          amount: 75000,
          unusedAmount: 0,
          status: 'COMPLETED'
        },
        {
          id: 5,
          paymentNumber: 'PAY-2024-005',
          type: 'INVOICE_PAYMENT',
          referenceNumber: '',
          date: '2024-12-10',
          customerName: 'Green Valley Poultry',
          invoiceNumber: 'INV-2024-002',
          mode: 'BANK_TRANSFER',
          amount: 180000,
          unusedAmount: 5000,
          status: 'PARTIALLY_USED'
        },
        {
          id: 6,
          paymentNumber: 'PAY-2024-006',
          type: 'ADVANCE_PAYMENT',
          referenceNumber: 'REF-006',
          date: '2024-12-08',
          customerName: 'ABC Farms Ltd',
          invoiceNumber: '-',
          mode: 'BANK_TRANSFER',
          amount: 50000,
          unusedAmount: 0,
          status: 'VOID'
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
      payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_USED':
        return 'bg-yellow-100 text-yellow-800';
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'INVOICE_PAYMENT':
        return 'bg-blue-100 text-blue-800';
      case 'ADVANCE_PAYMENT':
        return 'bg-purple-100 text-purple-800';
      case 'PARTIAL_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleView = (id) => {
    navigate(`/finance/sales/payments-received/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/finance/sales/payments-received/${id}/edit`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      // TODO: Implement delete API call
      console.log('Deleting payment:', id);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments Received</h1>
          <p className="text-gray-600 mt-1">Track and manage customer payments</p>
        </div>
        <button
          onClick={() => navigate('/finance/sales/payments-received/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">+</span>
          Record Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Payments</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{payments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Received</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            LKR {payments.filter(p => p.status !== 'VOID').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Unused Amount</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            LKR {payments.filter(p => p.status !== 'VOID').reduce((sum, p) => sum + p.unusedAmount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">This Month</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {payments.filter(p => {
              const paymentDate = new Date(p.date);
              const now = new Date();
              return paymentDate.getMonth() === now.getMonth() && 
                     paymentDate.getFullYear() === now.getFullYear() &&
                     p.status !== 'VOID';
            }).length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by payment number, reference, customer, or invoice..."
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
              <option value="COMPLETED">Completed</option>
              <option value="PARTIALLY_USED">Partially Used</option>
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
            {searchQuery || statusFilter !== 'all' ? 'No payments found matching your filters.' : 'No payments recorded yet. Record your first payment!'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unused</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{payment.paymentNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(payment.type)}`}>
                          {payment.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.referenceNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentModeColor(payment.mode)}`}>
                          {payment.mode.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          LKR {payment.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${payment.unusedAmount > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                          LKR {payment.unusedAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status.replace('_', ' ')}
                        </span>
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

export default PaymentsReceivedPage;