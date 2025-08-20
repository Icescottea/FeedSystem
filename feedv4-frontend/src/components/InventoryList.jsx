import React from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const InventoryList = ({
  inventory,
  onEdit,
  onDelete,
  onArchive,
  onToggleLock,
  showArchived,
  onReceive,     // NEW
  onIssue        // NEW
}) => {
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
      style={{ maxWidth: 'calc(100vw - 298px)' }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-[1500px] table-auto text-xs text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {[
                'Name', 'Type',
                'Avg Cost (WAC)', // NEW
                'Cost (base)',
                'Stock',
                'Total Value',    // NEW
                'Expiry',
                'Supplier', 'Batch', 'Grade', 'CP', 'ME', 'Ca', 'Fat', 'Fiber', 'Ash',
                '🔒', 'Status', 'Actions'
              ].map(col => (
                <th key={col} className="px-3 py-2 whitespace-nowrap">{col}</th>
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
                <td className="px-3 py-2 max-w-[150px] truncate" title={item.name}>{item.name}</td>
                <td className="px-3 py-2">{item.type}</td>

                {/* NEW: WAC */}
                <td className="px-3 py-2">{item.weightedAvgCost ?? '-'}</td>

                {/* Base cost (legacy field) */}
                <td className="px-3 py-2">{item.costPerKg}</td>

                <td className="px-3 py-2">{item.inStockKg}</td>

                {/* NEW: Total Value */}
                <td className="px-3 py-2">{item.totalValue ?? (item.inStockKg && item.weightedAvgCost ? (item.inStockKg * item.weightedAvgCost).toFixed(2) : '-')}</td>

                <td className="px-3 py-2">{item.expiryDate}</td>
                <td className="px-3 py-2 max-w-[150px] truncate" title={item.supplier}>{item.supplier}</td>
                <td className="px-3 py-2 max-w-[150px] truncate" title={item.batchId}>{item.batchId}</td>
                <td className="px-3 py-2 max-w-[120px] truncate" title={item.qualityGrade}>{item.qualityGrade}</td>
                <td className="px-3 py-2">{item.cp}</td>
                <td className="px-3 py-2">{item.me}</td>
                <td className="px-3 py-2">{item.calcium}</td>
                <td className="px-3 py-2">{item.fat}</td>
                <td className="px-3 py-2">{item.fiber}</td>
                <td className="px-3 py-2">{item.ash}</td>

                <td className="px-3 py-2 text-center">
                  <input type="checkbox" checked={item.locked} readOnly />
                </td>

                <td className="px-3 py-2">{item.archived ? 'Archived' : 'Active'}</td>

                <td className="px-3 py-2 whitespace-nowrap">
                  {item.locked ? (
                    <button
                      onClick={() => onToggleLock(item.id)}
                      className="text-indigo-600 hover:underline px-1"
                    >
                      Unlock
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button onClick={() => onEdit(item)} className="text-blue-600 hover:underline px-1">Edit</button>
                      <button onClick={() => onArchive(item.id)} className="text-yellow-600 hover:underline px-1">
                        {item.archived ? 'Unarchive' : 'Archive'}
                      </button>
                      <button onClick={() => onToggleLock(item.id)} className="text-indigo-600 hover:underline px-1">Lock</button>
                      <button onClick={() => onDelete(item.id)} className="text-red-600 hover:underline px-1">Delete</button>

                      {/* NEW: WACM actions */}
                      <button
                        onClick={() => onReceive?.(item)}
                        className="text-green-700 hover:underline px-1"
                        title="Receive stock (updates WAC)"
                      >
                        Receive
                      </button>
                      <button
                        onClick={() => onIssue?.(item)}
                        className="text-pink-700 hover:underline px-1"
                        title="Issue stock (uses current WAC)"
                      >
                        Issue
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
