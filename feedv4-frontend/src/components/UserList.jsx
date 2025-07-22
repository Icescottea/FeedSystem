import React from 'react';

const UserList = ({ users, onEdit, onToggle, onDelete }) => {
  if (!users.length) return <p className="text-gray-500">No users found.</p>;

  return (
    <table className="min-w-full bg-white shadow-md rounded mt-4 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 text-left">Full Name</th>
          <th className="px-4 py-2 text-left">Email</th>
          <th className="px-4 py-2 text-left">Role</th>
          <th className="px-4 py-2 text-left">Active</th>
          <th className="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id} className="border-t">
            <td className="px-4 py-2">{user.fullName}</td>
            <td className="px-4 py-2">{user.email}</td>
            <td className="px-4 py-2">{user.role}</td>
            <td className="px-4 py-2">
              {user.active ? '✅ Active' : '❌ Inactive'}
            </td>
            <td className="px-4 py-2 space-x-2">
              <button className="text-blue-600" onClick={() => onEdit(user)}>Edit</button>
              <button className="text-yellow-600" onClick={() => onToggle(user.id)}>
                {user.active ? 'Deactivate' : 'Activate'}
              </button>
              <button className="text-red-600" onClick={() => onDelete(user.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserList;
