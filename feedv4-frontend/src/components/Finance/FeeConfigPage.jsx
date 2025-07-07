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

      if (Array.isArray(data)) {
        setConfigs(data);
      } else {
        console.error("Expected array but got:", data);
        setConfigs([]);
      }
    } catch (err) {
      console.error("Failed to fetch configs:", err);
      setConfigs([]);
    }
  };

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
        setForm({
          serviceType: '',
          feeType: '',
          rate: 0,
          percentage: false,
        });
      } else {
        alert('Failed to save configuration');
      }
    } catch (err) {
      console.error("Failed to save config:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this config?')) return;

    try {
      await fetch(`/api/charges-config/${id}`, {
        method: 'DELETE',
      });
      await fetchConfigs();
    } catch (err) {
      console.error("Failed to delete config:", err);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return (
    <div>
      <h2>⚙️ Fee Configuration</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>Service Type:</label>
        <input name="serviceType" value={form.serviceType} onChange={handleChange} />

        <label>Fee Type:</label>
        <input name="feeType" value={form.feeType} onChange={handleChange} />

        <label>Rate:</label>
        <input
          type="number"
          name="rate"
          value={form.rate}
          onChange={handleChange}
        />

        <label>
          <input
            type="checkbox"
            name="percentage"
            checked={form.percentage}
            onChange={handleChange}
          />
          Percentage Based
        </label>

        <button onClick={handleSubmit}>Save Config</button>
      </div>

      <hr />

      <h3>Existing Configs</h3>
      {configs.length === 0 ? (
        <p>No configurations found.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Service</th>
              <th>Fee Type</th>
              <th>Rate</th>
              <th>Is %</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((cfg) => (
              <tr key={cfg.id}>
                <td>{cfg.serviceType}</td>
                <td>{cfg.feeType}</td>
                <td>{cfg.rate}</td>
                <td>{cfg.percentage ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => handleDelete(cfg.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FeeConfigPage;
