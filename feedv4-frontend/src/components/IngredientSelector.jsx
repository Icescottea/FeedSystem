import React, { useState, useEffect } from 'react';

const IngredientSelector = ({ batchSize, onUpdate }) => {
  const [ingredients, setIngredients] = useState([]);
  const [selected, setSelected] = useState([]);

  /* fetch once on mount */
  useEffect(() => {
    fetch('/api/inventory')
      .then((res) => res.json())
      .then(setIngredients)
      .catch(console.error);
  }, []);

  /* helpers */
  const handleQtyChange = (id, qty) => {
    const updated = selected.map((i) =>
      i.id === id ? { ...i, qty: parseFloat(qty) || 0 } : i
    );
    setSelected(updated);
    onUpdate(updated);
  };

  const toggleIngredient = (ing) => {
    if (selected.some((i) => i.id === ing.id)) {
      const updated = selected.filter((i) => i.id !== ing.id);
      setSelected(updated);
      onUpdate(updated);
    } else {
      const newSel = [...selected, { ...ing, qty: 0 }];
      setSelected(newSel);
      onUpdate(newSel);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border p-4 max-w-full overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Ingredient Selector
      </h2>

      {/* scrollable list area */}
      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar-hide text-xs">
        {ingredients.map((ing) => {
          const isSel = selected.some((i) => i.id === ing.id);
          const rowSel = selected.find((i) => i.id === ing.id);

          return (
            <div
              key={ing.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded px-3 py-2 hover:shadow transition"
            >
              {/* left – checkbox + label */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggleIngredient(ing)}
                  className="accent-blue-600 shrink-0"
                />
                <span className="font-medium">{ing.name}</span>
                <span className="text-gray-500">
                  (CP {ing.cp}%, ME {ing.me} kcal, Rs {ing.costPerKg}/kg)
                </span>
              </label>

              {/* right – qty input */}
              {isSel && (
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Qty kg"
                  value={rowSel.qty}
                  onChange={(e) => handleQtyChange(ing.id, e.target.value)}
                  className="mt-2 sm:mt-0 border border-gray-300 rounded px-2 py-1 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IngredientSelector;
