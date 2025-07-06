import React, { useState } from 'react';

const PelletingStatusUpdater = ({ batchId, onUpdated }) => {
  const [status, setStatus] = useState('');
  const [yieldKg, setYieldKg] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = async () => {
    const payload = {
      status,
      actualYieldKg: parseFloat(yieldKg),
      operatorComments: comments
    };

    const res = await fetch(`/api/pelleting/${batchId}/update-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('Status updated!');
      onUpdated?.();
    } else {
      alert('Failed to update.');
    }
  };

  return (
    <div>
      <h3>Update Status</h3>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">Select status</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
      </select>
      <br />
      <input
        type="number"
        placeholder="Actual Yield (kg)"
        value={yieldKg}
        onChange={e => setYieldKg(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Operator comments"
        value={comments}
        onChange={e => setComments(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default PelletingStatusUpdater;
