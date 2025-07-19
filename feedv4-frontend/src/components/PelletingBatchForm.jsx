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
      body: JSON.stringify({ formulationId, targetQuantityKg, machineUsed: machine, operatorId })
    });
    if (res.ok) {
      alert("Batch created");
      setForm({ formulationId: '', targetQuantityKg: 1000, machine: '', operatorId: '' });
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
      .then(data => Array.isArray(data) ? setOperators(data) : setOperators([]))
      .catch(() => setOperators([]));
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
      <div>
        <h2 className="text-lg font-semibold mb-4">➕ Create Pelleting Batch</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Formulation Select */}
          <div>
            <label htmlFor="formulationId" className="block text-sm font-medium text-gray-700 mb-1">
              Formulation
            </label>
            <select
              id="formulationId"
              name="formulationId"
              value={form.formulationId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select</option>
              {formulations.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Target Quantity */}
          <div>
            <label htmlFor="targetQuantityKg" className="block text-sm font-medium text-gray-700 mb-1">
              Target Quantity (kg)
            </label>
            <input
              id="targetQuantityKg"
              name="targetQuantityKg"
              type="number"
              value={form.targetQuantityKg}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Machine Input */}
          <div>
            <label htmlFor="machine" className="block text-sm font-medium text-gray-700 mb-1">
              Machine
            </label>
            <input
              id="machine"
              name="machine"
              type="text"
              value={form.machine}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Operator Select */}
          <div>
            <label htmlFor="operatorId" className="block text-sm font-medium text-gray-700 mb-1">
              Assign Operator
            </label>
            <select
              id="operatorId"
              name="operatorId"
              value={form.operatorId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Operator</option>
              {operators.map(op => (
                <option key={op.id} value={op.id}>{op.fullName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md shadow-sm"
          >
            Create Batch
          </button>
        </div>
      </div>
    </div>
  );
};

export default PelletingBatchForm;
