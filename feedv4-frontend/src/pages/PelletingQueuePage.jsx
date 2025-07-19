import React from 'react';
import PelletingBatchForm from '../components/PelletingBatchForm';
import PelletingBatchList from '../components/PelletingBatchList';
import MyPelletingBatches from '../components/MyPelletingBatches';

const PelletingQueuePage = () => {
  return (
    <div className="w-full max-w-full mx-auto p-4 text-xs text-gray-800 overflow-x-hidden" style={{maxWidth: 'calc(100vw - 298px)'}}>
      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-4">Pelleting Queue</h1>

      {/* Create Batch Form */}
      <section>
        <PelletingBatchForm />
      </section>

      {/* Admin View: All Batches */}
      <section>
        <PelletingBatchList />
      </section>

      {/* Operator View: My Batches */}
      <section>
        <MyPelletingBatches />
      </section>
    </div>
  );
};

export default PelletingQueuePage;
