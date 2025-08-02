import React, { useState } from 'react';

const FormulationEditor = ({ formulation, onSave, isSaving }) => {
  const [editableIngredients, setEditableIngredients] = useState(
    formulation.ingredients.reduce((acc, ingredient) => {
      if (!acc.some(i => i.materialId === ingredient.materialId)) {
        acc.push({ ...ingredient });
      }
      return acc;
    }, [])
  );

  const handlePercentageChange = (materialId, value) => {
    setEditableIngredients(prev => prev.map(item => 
      item.materialId === materialId 
        ? { ...item, percentage: parseFloat(value) || 0 } 
        : item
    ));
  };

  const handleQuantityChange = (materialId, value) => {
    setEditableIngredients(prev => prev.map(item => 
      item.materialId === materialId 
        ? { ...item, quantityKg: parseFloat(value) || 0 } 
        : item
    ));
  };

  const handleSave = () => {
    // Recalculate quantities if percentages changed
    const totalWeight = editableIngredients.reduce((sum, i) => sum + i.quantityKg, 0);
    const normalizedIngredients = editableIngredients.map(ingredient => ({
      ...ingredient,
      quantityKg: (ingredient.percentage / 100) * totalWeight
    }));
    
    onSave({
      ...formulation,
      ingredients: normalizedIngredients
    });
    
  };

  return (
    <div className="bg-white shadow-md rounded-md border p-6">
      {/* ... nutrient summary ... */}
      
      <table className="w-full mt-2">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Name</th>
            <th className="text-right py-2">Percentage</th>
            <th className="text-right py-2">Quantity (kg)</th>
          </tr>
        </thead>
        <tbody>
          {editableIngredients.map((ingredient) => (
            <tr key={ingredient.materialId} className="border-b">
              <td className="py-2">{ingredient.name}</td>
              <td className="text-right py-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={ingredient.percentage}
                  onChange={(e) => handlePercentageChange(ingredient.materialId, e.target.value)}
                  className="w-20 text-right border rounded px-2 py-1"
                /> %
              </td>
              <td className="text-right py-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ingredient.quantityKg}
                  onChange={(e) => handleQuantityChange(ingredient.materialId, e.target.value)}
                  className="w-24 text-right border rounded px-2 py-1"
                />
              </td>
            </tr>
          ))}
          <tr className="font-semibold bg-gray-50">
            <td className="py-2">Total</td>
            <td className="text-right py-2">
              {editableIngredients.reduce((sum, i) => sum + i.percentage, 0).toFixed(2)}%
            </td>
            <td className="text-right py-2">
              {editableIngredients.reduce((sum, i) => sum + i.quantityKg, 0).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => onSave(null)} // Cancel
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Formulation'}
        </button>
      </div>
    </div>
  );
};

export default FormulationEditor;