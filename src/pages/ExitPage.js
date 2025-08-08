import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function ExitPage() {
  const navigate = useNavigate();
  const [openBatches, setOpenBatches] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingBatch, setProcessingBatch] = useState(null);
  const [exitData, setExitData] = useState({
    destinationId: '',
    newDestination: '',
    notes: '',
    transportType: '',
    vehicleRegistration: ''
  });
  const [message, setMessage] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, destinationsRes, companiesRes] = await Promise.all([
        API.get('/batches/open'), // Use the correct endpoint for open batches
        API.get('/destinations'),
        API.get('/companies')
      ]);

      // No need to filter since /batches/open already returns only non-exited batches
      setOpenBatches(batchesRes.data);
      setDestinations(destinationsRes.data);
      setCompanies(companiesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('❌ Error loading data');
      setLoading(false);
    }
  };

  const handleExitClick = (batch) => {
    setProcessingBatch(batch);
    
    // Find the company destination that matches the batch's company
    const companyDestination = destinations.find(d => 
      d.name === batch.company_name
    );
    
    setExitData({
      destinationId: companyDestination ? companyDestination.id : '',
      newDestination: '',
      notes: '',
      transportType: '',
      vehicleRegistration: ''
    });
    setShowExitModal(true);
  };

  const handleAddDestination = async () => {
    if (exitData.newDestination.trim()) {
      try {
        const res = await API.post('/destinations', { name: exitData.newDestination.trim() });
        setDestinations([...destinations, res.data]);
        setExitData(prev => ({ 
          ...prev, 
          destinationId: res.data.id, 
          newDestination: '' 
        }));
        setMessage('✅ Destination added successfully');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('❌ Error adding destination');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const resetExitData = () => {
    setExitData({
      destinationId: '',
      newDestination: '',
      notes: '',
      transportType: '',
      vehicleRegistration: ''
    });
  };

  const handleProcessExit = async () => {
    if (!exitData.destinationId) {
      setMessage('❌ Please select a destination');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (!exitData.transportType) {
      setMessage('❌ Please select transport type');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (exitData.transportType === 'external' && !exitData.vehicleRegistration) {
      setMessage('❌ Please enter vehicle registration for external transport');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    // Validate vehicle registration format for external transport
    if (exitData.transportType === 'external' && exitData.vehicleRegistration) {
      const vehicleRegex = /^[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,2}[-\s]?[0-9]{1,4}$/i;
      if (!vehicleRegex.test(exitData.vehicleRegistration.replace(/\s/g, ''))) {
        setMessage('❌ Please enter a valid vehicle registration number (e.g., MH-12-AB-1234)');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
    }

    try {
      const exitPayload = {
        destination_id: exitData.destinationId,
        notes: exitData.notes,
        transport_type: exitData.transportType
      };

      // Only include vehicle registration for external transport
      if (exitData.transportType === 'external') {
        exitPayload.vehicle_registration = exitData.vehicleRegistration;
      }

      await API.post(`/batch/${processingBatch.id}/exit`, exitPayload);
      
      setMessage('✅ Batch processed successfully!');
      setShowExitModal(false);
      resetExitData();
      setProcessingBatch(null);
      fetchData(); // Refresh the list
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Exit error:', error);
      setMessage('❌ ' + (error.response?.data?.error || 'Error processing exit'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getDaysInSystem = (inTime) => {
    const now = new Date();
    const entryTime = new Date(inTime);
    const diffTime = Math.abs(now - entryTime);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
          <p>Loading batches...</p>
        </div>
      </div>
    );
  }

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
              🚛 Batch Exit Processing
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0
            }}>
              Process completed batches and mark them for delivery
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
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
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>
              {openBatches.length}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Ready for Exit
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📍</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>
              {destinations.length}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Destinations
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #8b5cf6'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>
              {openBatches.length > 0 ? 
                Math.max(...openBatches.map(b => getDaysInSystem(b.in_time))) : 0}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Max Days Waiting
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            background: message.includes('✅') 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.includes('✅') ? '#10b981' : '#ef4444'}`,
            color: message.includes('✅') ? '#065f46' : '#991b1b',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontWeight: '500',
            backdropFilter: 'blur(10px)'
          }}>
            {message}
          </div>
        )}

        {/* Batches Ready for Exit */}
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 1rem 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            📦 Batches Ready for Exit
          </h2>

          {openBatches.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {openBatches.map((batch) => (
                <div
                  key={batch.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 0.5rem 0'
                      }}>
                        {batch.company_name}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        Lot: {batch.lot_number}
                      </p>
                    </div>
                    <div style={{
                      background: '#fef3c7',
                      color: '#d97706',
                      padding: '0.5rem 1rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      ⏳ {getDaysInSystem(batch.in_time)} day(s)
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1rem' }}>📅</span>
                      <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                        Entry: {new Date(batch.in_time).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1rem' }}>🚚</span>
                      <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                        {batch.received_through_type === 'mediator' 
                          ? `Via: ${batch.mediator_name || 'Mediator'}` 
                          : 'Direct from Company'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExitClick(batch)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(5, 150, 105, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span>🚛</span>
                    Process Exit
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1.5rem',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.7 }}>✅</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 0.5rem 0'
              }}>
                No Batches Ready for Exit
              </h3>
              <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                All batches have been processed and exited
              </p>
              <button
                onClick={() => navigate('/entry')}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add New Batch
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && processingBatch && (
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                🚛 Process Exit
              </h3>
              <button
                onClick={() => setShowExitModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                ×
              </button>
            </div>

            {/* Batch Information */}
            <div style={{
              background: '#f9fafb',
              padding: '1.5rem',
              borderRadius: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                {processingBatch.company_name}
              </h4>
              <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                Lot: {processingBatch.lot_number}
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                In system for {getDaysInSystem(processingBatch.in_time)} day(s)
              </p>
            </div>

            {/* Destination Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '0.5rem'
              }}>
                Destination <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={exitData.destinationId}
                onChange={(e) => setExitData(prev => ({ ...prev, destinationId: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="">Select Destination</option>
                <optgroup label="📍 Company Destinations">
                  {destinations
                    .filter(dest => companies.some(company => company.name === dest.name))
                    .map(dest => {
                      const isOriginalCompany = dest.name === processingBatch.company_name;
                      return (
                        <option key={`company-${dest.id}`} value={dest.id}>
                          {dest.name} {isOriginalCompany ? '(Original Company)' : ''}
                        </option>
                      );
                    })
                  }
                </optgroup>
                <optgroup label="🏢 Other Destinations">
                  {destinations
                    .filter(dest => !companies.some(company => company.name === dest.name))
                    .map(dest => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name}
                      </option>
                    ))
                  }
                </optgroup>
              </select>
            </div>

            {/* Add New Destination */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '0.5rem'
              }}>
                Add New Destination
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  placeholder="Enter new destination"
                  value={exitData.newDestination}
                  onChange={(e) => setExitData(prev => ({ ...prev, newDestination: e.target.value }))}
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
                  onClick={handleAddDestination}
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

            {/* Transport Type Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '0.5rem'
              }}>
                Transport Type <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setExitData(prev => ({ ...prev, transportType: 'company', vehicleRegistration: '' }))}
                  style={{
                    padding: '0.75rem',
                    border: exitData.transportType === 'company' ? '2px solid #059669' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    background: exitData.transportType === 'company' ? '#ecfdf5' : 'white',
                    color: exitData.transportType === 'company' ? '#059669' : '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  🏢 Company Transport
                </button>
                <button
                  type="button"
                  onClick={() => setExitData(prev => ({ ...prev, transportType: 'external' }))}
                  style={{
                    padding: '0.75rem',
                    border: exitData.transportType === 'external' ? '2px solid #d97706' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    background: exitData.transportType === 'external' ? '#fffbeb' : 'white',
                    color: exitData.transportType === 'external' ? '#d97706' : '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  🚚 External Transport
                </button>
              </div>
            </div>

            {/* Vehicle Registration (for external transport) */}
            {exitData.transportType === 'external' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4b5563',
                  marginBottom: '0.5rem'
                }}>
                  Vehicle Registration Number <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  placeholder="e.g., MH-12-AB-1234 or GJ-01-AA-1234"
                  value={exitData.vehicleRegistration}
                  onChange={(e) => setExitData(prev => ({ ...prev, vehicleRegistration: e.target.value.toUpperCase() }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase'
                  }}
                />
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.25rem',
                  fontStyle: 'italic'
                }}>
                  Enter vehicle registration in format: XX-XX-XX-XXXX or XX-XX-XXXX
                </p>
              </div>
            )}

            {/* Transport Summary */}
            {exitData.transportType && (
              <div style={{
                background: exitData.transportType === 'company' ? '#ecfdf5' : '#fffbeb',
                border: `1px solid ${exitData.transportType === 'company' ? '#10b981' : '#f59e0b'}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '1rem' }}>
                    {exitData.transportType === 'company' ? '🏢' : '🚚'}
                  </span>
                  <span style={{
                    fontWeight: '600',
                    color: exitData.transportType === 'company' ? '#059669' : '#d97706'
                  }}>
                    {exitData.transportType === 'company' ? 'Company Transport' : 'External Transport'}
                  </span>
                </div>
                {exitData.transportType === 'external' && exitData.vehicleRegistration && (
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}>
                    Vehicle: <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                      {exitData.vehicleRegistration}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '0.5rem'
              }}>
                Exit Notes (Optional)
              </label>
              <textarea
                placeholder="Add any exit notes, delivery instructions, or transport details..."
                value={exitData.notes}
                onChange={(e) => setExitData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowExitModal(false)}
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
                onClick={handleProcessExit}
                disabled={!exitData.destinationId || !exitData.transportType || 
                         (exitData.transportType === 'external' && !exitData.vehicleRegistration)}
                style={{
                  background: (!exitData.destinationId || !exitData.transportType || 
                              (exitData.transportType === 'external' && !exitData.vehicleRegistration)) 
                              ? '#9ca3af' : '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: (!exitData.destinationId || !exitData.transportType || 
                          (exitData.transportType === 'external' && !exitData.vehicleRegistration)) 
                          ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🚛 Process Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}