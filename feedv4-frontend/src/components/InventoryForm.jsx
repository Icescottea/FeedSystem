import React, { useState, useEffect } from 'react';

const InventoryForm = ({ item, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
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
    locked: false
  });

  useEffect(() => {
    if (item) setForm(item);
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm({ ...form, [name]: inputType === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: form.id,
      name: form.name,
      type: form.type,
      costPerKg: parseFloat(form.costPerKg),
      inStockKg: parseFloat(form.inStockKg),
      expiryDate: form.expiryDate,
      supplier: form.supplier,
      batchId: form.batchId,
      qualityGrade: form.qualityGrade,     
      cp: parseFloat(form.cp),
      me: parseFloat(form.me),
      calcium: parseFloat(form.calcium),
      fat: parseFloat(form.fat),
      fiber: parseFloat(form.fiber),
      ash: parseFloat(form.ash),
      locked: form.locked || false,
      archived: form.archived || false
    };

    const method = item ? 'PUT' : 'POST';
    const url = item ? `/api/inventory/${item.id}` : '/api/inventory';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input name="type" placeholder="Type" value={form.type} onChange={handleChange} required />
      <input name="costPerKg" type="number" placeholder="Cost per Kg" value={form.costPerKg} onChange={handleChange} required />
      <input name="inStockKg" type="number" placeholder="Stock (Kg)" value={form.inStockKg} onChange={handleChange} required />
      <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} />
      <input name="supplier" placeholder="Supplier" value={form.supplier} onChange={handleChange} />
      <input name="batchId" placeholder="Batch ID" value={form.batchId} onChange={handleChange} />
      <input name="qualityGrade" placeholder="Grade" value={form.qualityGrade} onChange={handleChange} />
      <input name="cp" type="number" placeholder="CP" value={form.cp} onChange={handleChange} />
      <input name="me" type="number" placeholder="ME" value={form.me} onChange={handleChange} />
      <input name="calcium" type="number" placeholder="Calcium" value={form.calcium} onChange={handleChange} />
      <input name="fat" type="number" placeholder="Fat" value={form.fat} onChange={handleChange} />
      <input name="fiber" type="number" placeholder="Fiber" value={form.fiber} onChange={handleChange} />
      <input name="ash" type="number" placeholder="Ash" value={form.ash} onChange={handleChange} />
      <label>
        Locked: <input name="locked" type="checkbox" checked={form.locked} onChange={handleChange} />
      </label>
      <button type="submit">{item ? 'Update' : 'Add'}</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default InventoryForm;
