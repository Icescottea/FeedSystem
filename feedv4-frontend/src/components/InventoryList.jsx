import React from 'react';

const InventoryList = ({ inventory, onEdit, onDelete, onArchive, onToggleLock, showArchived }) => {
  if (!inventory || inventory.length === 0) {
    return (
      <p className="text-gray-500 italic mt-4">
        {showArchived ? 'No archived inventory found.' : 'No active inventory found.'}
      </p>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md border p-4 overflow-hidden"
      style={{
        maxWidth: 'calc(100vw - 298px)'
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-[1400px] table-auto text-xs text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {[
                'Name', 'Type', 'Cost', 'Stock', 'Expiry',
                'Supplier', 'Batch', 'Grade', 'CP', 'ME',
                'Ca', 'Fat', 'Fiber', 'Ash', '🔒', 'Status', 'Actions'
              ].map(col => (
                <th key={col} className="px-3 py-2 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr
                key={item.id}
                className={`border-t hover:bg-gray-50 ${
                  item.archived ? 'text-gray-400 italic' : 'text-gray-800'
                }`}
              >
                {/* Name */}
                <td className="px-3 py-2 max-w-[150px] truncate" title={item.name}>
                  {item.name}
                </td>

                {/* Type */}
                <td className="px-3 py-2">{item.type}</td>

                {/* Cost */}
                <td className="px-3 py-2">{item.costPerKg}</td>

                {/* Stock */}
                <td className="px-3 py-2">{item.inStockKg}</td>

                {/* Expiry */}
                <td className="px-3 py-2">{item.expiryDate}</td>

                {/* Supplier */}
                <td className="px-3 py-2 max-w-[150px] truncate" title={item.supplier}>
                  {item.supplier}
                </td>

                {/* Batch */}
                <td className="px-3 py-2 max-w-[150px] truncate" title={item.batchId}>
                  {item.batchId}
                </td>

                {/* Grade */}
                <td className="px-3 py-2 max-w-[120px] truncate" title={item.qualityGrade}>
                  {item.qualityGrade}
                </td>

                {/* CP */}
                <td className="px-3 py-2">{item.cp}</td>

                {/* ME */}
                <td className="px-3 py-2">{item.me}</td>

                {/* Ca */}
                <td className="px-3 py-2">{item.calcium}</td>

                {/* Fat */}
                <td className="px-3 py-2">{item.fat}</td>

                {/* Fiber */}
                <td className="px-3 py-2">{item.fiber}</td>

                {/* Ash */}
                <td className="px-3 py-2">{item.ash}</td>

                {/* Locked */}
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" checked={item.locked} readOnly />
                </td>

                {/* Status */}
                <td className="px-3 py-2">
                  {item.archived ? 'Archived' : 'Active'}
                </td>

                {/* Actions */}
                <td className="px-3 py-2 whitespace-nowrap">
                  {item.locked ? (
                    <button
                      onClick={() => onToggleLock(item.id)}
                      className="text-indigo-600 hover:underline px-1"
                    >
                      Unlock
                    </button>
                  ) : (
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:underline px-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onArchive(item.id)}
                        className="text-yellow-600 hover:underline px-1"
                      >
                        {item.archived ? 'Unarchive' : 'Archive'}
                      </button>
                      <button
                        onClick={() => onToggleLock(item.id)}
                        className="text-indigo-600 hover:underline px-1"
                      >
                        Lock
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:underline px-1"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
