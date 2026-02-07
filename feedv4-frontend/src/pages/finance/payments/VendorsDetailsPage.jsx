
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const VendorDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      
      const mockData = {
        id: 1,
        name: 'Global Feed Supplies Ltd',
        companyName: 'Global Feed Supplies Ltd',
        email: 'info@globalfeed.com',
        workPhone: '+94 11 234 5678',
        website: 'www.globalfeed.com',
        status: 'ACTIVE',
        currency: 'LKR',
        paymentTerms: '30',
        payables: 450000,
        unusedCredits: 0,
        gstTreatment: 'REGISTERED',
        gstNumber: 'GST123456',
        panNumber: 'PAN789012',
        billingAddress: {
          street: '123 Industrial Zone',
          city: 'Colombo',
          state: 'Western',
          zip: '00100',
          country: 'Sri Lanka'
        },
        shippingAddress: {
          street: '123 Industrial Zone',
          city: 'Colombo',
          state: 'Western',
          zip: '00100',
          country: 'Sri Lanka'
        },
        contactPersons: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Silva',
            email: 'john@globalfeed.com',
            phone: '+94 11 234 5679',
            mobile: '+94 77 123 4567',
            designation: 'Sales Manager'
          }
        ],
        customFields: {
          field1: 'Supplier Code: SUP001',
          field2: 'Credit Rating: A'
        },
        reportingTags: {
          department: 'Raw Materials',
          location: 'Main Warehouse'
        },
        notes: 'Preferred supplier for corn and wheat',
        transactions: [
          {
            id: 1,
            type: 'Bill',
            number: 'BILL-2024-001',
            date: '2024-12-01',
            dueDate: '2024-12-31',
            amount: 250000,
            status: 'Unpaid'
          },
          {
            id: 2,
            type: 'Payment',
            number: 'PAY-2024-010',
            date: '2024-11-25',
            amount: 150000,
            status: 'Completed'
          }
        ],
        createdDate: '2024-01-15',
        modifiedDate: '2024-12-20'
      };
      
      setVendor(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/finance/payments/vendors/${id}/edit`);
  };

  const handleClone = () => {
    console.log('Cloning vendor:', id);
    alert('Vendor cloned! Redirecting to new vendor...');
    navigate('/finance/payments/vendors/new');
  };

  const handleMarkAsInactive = async () => {
    if (window.confirm('Are you sure you want to mark this vendor as inactive?')) {
      try {
        // TODO: Implement API call
        console.log('Marking vendor as inactive:', id);
        setVendor(prev => ({ ...prev, status: 'INACTIVE' }));
        alert('Vendor marked as inactive!');
      } catch (error) {
        console.error('Error updating vendor:', error);
        alert('Error updating vendor status.');
      }
    }
  };

  const handleDelete = async () => {
    if (vendor.payables > 0) {
      alert('Cannot delete a vendor with outstanding payables.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      try {
        // TODO: Implement delete API call
        console.log('Deleting vendor:', id);
        alert('Vendor deleted successfully!');
        navigate('/finance/purchase/vendors');
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Error deleting vendor.');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading vendor details...</div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Vendor not found</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'comments', label: 'Comments' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'mails', label: 'Mails' },
    { id: 'statement', label: 'Statement' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/finance/purchase/vendors')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Vendors
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{vendor.name}</h1>
            <p className="text-gray-600 mt-1">{vendor.companyName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleClone}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clone
            </button>
            <button
              onClick={handleMarkAsInactive}
              disabled={vendor.status === 'INACTIVE'}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark as Inactive
            </button>
            <button
              onClick={handleDelete}
              disabled={vendor.payables > 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
          vendor.status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {vendor.status}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Outstanding Payables</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {vendor.currency} {vendor.payables.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Unused Credits</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {vendor.currency} {vendor.unusedCredits.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Payment Terms</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">Net {vendor.paymentTerms}</p>
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
                    <p className="text-gray-800">{vendor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Work Phone</p>
                    <p className="text-gray-800">{vendor.workPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <p className="text-gray-800">{vendor.website}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Terms</p>
                    <p className="text-gray-800">Net {vendor.paymentTerms} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="text-gray-800">{vendor.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">GST Treatment</p>
                    <p className="text-gray-800">{vendor.gstTreatment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">GST Number</p>
                    <p className="text-gray-800">{vendor.gstNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">PAN Number</p>
                    <p className="text-gray-800">{vendor.panNumber}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Billing Address</h3>
                  <div className="text-gray-700">
                    <p>{vendor.billingAddress.street}</p>
                    <p>{vendor.billingAddress.city}, {vendor.billingAddress.state} {vendor.billingAddress.zip}</p>
                    <p>{vendor.billingAddress.country}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Address</h3>
                  <div className="text-gray-700">
                    <p>{vendor.shippingAddress.street}</p>
                    <p>{vendor.shippingAddress.city}, {vendor.shippingAddress.state} {vendor.shippingAddress.zip}</p>
                    <p>{vendor.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Contact Persons */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Persons</h3>
                {vendor.contactPersons.map((person) => (
                  <div key={person.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                    <p className="font-medium text-gray-900">{person.firstName} {person.lastName}</p>
                    <p className="text-sm text-gray-600">{person.designation}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Email: </span>
                        <span className="text-gray-800">{person.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone: </span>
                        <span className="text-gray-800">{person.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mobile: </span>
                        <span className="text-gray-800">{person.mobile}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Fields */}
              {vendor.customFields && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendor.customFields.field1 && (
                      <div>
                        <p className="text-sm text-gray-600">Custom Field 1</p>
                        <p className="text-gray-800">{vendor.customFields.field1}</p>
                      </div>
                    )}
                    {vendor.customFields.field2 && (
                      <div>
                        <p className="text-sm text-gray-600">Custom Field 2</p>
                        <p className="text-gray-800">{vendor.customFields.field2}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reporting Tags */}
              {vendor.reportingTags && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Reporting Tags</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="text-gray-800">{vendor.reportingTags.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-gray-800">{vendor.reportingTags.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {vendor.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
                  <p className="text-gray-700">{vendor.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="text-center py-8 text-gray-500">
              <p>Comments feature coming soon</p>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
              {vendor.transactions.length === 0 ? (
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vendor.transactions.map((transaction) => (
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
                            LKR {transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'Paid' || transaction.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Mails Tab */}
          {activeTab === 'mails' && (
            <div className="text-center py-8 text-gray-500">
              <p>Email history feature coming soon</p>
            </div>
          )}

          {/* Statement Tab */}
          {activeTab === 'statement' && (
            <div className="text-center py-8 text-gray-500">
              <p>Statement feature coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsPage;