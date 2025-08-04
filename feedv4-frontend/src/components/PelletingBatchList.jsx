import React, { useState, useEffect } from 'react';

const PelletingBatchList = () => {
  const [batches, setBatches] = useState([]);

  const fetchBatches = () => {
    fetch('/api/pelleting')
      .then(res => res.json())
      .then(data => setBatches(Array.isArray(data) ? data : []))
      .catch(() => setBatches([]));
  };

  const handleStart = async (id) => {
    const machine = prompt("Enter machine used:");
    const operatorId = prompt("Enter operator ID:");

    if (!machine || !operatorId) return alert("Required fields missing");

    const res = await fetch(`/api/pelleting/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formulationId: id, // If it's the formulation ID (adjust if needed)
        targetQuantityKg: 1000, // Or read from batch itself
        machineUsed: machine,
        operatorId: operatorId
      })
    });

    res.ok ? fetchBatches() : alert("Failed to start batch");
  };

  const handleComplete = async (id) => {
    const actualYieldKg = prompt("Enter actual yield (kg):");
    const comments = prompt("Enter operator comments:");
    const rawLeftovers = prompt("Enter leftover materials (comma-separated):");
    const wastage = prompt("Enter total wastage (kg):");
    
    if (!actualYieldKg || !wastage) return alert("Yield and wastage required");
    
    const res = await fetch(`/api/pelleting/${id}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actualYieldKg: parseFloat(actualYieldKg),
        operatorComments: comments,
        leftoverRawMaterials: rawLeftovers?.split(',').map(x => x.trim()),
        totalWastageKg: parseFloat(wastage)
      })
    });
  
    res.ok ? fetchBatches() : alert("Failed to mark as complete");
  };
  
  const handleSendToFinance = async (id) => {
    const res = await fetch(`/api/pelleting/${id}/send-to-finance`, {
      method: 'POST'
    });
    const msg = await res.text();
    res.ok ? alert(msg) : alert("Failed to send to finance");
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md border p-4 overflow-hidden mb-6"
      style={{
        /* 
           100vw minus: 
           - 16rem sidebar (256px) 
           - 2rem page padding (32px) 
           = calc(100vw - 288px)
        */
        maxWidth: 'calc(100vw - 298px)'
      }}>
      <h2 className="text-xl font-semibold mb-4">📦 Pelleting Queue</h2>

      <div className="bg-white border rounded-lg shadow-md p-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] table-auto text-xs text-left w-full">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Formulation</th>
                <th className="px-3 py-2">Machine</th>
                <th className="px-3 py-2">Operator</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Target Qty</th>
                <th className="px-3 py-2">Yield</th>
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Ended</th>
                <th className="px-3 py-2">Time Taken (min)</th>
                <th className="px-3 py-2">Comments</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(batches) && batches.map(b => (
                <tr key={b.id} className="border-t hover:bg-gray-50 whitespace-nowrap">
                  <td className="px-3 py-2">{b.id}</td>
                  <td className="px-3 py-2">{b.formulation?.name || '-'}</td>
                  <td className="px-3 py-2">{b.machine || '-'}</td>
                  <td className="px-3 py-2">{b.operator?.name || '-'}</td>
                  <td className="px-3 py-2">{b.status}</td>
                  <td className="px-3 py-2">{b.targetQuantityKg}</td>
                  <td className="px-3 py-2">{b.actualYieldKg ?? '-'}</td>
                  <td className="px-3 py-2">{b.startTime?.substring(0,16) || '-'}</td>
                  <td className="px-3 py-2">{b.endTime?.substring(0,16) || '-'}</td>
                  <td className="px-3 py-2">{b.timeTakenMinutes || '-'}</td>
                  <td className="px-3 py-2 truncate max-w-[150px]">{b.operatorComments || '-'}</td>
                  <td className="px-3 py-2">
                    {b.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleComplete(b.id)}
                        className="text-blue-600 hover:underline text-xs px-1"
                      >
                        Mark Complete
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2 space-x-2">
                    {b.status === 'Not Started' && (
                      <button
                        onClick={() => handleStart(b.id)}
                        className="text-green-600 hover:underline text-xs"
                      >
                        Start
                      </button>
                    )}
                    {b.status === 'In Progress' && (
                      <button
                        onClick={() => handleComplete(b.id)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Complete
                      </button>
                    )}
                    {b.status === 'Completed' && (
                      <button
                        onClick={() => handleSendToFinance(b.id)}
                        className="text-purple-600 hover:underline text-xs"
                      >
                        Send to Finance
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PelletingBatchList;
