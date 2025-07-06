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
    <div className="wizard">
      <h2>Formulation Wizard - Step {step}</h2>

      {step === 1 && (
        <div>
          <label>Feed Profile:</label>
          <select name="profileId" value={formulation.profileId} onChange={handleChange}>
            <option value="">Select</option>
            {profiles
              .filter(p => !p.archived) // optional: hide archived
              .map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.feedName} ({profile.species} - {profile.stage})
                </option>
              ))}
          </select>

          <label>Batch Size (kg):</label>
          <input
            type="number"
            name="batchSize"
            value={formulation.batchSize}
            onChange={handleChange}
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <label>Strategy:</label>
          {['Cost-Efficient', 'Balanced', 'High-Quality'].map((s) => (
            <label key={s}>
              <input
                type="checkbox"
                checked={formulation.strategy.includes(s)}
                onChange={() => handleStrategyToggle(s)}
              />
              {s}
            </label>
          ))}
        </div>
      )}

      {step === 3 && (
        <div>
          <p>Ingredient Locking (optional)</p>
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
          />
        </div>
      )}

      <div className="wizard-nav">
        {step > 1 && <button onClick={handlePrev}>Back</button>}
        {step < 3 && <button onClick={handleNext}>Next</button>}
        {step === 3 && <button onClick={handleSubmit}>Start Formulation</button>}
      </div>
    </div>
  );
};

export default FormulationWizard;
