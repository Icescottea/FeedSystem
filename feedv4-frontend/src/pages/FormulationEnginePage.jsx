import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormulationWizard from '../components/FormulationWizard';

const FormulationEnginePage = () => {
  const [wizardData, setWizardData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleWizardFinish = (data) => {
    const payload = {
      ...data,
      status: 'Draft'
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
        navigate(`/formulations/${created.id}/builder`); // <-- 🔁 Redirect after creation
      })
      .catch(err => {
        console.error("❌ Error:", err);
        setError("Something went wrong while creating the formulation. Please try again.");
      });
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 text-xs text-gray-800 overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Formulation Engine</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md border border-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-md border p-6">
        {!wizardData ? (
          <FormulationWizard onFinish={handleWizardFinish} />
        ) : (
          <p className="text-sm text-gray-500 italic">Creating formulation...</p>
        )}
      </div>
    </div>
  );
};

export default FormulationEnginePage;
