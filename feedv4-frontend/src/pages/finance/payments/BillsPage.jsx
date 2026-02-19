import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/bills`;

const getStatusBadge = (status) => {
  const config = {
    DRAFT: { cls: 'bg-gray-100 text-gray-800', label: 'DRAFT' },
    OPEN: { cls: 'bg-blue-100 text-blue-800', label: 'OPEN' },
    PARTIALLY_PAID: { cls: 'bg-yellow-100 text-yellow-800', label: 'Partially Paid' },
    PAID: { cls: 'bg-green-100 text-green-800', label: 'PAID' },
    OVERDUE: { cls: 'bg-red-100 text-red-800', label: 'OVERDUE' },
    VOID: { cls: 'bg-gray-100 text-gray-600', label: 'VOID' },
  };
  const c = config[status] || config.DRAFT;
  return { className: `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${c.cls}`, label: c.label };
};

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
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch bills');
      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}/clone`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to clone bill');
      const cloned = await response.json();
      navigate(`/finance/payments/bills/${cloned.id}/edit`);
    } catch (error) {
      alert('Error cloning bill: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete bill');
      }
      fetchBills();
    } catch (error) {
      alert('Error deleting bill: ' + error.message);
    }
  };

  const filteredBills = bills.filter(bill => {
    const billNum = bill.billNumber || '';
    const ref = bill.referenceNumber || '';
    const vendor = bill.vendorName || '';
    const matchesSearch =
      billNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

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
            LKR {bills.reduce((sum, b) => sum + (parseFloat(b.balanceDue) || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by bill number, reference, or vendor name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-48">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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

      {/* Table */}
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
                    {['Date', 'Bill Number', 'Reference', 'Vendor Name', 'Status', 'Due Date', 'Amount', 'Balance Due', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBills.map((bill) => {
                    const badge = getStatusBadge(bill.status);
                    const balanceDue = parseFloat(bill.balanceDue) || 0;
                    const isOverdue = bill.dueDate && new Date(bill.dueDate) < new Date() && balanceDue > 0
                      && bill.status !== 'PAID' && bill.status !== 'VOID';
                    return (
                      <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                            onClick={() => navigate(`/finance/payments/bills/${bill.id}`)}>
                            {bill.billNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {bill.referenceNumber || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {bill.vendorName || `Vendor #${bill.vendorId}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={badge.className}>{badge.label}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '—'}
                            {isOverdue && <span className="ml-1">⚠</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                          LKR {(parseFloat(bill.total) || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            LKR {balanceDue.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => navigate(`/finance/payments/bills/${bill.id}`)}
                              className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                            <button onClick={() => navigate(`/finance/payments/bills/${bill.id}/edit`)}
                              className="text-green-600 hover:text-green-800 font-medium">Edit</button>
                            <button onClick={() => handleClone(bill.id)}
                              className="text-purple-600 hover:text-purple-800 font-medium">Clone</button>
                            <button onClick={() => handleDelete(bill.id)}
                              className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBills.length)} of {filteredBills.length} bills
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
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