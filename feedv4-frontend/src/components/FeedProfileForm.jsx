import React, { useState, useEffect } from 'react';

const defaultProfile = {
  feedName: '', species: 'Poultry', stage: 'Starter',
  protein: 0, energy: 0, calcium: 0, phosphorus: 0,
  fiber: 0, fat: 0, methionine: 0, lysine: 0,
  maxSalt: 0.5, maxFiber: 6,
  mandatoryIngredients: [], restrictedIngredients: [], preferenceStrategy: 'Balanced',
  tags: [], archived: false, locked: false
};

const FeedProfileForm = ({ profile, onSuccess, onCancel }) => {
  const [form, setForm] = useState(defaultProfile);

  useEffect(() => {
    setForm(profile || defaultProfile);
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleArrChange = (name, value) => {
    const arr = value.split(',').map(s => s.trim()).filter(Boolean);
    setForm(prev => ({ ...prev, [name]: arr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = profile ? 'PUT' : 'POST';
    const url = profile ? `/api/feed-profiles/${profile.id}` : '/api/feed-profiles';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    onSuccess();
  };

  const fields = [
    ['feedName', 'Feed Name'],
    ['species', 'Species'],
    ['stage', 'Stage'],
    ['protein', 'Protein (%)'],
    ['energy', 'Energy (Kcal/kg)'],
    ['calcium', 'Calcium'],
    ['phosphorus', 'Phosphorus'],
    ['fiber', 'Fiber'],
    ['fat', 'Fat'],
    ['methionine', 'Methionine'],
    ['lysine', 'Lysine'],
    ['maxSalt', 'Max Salt (%)'],
    ['maxFiber', 'Max Fiber (%)'],
    ['preferenceStrategy', 'Preference Strategy'],
    ['mandatoryIngredients', 'Mandatory Ingredients (comma-separated)'],
    ['restrictedIngredients', 'Restricted Ingredients (comma-separated)'],
    ['tags', 'Tags (comma-separated)']
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-md p-6 space-y-6 max-w-4xl mx-auto"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        {profile ? 'Edit Feed Profile' : 'Create Feed Profile'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(([key, label]) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              type={typeof defaultProfile[key] === 'number' ? 'number' : 'text'}
              name={key}
              id={key}
              value={Array.isArray(form[key]) ? form[key].join(', ') : form[key]}
              onChange={(e) =>
                ['mandatoryIngredients', 'restrictedIngredients', 'tags'].includes(key)
                  ? handleArrChange(key, e.target.value)
                  : handleChange(e)
              }
              required={['feedName', 'species', 'stage'].includes(key)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
        >
          {profile ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default FeedProfileForm;
