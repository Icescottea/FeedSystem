import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormulationWizard from '../components/FormulationWizard';

const FormulationEnginePage = () => {
  const [wizardData, setWizardData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleWizardFinish = (data) => {
    console.log("🧪 Wizard completed:", data);
    setWizardData(data);

    const payload = {
      ...data,
      status: 'Draft' // ✅ Set default status
    };

    fetch('/api/formulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create formulation');
        return res.json();
      })
      .then(created => {
        console.log("✅ New formulation created:", created);
        navigate(`/formulations/builder/${created.id}`);
      })
      .catch(err => {
        console.error("❌ Error:", err);
        setError("Something went wrong while creating the formulation. Please try again.");
      });
  };

  return (
    <div>
      <h1>Formulation Engine</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      {!wizardData ? (
        <FormulationWizard onFinish={handleWizardFinish} />
      ) : (
        <p>Creating formulation...</p> // Optional loading state
      )}
    </div>
  );
};

export default FormulationEnginePage;
