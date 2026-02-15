import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QuotesPage = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/quotes`);
      if (!response.ok) throw new Error('Failed to fetch quotes');
      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quoteNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleView = (id) => navigate(`/finance/sales/quotes/${id}`);
  const handleEdit = (id) => navigate(`/finance/sales/quotes/${id}/edit`);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/quotes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete quote');
      }

      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert(error.message);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quotes</h1>
          <p className="text-gray-600 mt-1">Manage your sales quotes</p>
        </div>
        <button
          onClick={() => navigate('/finance/sales/quotes/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">+</span>
          New Quote
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Quotes" value={quotes.length} />
        <StatCard title="Accepted" value={quotes.filter(q => q.status === 'ACCEPTED').length} color="text-green-600" />
        <StatCard title="Pending" value={quotes.filter(q => q.status === 'SENT').length} color="text-blue-600" />
        <StatCard title="Total Value" value={`LKR ${quotes.reduce((sum, q) => sum + (q.total || 0), 0).toLocaleString()}`} />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 flex gap-4 flex-col md:flex-row">
        <input
          type="text"
          placeholder="Search by quote, reference or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="DECLINED">Declined</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading quotes...</div>
        ) : paginatedQuotes.length === 0 ? (
          <div className="p-8 text-center">No quotes found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Quote #</TableHeader>
                  <TableHeader>Reference</TableHeader>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedQuotes.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{new Date(q.quoteDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-blue-600">{q.quoteNumber}</td>
                    <td className="px-6 py-4">{q.referenceNumber || '-'}</td>
                    <td className="px-6 py-4">{q.customerName || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(q.status)}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      LKR {(q.total || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <ActionBtn onClick={() => handleView(q.id)} text="View" color="text-blue-600" />
                      <ActionBtn onClick={() => handleEdit(q.id)} text="Edit" color="text-green-600" />
                      <ActionBtn onClick={() => handleDelete(q.id)} text="Delete" color="text-red-600" />
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

/* Small UI Helpers */

const StatCard = ({ title, value, color = 'text-gray-800' }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border">
    <p className="text-gray-600 text-sm">{title}</p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
    {children}
  </th>
);

const ActionBtn = ({ onClick, text, color }) => (
  <button onClick={onClick} className={`${color} hover:underline font-medium`}>
    {text}
  </button>
);

export default QuotesPage;