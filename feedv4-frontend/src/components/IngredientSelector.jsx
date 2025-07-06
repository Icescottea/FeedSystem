import React, { useState, useEffect } from 'react';

const IngredientSelector = ({ batchSize, onUpdate }) => {
  const [ingredients, setIngredients] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(setIngredients)
      .catch(console.error);
  }, []);

  const handleQtyChange = (id, qty) => {
    const updated = selected.map(item =>
      item.id === id ? { ...item, qty: parseFloat(qty) || 0 } : item
    );
    setSelected(updated);
    onUpdate(updated);
  };

  const toggleIngredient = (ingredient) => {
    if (selected.some(i => i.id === ingredient.id)) {
      const updated = selected.filter(i => i.id !== ingredient.id);
      setSelected(updated);
      onUpdate(updated);
    } else {
      const newSelection = [...selected, { ...ingredient, qty: 0 }];
      setSelected(newSelection);
      onUpdate(newSelection);
    }
  };

  return (
    <div>
      <h3>Ingredient Selector</h3>
      {ingredients.map(ing => (
        <div key={ing.id}>
          <input
            type="checkbox"
            checked={selected.some(i => i.id === ing.id)}
            onChange={() => toggleIngredient(ing)}
          />
          {ing.name} (CP: {ing.cp}%, ME: {ing.me} kcal, Cost: {ing.costPerKg}/kg)
          {selected.some(i => i.id === ing.id) && (
            <input
              type="number"
              placeholder="kg"
              value={selected.find(i => i.id === ing.id)?.qty || 0}
              onChange={e => handleQtyChange(ing.id, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default IngredientSelector;
