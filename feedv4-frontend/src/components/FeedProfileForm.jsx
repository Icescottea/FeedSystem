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

  return (
    <form onSubmit={handleSubmit}>
      {[
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
      ].map(([key, label]) => (
        <div key={key}>
          <label>{label}:</label>
          <input
            type={typeof defaultProfile[key] === 'number' ? 'number' : 'text'}
            name={key}
            value={Array.isArray(form[key]) ? form[key].join(', ') : form[key]}
            onChange={(e) =>
              ['mandatoryIngredients', 'restrictedIngredients', 'tags'].includes(key)
                ? handleArrChange(key, e.target.value)
                : handleChange(e)
            }
            required={['feedName', 'species', 'stage'].includes(key)}
          />
        </div>
      ))}

      <button type="submit">{profile ? 'Update' : 'Create'}</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default FeedProfileForm;
