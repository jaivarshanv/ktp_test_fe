import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function EntryPage() {
  const [formData, setFormData] = useState({
    companyId: '',
    lotNumber: '',
    receivedThroughType: '',
    mediatorId: '',
    newCompany: '',
    newMediator: ''
  });
  
  const [items, setItems] = useState([{ material_type_id: '', color: '', number_of_rolls: 1 }]);
  const [companies, setCompanies] = useState([]);
  const [mediators, setMediators] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [newMaterialType, setNewMaterialType] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/companies'),
      API.get('/mediators'),
      API.get('/material-types')
    ]).then(([companiesRes, mediatorsRes, materialTypesRes]) => {
      setCompanies(companiesRes.data);
      setMediators(mediatorsRes.data);
      setMaterialTypes(materialTypesRes.data);
    });
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyId) newErrors.company = 'Company is required';
    if (!formData.lotNumber) newErrors.lotNumber = 'Lot number is required';
    if (!formData.receivedThroughType) newErrors.receivedThrough = 'Please select how material was received';
    if (formData.receivedThroughType === 'mediator' && !formData.mediatorId) {
      newErrors.mediator = 'Mediator is required';
    }
    
    items.forEach((item, idx) => {
      if (!item.material_type_id) newErrors[`item_${idx}_material`] = 'Material type required';
      if (!item.color) newErrors[`item_${idx}_color`] = 'Color required';
      if (!item.number_of_rolls || item.number_of_rolls < 1) newErrors[`item_${idx}_rolls`] = 'Number of rolls required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (idx, field, value) => {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setItems(updated);
    
    const errorKey = `item_${idx}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addItem = () => {
    setItems([...items, { material_type_id: '', color: '', number_of_rolls: 1 }]);
  };

  const removeItem = (idx) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleAddCompany = async () => {
    if (formData.newCompany.trim()) {
      try {
        const res = await API.post('/companies', { name: formData.newCompany.trim() });
        setCompanies([...companies, res.data]);
        handleInputChange('companyId', res.data.id);
        handleInputChange('newCompany', '');
      } catch (err) {
        setMessage('Error adding company');
      }
    }
  };

  const handleAddMediator = async () => {
    if (formData.newMediator.trim()) {
      try {
        const res = await API.post('/mediators', { name: formData.newMediator.trim() });
        setMediators([...mediators, res.data]);
        handleInputChange('mediatorId', res.data.id);
        handleInputChange('newMediator', '');
      } catch (err) {
        setMessage('Error adding mediator');
      }
    }
  };

  const handleAddMaterialType = async () => {
    if (newMaterialType.trim()) {
      try {
        const res = await API.post('/material-types', { name: newMaterialType.trim() });
        setMaterialTypes([...materialTypes, res.data]);
        setNewMaterialType('');
      } catch (err) {
        setMessage('Error adding material type');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await API.post('/batch', {
        company_id: formData.companyId,
        lot_number: formData.lotNumber,
        items,
        received_through_type: formData.receivedThroughType,
        mediator_id: formData.receivedThroughType === 'mediator' ? formData.mediatorId : null
      });
      
      setMessage('Entry saved successfully! ✅');
      setTimeout(() => {
        setFormData({
          companyId: '',
          lotNumber: '',
          receivedThroughType: '',
          mediatorId: '',
          newCompany: '',
          newMediator: ''
        });
        setItems([{ material_type_id: '', color: '', number_of_rolls: 1 }]);
        setMessage('');
      }, 2000);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Error saving entry'));
    }
  };

  const totalRolls = items.reduce((sum, item) => sum + (item.number_of_rolls || 0), 0);

  return (
    <div className="form-container">
      <div className="form-wrapper">
        {/* Header */}
        <div className="form-header">
          <h1 className="form-title">🏭 Batch Entry System</h1>
          <div className="step-indicator">
            <div className="step step-active">1</div>
            <div className="step step-active">2</div>
            <div className="step step-active">3</div>
          </div>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: '1fr 400px' }}>
          {/* Main Form */}
          <div className="form-main">
            <div className="card">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Step 1: Company Information */}
                <div className="form-section">
                  <h2 className="form-section-title">📊 Company Information</h2>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="label">
                      Company <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      className={`custom-select ${errors.company ? 'custom-input-error' : ''}`}
                      value={formData.companyId}
                      onChange={(e) => handleInputChange('companyId', Number(e.target.value))}
                    >
                      <option value="">Select Company</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.company && (
                      <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {errors.company}
                      </p>
                    )}
                  </div>

                  <div className="form-row" style={{ marginBottom: '1rem' }}>
                    <input
                      className="custom-input"
                      placeholder="Add new company"
                      value={formData.newCompany}
                      onChange={(e) => handleInputChange('newCompany', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCompany}
                      className="secondary-btn"
                      style={{ width: 'auto' }}
                    >
                      Add
                    </button>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label className="label">
                      Lot Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      className={`custom-input ${errors.lotNumber ? 'custom-input-error' : ''}`}
                      placeholder="Enter lot number"
                      value={formData.lotNumber}
                      onChange={(e) => handleInputChange('lotNumber', e.target.value)}
                    />
                    {errors.lotNumber && (
                      <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {errors.lotNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 2: Delivery Information */}
                <div className="form-section">
                  <h2 className="form-section-title">🚚 Entry Information</h2>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="label">
                      Received Through <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      className={`custom-select ${errors.receivedThrough ? 'custom-input-error' : ''}`}
                      value={formData.receivedThroughType}
                      onChange={(e) => handleInputChange('receivedThroughType', e.target.value)}
                    >
                      <option value="">Select Option</option>
                      <option value="company">Company Itself</option>
                      <option value="mediator">Mediator</option>
                    </select>
                    {errors.receivedThrough && (
                      <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {errors.receivedThrough}
                      </p>
                    )}
                  </div>

                  {formData.receivedThroughType === 'mediator' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label className="label">
                          Mediator <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <select
                          className={`custom-select ${errors.mediator ? 'custom-input-error' : ''}`}
                          value={formData.mediatorId}
                          onChange={(e) => handleInputChange('mediatorId', Number(e.target.value))}
                        >
                          <option value="">Select Mediator</option>
                          {mediators.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                        {errors.mediator && (
                          <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            {errors.mediator}
                          </p>
                        )}
                      </div>

                      <div className="form-row">
                        <input
                          className="custom-input"
                          placeholder="Add new mediator"
                          value={formData.newMediator}
                          onChange={(e) => handleInputChange('newMediator', e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleAddMediator}
                          className="secondary-btn"
                          style={{ width: 'auto' }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Material Items */}
                <div className="form-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 className="form-section-title" style={{ marginBottom: 0 }}>📦 Material Items</h2>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="toggle-btn"
                    >
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                    </button>
                  </div>

                  {showAdvanced && (
                    <div className="advanced-section" style={{ marginBottom: '1rem' }}>
                      <div className="form-row">
                        <input
                          className="custom-input"
                          placeholder="Add new material type"
                          value={newMaterialType}
                          onChange={(e) => setNewMaterialType(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleAddMaterialType}
                          className="secondary-btn"
                          style={{ width: 'auto' }}
                        >
                          Add Type
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {items.map((item, idx) => (
                      <div key={idx} className="item-card">
                        <div className="item-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
                          <div>
                            <label className="label">Material Type</label>
                            <select
                              className={`custom-select ${errors[`item_${idx}_material`] ? 'custom-input-error' : ''}`}
                              value={item.material_type_id}
                              onChange={(e) => handleItemChange(idx, 'material_type_id', Number(e.target.value))}
                            >
                              <option value="">Select Material</option>
                              {materialTypes.map(mt => (
                                <option key={mt.id} value={mt.id}>{mt.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="label">Color(to be dyed)</label>
                            <input
                              className={`custom-input ${errors[`item_${idx}_color`] ? 'custom-input-error' : ''}`}
                              placeholder="Enter color"
                              value={item.color}
                              onChange={(e) => handleItemChange(idx, 'color', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="label">Number of Rolls</label>
                            <input
                              className={`custom-input ${errors[`item_${idx}_rolls`] ? 'custom-input-error' : ''}`}
                              type="number"
                              min="1"
                              placeholder="Rolls"
                              value={item.number_of_rolls || ''}
                              onChange={(e) => handleItemChange(idx, 'number_of_rolls', Number(e.target.value))}
                            />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              disabled={items.length === 1}
                              className="danger-btn"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addItem}
                      className="add-item-btn"
                    >
                      + Add Material Item
                    </button>
                  </div>
                </div>

                <button type="submit" className="primary-btn">
                  💾 Submit Entry
                </button>
              </form>

              {message && (
                <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Sidebar */}
          <div className="form-sidebar">
            <div className="preview-card">
              <h3 className="subsection-title">📋 Live Preview</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                <div>
                  <span className="preview-label">Company:</span>
                  <p className="preview-value">
                    {companies.find(c => c.id === formData.companyId)?.name || 'Not selected'}
                  </p>
                </div>

                <div>
                  <span className="preview-label">Lot Number:</span>
                  <p className="preview-value">{formData.lotNumber || 'Not entered'}</p>
                </div>

                <div>
                  <span className="preview-label">Received Through:</span>
                  <p className="preview-value">
                    {formData.receivedThroughType === 'mediator' 
                      ? `Mediator: ${mediators.find(m => m.id === formData.mediatorId)?.name || 'Not selected'}`
                      : formData.receivedThroughType === 'company' 
                        ? 'Company Itself' 
                        : 'Not selected'
                    }
                  </p>
                </div>

                <div>
                  <span className="preview-label">Total Items:</span>
                  <p className="preview-value">{items.length}</p>
                </div>

                <div>
                  <span className="preview-label">Total Rolls:</span>
                  <p className="preview-total">{totalRolls}</p>
                </div>

                <div>
                  <span className="preview-label">Items:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {items.map((item, idx) => (
                      <div key={idx} className="preview-item">
                        <p style={{ fontWeight: '500', margin: 0 }}>
                          {materialTypes.find(mt => mt.id === item.material_type_id)?.name || 'Material not selected'}
                        </p>
                        <p style={{ color: '#4b5563', margin: 0 }}>
                          Color: {item.color || 'Not specified'} | 
                          Rolls: {item.number_of_rolls || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => navigate('/')}
            className="nav-btn"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}