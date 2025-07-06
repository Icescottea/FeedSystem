import React, { useEffect, useState } from 'react';
import PelletingStatusUpdater from './PelletingStatusUpdater';

const MyPelletingBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = () => {
    fetch('/api/pelleting/my-batches')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBatches(data);
        } else {
          console.error("Expected an array but got:", data);
          setBatches([]); // fallback
        }
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

  if (loading) return <p>Loading your batches...</p>;
  if (!Array.isArray(batches) || batches.length === 0) return <p>No batches assigned to you.</p>;

  return (
    <div>
      <h2>My Pelleting Batches</h2>
      {batches.map(batch => (
        <div key={batch.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 20 }}>
          <p><strong>Formulation:</strong> {batch.formulation?.name || 'Unnamed'}</p>
          <p><strong>Target Quantity:</strong> {batch.targetQuantityKg} kg</p>
          <p><strong>Status:</strong> {batch.status}</p>
          <p><strong>Machine:</strong> {batch.machineUsed}</p>
          <p><strong>Started At:</strong> {batch.startedAt || '-'}</p>

          <PelletingStatusUpdater
            batchId={batch.id}
            onUpdated={fetchBatches}
          />
        </div>
      ))}
    </div>
  );
};

export default MyPelletingBatches;
