import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormulationWizard from '../components/FormulationWizard';
import ErrorAlert from '../components/ErrorAlert';
import FormulationEditor from '../components/FormulationEditor';
import { showToast } from '../components/toast';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const FormulationEnginePage = () => {
  const [generatedFormulation, setGeneratedFormulation] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [factory, setFactory] = useState("");

  const handleWizardFinish = async (data) => {
    try {
      setFormName(data.name);
      setFactory(data.factory);

      const response = await fetch(`${API_BASE}/api/formulations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: data.profileId,
          batchSize: data.batchSize
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      const result = await response.json();
      setGeneratedFormulation(result);
    } catch (err) {
      setError(err.message);
      setGeneratedFormulation(null);
    }
  };

  const handleSave = async (updatedFormulation) => {
    if (!updatedFormulation) {
      setGeneratedFormulation(null); // cancel
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/formulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          factory: factory,
          profileId: updatedFormulation.profileId,
          batchSize: updatedFormulation.batchSize,
          ingredients: updatedFormulation.ingredients
        })
      });

      if (!response.ok) throw new Error('Save failed');
      showToast("Formulation saved.");
      navigate('/formulation-library');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Formulation Engine</h1>
      
      {error && <ErrorAlert message={error} />}
      
      {!generatedFormulation ? (
        <FormulationWizard onFinish={handleWizardFinish} />
      ) : (
        <FormulationEditor 
          formulation={generatedFormulation}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default FormulationEnginePage;