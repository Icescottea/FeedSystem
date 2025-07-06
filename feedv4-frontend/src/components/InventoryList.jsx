import React from 'react';

const InventoryList = ({ inventory, onEdit, onDelete, onArchive, showArchived}) => {
  if (!inventory || inventory.length === 0) {
    return (
      <p>
        {showArchived 
          ? 'No archived inventory found.' 
          : 'No active inventory found.'}
      </p>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Cost (Rs/kg)</th>
          <th>Stock (kg)</th>
          <th>Expiry Date</th>
          <th>Supplier</th>
          <th>Batch ID</th>
          <th>Quality Grade</th>
          <th>CP</th>
          <th>ME</th>
          <th>Calcium</th>
          <th>Fat</th>
          <th>Fiber</th>
          <th>Ash</th>
          <th>Locked</th>
          <th>Archived</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {inventory.map((item) => (
          <tr key={item.id} style={{ color: item.archived ? 'gray' : 'black' }}>            <td>{item.name}</td>
            <td>{item.type}</td>
            <td>{item.costPerKg}</td>
            <td>{item.inStockKg}</td>
            <td>{item.expiryDate}</td>
            <td>{item.supplier}</td>
            <td>{item.batchId}</td>
            <td>{item.qualityGrade}</td>
            <td>{item.cp}</td>
            <td>{item.me}</td>
            <td>{item.calcium}</td>
            <td>{item.fat}</td>
            <td>{item.fiber}</td>
            <td>{item.ash}</td>
            <td>
              <input type="checkbox" checked={item.locked} readOnly />
            </td>
            <td>{item.archived ? 'Archived' : 'Active'}</td>
            <td>
              {!item.locked && (
                <>
                  <button onClick={() => onEdit(item)}>Edit</button>
                  <button onClick={() => onDelete(item.id)}>Delete</button>
                  <button onClick={() => onArchive(item.id)}>
                    {item.archived ? 'Unarchive' : 'Archive'}
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventoryList;
