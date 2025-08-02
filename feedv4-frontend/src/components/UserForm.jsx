import React, { useState, useEffect } from 'react';

const UserForm = ({ onSubmit, onCancel, editingUser }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    roles: ['OPERATOR'],
    active: true
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({ 
        fullName: editingUser.fullName || '', 
        email: editingUser.email || '', 
        password: '', 
        roles: editingUser.roles || ['OPERATOR'], 
        active: editingUser.active ?? true 
      });
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
    if (editingUser) {
      onSubmit({ ...formData, id: editingUser.id }); // update
    } else {
      if (!formData.password) {
        alert("Password cannot be blank for new users.");
        return;
      }
      onSubmit(formData); // create
    }
  
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      password: '',
      roles: ['OPERATOR'],
      active: true
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white border rounded-md shadow p-6 space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        {editingUser ? 'Edit User' : 'Create User'}
      </h2>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Password (only on create) */}
        {!editingUser && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Roles
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['ADMIN', 'FORMULATOR', 'INVENTORY_MANAGER', 'FINANCE_OFFICER', 'OPERATOR'].map(roles => (
              <label key={roles} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  name="roles"
                  value={roles}
                  checked={formData.roles?.includes(roles)}
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    setFormData(prev => ({
                      ...prev,
                      roles: checked
                        ? [...(prev.roles || []), value]
                        : prev.roles.filter(r => r !== value)
                    }));
                  }}
                  className="mr-2"
                />
                {roles}
              </label>
            ))}
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="active" className="ml-2 text-sm text-gray-700">
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        {editingUser && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md"
        >
          {editingUser ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
