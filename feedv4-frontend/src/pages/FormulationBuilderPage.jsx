import React, { useState, useEffect } from 'react';
import IngredientSelector from '../components/IngredientSelector';
import NutrientGraph from '../components/NutrientGraph';

const FormulationBuilderPage = ({ formulationId }) => {
  const [formulation, setFormulation] = useState(null);
  const [lockedIngredients, setLockedIngredients] = useState([]);
  const [percentages, setPercentages] = useState({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [suggestions, setSuggestions] = useState({});
  const [logs, setLogs] = useState([]); // ✅ FIXED
  const nutrientKeys = ['protein', 'energy', 'calcium', 'phosphorus', 'fiber', 'fat', 'methionine', 'lysine'];

  useEffect(() => {
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

    if (formulationId) {
      fetch(`/api/formulations/${formulationId}/suggestions`)
        .then(res => res.json())
        .then(setSuggestions)
        .catch(console.error);

      fetch(`/api/formulations/${formulationId}/logs`)
        .then(res => res.json())
        .then(setLogs)
        .catch(console.error);
    }
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
    return (formulation.ingredients || []).reduce((sum, i) => {
      const pct = percentages[i.rawMaterial.name] || 0;
      return sum + (pct * i.rawMaterial.costPerKg) / 100;
    }, 0);
  };

  const calculateActualNutrients = () => {
    const totals = {};
    nutrientKeys.forEach(k => (totals[k] = 0));

    if (!formulation || !formulation.ingredients) return totals;

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

  const actualNutrients = formulation ? calculateActualNutrients() : {};
  const targetNutrients = formulation?.feedProfile || {};
  const deviations = getDeviation(actualNutrients, targetNutrients);

  const handleSave = async (final) => {
    const body = {
      ingredientPercentages: percentages,
      lockedIngredients,
      finalized: final,
    };
    await fetch(`/api/formulations/${formulationId}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    alert(final ? 'Formulation Finalized' : 'Draft Saved');
  };

  if (!formulation) return <div>Loading...</div>;
  if (formulation.locked) return <div>🔒 This formulation is locked and cannot be edited.</div>;

  return (
    <div>
      <h2>Formulation Builder: {formulation.name}</h2>

      <IngredientSelector
        ingredients={formulation.ingredients}
        percentages={percentages}
        onChange={handleSlider}
        locked={lockedIngredients}
        onToggleLock={toggleIngredientLock}
      />

      <NutrientGraph target={targetNutrients} actual={actualNutrients} />

      <table>
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>%</th>
            <th>Cost/kg</th>
            <th>Contribution (kg)</th>
            <th>Locked</th>
          </tr>
        </thead>
        <tbody>
          {(formulation.ingredients || []).map(i => (
            <tr key={i.rawMaterial.name}>
              <td>{i.rawMaterial.name}</td>
              <td>{percentages[i.rawMaterial.name] || 0}</td>
              <td>{i.rawMaterial.costPerKg}</td>
              <td>{((percentages[i.rawMaterial.name] || 0) * formulation.batchSize) / 100}</td>
              <td>{lockedIngredients.includes(i.rawMaterial.name) ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {suggestions && (
        <div>
          <h3>🔄 Ingredient Alternatives</h3>
          {Object.entries(suggestions).map(([name, alts]) => (
            <div key={name}>
              <strong>{name}</strong>:&nbsp;
              {alts.length === 0
                ? 'No better alternatives'
                : alts.map(alt => `${alt.name} (${alt.costPerKg} LKR/kg)`).join(', ')
              }
            </div>
          ))}
        </div>
      )}

      <p><strong>Total Cost per Kg:</strong> {calcCost().toFixed(2)} LKR</p>

      {!isFinalized && (
        <div>
          <button onClick={() => handleSave(false)}>Save Draft</button>
          <button onClick={() => handleSave(true)}>Finalize</button>
        </div>
      )}

      {isFinalized && (
        <div>
          <p>✅ Finalized</p>
          <button onClick={async () => {
            await fetch(`/api/formulations/${formulationId}/unfinalize`, { method: 'PUT' });
            alert("Formulation unfinalized");
            setIsFinalized(false);
          }}>
            Undo Finalize
          </button>
        </div>
      )}

      {formulation.status === "Archived" && (
        <div>
          <p>📦 This formulation is archived.</p>
          <button onClick={async () => {
            await fetch(`/api/formulations/${formulationId}/unarchive`, { method: 'PUT' });
            alert("Formulation unarchived");
            window.location.reload();
          }}>
            Undo Archive
          </button>
        </div>
      )}

      {formulation.locked && (
        <div>
          <p>🔒 Locked Formulation</p>
          <button onClick={async () => {
            await fetch(`/api/formulations/${formulationId}/unlock`, { method: 'PUT' });
            alert("Formulation unlocked");
            window.location.reload();
          }}>
            Unlock Formulation
          </button>
        </div>
      )}

      <div style={{ marginTop: '10px' }}>
        <button onClick={() => window.open(`/api/formulations/${formulationId}/export/excel`, "_blank")}>
          Export to Excel
        </button>
        <button onClick={() => window.open(`/api/formulations/${formulationId}/export/pdf`, "_blank")}>
          Export to PDF
        </button>
      </div>

      <h3>📜 Activity Log</h3>
      <ul>
        {logs.map(log => (
          <li key={log.id}>
            [{new Date(log.timestamp).toLocaleString()}] - <strong>{log.action}</strong>: {log.message}
          </li>
        ))}
      </ul>

      {Object.keys(deviations).length > 0 && (
        <div style={{ border: '1px solid red', padding: '10px', marginTop: '1rem', color: 'darkred' }}>
          <strong>⚠️ Nutrient Deviation Detected:</strong>
          <ul>
            {Object.entries(deviations).map(([nutrient, deviation]) => (
              <li key={nutrient}>
                {nutrient.toUpperCase()}: {deviation > 0 ? '+' : ''}{deviation}% deviation
              </li>
            ))}
          </ul>
          <small>Adjust ingredient percentages to meet the target profile.</small>
        </div>
      )}
    </div>
  );
};

export default FormulationBuilderPage;
