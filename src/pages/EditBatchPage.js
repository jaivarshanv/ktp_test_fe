import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';

export default function EditBatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    companyId: '',
    lotNumber: '',
    receivedThroughType: '',
    mediatorId: '',
    newCompany: '',
    newMediator: ''
  });
  
  const [items, setItems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [mediators, setMediators] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [newMaterialType, setNewMaterialType] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [batchRes, companiesRes, mediatorsRes, materialTypesRes] = await Promise.all([
        API.get(`/batch/${id}`),
        API.get('/companies'),
        API.get('/mediators'),
        API.get('/material-types')
      ]);

      const batch = batchRes.data;
      
      setFormData({
        companyId: batch.company_id,
        lotNumber: batch.lot_number,
        receivedThroughType: batch.received_through_type,
        mediatorId: batch.mediator_id || '',
        newCompany: '',
        newMediator: ''
      });
      
      setItems(batch.items.map(item => ({
        material_type_id: item.material_type_id,
        color: item.color,
        number_of_rolls: item.number_of_rolls
      })));
      
      setCompanies(companiesRes.data);
      setMediators(mediatorsRes.data);
      setMaterialTypes(materialTypesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching batch data:', error);
      setMessage('❌ Error loading batch data');
      setLoading(false);
    }
  };

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
        setMessage('✅ Company added successfully');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('❌ Error adding company');
        setTimeout(() => setMessage(''), 3000);
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
        setMessage('✅ Mediator added successfully');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('❌ Error adding mediator');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleAddMaterialType = async () => {
    if (newMaterialType.trim()) {
      try {
        const res = await API.post('/material-types', { name: newMaterialType.trim() });
        setMaterialTypes([...materialTypes, res.data]);
        setNewMaterialType('');
        setMessage('✅ Material type added successfully');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('❌ Error adding material type');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await API.put(`/batch/${id}`, {
        company_id: formData.companyId,
        lot_number: formData.lotNumber,
        items,
        received_through_type: formData.receivedThroughType,
        mediator_id: formData.receivedThroughType === 'mediator' ? formData.mediatorId : null
      });
      
      setMessage('✅ Batch updated successfully!');
      setTimeout(() => {
        navigate('/view');
      }, 2000);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Error updating batch'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/batch/${id}`);
      setMessage('✅ Batch deleted successfully!');
      setTimeout(() => {
        navigate('/view');
      }, 1500);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Error deleting batch'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading batch data...</p>
        </div>
      </div>
    );
  }

  const totalRolls = items.reduce((sum, item) => sum + (item.number_of_rolls || 0), 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
      padding: 0
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '2rem 1rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: 'white',
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              ✏️ Edit Batch #{id}
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0
            }}>
              Modify batch details and material information
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/view')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              ← Back to Records
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                background: 'rgba(220, 38, 38, 0.2)',
                color: 'white',
                border: '1px solid rgba(220, 38, 38, 0.5)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              🗑️ Delete Batch
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '2rem'
      }}>
        {/* Main Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Company Information */}
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 1rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📊 Company Information
              </h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4b5563',
                  marginBottom: '0.5rem'
                }}>
                  Company <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => handleInputChange('companyId', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.company ? '1px solid #dc2626' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
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

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  placeholder="Add new company"
                  value={formData.newCompany}
                  onChange={(e) => handleInputChange('newCompany', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCompany}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4b5563',
                  marginBottom: '0.5rem'
                }}>
                  Lot Number <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  placeholder="Enter lot number"
                  value={formData.lotNumber}
                  onChange={(e) => handleInputChange('lotNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.lotNumber ? '1px solid #dc2626' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
                {errors.lotNumber && (
                  <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors.lotNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 1rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🚚 Entry Information
              </h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4b5563',
                  marginBottom: '0.5rem'
                }}>
                  Received Through <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.receivedThroughType}
                  onChange={(e) => handleInputChange('receivedThroughType', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.receivedThrough ? '1px solid #dc2626' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
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
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#4b5563',
                      marginBottom: '0.5rem'
                    }}>
                      Mediator <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={formData.mediatorId}
                      onChange={(e) => handleInputChange('mediatorId', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: errors.mediator ? '1px solid #dc2626' : '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
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

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      placeholder="Add new mediator"
                      value={formData.newMediator}
                      onChange={(e) => handleInputChange('newMediator', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddMediator}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Material Items */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📦 Material Items
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </button>
              </div>

              {showAdvanced && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      placeholder="Add new material type"
                      value={newMaterialType}
                      onChange={(e) => setNewMaterialType(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddMaterialType}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Add Type
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{
                    background: '#f9fafb',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#4b5563',
                          marginBottom: '0.5rem'
                        }}>
                          Material Type
                        </label>
                        <select
                          value={item.material_type_id}
                          onChange={(e) => handleItemChange(idx, 'material_type_id', Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: errors[`item_${idx}_material`] ? '1px solid #dc2626' : '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          <option value="">Select Material</option>
                          {materialTypes.map(mt => (
                            <option key={mt.id} value={mt.id}>{mt.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#4b5563',
                          marginBottom: '0.5rem'
                        }}>
                          Color (to be dyed)
                        </label>
                        <input
                          placeholder="Enter color"
                          value={item.color}
                          onChange={(e) => handleItemChange(idx, 'color', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: errors[`item_${idx}_color`] ? '1px solid #dc2626' : '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#4b5563',
                          marginBottom: '0.5rem'
                        }}>
                          Number of Rolls
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="Rolls"
                          value={item.number_of_rolls || ''}
                          onChange={(e) => handleItemChange(idx, 'number_of_rolls', Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: errors[`item_${idx}_rolls`] ? '1px solid #dc2626' : '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        style={{
                          background: items.length === 1 ? '#9ca3af' : '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: items.length === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addItem}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  + Add Material Item
                </button>
              </div>
            </div>

            <button type="submit" style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              💾 Update Batch
            </button>
          </form>
        </div>

        {/* Live Preview Sidebar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          height: 'fit-content'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📋 Batch Preview
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#6b7280', fontWeight: '500' }}>Company:</span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#1f2937' }}>
                {companies.find(c => c.id === formData.companyId)?.name || 'Not selected'}
              </p>
            </div>

            <div>
              <span style={{ color: '#6b7280', fontWeight: '500' }}>Lot Number:</span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#1f2937' }}>
                {formData.lotNumber || 'Not entered'}
              </p>
            </div>

            <div>
              <span style={{ color: '#6b7280', fontWeight: '500' }}>Received Through:</span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#1f2937' }}>
                {formData.receivedThroughType === 'mediator' 
                  ? `Mediator: ${mediators.find(m => m.id === formData.mediatorId)?.name || 'Not selected'}`
                  : formData.receivedThroughType === 'company' 
                    ? 'Company Itself' 
                    : 'Not selected'
                }
              </p>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <span style={{ color: '#6b7280', fontWeight: '500' }}>Total Items:</span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: '700', color: '#059669', fontSize: '1.25rem' }}>
                {items.length}
              </p>
            </div>

            <div>
              <span style={{ color: '#6b7280', fontWeight: '500' }}>Total Rolls:</span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: '700', color: '#d97706', fontSize: '1.25rem' }}>
                {totalRolls}
              </p>
            </div>

            <div>
              <span style={{ color: '#6b7280', fontWeight: '500' }}>Items:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{
                    background: '#f3f4f6',
                    padding: '0.75rem',
                    borderRadius: '0.5rem'
                  }}>
                    <p style={{ fontWeight: '500', margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>
                      {materialTypes.find(mt => mt.id === item.material_type_id)?.name || 'Material not selected'}
                    </p>
                    <p style={{ color: '#4b5563', margin: 0, fontSize: '0.75rem' }}>
                      {item.color || 'No color'} • {item.number_of_rolls || 0} rolls
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          background: message.includes('✅') 
            ? 'rgba(16, 185, 129, 0.95)' 
            : 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          fontWeight: '500',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}>
          {message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 0.5rem 0'
            }}>
              Delete Batch?
            </h3>
            <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0' }}>
              Are you sure you want to delete this batch? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: '#f3f4f6',
                  color: '#4b5563',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}