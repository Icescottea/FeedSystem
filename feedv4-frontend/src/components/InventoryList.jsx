import React from 'react';

const InventoryList = ({ inventory, onEdit, onDelete, onArchive, showArchived }) => {
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
        /* 
           100vw minus: 
           - 16rem sidebar (256px) 
           - 2rem page padding (32px) 
           = calc(100vw - 288px)
        */
        maxWidth: 'calc(100vw - 298px)'
      }}
    >
      {/* *** Only THIS scrolls horizontally *** */}
      <div className="overflow-x-auto">
        <table className="min-w-[1400px] table-auto text-xs text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {[
                'Name','Type','Cost','Stock','Expiry',
                'Supplier','Batch','Grade','CP','ME',
                'Ca','Fat','Fiber','Ash','🔒','Status','Actions'
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
                {[
                  item.name, item.type, item.costPerKg, item.inStockKg,
                  item.expiryDate, item.supplier, item.batchId,
                  item.qualityGrade, item.cp, item.me,
                  item.calcium, item.fat, item.fiber, item.ash
                ].map((val, i) => (
                  <td key={i} className="px-3 py-2 whitespace-nowrap">
                    {val}
                  </td>
                ))}

                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <input type="checkbox" checked={item.locked} readOnly />
                </td>

                <td className="px-3 py-2 whitespace-nowrap">
                  {item.archived ? 'Archived' : 'Active'}
                </td>

                <td className="px-3 py-2 whitespace-nowrap">
                  {!item.locked ? (
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:underline px-1"
                      >Edit</button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:underline px-1"
                      >Delete</button>
                      <button
                        onClick={() => onArchive(item.id)}
                        className="text-yellow-600 hover:underline px-1"
                      >
                        {item.archived ? 'Unarchive' : 'Archive'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">Locked</span>
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
