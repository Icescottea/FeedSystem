import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/expenses`;

const getStatusColor = (status) => {
  switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800';
    case 'UNPAID': return 'bg-red-100 text-red-800';
    case 'PARTIALLY_PAID': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const ExpenseDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenseDetails();
  }, [id]);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch expense details');
      const data = await response.json();
      setExpense(data);
    } catch (error) {
      console.error('Error fetching expense details:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── ACTIONS ─────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete expense');
      }
      navigate('/finance/payments/expenses');
    } catch (error) {
      alert('Error deleting expense: ' + error.message);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading expense details...</div>;
  }

  if (!expense) {
    return <div className="p-6 text-center text-gray-500">Expense not found</div>;
  }

  const entries = expense.accountingEntries || [];
  const totalDebit = entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/finance/payments/expenses')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1">
          ← Back to Expenses
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {expense.referenceNumber || `Expense #${expense.id}`}
            </h1>
            <p className="text-gray-600 mt-1">Expense Account: {expense.expenseAccount}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/finance/payments/expenses/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Edit
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(expense.status)}`}>
          {expense.status}
        </span>
      </div>

      {/* Expense Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Expense Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="text-gray-800 font-medium">
              {expense.date ? new Date(expense.date).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expense Account</p>
            <p className="text-gray-800 font-medium">{expense.expenseAccount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-gray-800 font-medium">
              LKR {(parseFloat(expense.amount) || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tax</p>
            <p className="text-gray-800 font-medium">
              LKR {(parseFloat(expense.tax) || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Net Amount</p>
            <p className="text-blue-600 font-bold text-lg">
              LKR {(parseFloat(expense.netAmount) || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tax Treatment</p>
            <p className="text-gray-800 font-medium">
              {expense.taxInclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Paid Through</p>
            <p className="text-gray-800 font-medium">{expense.paidThrough || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Vendor</p>
            <p className="text-gray-800 font-medium">{expense.vendorName || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="text-gray-800 font-medium">{expense.customerName || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reference Number</p>
            <p className="text-gray-800 font-medium">{expense.referenceNumber || '—'}</p>
          </div>
          {expense.department && (
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-gray-800 font-medium">{expense.department}</p>
            </div>
          )}
          {expense.location && (
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-gray-800 font-medium">{expense.location}</p>
            </div>
          )}
        </div>

        {expense.notes && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Notes</p>
            <p className="text-gray-800 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{expense.notes}</p>
          </div>
        )}
      </div>

      {/* Accounting Entries */}
      {entries.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Accounting Entries</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry, i) => (
                  <tr key={entry.id || i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.account}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {parseFloat(entry.debit) > 0 ? `LKR ${parseFloat(entry.debit).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {parseFloat(entry.credit) > 0 ? `LKR ${parseFloat(entry.credit).toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                  <td className="px-6 py-4 text-sm text-gray-900">LKR {totalDebit.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">LKR {totalCredit.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Audit Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {expense.createdBy && (
            <div>
              <p className="text-gray-600">Created By</p>
              <p className="text-gray-800 font-medium">{expense.createdBy}</p>
            </div>
          )}
          <div>
            <p className="text-gray-600">Created Date</p>
            <p className="text-gray-800 font-medium">
              {expense.createdAt ? new Date(expense.createdAt).toLocaleString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Last Modified</p>
            <p className="text-gray-800 font-medium">
              {expense.updatedAt ? new Date(expense.updatedAt).toLocaleString() : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailsPage;