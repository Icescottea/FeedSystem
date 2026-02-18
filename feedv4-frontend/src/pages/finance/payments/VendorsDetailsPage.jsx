import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/vendors`;

const VendorDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      // Use /with-financials to get payables + unusedCredits calculated
      const response = await fetch(`${API_BASE}/${id}/with-financials`);
      if (!response.ok) throw new Error('Failed to fetch vendor details');
      const data = await response.json();
      setVendor(data);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── ACTIONS ─────────────────────────────────────────────────────────────

  const handleMarkAsInactive = async () => {
    if (!window.confirm('Are you sure you want to mark this vendor as inactive?')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}/mark-inactive`, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to update vendor status');
      const updated = await response.json();
      setVendor(updated);
    } catch (error) {
      alert('Error updating vendor status: ' + error.message);
    }
  };

  const handleMarkAsActive = async () => {
    if (!window.confirm('Are you sure you want to mark this vendor as active?')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}/mark-active`, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to update vendor status');
      const updated = await response.json();
      setVendor(updated);
    } catch (error) {
      alert('Error updating vendor status: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (parseFloat(vendor.payables) > 0) {
      alert('Cannot delete a vendor with outstanding payables.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete vendor');
      }
      navigate('/finance/payments/vendors');
    } catch (error) {
      alert('Error deleting vendor: ' + error.message);
    }
  };

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  const formatAddress = (street, city, state, zip, country) => {
    const parts = [street, [city, state, zip].filter(Boolean).join(', '), country].filter(Boolean);
    return parts.length > 0 ? parts : ['—'];
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading vendor details...</div>;
  }

  if (!vendor) {
    return <div className="p-6 text-center text-gray-500">Vendor not found</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'comments', label: 'Comments' },
    { id: 'mails', label: 'Mails' },
    { id: 'statement', label: 'Statement' },
  ];

  const isActive = vendor.status === 'ACTIVE';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/finance/payments/vendors')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Vendors
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{vendor.vendorDisplayName}</h1>
            <p className="text-gray-600 mt-1">{vendor.companyName}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={() => navigate(`/finance/payments/vendors/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            {isActive ? (
              <button
                onClick={handleMarkAsInactive}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Mark as Inactive
              </button>
            ) : (
              <button
                onClick={handleMarkAsActive}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as Active
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={parseFloat(vendor.payables) > 0}
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
          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {vendor.status}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Outstanding Payables</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {vendor.currency || 'LKR'} {(parseFloat(vendor.payables) || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Unused Credits</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {vendor.currency || 'LKR'} {(parseFloat(vendor.unusedCredits) || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Payment Terms</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {vendor.paymentTerms === '0' ? 'Due on Receipt' : `Net ${vendor.paymentTerms}`}
          </p>
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-800">{vendor.vendorEmail || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Work Phone</p>
                    <p className="text-gray-800">{vendor.vendorPhone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <p className="text-gray-800">{vendor.website || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Terms</p>
                    <p className="text-gray-800">
                      {vendor.paymentTerms === '0' ? 'Due on Receipt' : `Net ${vendor.paymentTerms} days`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="text-gray-800">{vendor.currency || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">GST Treatment</p>
                    <p className="text-gray-800">{vendor.gstTreatment || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">GST Number</p>
                    <p className="text-gray-800">{vendor.gstNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">PAN Number</p>
                    <p className="text-gray-800">{vendor.panNumber || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Billing Address</h3>
                  <div className="text-gray-700 space-y-1">
                    {formatAddress(
                      vendor.billingStreet, vendor.billingCity,
                      vendor.billingState, vendor.billingZip, vendor.billingCountry
                    ).map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Address</h3>
                  <div className="text-gray-700 space-y-1">
                    {formatAddress(
                      vendor.shippingStreet, vendor.shippingCity,
                      vendor.shippingState, vendor.shippingZip, vendor.shippingCountry
                    ).map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                </div>
              </div>

              {/* Contact Persons */}
              {vendor.contactPersons && vendor.contactPersons.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Persons</h3>
                  {vendor.contactPersons.map((person) => (
                    <div key={person.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <p className="font-medium text-gray-900">{person.firstName} {person.lastName}</p>
                      <p className="text-sm text-gray-600">{person.designation}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-600">Email: </span><span className="text-gray-800">{person.email || '—'}</span></div>
                        <div><span className="text-gray-600">Phone: </span><span className="text-gray-800">{person.phone || '—'}</span></div>
                        <div><span className="text-gray-600">Mobile: </span><span className="text-gray-800">{person.mobile || '—'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Fields */}
              {(vendor.customField1 || vendor.customField2) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendor.customField1 && (
                      <div>
                        <p className="text-sm text-gray-600">Custom Field 1</p>
                        <p className="text-gray-800">{vendor.customField1}</p>
                      </div>
                    )}
                    {vendor.customField2 && (
                      <div>
                        <p className="text-sm text-gray-600">Custom Field 2</p>
                        <p className="text-gray-800">{vendor.customField2}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reporting Tags */}
              {(vendor.department || vendor.location) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Reporting Tags</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendor.department && (
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="text-gray-800">{vendor.department}</p>
                      </div>
                    )}
                    {vendor.location && (
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="text-gray-800">{vendor.location}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {vendor.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{vendor.notes}</p>
                </div>
              )}

              {/* Audit Info */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="text-gray-800">
                      {vendor.createdAt ? new Date(vendor.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Modified</p>
                    <p className="text-gray-800">
                      {vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  {vendor.createdBy && (
                    <div>
                      <p className="text-gray-600">Created By</p>
                      <p className="text-gray-800">{vendor.createdBy}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="text-center py-8 text-gray-500">Comments feature coming soon</div>
          )}
          {activeTab === 'mails' && (
            <div className="text-center py-8 text-gray-500">Email history feature coming soon</div>
          )}
          {activeTab === 'statement' && (
            <div className="text-center py-8 text-gray-500">Statement feature coming soon</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsPage;