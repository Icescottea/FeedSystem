import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const PelletingBatchList = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const FINANCE_ROUTE = '/finance/invoices';

  const fetchBatches = () => {
    fetch(`${API_BASE}/api/pelleting/batches`)
      .then(res => res.json())
      .then(data => setBatches(Array.isArray(data) ? data : []))
      .catch(() => setBatches([]));
  };

  const handleStart = async (batchId) => {
    const machineUsed = prompt("Enter machine used:");
    const operatorId = prompt("Enter operator ID (must have OPERATOR role):");
    if (!machineUsed || !operatorId) return alert("Machine and operator are required");

    const res = await fetch(`${API_BASE}/api/pelleting/${batchId}/start`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineUsed, operatorId: Number(operatorId) })
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      return alert(`Failed to start batch. ${msg || ''}`);
    }
    fetchBatches();
  };

  const handleComplete = async (batchId) => {
    const operatorComments = prompt("Enter operator comments (required):");
    if (!operatorComments) return alert("Comments are required");

    const res = await fetch(`${API_BASE}/api/pelleting/${batchId}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorComments })
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      return alert(`Failed to complete batch. ${msg || ''}`);
    }

    // Refresh to reflect status change
    fetchBatches();

    // Redirect to Finance
    setTimeout(() => navigate(FINANCE_ROUTE), 500);
  };
  
  const handleSendToFinance = async (id) => {
    const res = await fetch(`${API_BASE}/api/pelleting/${id}/send-to-finance`, {
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
                  <td className="px-3 py-2">{b.operator?.fullName || b.operator?.name || '-'}</td>
                  <td className="px-3 py-2">{b.status}</td>
                  <td className="px-3 py-2">{b.targetQuantityKg}</td>
                  <td className="px-3 py-2">{b.actualYieldKg ?? '-'}</td>
                  <td className="px-3 py-2">{b.startTime?.substring(0,16) || '-'}</td>
                  <td className="px-3 py-2">{b.endTime?.substring(0,16) || '-'}</td>
                  <td className="px-3 py-2">{b.timeTakenMinutes || '-'}</td>
                  <td className="px-3 py-2 truncate max-w-[150px]">{b.operatorComments || '-'}</td>
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
                      <span className="text-gray-500 text-xs select-none cursor-not-allowed">
                        Ready for Invoicing
                      </span>
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
