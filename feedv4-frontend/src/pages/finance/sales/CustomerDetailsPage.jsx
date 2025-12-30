import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/customers/${id}`);
      // const data = await response.json();
      
      // Mock data
      const mockData = {
        id: 1,
        customerType: 'BUSINESS',
        customerName: 'ABC Farms Ltd',
        companyName: 'ABC Farms Ltd',
        displayName: 'ABC Farms',
        email: 'contact@abcfarms.com',
        phone: '+94 11 234 5678',
        mobile: '+94 77 123 4567',
        website: 'www.abcfarms.com',
        billingAddress: {
          street: '123 Main Street',
          city: 'Colombo',
          state: 'Western',
          zip: '00100',
          country: 'Sri Lanka'
        },
        shippingAddress: {
          street: '123 Main Street',
          city: 'Colombo',
          state: 'Western',
          zip: '00100',
          country: 'Sri Lanka'
        },
        paymentTerms: '30',
        creditLimit: 500000,
        currency: 'LKR',
        openingBalance: 0,
        outstandingBalance: 125000,
        notes: 'Regular customer since 2024',
        status: 'ACTIVE',
        createdDate: '2024-01-15',
        transactions: [
          {
            id: 1,
            type: 'Invoice',
            number: 'INV-2024-001',
            date: '2024-12-01',
            dueDate: '2024-12-31',
            amount: 150000,
            status: 'Unpaid'
          },
          {
            id: 2,
            type: 'Payment',
            number: 'PAY-2024-005',
            date: '2024-11-25',
            amount: 75000,
            status: 'Completed'
          },
          {
            id: 3,
            type: 'Invoice',
            number: 'INV-2024-002',
            date: '2024-11-15',
            dueDate: '2024-12-15',
            amount: 95000,
            status: 'Paid'
          }
        ]
      };
      
      setCustomer(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/finance/sales/customers/${id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to deactivate this customer?')) {
      // TODO: Implement delete/deactivate API call
      console.log('Deactivating customer:', id);
      navigate('/finance/sales/customers');
    }
  };

  const handleCreateInvoice = () => {
    navigate(`/finance/sales/invoices/new?customerId=${id}`);
  };

  const handleRecordPayment = () => {
    navigate(`/finance/sales/payments/new?customerId=${id}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Customer not found</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'statements', label: 'Statements' },
    { id: 'comments', label: 'Comments' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/finance/sales/customers')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Customers
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{customer.customerName}</h1>
            <p className="text-gray-600 mt-1">{customer.companyName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
          customer.status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {customer.status}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Outstanding Balance</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {customer.currency} {customer.outstandingBalance.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Credit Limit</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {customer.currency} {customer.creditLimit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Available Credit</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {customer.currency} {(customer.creditLimit - customer.outstandingBalance).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Payment Terms</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">Net {customer.paymentTerms}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCreateInvoice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Invoice
            </button>
            <button
              onClick={handleRecordPayment}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Record Payment
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Send Email
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Generate Statement
            </button>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-800">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-800">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="text-gray-800">{customer.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <p className="text-gray-800">{customer.website}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Billing Address</h3>
                  <div className="text-gray-700">
                    <p>{customer.billingAddress.street}</p>
                    <p>{customer.billingAddress.city}, {customer.billingAddress.state} {customer.billingAddress.zip}</p>
                    <p>{customer.billingAddress.country}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Address</h3>
                  <div className="text-gray-700">
                    <p>{customer.shippingAddress.street}</p>
                    <p>{customer.shippingAddress.city}, {customer.shippingAddress.state} {customer.shippingAddress.zip}</p>
                    <p>{customer.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Terms</p>
                    <p className="text-gray-800">Net {customer.paymentTerms} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Credit Limit</p>
                    <p className="text-gray-800">{customer.currency} {customer.creditLimit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="text-gray-800">{customer.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Opening Balance</p>
                    <p className="text-gray-800">{customer.currency} {customer.openingBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
                  <p className="text-gray-700">{customer.notes}</p>
                </div>
              )}

              {/* Additional Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer Type</p>
                    <p className="text-gray-800">{customer.customerType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created Date</p>
                    <p className="text-gray-800">{new Date(customer.createdDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Types</option>
                    <option>Invoices</option>
                    <option>Payments</option>
                  </select>
                </div>
              </div>

              {customer.transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No transactions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customer.transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800">{transaction.type}</td>
                          <td className="px-6 py-4 text-sm font-medium text-blue-600">{transaction.number}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            {customer.currency} {transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'Paid' || transaction.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'Unpaid'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Statements Tab */}
          {activeTab === 'statements' && (
            <div className="text-center py-8 text-gray-500">
              <p>Statement generation coming soon</p>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="text-center py-8 text-gray-500">
              <p>Comments feature coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;