import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/toast';

const FormulationWizard = ({ onFinish }) => {
  const [formulation, setFormulation] = useState({
    name: '',
    factory: '',
    profileId: '',
    batchSize: 1000
  });

  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/feed-profiles')
      .then(res => res.json())
      .then(setProfiles)
      .catch(err => console.error("Failed to load feed profiles:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulation(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const profileId = e.target.value;
    const profile = profiles.find(p => p.id == profileId);
    setSelectedProfile(profile);
    handleChange(e);
  };

  const handleGenerate = () => {
    if (!formulation.name || !formulation.profileId) {
      alert("Formulation name and feed profile are required.");
      return;
    }

    setIsGenerating(true);
    onFinish({
      name: formulation.name,
      factory: formulation.factory,
      profileId: Number(formulation.profileId),
      batchSize: Number(formulation.batchSize)
    }).finally(() => setIsGenerating(false));
  };

  return (
    <div className="space-y-6 text-sm text-gray-800">
      <h2 className="text-lg font-semibold mb-2">Formulation Generator</h2>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Formulation Name:</label>
          <input
            type="text"
            name="name"
            value={formulation.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Factory Name:</label>
          <input
            type="text"
            name="factory"
            value={formulation.factory}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Feed Profile:</label>
          <select
            name="profileId"
            value={formulation.profileId}
            onChange={handleProfileChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select</option>
            {profiles.filter(p => !p.archived).map(p => (
              <option key={p.id} value={p.id}>
                {p.feedName} ({p.species} - {p.stage})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Batch Size (kg):</label>
          <input
            type="number"
            name="batchSize"
            min="1"
            value={formulation.batchSize}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      {selectedProfile && (
        <div className="flex gap-4 mt-4">
          <div className="flex-1 border rounded p-4">
            <h3 className="font-medium mb-2">Profile Targets (%)</h3>
            <div>Protein: {selectedProfile.protein}%</div>
            <div>Fat: {selectedProfile.fat}%</div>
          </div>
          <div className="flex-1 border rounded p-4">
            <h3 className="font-medium mb-2">Batch Quantities (kg)</h3>
            <div>Protein: {(formulation.batchSize * selectedProfile.protein / 100).toFixed(2)} kg</div>
            <div>Fat: {(formulation.batchSize * selectedProfile.fat / 100).toFixed(2)} kg</div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleGenerate}
          disabled={!formulation.profileId || isGenerating}
          className="w-full py-2 rounded bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
        >
          {isGenerating ? "Generating..." : "Generate Formulation"}
        </button>
      </div>
    </div>
  );
};

export default FormulationWizard;