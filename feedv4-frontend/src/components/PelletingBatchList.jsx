import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const PelletingBatchList = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [showView, setShowView] = useState(false);
  const [viewRows, setViewRows] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');
  const INVOICE_NEW_ROUTE = '/finance/invoices/new';
  const [statusFilter, setStatusFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const fetchBatches = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    params.set('archived', String(showArchived));
    fetch(`${API_BASE}/api/pelleting/batches?` + params.toString())
      .then(res => res.json())
      .then(data => setBatches(Array.isArray(data) ? data : []))
      .catch(() => setBatches([]));
  };

  const handleView = async (batchId) => {
    setShowView(true);
    setViewLoading(true);
    setViewError('');
    setViewRows([]);
    try {
      const res = await fetch(`${API_BASE}/api/pelleting/${batchId}/ingredients`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setViewRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setViewError('Failed to load ingredients');
    } finally {
      setViewLoading(false);
    }
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
    
    setTimeout(() => navigate(`${INVOICE_NEW_ROUTE}?batchId=${batchId}`), 1000);
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
  }, [statusFilter, showArchived]);

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

      <div className="flex items-center gap-3 mb-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={e => setShowArchived(e.target.checked)}
          />
          Show archived
        </label>
      </div>

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
                    {b.status && (
                      <button
                        onClick={() => handleView(b.id)}
                        className="text-indigo-600 hover:underline text-xs"
                      >
                        View
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        const res = await fetch(`${API_BASE}/api/pelleting/${b.id}/archive?archived=${!b.archived}`, { method: 'PATCH' });
                        if (!res.ok) return alert('Failed to toggle archive');
                        fetchBatches();
                      }}
                      className="text-yellow-700 hover:underline text-xs"
                    >
                      {b.archived ? 'Unarchive' : 'Archive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[640px] max-w-[95vw] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Formulation Ingredients</h3>
              <button
                onClick={() => setShowView(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            
            {viewLoading && <div className="text-sm text-gray-600">Loading…</div>}
            {viewError && <div className="text-sm text-red-600">{viewError}</div>}
            
            {!viewLoading && !viewError && (
              <div className="overflow-x-auto">
                <table className="min-w-[520px] table-auto text-sm w-full">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Ingredient</th>
                      <th className="px-3 py-2 text-right">% Incl.</th>
                      <th className="px-3 py-2 text-right">Kg (batch)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {viewRows.map((r, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{r.name}</td>
                        <td className="px-3 py-2 text-right">{Number(r.percentage ?? 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">{Number(r.quantityKg ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    {viewRows.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-3 py-3 text-center text-gray-500">
                          No ingredients found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
      
            <div className="mt-4 text-right">
              <button
                onClick={() => setShowView(false)}
                className="px-4 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PelletingBatchList;
