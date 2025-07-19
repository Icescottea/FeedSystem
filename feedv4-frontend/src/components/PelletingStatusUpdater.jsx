import React, { useState } from 'react';

const PelletingStatusUpdater = ({ batchId, onUpdated }) => {
  const [status, setStatus] = useState('');
  const [yieldKg, setYieldKg] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = async () => {
    const payload = {
      status,
      actualYieldKg: yieldKg ? parseFloat(yieldKg) : null,
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
    <div className="max-w-md mx-auto px-4 sm:px-6 text-gray-800">
      <div className="bg-white border rounded-md shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">Update Status</h3>

        {/* Status Select */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select status</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Actual Yield */}
        <div>
          <label htmlFor="yieldKg" className="block text-sm font-medium text-gray-700 mb-1">
            Actual Yield (kg)
          </label>
          <input
            id="yieldKg"
            type="number"
            placeholder="e.g., 950"
            value={yieldKg}
            onChange={e => setYieldKg(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Operator Comments */}
        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
            Operator Comments
          </label>
          <textarea
            id="comments"
            placeholder="Any notes..."
            value={comments}
            onChange={e => setComments(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none h-24 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md shadow-sm"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PelletingStatusUpdater;
