import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fields mirror CustomerDTO exactly.
  // paymentTerms is kept as a string for <select>, parsed to Integer before sending.
  const [formData, setFormData] = useState({
    customerName:    '',
    companyName:     '',
    email:           '',
    phone:           '',
    mobile:          '',
    website:         '',
    currency:        'LKR',
    paymentTerms:    '30',
    gstTreatment:    '',
    gstNumber:       '',
    panNumber:       '',
    billingStreet:   '',
    billingCity:     '',
    billingState:    '',
    billingZip:      '',
    billingCountry:  'Sri Lanka',
    shippingStreet:  '',
    shippingCity:    '',
    shippingState:   '',
    shippingZip:     '',
    shippingCountry: 'Sri Lanka',
    department:      '',
    location:        '',
    notes:           '',
    status:          'ACTIVE',
  });

  // Contact persons managed separately (maps to CustomerContactPersonDTO list)
  const [contactPersons, setContactPersons] = useState([
    { firstName: '', lastName: '', email: '', phone: '', mobile: '', designation: '', sequence: 0 }
  ]);

  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

  useEffect(() => {
    if (isEditMode) fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`);
      if (!response.ok) throw new Error('Failed to fetch customer');
      const data = await response.json();

      setFormData({
        customerName:    data.customerName    || '',
        companyName:     data.companyName     || '',
        email:           data.email           || '',
        phone:           data.phone           || '',
        mobile:          data.mobile          || '',
        website:         data.website         || '',
        currency:        data.currency        || 'LKR',
        paymentTerms:    data.paymentTerms != null ? String(data.paymentTerms) : '30',
        gstTreatment:    data.gstTreatment    || '',
        gstNumber:       data.gstNumber       || '',
        panNumber:       data.panNumber       || '',
        billingStreet:   data.billingStreet   || '',
        billingCity:     data.billingCity     || '',
        billingState:    data.billingState    || '',
        billingZip:      data.billingZip      || '',
        billingCountry:  data.billingCountry  || 'Sri Lanka',
        shippingStreet:  data.shippingStreet  || '',
        shippingCity:    data.shippingCity    || '',
        shippingState:   data.shippingState   || '',
        shippingZip:     data.shippingZip     || '',
        shippingCountry: data.shippingCountry || 'Sri Lanka',
        department:      data.department      || '',
        location:        data.location        || '',
        notes:           data.notes           || '',
        status:          data.status          || 'ACTIVE',
      });

      if (data.contactPersons && data.contactPersons.length > 0) {
        setContactPersons(data.contactPersons.map(cp => ({
          id:          cp.id,
          firstName:   cp.firstName   || '',
          lastName:    cp.lastName    || '',
          email:       cp.email       || '',
          phone:       cp.phone       || '',
          mobile:      cp.mobile      || '',
          designation: cp.designation || '',
          sequence:    cp.sequence    ?? 0,
        })));
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Error loading customer details. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

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
        shippingStreet:  prev.billingStreet,
        shippingCity:    prev.billingCity,
        shippingState:   prev.billingState,
        shippingZip:     prev.billingZip,
        shippingCountry: prev.billingCountry,
      }));
    }
  };

  const handleContactChange = (index, e) => {
    const { name, value } = e.target;
    setContactPersons(prev => prev.map((cp, i) => i === index ? { ...cp, [name]: value } : cp));
  };

  const addContactPerson = () => {
    setContactPersons(prev => [
      ...prev,
      { firstName: '', lastName: '', email: '', phone: '', mobile: '', designation: '', sequence: prev.length }
    ]);
  };

  const removeContactPerson = (index) => {
    setContactPersons(prev => prev.filter((_, i) => i !== index));
  };

  // Build payload that matches CustomerDTO field-for-field.
  // Phantom fields (customerType, salutation, firstName, lastName,
  // displayName, creditLimit, openingBalance) are intentionally excluded —
  // the backend DTO does not have them and @Valid will reject unknown fields
  // if Spring is configured strictly.
  const buildPayload = () => ({
    customerName:    formData.customerName,
    companyName:     formData.companyName     || null,
    email:           formData.email,
    phone:           formData.phone           || null,
    mobile:          formData.mobile          || null,
    website:         formData.website         || null,
    currency:        formData.currency,
    paymentTerms:    parseInt(formData.paymentTerms, 10),
    gstTreatment:    formData.gstTreatment    || null,
    gstNumber:       formData.gstNumber       || null,
    panNumber:       formData.panNumber       || null,
    billingStreet:   formData.billingStreet   || null,
    billingCity:     formData.billingCity     || null,
    billingState:    formData.billingState    || null,
    billingZip:      formData.billingZip      || null,
    billingCountry:  formData.billingCountry  || null,
    shippingStreet:  formData.shippingStreet  || null,
    shippingCity:    formData.shippingCity    || null,
    shippingState:   formData.shippingState   || null,
    shippingZip:     formData.shippingZip     || null,
    shippingCountry: formData.shippingCountry || null,
    department:      formData.department      || null,
    location:        formData.location        || null,
    notes:           formData.notes           || null,
    status:          formData.status,
    contactPersons:  contactPersons
      .filter(cp => cp.firstName.trim())   // skip empty rows
      .map((cp, i) => ({ ...cp, sequence: i })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard required DB-level fields before hitting the server
    if (!formData.customerName.trim()) {
      alert('Customer Name is required.');
      setActiveTab('basic');
      return;
    }
    if (!formData.email.trim()) {
      alert('Email is required.');
      setActiveTab('contact');
      return;
    }

    try {
      setLoading(true);
      const url    = isEditMode ? `${API_BASE_URL}/api/customers/${id}` : `${API_BASE_URL}/customers`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save customer');
      }

      alert(isEditMode ? 'Customer updated successfully!' : 'Customer created successfully!');
      navigate('/finance/sales/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic',      label: 'Basic Information' },
    { id: 'contact',    label: 'Contact Details' },
    { id: 'address',    label: 'Addresses' },
    { id: 'financial',  label: 'Financial' },
    { id: 'additional', label: 'Additional' },
  ];

  if (fetchLoading) {
    return <div className="p-6 text-center text-gray-500">Loading customer...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/finance/sales/customers')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Customers
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Customer' : 'New Customer'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update customer information' : 'Add a new customer to your database'}
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

            {/* ── Basic Information ── */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Department"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Contact Persons */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-medium text-gray-800">Contact Persons</h3>
                    <button
                      type="button"
                      onClick={addContactPerson}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Add Contact
                    </button>
                  </div>
                  <div className="space-y-4">
                    {contactPersons.map((cp, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-600">Contact {index + 1}</span>
                          {contactPersons.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeContactPerson(index)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input type="text" name="firstName" value={cp.firstName}
                            onChange={e => handleContactChange(index, e)} placeholder="First Name"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                          <input type="text" name="lastName" value={cp.lastName}
                            onChange={e => handleContactChange(index, e)} placeholder="Last Name"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                          <input type="text" name="designation" value={cp.designation}
                            onChange={e => handleContactChange(index, e)} placeholder="Designation"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                          <input type="email" name="email" value={cp.email}
                            onChange={e => handleContactChange(index, e)} placeholder="Email"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                          <input type="tel" name="phone" value={cp.phone}
                            onChange={e => handleContactChange(index, e)} placeholder="Phone"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                          <input type="tel" name="mobile" value={cp.mobile}
                            onChange={e => handleContactChange(index, e)} placeholder="Mobile"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Contact Details ── */}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+94 11 234 5678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+94 77 123 4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input type="text" name="website" value={formData.website} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="www.example.com" />
                </div>
              </div>
            )}

            {/* ── Addresses ── */}
            {activeTab === 'address' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Billing Address</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                      <input type="text" name="billingStreet" value={formData.billingStreet} onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Street address" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input type="text" name="billingCity" value={formData.billingCity} onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="City" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                        <input type="text" name="billingState" value={formData.billingState} onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="State/Province" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                        <input type="text" name="billingZip" value={formData.billingZip} onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Postal code" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input type="text" name="billingCountry" value={formData.billingCountry} onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Country" />
                      </div>
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
                      <input type="text" name="shippingStreet" value={formData.shippingStreet} onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Street address" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input type="text" name="shippingCity" value={formData.shippingCity} onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="City" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                        <input type="text" name="shippingState" value={formData.shippingState} onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="State/Province" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                        <input type="text" name="shippingZip" value={formData.shippingZip} onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Postal code" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input type="text" name="shippingCountry" value={formData.shippingCountry} onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Country" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Financial ── */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select name="currency" value={formData.currency} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="LKR">LKR - Sri Lankan Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-800 mb-3">Tax Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GST Treatment</label>
                      <select name="gstTreatment" value={formData.gstTreatment} onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select GST Treatment</option>
                        <option value="REGISTERED">Registered</option>
                        <option value="UNREGISTERED">Unregistered</option>
                        <option value="EXEMPT">Exempt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                      <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="GST registration number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                      <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="PAN number" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Additional ── */}
            {activeTab === 'additional' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional notes about this customer..."
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/finance/sales/customers')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Customer' : 'Create Customer')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerFormPage;