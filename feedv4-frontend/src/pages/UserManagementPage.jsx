import React, { useState, useEffect } from 'react';
import UserList from '../components/UserList';
import UserForm from '../components/UserForm';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = () => {
    fetch(`${API_BASE}/api/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  };

  useEffect(fetchUsers, []);

  const handleSubmit = async (data) => {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id 
      ? `${API_BASE}/api/users/${data.id}` 
      : `${API_BASE}/api/users/create`;

    const payload = { ...data };

    // 🔥 Skip blank password on update
    if (data.id && (!data.password || data.password.trim() === '')) {
      delete payload.password;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      fetchUsers();
      setEditingUser(null);
    }
  };

  const handleToggle = async (id) => {
    await fetch(`${API_BASE}/api/users/${id}/toggle-active`, { method: 'PUT' });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this user?')) {
      await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">👥 User Management</h1>
      <UserForm 
        onSubmit={handleSubmit} 
        editingUser={editingUser} 
        onCancel={() => setEditingUser(null)} 
      />
      <UserList 
        users={users} 
        onEdit={setEditingUser} 
        onToggle={handleToggle} 
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default UserManagementPage;
