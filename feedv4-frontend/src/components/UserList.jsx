import React from 'react';

const UserList = ({ users, onEdit, onToggle, onDelete }) => {
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-gray-600">
        <p className="text-sm italic">No users found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="bg-white border rounded-md shadow p-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] table-auto text-sm text-left w-full">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2">Full Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Roles</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 whitespace-nowrap">
                  <td className="px-3 py-2">{user.fullName}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">{user.roles}</td>
                  <td className="px-3 py-2">{user.active ? '✅ Active' : '❌ Inactive'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-3 text-xs">
                      <button
                        onClick={() => onEdit(user)}
                        className="text-blue-600 hover:underline px-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onToggle(user.id)}
                        className="text-yellow-600 hover:underline px-1"
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
                        className="text-red-600 hover:underline px-1"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
