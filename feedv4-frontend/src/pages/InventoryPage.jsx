import React, { useState, useEffect } from 'react';
import InventoryList from '../components/InventoryList';
import InventoryForm from '../components/InventoryForm';
import * as XLSX from 'xlsx';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  const fetchInventory = () => {
    const url = showArchived ? '/api/inventory/all' : '/api/inventory';

    console.log(`📡 Fetching from: ${url}`);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("📦 Raw data from backend:", data);
        setInventory(data);
      })
      .catch(err => {
        console.error("❌ Error fetching inventory:", err);
      });
  };

  useEffect(() => {
    fetchInventory();
  }, [showArchived]);

  const handleAddClick = () => {
    setSelectedItem(null);
    setShowForm(true);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleSuccess = () => {
    console.log("✅ Operation successful, refreshing inventory...");
    fetchInventory();
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
    console.log(`🗑 Deleted item with ID ${id}`);
    handleSuccess();
  };

  const handleArchive = async (id) => {
    await fetch(`/api/inventory/${id}/toggle-archive`, { method: 'PUT' });
    console.log(`📁 Toggled archive status for item ID ${id}`);
    handleSuccess();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(firstSheet);
      setPreviewData(parsedData);
      console.log("📄 Excel Preview:", parsedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const response = await fetch('/api/inventory/bulk-upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('✅ Upload successful');
        setPreviewData([]);
        fetchInventory();
      } else {
        console.error('❌ Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
    }
  };

  const handleLowStockCheck = async () => {
    const res = await fetch('/api/inventory/low-stock');
    const data = await res.json();
    setLowStockItems(data);
    console.log("⚠️ Low Stock Items:", data);
  };

  const filteredInventory = showArchived
    ? inventory
    : inventory.filter(item => !item.archived);

  console.log("📋 Displaying items:", filteredInventory);

  return (
    <div>
      <h1>Inventory</h1>

      <button onClick={() => setShowArchived(!showArchived)}>
        {showArchived ? 'Hide Archived' : 'Show Archived'}
      </button>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />

      {previewData.length > 0 && (
        <div>
          <h3>Preview</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(previewData[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, idx) => (
                    <td key={idx}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleUpload}>Confirm Upload</button>
        </div>
      )}

      {!showForm && <button onClick={handleAddClick}>Add Raw Material</button>}

      {showForm && (
        <InventoryForm
          item={selectedItem}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      <InventoryList
        inventory={filteredInventory}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onArchive={handleArchive}
        showArchived={showArchived}
      />

      <button onClick={handleLowStockCheck}>Check Low Stock</button>
      {lowStockItems.length > 0 && (
        <div>
          <h3>⚠️ Low Stock (≤ 50kg)</h3>
          <InventoryList inventory={lowStockItems} />
        </div>
      )}

    </div>
  );
};

export default InventoryPage;
