import React, { useState, useEffect } from 'react';

const UserForm = ({ onSubmit, onCancel, editingUser }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'OPERATOR',
    active: true
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({ ...editingUser, password: '' }); // keep password optional
    }
  }, [editingUser]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'OPERATOR',
      active: true
    });
  };

  return (
    <form className="bg-white p-4 rounded shadow-md space-y-3 mt-4" onSubmit={handleSubmit}>
      <h3 className="font-semibold">{editingUser ? 'Edit User' : 'Create User'}</h3>
      <input
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Full Name"
        required
        className="w-full border p-2 rounded"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        type="email"
        required
        className="w-full border p-2 rounded"
      />
      {!editingUser && (
        <input
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          required
          className="w-full border p-2 rounded"
        />
      )}
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        {['ADMIN', 'FORMULATOR', 'INVENTORY_MANAGER', 'FINANCE_OFFICER', 'OPERATOR'].map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <label className="flex items-center space-x-2">
        <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
        <span>Active</span>
      </label>
      <div className="space-x-3">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingUser ? 'Update' : 'Create'}
        </button>
        {editingUser && (
          <button type="button" onClick={onCancel} className="text-gray-600">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default UserForm;
