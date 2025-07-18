import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

import InventoryList from '../components/InventoryList';
import InventoryForm from '../components/InventoryForm';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  /* ───────── fetch helpers ───────── */
  const fetchInventory = async () => {
    const url = showArchived ? '/api/inventory/all' : '/api/inventory';
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

  const handleDelete  = (id) => fetch(`/api/inventory/${id}`,           { method: 'DELETE' }).then(refreshAndClose);
  const handleArchive = (id) => fetch(`/api/inventory/${id}/toggle-archive`, { method: 'PUT'    }).then(refreshAndClose);

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

  const handleUpload = async () => {
    if (!excelFile) return;
    const formData = new FormData();
    formData.append('file', excelFile);

    const res = await fetch('/api/inventory/bulk-upload', { method: 'POST', body: formData });
    if (res.ok) {
      setPreviewData([]);
      fetchInventory();
    } else console.error('❌ Upload failed');
  };

  /* ───────── low‑stock check ───────── */
  const handleLowStockCheck = async () => {
    const res = await fetch('/api/inventory/low-stock');
    setLowStockItems(await res.json());
  };

  /* filter active/archived */
  const filteredInventory = showArchived
    ? inventory
    : inventory.filter((i) => !i.archived);

  /* ───────── render ───────── */
  return (
    <div className="w-full max-w-full mx-auto p-4 text-xs text-gray-800">
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
      <div className="bg-white rounded-lg shadow-md border p-4 max-w-full overflow-hidden mb-6">
        <h2 className="text-lg font-medium mb-2">Bulk Upload</h2>
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
          showArchived={showArchived}
        />
      )}

      {/* ───── Low‑Stock Section ───── */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-6 max-w-full">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Low Stock (≤ 50 kg)
          </h3>
          {/* simply render InventoryList—its internal wrapper will scroll the table */}
          <InventoryList
            inventory={lowStockItems}
            onEdit={(itm) => { setSelectedItem(itm); setShowForm(true); }}
            onDelete={handleDelete}
            onArchive={handleArchive}
            showArchived={false}
          />
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
