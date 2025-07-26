import React, { useState, useEffect } from 'react';
import IngredientSelector from '../components/IngredientSelector';
import NutrientGraph from '../components/NutrientGraph';
import { useParams } from 'react-router-dom';

const FormulationBuilderPage = () => {
  const { formulationId } = useParams();
  const [formulation, setFormulation] = useState(null);
  const [lockedIngredients, setLockedIngredients] = useState([]);
  const [percentages, setPercentages] = useState({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [suggestions, setSuggestions] = useState({});
  const [logs, setLogs] = useState([]);
  const nutrientKeys = ['protein', 'energy', 'calcium', 'phosphorus', 'fiber', 'fat', 'methionine', 'lysine'];

  useEffect(() => {
    // Load main formulation
    fetch(`/api/formulations/${formulationId}`)
      .then(res => res.json())
      .then(data => {
        setFormulation(data);
        setIsFinalized(data.finalized);
        const init = {};
        (data.ingredients || []).forEach(i => {
          init[i.rawMaterial.name] = i.percentage;
          if (i.locked) setLockedIngredients(prev => [...prev, i.rawMaterial.name]);
        });
        setPercentages(init);
      });

    // Load suggestions
    fetch(`/api/formulations/${formulationId}/suggestions`)
      .then(res => res.json())
      .then(setSuggestions)
      .catch(console.error);

    // Load activity logs
    fetch(`/api/formulations/${formulationId}/logs`)
      .then(res => res.json())
      .then(setLogs)
      .catch(console.error);
  }, [formulationId]);

  const handleSlider = (name, value) => {
    if (!lockedIngredients.includes(name)) {
      setPercentages(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleIngredientLock = (name) => {
    setLockedIngredients(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const calcCost = () => {
    if (!Array.isArray(formulation?.ingredients)) return 0;
    return formulation.ingredients.reduce((sum, i) => {
      const pct = percentages[i.rawMaterial.name] || 0;
      return sum + (pct * i.rawMaterial.costPerKg) / 100;
    }, 0);
  };

  const calculateActualNutrients = () => {
    if (!formulation?.ingredients) return {};
    const totals = {};
    nutrientKeys.forEach(k => (totals[k] = 0));
    formulation.ingredients.forEach(i => {
      const pct = percentages[i.rawMaterial.name] || 0;
      nutrientKeys.forEach(k => {
        const value = i.rawMaterial[k] || 0;
        totals[k] += (pct * value) / 100;
      });
    });
    return totals;
  };

  const getDeviation = (actual, target) => {
    const deviations = {};
    const threshold = 5;
    nutrientKeys.forEach(key => {
      const t = target[key] || 0;
      const a = actual[key] || 0;
      const diffPercent = t !== 0 ? ((a - t) / t) * 100 : 0;
      if (Math.abs(diffPercent) > threshold) {
        deviations[key] = diffPercent.toFixed(2);
      }
    });
    return deviations;
  };

  if (!formulation) {
    return <div className="text-sm text-gray-600 px-4 py-6">Loading...</div>;
  }
  if (formulation.locked) {
    return <div className="text-sm text-gray-700 px-4 py-6">🔒 This formulation is locked and cannot be edited.</div>;
  }

  const actualNutrients = calculateActualNutrients();
  const targetNutrients = formulation.feedProfile || {};
  const deviations = getDeviation(actualNutrients, targetNutrients);

  const handleSave = async (final) => {
    const body = { ingredientPercentages: percentages, lockedIngredients, finalized: final };
    await fetch(`/api/formulations/${formulationId}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    alert(final ? 'Formulation Finalized' : 'Draft Saved');
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 text-xs text-gray-800 overflow-x-hidden">
      <h2 className="text-2xl font-semibold pt-4  mb-5">Formulation Builder: {formulation.name}</h2>

      <div className="bg-white border rounded-md shadow p-6 space-y-6">
        <IngredientSelector
          ingredients={formulation.ingredients || []}
          percentages={percentages}
          onChange={handleSlider}
          locked={lockedIngredients}
          onToggleLock={toggleIngredientLock}
        />

        <NutrientGraph target={targetNutrients} actual={actualNutrients} />

        <div className="overflow-x-auto mt-6 border rounded">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Ingredient</th>
                <th className="px-4 py-2 text-left">Percentage</th>
                <th className="px-4 py-2 text-left">Lock</th>
              </tr>
            </thead>
            <tbody>
              {formulation.ingredients?.map((i) => {
                const name = i.rawMaterial.name;
                const locked = lockedIngredients.includes(name);
                const percentage = percentages[name] ?? 0;
              
                return (
                  <tr key={name} className={locked ? 'bg-gray-100' : ''}>
                    <td className="px-4 py-2 font-medium">{name}</td>
                    <td className="px-4 py-2 w-64">
                      {locked ? (
                        <span>{percentage.toFixed(2)}%</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={percentage}
                            onChange={(e) => handleSlider(name, parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="w-12 text-right">{percentage.toFixed(2)}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => toggleIngredientLock(name)}
                        className="text-xl"
                        title={locked ? 'Unlock' : 'Lock'}
                      >
                        {locked ? '🔒' : '🔓'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">🔄 Ingredient Alternatives</h3>
          {Object.entries(suggestions).map(([name, alts]) => (
            <div key={name} className="text-xs">
              <strong>{name}</strong>: {Array.isArray(alts)
                ? (alts.length === 0
                    ? 'No better alternatives'
                    : alts.map(alt => `${alt.name} (${alt.costPerKg} LKR/kg)`).join(', '))
                : 'Invalid data'}
            </div>
          ))}
        </div>

        <div className="text-sm">
          <strong>Total Cost per Kg:</strong> {calcCost().toFixed(2)} LKR
        </div>

        {!isFinalized && (
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => handleSave(false)}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 text-sm rounded-md"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md"
            >
              Finalize
            </button>
          </div>
        )}

        {isFinalized && (
          <div className="bg-green-100 border border-green-300 p-4 rounded-md text-sm text-green-700">
            ✅ Finalized
            <button
              onClick={async () => {
                await fetch(`/api/formulations/${formulationId}/unfinalize`, { method: 'PUT' });
                alert("Formulation unfinalized");
                setIsFinalized(false);
              }}
              className="ml-4 text-blue-600 hover:underline text-xs"
            >
              Undo Finalize
            </button>
          </div>
        )}

        {formulation.status === "Archived" && (
          <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-md text-sm text-yellow-800">
            📦 This formulation is archived.
            <button
              onClick={async () => {
                await fetch(`/api/formulations/${formulationId}/unarchive`, { method: 'PUT' });
                alert("Formulation unarchived");
                window.location.reload();
              }}
              className="ml-4 text-blue-600 hover:underline text-xs"
            >
              Undo Archive
            </button>
          </div>
        )}

        {formulation.locked && (
          <div className="bg-red-100 border border-red-300 p-4 rounded-md text-sm text-red-700">
            🔒 Locked Formulation
            <button
              onClick={async () => {
                await fetch(`/api/formulations/${formulationId}/unlock`, { method: 'PUT' });
                alert("Formulation unlocked");
                window.location.reload();
              }}
              className="ml-4 text-blue-600 hover:underline text-xs"
            >
              Unlock Formulation
            </button>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            onClick={() => window.open(`/api/formulations/${formulationId}/export/excel`, "_blank")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-md"
          >
            Export to Excel
          </button>
          <button
            onClick={() => window.open(`/api/formulations/${formulationId}/export/pdf`, "_blank")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm rounded-md"
          >
            Export to PDF
          </button>
        </div>

        <div className="pt-6">
          <h3 className="text-sm font-medium mb-2">📜 Activity Log</h3>
          <ul className="text-xs space-y-1">
            {Array.isArray(logs) && logs.map(log => (
              <li key={log.id}>
                [{new Date(log.timestamp).toLocaleString()}] - <strong>{log.action}</strong>: {log.message}
              </li>
            ))}
          </ul>
        </div>

        {Object.keys(deviations).length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-300 text-red-700 p-4 rounded-md text-sm">
            <strong>⚠️ Nutrient Deviation Detected:</strong>
            <ul className="list-disc pl-5">
              {Object.entries(deviations).map(([nutrient, deviation]) => (
                <li key={nutrient}>
                  {nutrient.toUpperCase()}: {deviation > 0 ? '+' : ''}{deviation}% deviation
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs">Adjust ingredient percentages to meet the target profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulationBuilderPage;
