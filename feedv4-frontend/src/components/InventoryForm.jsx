import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const InventoryForm = ({ item, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    id: undefined,
    name: '',
    type: '',
    costPerKg: '',
    inStockKg: '',
    expiryDate: '',
    supplier: '',
    batchId: '',
    qualityGrade: '',
    cp: '',
    me: '',
    calcium: '',
    fat: '',
    fiber: '',
    ash: '',
    locked: false,
    archived: false,
    // read-only WACM display (if backend provides)
    weightedAvgCost: '',
    totalValue: '',
  });

  useEffect(() => {
    if (item) {
      setForm({
        id: item.id,
        name: item.name ?? '',
        type: item.type ?? '',
        costPerKg: item.costPerKg ?? '',
        inStockKg: item.inStockKg ?? '',
        expiryDate: item.expiryDate ?? '',
        supplier: item.supplier ?? '',
        batchId: item.batchId ?? '',
        qualityGrade: item.qualityGrade ?? '',
        cp: item.cp ?? '',
        me: item.me ?? '',
        calcium: item.calcium ?? '',
        fat: item.fat ?? '',
        fiber: item.fiber ?? '',
        ash: item.ash ?? '',
        locked: !!item.locked,
        archived: !!item.archived,
        weightedAvgCost: item.weightedAvgCost ?? '',
        totalValue: item.totalValue ?? '',
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: form.id,
      name: form.name.trim(),
      type: form.type.trim(),
      costPerKg: parseFloat(form.costPerKg) || 0,
      inStockKg: parseFloat(form.inStockKg) || 0,
      expiryDate: form.expiryDate,
      supplier: form.supplier.trim(),
      batchId: form.batchId.trim(),
      qualityGrade: form.qualityGrade.trim(),
      cp: parseFloat(form.cp) || 0,
      me: parseFloat(form.me) || 0,
      calcium: parseFloat(form.calcium) || 0,
      fat: parseFloat(form.fat) || 0,
      fiber: parseFloat(form.fiber) || 0,
      ash: parseFloat(form.ash) || 0,
      locked: !!form.locked,
      archived: !!form.archived,
    };

    const method = item ? 'PUT' : 'POST';
    const url = item
      ? `${API_BASE}/api/inventory/${item.id}`
      : `${API_BASE}/api/inventory`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    onSuccess();
  };

  const FIELDS = [
    ['name', 'Name', 'text'],
    ['type', 'Type', 'text'],
    ['costPerKg', 'Cost per Kg (initial/base)', 'number'],
    ['inStockKg', 'Stock (Kg)', 'number'],
    ['expiryDate', 'Expiry Date', 'date'],
    ['supplier', 'Supplier', 'text'],
    ['batchId', 'Batch ID', 'text'],
    ['qualityGrade', 'Quality Grade', 'text'],
    ['cp', 'CP', 'number'],
    ['me', 'ME', 'number'],
    ['calcium', 'Calcium', 'number'],
    ['fat', 'Fat', 'number'],
    ['fiber', 'Fiber', 'number'],
    ['ash', 'Ash', 'number'],
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow-md border mt-6 w-full max-w-full overflow-hidden"
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        {item ? 'Edit Raw Material' : 'Add Raw Material'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
        {FIELDS.map(([name, label, type]) => (
          <div key={name} className="flex flex-col">
            <label htmlFor={name} className="block text-gray-600 mb-1 whitespace-nowrap">
              {label}
            </label>
            <input
              id={name}
              name={name}
              type={type}
              value={form[name]}
              onChange={handleChange}
              required={['name', 'type', 'costPerKg', 'inStockKg'].includes(name)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              step={type === 'number' ? 'any' : undefined}
              min={type === 'number' ? '0' : undefined}
            />
          </div>
        ))}

        {/* Read-only WACM display when editing */}
        {item && (
          <>
            <div className="flex flex-col">
              <label className="block text-gray-600 mb-1 whitespace-nowrap">Weighted Avg Cost (WAC)</label>
              <input
                type="number"
                value={form.weightedAvgCost || 0}
                readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded px-2 py-1.5 text-gray-600"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-gray-600 mb-1 whitespace-nowrap">Total Value</label>
              <input
                type="number"
                value={form.totalValue || 0}
                readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded px-2 py-1.5 text-gray-600"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center mt-4 gap-4 text-xs sm:text-sm">
        <label className="flex items-center gap-2 text-gray-700">
          <input
            name="locked"
            type="checkbox"
            checked={form.locked}
            onChange={handleChange}
            className="accent-blue-600"
          />
          Locked
        </label>
      </div>

      <div className="flex justify-end mt-6 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm"
        >
          {item ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
};

export default InventoryForm;
