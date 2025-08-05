import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const FormulationEditForm = ({ formulationId, onClose, onSaved }) => {
  const [formulation, setFormulation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/formulations/${formulationId}`)
      .then(res => res.json())
      .then(setFormulation)
      .catch(() => setError('Could not load formulation.'));
  }, [formulationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulation(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormulation(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formulation.name,
        version: formulation.version,
        notes: formulation.notes,
        tags: formulation.tags,
        locked: formulation.locked
      };

      const res = await fetch(`${API_BASE}/api/formulations/${formulationId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();
      onSaved?.();
    } catch {
      setError('Failed to save changes.');
    }
  };

  if (error) return <div className="text-red-600">{error}</div>;
  if (!formulation) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm p-4 bg-white border rounded-md shadow-md">
      <h2 className="text-lg font-semibold">Edit Formulation</h2>

      <div>
        <label className="block font-medium">Name:</label>
        <input
          name="name"
          value={formulation.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Version:</label>
        <input
          name="version"
          value={formulation.version}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="block font-medium">Notes:</label>
        <textarea
          name="notes"
          value={formulation.notes || ''}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-md"
          rows={3}
        />
      </div>

      <div>
        <label className="block font-medium">Tags (comma-separated):</label>
        <input
          name="tags"
          value={formulation.tags?.join(', ') || ''}
          onChange={handleTagsChange}
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      {!formulation.finalized && (
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={formulation.locked}
              onChange={() =>
                setFormulation(prev => ({ ...prev, locked: !prev.locked }))
              }
              className="accent-blue-600 mr-2"
            />
            Locked
          </label>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 px-4 py-2 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default FormulationEditForm;
