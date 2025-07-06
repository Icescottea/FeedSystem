import React, { useState, useEffect } from 'react';

const PelletingBatchForm = () => {
  const [formulations, setFormulations] = useState([]);
  const [operators, setOperators] = useState([]);
  const [form, setForm] = useState({
    formulationId: '',
    targetQuantityKg: 1000,
    machine: '',
    operatorId: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { formulationId, targetQuantityKg, machine, operatorId } = form;

    if (!formulationId || !operatorId || !machine) {
      alert("Fill all fields");
      return;
    }

    const res = await fetch('/api/pelleting/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formulationId,
        targetQuantityKg,
        machineUsed: machine,
        operatorId
      })
    });

    if (res.ok) {
      alert("Batch created");
      setForm({
        formulationId: '',
        targetQuantityKg: 1000,
        machine: '',
        operatorId: '',
      });
    } else {
      alert("Failed to create batch");
    }
  };

  useEffect(() => {
    fetch('/api/formulations')
      .then(res => res.json())
      .then(data => setFormulations(data.filter(f => f.finalized)));

    fetch('/api/users/operators')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOperators(data);
        } else {
          console.error("Expected an array, got:", data);
          setOperators([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch operators", err);
        setOperators([]);
      });
  }, []);

  return (
    <div>
      <h2>➕ Create Pelleting Batch</h2>

      <label>Formulation:</label>
      <select name="formulationId" value={form.formulationId} onChange={handleChange}>
        <option value="">Select</option>
        {formulations.map(f => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>

      <label>Target Quantity (kg):</label>
      <input
        type="number"
        name="targetQuantityKg"
        value={form.targetQuantityKg}
        onChange={handleChange}
      />

      <label>Machine:</label>
      <input
        type="text"
        name="machine"
        value={form.machine}
        onChange={handleChange}
      />

      <label>Assign Operator:</label>
      <select name="operatorId" value={form.operatorId} onChange={handleChange}>
        <option value="">Select Operator</option>
        {operators.map(op => (
          <option key={op.id} value={op.id}>
            {op.fullName}
          </option>
        ))}
      </select>

      <br /><br />
      <button onClick={handleSubmit}>Create Batch</button>
    </div>
  );
};

export default PelletingBatchForm;
