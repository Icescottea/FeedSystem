import React, { useState, useEffect } from 'react';

const FeeConfigPage = () => {
  const [configs, setConfigs] = useState([]);
  const [form, setForm] = useState({
    serviceType: '',
    feeType: '',
    rate: 0,
    percentage: false,
  });

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/charges-config');
      const data = await res.json();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch configs:", err);
      setConfigs([]);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/charges-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert('Configuration saved');
        await fetchConfigs();
        setForm({ serviceType: '', feeType: '', rate: 0, percentage: false });
      } else {
        alert('Failed to save configuration');
      }
    } catch (err) {
      console.error("Failed to save config:", err);
      alert('Failed to save configuration');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this config?')) return;
    try {
      await fetch(`/api/charges-config/${id}`, { method: 'DELETE' });
      await fetchConfigs();
    } catch (err) {
      console.error("Failed to delete config:", err);
      alert('Failed to delete configuration');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-gray-800 space-y-8">
      {/* Page Title */}
      <h2 className="text-2xl font-semibold">⚙️ Fee Configuration</h2>

      {/* Form Card */}
      <div className="bg-white border rounded-md shadow p-6">
        <h3 className="text-lg font-medium mb-4">Add / Edit Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Service Type */}
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <input
              id="serviceType"
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Fee Type */}
          <div>
            <label htmlFor="feeType" className="block text-sm font-medium text-gray-700 mb-1">
              Fee Type
            </label>
            <input
              id="feeType"
              name="feeType"
              value={form.feeType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Rate */}
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
              Rate
            </label>
            <input
              id="rate"
              name="rate"
              type="number"
              value={form.rate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Percentage */}
          <div className="flex items-center mt-6 sm:mt-0">
            <input
              id="percentage"
              name="percentage"
              type="checkbox"
              checked={form.percentage}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="percentage" className="ml-2 text-sm text-gray-700">
              Percentage Based
            </label>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-md shadow-sm"
          >
            Save Config
          </button>
        </div>
      </div>

      {/* Existing Configs Table */}
      <div className="bg-white border rounded-md shadow p-6 overflow-x-auto">
        <h3 className="text-lg font-medium mb-4">Existing Configurations</h3>
        {configs.length === 0 ? (
          <p className="text-sm text-gray-600">No configurations found.</p>
        ) : (
          <table className="min-w-[700px] table-auto text-sm text-left w-full">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2">Service</th>
                <th className="px-3 py-2">Fee Type</th>
                <th className="px-3 py-2">Rate</th>
                <th className="px-3 py-2">Is %</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {configs.map(cfg => (
                <tr key={cfg.id} className="hover:bg-gray-50 whitespace-nowrap">
                  <td className="px-3 py-2">{cfg.serviceType}</td>
                  <td className="px-3 py-2">{cfg.feeType}</td>
                  <td className="px-3 py-2">{cfg.rate}</td>
                  <td className="px-3 py-2">{cfg.percentage ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDelete(cfg.id)}
                      className="text-red-600 hover:underline text-sm px-1"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FeeConfigPage;
