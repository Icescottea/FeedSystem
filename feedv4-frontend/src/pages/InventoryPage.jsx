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

  /* ───────── fetch helpers ───────── */
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

  const handleArchive = (id) => fetch(`${API_BASE}/api/inventory/${id}/toggle-archive`, { method: 'PUT' })

  /* ───────── excel upload ───────── */
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
        const err = await res.text(); // Expecting meaningful backend error string
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

  /* ───────── low‑stock check ───────── */
  const handleLowStockCheck = async () => {
    const res = await fetch(`${API_BASE}/api/inventory/low-stock`);
    setLowStockItems(await res.json());
  };

  /* filter active/archived */
  const filteredInventory = showArchived
    ? inventory
    : inventory.filter((i) => !i.archived);

  /* ───────── render ───────── */
  return (
    <div className="w-full max-w-full mx-auto p-4 text-xs text-gray-800 overflow-x-hidden"
    style={{maxWidth: 'calc(100vw - 258px)'
      }}>
      {/* header bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowArchived((s) => !s)}
            className={`px-3 py-1 rounded ${
              showArchived ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
            }`}
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
      <div className="bg-white rounded-lg shadow-md border p-4 max-w-full overflow-hidden mb-6"
          style={{
        /* 
           100vw minus: 
           - 16rem sidebar (256px) 
           - 2rem page padding (32px) 
           = calc(100vw - 288px)
        */
        maxWidth: 'calc(100vw - 298px)'
      }}>
        <h2 className="text-lg font-medium mb-2">Bulk Upload</h2>
        {errorMsg && (
          <div className="text-red-600 mb-2 text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}
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
                      <th
                        key={k}
                        className="px-2 py-1 border whitespace-nowrap"
                      >
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="even:bg-gray-50">
                      {Object.values(row).map((val, idx) => (
                        <td
                          key={idx}
                          className="px-2 py-1 border whitespace-nowrap"
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleUpload}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
            >
              Confirm Upload
            </button>

            <button
              onClick={handleCancelUpload}
              className="mt-3 ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded"
            >
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
        />
      )}

      {/* ───── Low‑Stock Section ───── */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-6 overflow-hiddens">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Low Stock (≤ 50 kg)
          </h3>
          <InventoryList
            inventory={lowStockItems}
            onEdit={(itm) => { setSelectedItem(itm); setShowForm(true); }}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onToggleLock={handleToggleLock}
            showArchived={false}
          />
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
