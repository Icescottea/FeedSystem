import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/vendors`;

const VendorFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    vendorDisplayName: '',
    companyName: '',
    vendorEmail: '',
    vendorPhone: '',
    website: '',
    currency: 'LKR',
    paymentTerms: '30',
    gstTreatment: 'REGISTERED',
    gstNumber: '',
    panNumber: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'Sri Lanka',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'Sri Lanka',
    customField1: '',
    customField2: '',
    department: '',
    location: '',
    notes: '',
    status: 'ACTIVE',
  });

  const [contactPersons, setContactPersons] = useState([
    { tempId: Date.now(), firstName: '', lastName: '', email: '', phone: '', mobile: '', designation: '', sequence: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

  useEffect(() => {
    if (isEditMode) fetchVendor();
  }, [id]);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch vendor');
      const data = await response.json();

      setFormData({
        vendorDisplayName: data.vendorDisplayName || '',
        companyName: data.companyName || '',
        vendorEmail: data.vendorEmail || '',
        vendorPhone: data.vendorPhone || '',
        website: data.website || '',
        currency: data.currency || 'LKR',
        paymentTerms: data.paymentTerms || '30',
        gstTreatment: data.gstTreatment || 'REGISTERED',
        gstNumber: data.gstNumber || '',
        panNumber: data.panNumber || '',
        billingStreet: data.billingStreet || '',
        billingCity: data.billingCity || '',
        billingState: data.billingState || '',
        billingZip: data.billingZip || '',
        billingCountry: data.billingCountry || 'Sri Lanka',
        shippingStreet: data.shippingStreet || '',
        shippingCity: data.shippingCity || '',
        shippingState: data.shippingState || '',
        shippingZip: data.shippingZip || '',
        shippingCountry: data.shippingCountry || 'Sri Lanka',
        customField1: data.customField1 || '',
        customField2: data.customField2 || '',
        department: data.department || '',
        location: data.location || '',
        notes: data.notes || '',
        status: data.status || 'ACTIVE',
      });

      if (data.contactPersons && data.contactPersons.length > 0) {
        setContactPersons(data.contactPersons.map((cp, i) => ({
          ...cp,
          tempId: cp.id || i,
        })));
      }
    } catch (error) {
      console.error('Error fetching vendor:', error);
      alert('Failed to load vendor data.');
    } finally {
      setLoading(false);
    }
  };

  // ─── FORM HANDLERS ────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyBillingToShipping = (e) => {
    const checked = e.target.checked;
    setCopyBillingToShipping(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shippingStreet: prev.billingStreet,
        shippingCity: prev.billingCity,
        shippingState: prev.billingState,
        shippingZip: prev.billingZip,
        shippingCountry: prev.billingCountry,
      }));
    }
  };

  const handleContactPersonChange = (index, field, value) => {
    const updated = [...contactPersons];
    updated[index][field] = value;
    setContactPersons(updated);
  };

  const addContactPerson = () => {
    setContactPersons([...contactPersons, {
      tempId: Date.now(),
      firstName: '', lastName: '', email: '',
      phone: '', mobile: '', designation: '',
      sequence: contactPersons.length,
    }]);
  };

  const removeContactPerson = (index) => {
    if (contactPersons.length > 1) {
      setContactPersons(contactPersons.filter((_, i) => i !== index));
    }
  };

  // ─── SUBMIT ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        ...formData,
        contactPersons: contactPersons.map((cp, i) => ({
          id: typeof cp.id === 'number' ? cp.id : undefined,
          firstName: cp.firstName,
          lastName: cp.lastName,
          email: cp.email,
          phone: cp.phone,
          mobile: cp.mobile,
          designation: cp.designation,
          sequence: i,
        })),
      };

      const url = isEditMode ? `${API_BASE}/${id}` : API_BASE;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save vendor');
      }

      navigate('/finance/payments/vendors');
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Error saving vendor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'other', label: 'Other Details' },
    { id: 'address', label: 'Address' },
    { id: 'contact', label: 'Contact Persons' },
    { id: 'custom', label: 'Custom Fields' },
    { id: 'tags', label: 'Reporting Tags' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Vendor' : 'New Vendor'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update vendor information' : 'Add a new vendor to your database'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
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
            {/* Basic Information */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Display Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="vendorDisplayName" value={formData.vendorDisplayName}
                      onChange={handleChange} required placeholder="Enter vendor name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input type="text" name="companyName" value={formData.companyName}
                      onChange={handleChange} placeholder="Enter company name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Email <span className="text-red-500">*</span>
                    </label>
                    <input type="email" name="vendorEmail" value={formData.vendorEmail}
                      onChange={handleChange} required placeholder="email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Phone</label>
                    <input type="tel" name="vendorPhone" value={formData.vendorPhone}
                      onChange={handleChange} placeholder="+94 11 234 5678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input type="text" name="website" value={formData.website}
                      onChange={handleChange} placeholder="www.example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Other Details */}
            {activeTab === 'other' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select name="currency" value={formData.currency} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="LKR">LKR - Sri Lankan Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms (Days)</label>
                  <select name="paymentTerms" value={formData.paymentTerms} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="0">Due on Receipt</option>
                    <option value="7">Net 7</option>
                    <option value="15">Net 15</option>
                    <option value="30">Net 30</option>
                    <option value="45">Net 45</option>
                    <option value="60">Net 60</option>
                    <option value="90">Net 90</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Treatment</label>
                  <select name="gstTreatment" value={formData.gstTreatment} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="REGISTERED">Registered Business - Regular</option>
                    <option value="UNREGISTERED">Unregistered Business</option>
                    <option value="EXEMPT">Exempt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                  <input type="text" name="gstNumber" value={formData.gstNumber}
                    onChange={handleChange} placeholder="Enter GST number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input type="text" name="panNumber" value={formData.panNumber}
                    onChange={handleChange} placeholder="Enter PAN number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            )}

            {/* Address */}
            {activeTab === 'address' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Billing Address</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                      <input type="text" name="billingStreet" value={formData.billingStreet}
                        onChange={handleChange} placeholder="Street address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'billingCity', label: 'City', placeholder: 'City' },
                        { name: 'billingState', label: 'State/Province', placeholder: 'State/Province' },
                        { name: 'billingZip', label: 'Postal Code', placeholder: 'Postal code' },
                        { name: 'billingCountry', label: 'Country', placeholder: 'Country' },
                      ].map(field => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                          <input type="text" name={field.name} value={formData[field.name]}
                            onChange={handleChange} placeholder={field.placeholder}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="copyBilling" checked={copyBillingToShipping}
                    onChange={handleCopyBillingToShipping} className="mr-2" />
                  <label htmlFor="copyBilling" className="text-sm text-gray-700">
                    Copy billing address to shipping address
                  </label>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Shipping Address</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                      <input type="text" name="shippingStreet" value={formData.shippingStreet}
                        onChange={handleChange} placeholder="Street address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'shippingCity', label: 'City', placeholder: 'City' },
                        { name: 'shippingState', label: 'State/Province', placeholder: 'State/Province' },
                        { name: 'shippingZip', label: 'Postal Code', placeholder: 'Postal code' },
                        { name: 'shippingCountry', label: 'Country', placeholder: 'Country' },
                      ].map(field => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                          <input type="text" name={field.name} value={formData[field.name]}
                            onChange={handleChange} placeholder={field.placeholder}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Persons */}
            {activeTab === 'contact' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Contact Persons</h3>
                  <button type="button" onClick={addContactPerson}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    + Add Contact Person
                  </button>
                </div>
                <div className="space-y-6">
                  {contactPersons.map((person, index) => (
                    <div key={person.tempId || index} className="border border-gray-300 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-700">Contact Person {index + 1}</h4>
                        {contactPersons.length > 1 && (
                          <button type="button" onClick={() => removeContactPerson(index)}
                            className="text-red-600 hover:text-red-800 text-sm">
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { field: 'firstName', label: 'First Name', type: 'text', placeholder: 'First name' },
                          { field: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Last name' },
                          { field: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
                          { field: 'phone', label: 'Phone', type: 'tel', placeholder: '+94 11 234 5678' },
                          { field: 'mobile', label: 'Mobile', type: 'tel', placeholder: '+94 77 123 4567' },
                          { field: 'designation', label: 'Designation', type: 'text', placeholder: 'e.g. Sales Manager' },
                        ].map(({ field, label, type, placeholder }) => (
                          <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                            <input type={type} value={person[field]}
                              onChange={(e) => handleContactPersonChange(index, field, e.target.value)}
                              placeholder={placeholder}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {activeTab === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Field 1</label>
                  <input type="text" name="customField1" value={formData.customField1}
                    onChange={handleChange} placeholder="Enter custom field value"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Field 2</label>
                  <input type="text" name="customField2" value={formData.customField2}
                    onChange={handleChange} placeholder="Enter custom field value"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4}
                    placeholder="Add any notes about this vendor..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            )}

            {/* Reporting Tags */}
            {activeTab === 'tags' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input type="text" name="department" value={formData.department}
                    onChange={handleChange} placeholder="e.g. Raw Materials"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input type="text" name="location" value={formData.location}
                    onChange={handleChange} placeholder="e.g. Main Warehouse"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/finance/payments/vendors')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Saving...' : isEditMode ? 'Update Vendor' : 'Create Vendor'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VendorFormPage;