import React, { useState, useEffect } from 'react';

const FormulationWizard = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [formulation, setFormulation] = useState({
    profileId: '',
    batchSize: 1000,
    strategy: [],
    lockedIngredients: []
  });

  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetch('/api/feed-profiles')
      .then(res => res.json())
      .then(data => setProfiles(data))
      .catch(err => console.error("Failed to load feed profiles:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulation(prev => ({ ...prev, [name]: value }));
  };

  const handleStrategyToggle = (s) => {
    setFormulation(prev => ({
      ...prev,
      strategy: prev.strategy.includes(s)
        ? prev.strategy.filter(x => x !== s)
        : [...prev.strategy, s]
    }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);
  const handleSubmit = () => onFinish(formulation);

  return (
    <div className="space-y-6 text-sm text-gray-800">
      <h2 className="text-lg font-semibold mb-2">Formulation Wizard – Step {step}</h2>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Feed Profile:</label>
            <select
              name="profileId"
              value={formulation.profileId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select</option>
              {profiles
                .filter(p => !p.archived)
                .map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.feedName} ({profile.species} - {profile.stage})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Batch Size (kg):</label>
            <input
              type="number"
              name="batchSize"
              value={formulation.batchSize}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="block font-medium text-gray-700 mb-2">Formulation Strategy:</label>
          <div className="space-y-2">
            {['Cost-Efficient', 'Balanced', 'High-Quality'].map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formulation.strategy.includes(s)}
                  onChange={() => handleStrategyToggle(s)}
                  className="accent-blue-600"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="block font-medium text-gray-700 mb-1">Ingredient Locking (optional):</label>
          <textarea
            name="lockedIngredients"
            value={formulation.lockedIngredients.join(', ')}
            onChange={e =>
              setFormulation(prev => ({
                ...prev,
                lockedIngredients: e.target.value.split(',').map(x => x.trim())
              }))
            }
            placeholder="e.g., maize, premix"
            className="w-full h-24 border border-gray-300 rounded-md px-3 py-2 resize-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      <div className="flex justify-between pt-4 border-t mt-4">
        {step > 1 ? (
          <button
            onClick={handlePrev}
            className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-md"
          >
            Back
          </button>
        ) : <div />}

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md"
          >
            Start Formulation
          </button>
        )}
      </div>
    </div>
  );
};

export default FormulationWizard;
