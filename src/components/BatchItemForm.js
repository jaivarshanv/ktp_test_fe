import React, { useEffect, useState } from 'react';
import API from '../api';

export default function BatchItemForm({ items, setItems }) {
  const [materialTypes, setMaterialTypes] = useState([]);
  const [newMaterialType, setNewMaterialType] = useState('');

  useEffect(() => {
    API.get('/material-types').then(res => setMaterialTypes(res.data));
  }, []);

  const handleChange = (idx, field, value) => {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setItems(updated);
  };

  const addRow = () => setItems([...items, { material_type_id: '', color: '', number_of_rolls: 1 }]);
  const removeRow = idx => setItems(items.filter((_, i) => i !== idx));

  const handleAddMaterialType = () => {
    if (newMaterialType.trim()) {
      API.post('/material-types', { name: newMaterialType.trim() }).then(res => {
        setMaterialTypes([...materialTypes, res.data]);
        setNewMaterialType('');
      });
    }
  };

  return (
    <div>
      <h4>Material Items</h4>
      {items.map((item, idx) => (
        <div key={idx} className="form-row" style={{ marginBottom: '1rem' }}>
          <select
            value={item.material_type_id}
            onChange={e => handleChange(idx, 'material_type_id', Number(e.target.value))}
            required
          >
            <option value="">Select Material Type</option>
            {materialTypes.map(mt => <option key={mt.id} value={mt.id}>{mt.name}</option>)}
          </select>
          <input
            placeholder="Color"
            value={item.color}
            onChange={e => handleChange(idx, 'color', e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Rolls"
            value={item.number_of_rolls || ''}
            onChange={e => handleChange(idx, 'number_of_rolls', Number(e.target.value))}
            required
            min="1"
            style={{ width: '80px' }}
          />
          <button type="button" className="remove-btn" onClick={() => removeRow(idx)} disabled={items.length === 1}>
            Remove
          </button>
        </div>
      ))}
      
      <div className="form-row" style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Add new material type"
          value={newMaterialType}
          onChange={e => setNewMaterialType(e.target.value)}
        />
        <button type="button" className="add-btn" onClick={handleAddMaterialType}>
          Add Material Type
        </button>
      </div>
      
      <button type="button" className="add-btn" onClick={addRow}>
        Add Item
      </button>
    </div>
  );
}