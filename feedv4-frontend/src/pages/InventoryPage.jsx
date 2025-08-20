import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

import InventoryList from '../components/InventoryList';
import InventoryForm from '../components/InventoryForm';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // ───── Audit state ─────
  const [auditMaterialId, setAuditMaterialId] = useState('');
  const [auditFrom, setAuditFrom] = useState(''); // yyyy-mm-ddThh:mm
  const [auditTo, setAuditTo] = useState('');
  const [movements, setMovements] = useState([]);
  const [mvLoading, setMvLoading] = useState(false);

  const fetchInventory = async () => {
    const url = showArchived ? `${API_BASE}/api/inventory/all` : `${API_BASE}/api/inventory`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setInventory(await res.json());
    } catch (err) {
      console.error('❌ Error fetching inventory:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [showArchived]);

  const refreshAndClose = () => {
    fetchInventory();
    setShowForm(false);
  };

  const handleDelete  = (id) => { 
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;
    
    fetch(`${API_BASE}/api/inventory/${id}`, { method: 'DELETE' })
      .then(refreshAndClose)
      .catch(err => console.error('❌ Error deleting item:', err));
  };

  const handleArchive = (id) =>
    fetch(`${API_BASE}/api/inventory/${id}/toggle-archive`, { method: 'PUT' })
      .then(fetchInventory)
      .catch(err => console.error('❌ Error archiving item:', err));

  // ───── Bulk Upload ─────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      setPreviewData(XLSX.utils.sheet_to_json(firstSheet));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCancelUpload = () => {
    setPreviewData([]);
    setExcelFile(null);
    setErrorMsg('');
  };

  const handleUpload = async () => {
    if (!excelFile) return;
    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const res = await fetch(`${API_BASE}/api/inventory/bulk-upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Unknown error");
      }

      setPreviewData([]);
      setExcelFile(null);
      setErrorMsg('');
      fetchInventory();
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setErrorMsg(err.message || "Upload failed. Please check your file format.");
    }
  };

  const handleToggleLock = async (id) => {
    await fetch(`${API_BASE}/api/inventory/${id}/toggle-lock`, { method: 'PUT' });
    fetchInventory();
  };

  const handleLowStockCheck = async () => {
    const res = await fetch(`${API_BASE}/api/inventory/low-stock`);
    setLowStockItems(await res.json());
  };

  // ===== WACM: Receive & Issue =====
  const handleReceive = async (item) => {
    const qtyStr  = prompt(`Receive quantity (kg) for "${item.name}":`, '');
    if (qtyStr === null) return;
    const qty = Number(qtyStr);
    if (!qty || qty <= 0) return alert('Invalid quantity');

    const unitCostStr = prompt(`Unit cost (Rs/kg) for this receipt:`, `${item.costPerKg ?? ''}`);
    if (unitCostStr === null) return;
    const unitCost = Number(unitCostStr);
    if (!unitCost || unitCost <= 0) return alert('Invalid unit cost');

    const reference = prompt('Reference (optional):', '') || undefined;

    try {
      const res = await fetch(`${API_BASE}/api/wacm/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawMaterialId: item.id,
          quantity: qty,
          unitCost,
          reference
        })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchInventory();
      alert('Stock received (WAC updated).');
    } catch (e) {
      console.error(e);
      alert('Receive failed.');
    }
  };

  const handleIssue = async (item) => {
    const qtyStr  = prompt(`Issue quantity (kg) from "${item.name}":`, '');
    if (qtyStr === null) return;
    const qty = Number(qtyStr);
    if (!qty || qty <= 0) return alert('Invalid quantity');

    const reference = prompt('Reference (optional):', '') || undefined;

    try {
      const res = await fetch(`${API_BASE}/api/wacm/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawMaterialId: item.id,
          quantity: qty,
          reference
        })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchInventory();
      alert('Stock issued (valued at current WAC).');
    } catch (e) {
      console.error(e);
      alert('Issue failed.');
    }
  };

  const filteredInventory = showArchived ? inventory : inventory.filter((i) => !i.archived);

  // ===== Audit fetch =====
  const fetchMovements = async () => {
    if (!auditMaterialId) {
      setMovements([]);
      return;
    }
    try {
      setMvLoading(true);
      const qs = new URLSearchParams();
      qs.set('rawMaterialId', auditMaterialId);
      if (auditFrom) qs.set('from', new Date(auditFrom).toISOString());
      if (auditTo)   qs.set('to',   new Date(auditTo).toISOString());
      const res = await fetch(`${API_BASE}/api/wacm/movements?${qs.toString()}`);
      const data = await res.json();
      setMovements(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load movements', e);
      setMovements([]);
    } finally {
      setMvLoading(false);
    }
  };

  const fmtDateTime = (v) => {
    if (!v) return '-';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '-' : d.toLocaleString();
  };
  const asNum = (n) => (n === null || n === undefined ? '-' : Number(n).toFixed(2));

  return (
    <div
      className="w-full max-w-full mx-auto p-4 text-xs text-gray-800 overflow-x-hidden"
      style={{ maxWidth: 'calc(100vw - 258px)' }}
    >
      {/* header bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowArchived((s) => !s)}
            className={`px-3 py-1 rounded ${showArchived ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          <button
            onClick={() => { setSelectedItem(null); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
          >
            Add Raw Material
          </button>
          <button
            onClick={handleLowStockCheck}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
          >
            Check Low Stock
          </button>
        </div>
      </div>

      {/* ───── Bulk Upload Card ───── */}
      <div
        className="bg-white rounded-lg shadow-md border p-4 max-w-full overflow-hidden mb-6"
        style={{ maxWidth: 'calc(100vw - 298px)' }}
      >
        <h2 className="text-lg font-medium mb-2">Bulk Upload</h2>
        {errorMsg && <div className="text-red-600 mb-2 text-sm font-medium">⚠️ {errorMsg}</div>}
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="file:mr-4 file:py-1 file:px-3 file:border-0 file:rounded file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
        />

        {previewData.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Preview</h3>
            <div className="overflow-x-auto border rounded">
              <table className="min-w-[800px] text-xs border-collapse">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    {Object.keys(previewData[0]).map((k) => (
                      <th key={k} className="px-2 py-1 border whitespace-nowrap">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="even:bg-gray-50">
                      {Object.values(row).map((val, idx) => (
                        <td key={idx} className="px-2 py-1 border whitespace-nowrap">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={handleUpload} className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded">
              Confirm Upload
            </button>
            <button onClick={handleCancelUpload} className="mt-3 ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ───── Form OR List ───── */}
      {showForm ? (
        <InventoryForm
          item={selectedItem}
          onSuccess={refreshAndClose}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <InventoryList
          inventory={filteredInventory}
          onEdit={(itm) => { setSelectedItem(itm); setShowForm(true); }}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onToggleLock={handleToggleLock}
          showArchived={showArchived}
          onReceive={handleReceive}
          onIssue={handleIssue}
        />
      )}

      {/* ───── Low-Stock Section ───── */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-6 overflow-hiddens">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Low Stock (≤ 50 kg)
          </h3>
          <InventoryList
            inventory={lowStockItems}
            onEdit={(itm) => { setSelectedItem(itm); setShowForm(true); }}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onToggleLock={handleToggleLock}
            showArchived={false}
            onReceive={handleReceive}
            onIssue={handleIssue}
          />
        </div>
      )}

      {/* ───── Audit History (WACM Movements) ───── */}
      <div
        className="bg-white rounded-lg shadow-md border p-4 mt-6"
        style={{ maxWidth: 'calc(100vw - 298px)' }}
      >
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={auditMaterialId}
              onChange={(e) => setAuditMaterialId(e.target.value)}
            >
              <option value="">-- Select Raw Material --</option>
              {inventory.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="datetime-local"
              value={auditFrom}
              onChange={e => setAuditFrom(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="datetime-local"
              value={auditTo}
              onChange={e => setAuditTo(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={fetchMovements}
            className="bg-gray-800 hover:bg-black text-white text-sm px-4 py-2 rounded"
            disabled={!auditMaterialId || mvLoading}
          >
            {mvLoading ? 'Loading…' : 'Load Movements'}
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-[1100px] table-auto text-xs w-full">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Qty (kg)</th>
                <th className="px-3 py-2 text-right">Unit Cost</th>
                <th className="px-3 py-2 text-right">Total Cost</th>
                <th className="px-3 py-2 text-right">Balance Qty</th>
                <th className="px-3 py-2 text-right">Balance Cost</th>
                <th className="px-3 py-2 text-left">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 py-4 text-center text-gray-500">
                    {auditMaterialId ? 'No movements found for selection.' : 'Select a material to view movements.'}
                  </td>
                </tr>
              ) : movements.map((mv, idx) => (
                <tr key={idx} className="hover:bg-gray-50 whitespace-nowrap">
                  <td className="px-3 py-2">{fmtDateTime(mv.movementDate)}</td>
                  <td className="px-3 py-2">{mv.movementType}</td>
                  <td className="px-3 py-2 text-right">{asNum(mv.quantity)}</td>
                  <td className="px-3 py-2 text-right">{asNum(mv.unitCostAtMovement)}</td>
                  <td className="px-3 py-2 text-right">{asNum(mv.totalCost)}</td>
                  <td className="px-3 py-2 text-right">{asNum(mv.balanceQtyAfter)}</td>
                  <td className="px-3 py-2 text-right">{asNum(mv.balanceCostAfter)}</td>
                  <td className="px-3 py-2">{mv.reference || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ───── End Audit History ───── */}
    </div>
  );
};

export default InventoryPage;
