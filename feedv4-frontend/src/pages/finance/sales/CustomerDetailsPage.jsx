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

  // Use /with-financials so receivables is calculated server-side
  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/customers/${id}/with-financials`);
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

  // Use the dedicated mark-active / mark-inactive endpoints instead of a full PUT
  const handleToggleStatus = async () => {
    const isActive = customer.status === 'ACTIVE';
    const action = isActive ? 'deactivate' : 'reactivate';

    if (!window.confirm(`Are you sure you want to ${action} this customer?`)) return;

    try {
      const endpoint = isActive
        ? `${API_BASE_URL}/customers/${id}/mark-inactive`
        : `${API_BASE_URL}/customers/${id}/mark-active`;

      const response = await fetch(endpoint, { method: 'PUT' });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to ${action} customer`);
      }

      const updated = await response.json();
      setCustomer(updated);
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('Error updating customer status: ' + error.message);
    }
  };

  const handleCreateInvoice = () => {
    navigate(`/finance/sales/invoices/new?customerId=${id}`);
  };

  const handleRecordPayment = () => {
    navigate(`/finance/sales/payments-received/new?customerId=${id}`);
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

  const receivables    = customer.receivables    ?? 0;
  const unusedCredits  = customer.unusedCredits  ?? 0;
  const paymentTerms   = customer.paymentTerms;

  const tabs = [
    { id: 'overview',     label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'statements',   label: 'Statements' },
    { id: 'comments',     label: 'Comments' },
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
          <p className="text-gray-600 text-sm">Outstanding Receivables</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {customer.currency || 'LKR'} {Number(receivables).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Unused Credits</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {customer.currency || 'LKR'} {Number(unusedCredits).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Currency</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {customer.currency || '—'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Payment Terms</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {paymentTerms != null ? `Net ${paymentTerms}` : '—'}
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

        <div className="p-6">

          {/* ── Overview ── */}
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

              {/* Contact Persons */}
              {customer.contactPersons && customer.contactPersons.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Persons</h3>
                  <div className="space-y-3">
                    {customer.contactPersons.map((cp, i) => (
                      <div key={cp.id ?? i} className="border border-gray-200 rounded-lg p-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Name</p>
                          <p className="text-gray-800">{[cp.firstName, cp.lastName].filter(Boolean).join(' ') || '—'}</p>
                        </div>
                        {cp.designation && (
                          <div>
                            <p className="text-gray-600">Designation</p>
                            <p className="text-gray-800">{cp.designation}</p>
                          </div>
                        )}
                        {cp.email && (
                          <div>
                            <p className="text-gray-600">Email</p>
                            <p className="text-gray-800">{cp.email}</p>
                          </div>
                        )}
                        {cp.phone && (
                          <div>
                            <p className="text-gray-600">Phone</p>
                            <p className="text-gray-800">{cp.phone}</p>
                          </div>
                        )}
                        {cp.mobile && (
                          <div>
                            <p className="text-gray-600">Mobile</p>
                            <p className="text-gray-800">{cp.mobile}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Billing Address</h3>
                  {customer.billingStreet || customer.billingCity ? (
                    <div className="text-gray-700">
                      {customer.billingStreet && <p>{customer.billingStreet}</p>}
                      <p>
                        {[customer.billingCity, customer.billingState, customer.billingZip]
                          .filter(Boolean).join(', ')}
                      </p>
                      {customer.billingCountry && <p>{customer.billingCountry}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No billing address on file</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Address</h3>
                  {customer.shippingStreet || customer.shippingCity ? (
                    <div className="text-gray-700">
                      {customer.shippingStreet && <p>{customer.shippingStreet}</p>}
                      <p>
                        {[customer.shippingCity, customer.shippingState, customer.shippingZip]
                          .filter(Boolean).join(', ')}
                      </p>
                      {customer.shippingCountry && <p>{customer.shippingCountry}</p>}
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
                      {paymentTerms != null ? `Net ${paymentTerms} days` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="text-gray-800">{customer.currency || '—'}</p>
                  </div>
                  {customer.gstTreatment && (
                    <div>
                      <p className="text-sm text-gray-600">GST Treatment</p>
                      <p className="text-gray-800">{customer.gstTreatment}</p>
                    </div>
                  )}
                  {customer.gstNumber && (
                    <div>
                      <p className="text-sm text-gray-600">GST Number</p>
                      <p className="text-gray-800">{customer.gstNumber}</p>
                    </div>
                  )}
                  {customer.panNumber && (
                    <div>
                      <p className="text-sm text-gray-600">PAN Number</p>
                      <p className="text-gray-800">{customer.panNumber}</p>
                    </div>
                  )}
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
                  {customer.department && (
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="text-gray-800">{customer.department}</p>
                    </div>
                  )}
                  {customer.location && (
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-gray-800">{customer.location}</p>
                    </div>
                  )}
                  {customer.createdBy && (
                    <div>
                      <p className="text-sm text-gray-600">Created By</p>
                      <p className="text-gray-800">{customer.createdBy}</p>
                    </div>
                  )}
                  {customer.createdAt && (
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="text-gray-800">{new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Transactions ── */}
          {activeTab === 'transactions' && (
            <div className="text-center py-8 text-gray-500">
              <p>Transaction history coming soon</p>
            </div>
          )}

          {/* ── Statements ── */}
          {activeTab === 'statements' && (
            <div className="text-center py-8 text-gray-500">
              <p>Statement generation coming soon</p>
            </div>
          )}

          {/* ── Comments ── */}
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