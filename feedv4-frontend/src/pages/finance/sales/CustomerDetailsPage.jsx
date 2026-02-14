import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/customers/${id}`);
      if (!response.ok) throw new Error('Failed to fetch customer');
      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Error loading customer details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/finance/sales/customers/${id}/edit`);
  };

  const handleToggleStatus = async () => {
    const newStatus = customer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'INACTIVE' ? 'deactivate' : 'reactivate';

    if (!window.confirm(`Are you sure you want to ${action} this customer?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customer, status: newStatus })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to ${action} customer`);
      }

      const updated = await response.json();
      setCustomer(updated);
    } catch (error) {
      console.error(`Error updating customer status:`, error);
      alert(`Error updating customer status: ` + error.message);
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

  // Normalise address fields — backend sends flat fields, so fall back gracefully
  const billingAddress = {
    street: customer.billingStreet || '',
    city: customer.billingCity || '',
    state: customer.billingState || '',
    zip: customer.billingZip || '',
    country: customer.billingCountry || ''
  };

  const shippingAddress = {
    street: customer.shippingStreet || '',
    city: customer.shippingCity || '',
    state: customer.shippingState || '',
    zip: customer.shippingZip || '',
    country: customer.shippingCountry || ''
  };

  const outstandingBalance = customer.outstandingBalance ?? customer.receivables ?? 0;
  const creditLimit = customer.creditLimit ?? 0;
  const availableCredit = creditLimit - outstandingBalance;

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
            {customer.companyName && (
              <p className="text-gray-600 mt-1">{customer.companyName}</p>
            )}
          </div>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Customer
          </button>
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
            {customer.currency || 'LKR'} {outstandingBalance.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Credit Limit</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {customer.currency || 'LKR'} {creditLimit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Available Credit</p>
          <p className={`text-2xl font-bold mt-1 ${availableCredit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {customer.currency || 'LKR'} {availableCredit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Payment Terms</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {customer.paymentTerms ? `Net ${customer.paymentTerms}` : '—'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCreateInvoice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Invoice
            </button>
            <button
              onClick={handleRecordPayment}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Record Payment
            </button>
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                customer.status === 'ACTIVE'
                  ? 'border-orange-300 text-orange-700 hover:bg-orange-50'
                  : 'border-green-300 text-green-700 hover:bg-green-50'
              }`}
            >
              {customer.status === 'ACTIVE' ? 'Mark as Inactive' : 'Mark as Active'}
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
                    <p className="text-gray-800">{customer.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-800">{customer.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="text-gray-800">{customer.mobile || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <p className="text-gray-800">{customer.website || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Billing Address</h3>
                  {billingAddress.street || billingAddress.city ? (
                    <div className="text-gray-700">
                      {billingAddress.street && <p>{billingAddress.street}</p>}
                      <p>
                        {[billingAddress.city, billingAddress.state, billingAddress.zip]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {billingAddress.country && <p>{billingAddress.country}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No billing address on file</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Address</h3>
                  {shippingAddress.street || shippingAddress.city ? (
                    <div className="text-gray-700">
                      {shippingAddress.street && <p>{shippingAddress.street}</p>}
                      <p>
                        {[shippingAddress.city, shippingAddress.state, shippingAddress.zip]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {shippingAddress.country && <p>{shippingAddress.country}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No shipping address on file</p>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Terms</p>
                    <p className="text-gray-800">
                      {customer.paymentTerms ? `Net ${customer.paymentTerms} days` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Credit Limit</p>
                    <p className="text-gray-800">
                      {customer.currency || 'LKR'} {creditLimit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="text-gray-800">{customer.currency || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Opening Balance</p>
                    <p className="text-gray-800">
                      {customer.currency || 'LKR'} {(customer.openingBalance ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                </div>
              )}

              {/* Additional Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer Type</p>
                    <p className="text-gray-800">{customer.customerType || '—'}</p>
                  </div>
                  {customer.createdDate && (
                    <div>
                      <p className="text-sm text-gray-600">Created Date</p>
                      <p className="text-gray-800">
                        {new Date(customer.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="text-center py-8 text-gray-500">
              <p>Transaction history coming soon</p>
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