import React, { useEffect, useState } from 'react';
import PelletingStatusUpdater from './PelletingStatusUpdater';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const MyPelletingBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = () => {
    fetch(`${API_BASE}/api/pelleting/my-batches`)
      .then(res => res.json())
      .then(data => {
        setBatches(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch operator batches", err);
        setBatches([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-gray-600 py-6">
        <p className="text-sm">Loading your batches...</p>
      </div>
    );
  }

  if (!batches.length) {
    return (
      <div className="px-4 sm:px-6 text-gray-600 py-6">
        <p className="text-sm">No batches assigned to you.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 pb-6">
      <h2 className="text-xl font-semibold text-gray-800 pt-4">My Pelleting Batches</h2>

      {batches.map(batch => (
        <div
          key={batch.id}
          className="bg-white border rounded-md shadow p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p><span className="font-medium">Formulation:</span> {batch.formulation?.name || '-'}</p>
              <p><span className="font-medium">Target Quantity:</span> {batch.targetQuantityKg} kg</p>
              <p><span className="font-medium">Status:</span> {batch.status}</p>
            </div>
            <div>
              <p><span className="font-medium">Machine:</span> {batch.machineUsed || '-'}</p>
              <p><span className="font-medium">Started At:</span> {batch.startedAt?.substring(0,16) || '-'}</p>
            </div>
          </div>

          <div className="mt-4">
            <PelletingStatusUpdater
              batchId={batch.id}
              onUpdated={fetchBatches}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyPelletingBatches;
