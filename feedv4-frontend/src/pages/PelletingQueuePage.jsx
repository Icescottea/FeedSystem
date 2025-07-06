import React from 'react';
import PelletingBatchList from '../components/PelletingBatchList';
import PelletingBatchForm from '../components/PelletingBatchForm';
import MyPelletingBatches from '../components/MyPelletingBatches';

const PelletingQueuePage = () => {
  return (
    <div>
      <h1>Pelleting Queue</h1>

      {/* Render both admin and operator components for testing */}
      <PelletingBatchForm />
      <PelletingBatchList isAdmin={true} />
      <MyPelletingBatches />
    </div>
  );
};

export default PelletingQueuePage;
