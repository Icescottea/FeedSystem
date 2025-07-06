import React, { useState, useEffect } from 'react';

const PelletingBatchList = () => {
  const [batches, setBatches] = useState([]);

  const fetchBatches = () => {
    fetch('/api/pelleting')
      .then(res => res.json())
      .then(setBatches);
  };

  const handleComplete = async (id) => {
    const actualYieldKg = prompt("Enter actual yield (kg):");
    const comments = prompt("Enter operator comments:");

    if (!actualYieldKg) return;

    const res = await fetch(`/api/pelleting/${id}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actualYieldKg: parseFloat(actualYieldKg),
        operatorComments: comments,
      })
    });

    if (res.ok) {
      alert("Marked as completed");
      fetchBatches();
    } else {
      alert("Failed to complete batch");
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div>
      <h2>📦 Pelleting Queue</h2>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Formulation</th>
            <th>Machine</th>
            <th>Operator</th>
            <th>Status</th>
            <th>Target Qty</th>
            <th>Yield</th>
            <th>Started</th>
            <th>Ended</th>
            <th>Comments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.formulation?.name}</td>
              <td>{b.machine}</td>
              <td>{b.operator?.name}</td>
              <td>{b.status}</td>
              <td>{b.targetQuantityKg}</td>
              <td>{b.actualYieldKg || '-'}</td>
              <td>{b.startTime?.substring(0, 16) || '-'}</td>
              <td>{b.endTime?.substring(0, 16) || '-'}</td>
              <td>{b.operatorComments || '-'}</td>
              <td>
                {b.status !== 'COMPLETED' && (
                  <button onClick={() => handleComplete(b.id)}>Mark Complete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PelletingBatchList;
