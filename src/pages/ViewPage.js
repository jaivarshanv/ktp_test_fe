import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function ViewPage() {
  const [batches, setBatches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [expanded, setExpanded] = useState({});
  const [expandedExit, setExpandedExit] = useState({}); // New state for exit info
  const [items, setItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/batches').then(res => setBatches(res.data));
    API.get('/companies').then(res => setCompanies(res.data));
  }, []);

  const filteredBatches = selectedCompany 
    ? batches.filter(batch => batch.company_name === selectedCompany)
    : batches;

  const toggleExpand = async batch => {
    setExpanded(exp => ({ ...exp, [batch.id]: !exp[batch.id] }));
    if (!items[batch.id]) {
      try {
        const res = await API.get(`/batch/${batch.id}/items`);
        setItems(i => ({ ...i, [batch.id]: res.data }));
      } catch (error) {
        console.error('Error fetching batch items:', error);
      }
    }
  };

  // New function to toggle exit info
  const toggleExitInfo = (batchId) => {
    setExpandedExit(exp => ({ ...exp, [batchId]: !exp[batchId] }));
  };

  const exportCSV = () => {
    const csvData = filteredBatches.map(batch => ({
      Company: batch.company_name,
      LotNumber: batch.lot_number,
      InTime: batch.in_time,
      ExitTime: batch.out_time || 'Not Exited',
      ExitType: batch.transport_type === 'external' ? 'External' : batch.transport_type === 'company' ? 'Company' : 'N/A',
      Vehicle: batch.vehicle_registration || 'N/A',
      ReceivedThrough: batch.received_through_type,
      Mediator: batch.mediator_name || 'N/A'
    }));
    
    // Helper function to properly escape CSV fields
    const escapeCSV = (value) => {
      const stringValue = String(value || '');
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };
    
    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.map(escapeCSV).join(','), 
      ...csvData.map(row => headers.map(h => escapeCSV(row[h])).join(','))
    ].join('\r\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batches.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'white',
            margin: 0,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            📊 All Batches
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <select 
            value={selectedCompany} 
            onChange={e => setSelectedCompany(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              color: '#1f2937',
              fontWeight: '500',
              minWidth: '200px'
            }}
          >
            <option value="">All Companies</option>
            {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          
          <button onClick={exportCSV} style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            📥 Export as CSV
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(30, 64, 175, 0.1)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>Company</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>Lot Number</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>In Time</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>Exit Time</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>Exit Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>Vehicle</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>Received Through</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>Mediator</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map(batch => (
                  <React.Fragment key={batch.id}>
                    <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                      <td style={{ padding: '1rem', color: '#1f2937', fontWeight: '500' }}>
                        {batch.company_name}
                      </td>
                      <td style={{ padding: '1rem', color: '#4b5563' }}>
                        {batch.lot_number}
                      </td>
                      <td style={{ padding: '1rem', color: '#4b5563', fontSize: '0.875rem' }}>
                        {new Date(batch.in_time).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{ padding: '1rem', color: '#4b5563', fontSize: '0.875rem' }}>
                        {batch.out_time ? new Date(batch.out_time).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {batch.out_time ? (
                          <span style={{
                            background: batch.transport_type === 'external' ? '#dc2626' : '#059669',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {batch.transport_type === 'external' ? '🚚 External' : '🏢 Company'}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: '#4b5563', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                        {batch.vehicle_registration || '-'}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        <span style={{
                          background: batch.received_through_type === 'mediator' ? '#7c3aed' : '#2563eb',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {batch.received_through_type === 'mediator' ? '👤' : '🏢'} {batch.received_through_type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#4b5563' }}>
                        {batch.mediator_name || '-'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {/* Show Items Button */}
                          <button
                            onClick={() => toggleExpand(batch)}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            👁️ Show
                          </button>

                          {/* Edit Button - Only show if batch hasn't exited */}
                          {!batch.out_time && (
                            <button
                              onClick={() => navigate(`/edit-batch/${batch.id}`)}
                              style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              ✏️ Edit
                            </button>
                          )}

                          {/* Exit Info Button - Only show if batch has exited */}
                          {batch.out_time && (
                            <button
                              onClick={() => toggleExitInfo(batch.id)}
                              style={{
                                background: expandedExit[batch.id] 
                                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                                  : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {expandedExit[batch.id] ? '🔼 Hide Exit' : '🔽 Exit Info'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Items View */}
                    {expanded[batch.id] && items[batch.id] && (
                      <tr>
                        <td colSpan="9" style={{ padding: 0 }}>
                          <div style={{
                            background: 'rgba(249, 250, 251, 0.8)',
                            padding: '1.5rem',
                            borderTop: '1px solid rgba(0, 0, 0, 0.05)'
                          }}>
                            <h4 style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: '#1f2937',
                              margin: '0 0 1rem 0'
                            }}>
                              📦 Batch Items:
                            </h4>
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', fontSize: '0.875rem' }}>Material Type</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', fontSize: '0.875rem' }}>Color</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#1f2937', fontSize: '0.875rem' }}>Number of Rolls</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items[batch.id].map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                                      <td style={{ padding: '0.75rem', color: '#1f2937', fontWeight: '500' }}>
                                        {item.material_type_name}
                                      </td>
                                      <td style={{ padding: '0.75rem', color: '#4b5563' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <div 
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              borderRadius: '50%',
                                              border: '1px solid #d1d5db',
                                              backgroundColor: item.color.toLowerCase()
                                            }}
                                          ></div>
                                          {item.color}
                                        </span>
                                      </td>
                                      <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                          background: '#3b82f6',
                                          color: 'white',
                                          padding: '0.25rem 0.75rem',
                                          borderRadius: '1rem',
                                          fontSize: '0.75rem',
                                          fontWeight: '600'
                                        }}>
                                          {item.number_of_rolls} rolls
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            
                            {/* Total Summary */}
                            <div style={{
                              marginTop: '1rem',
                              padding: '1rem',
                              background: 'rgba(255, 255, 255, 0.6)',
                              borderRadius: '0.5rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '1rem'
                            }}>
                              <div>
                                <span style={{ fontWeight: '500', color: '#4b5563' }}>Total Items: </span>
                                <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '1.125rem' }}>
                                  {items[batch.id].length}
                                </span>
                              </div>
                              <div>
                                <span style={{ fontWeight: '500', color: '#4b5563' }}>Total Rolls: </span>
                                <span style={{ fontWeight: '700', color: '#3b82f6', fontSize: '1.125rem' }}>
                                  {items[batch.id].reduce((sum, item) => sum + item.number_of_rolls, 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {/* Collapsible Exit Information */}
                    {batch.out_time && expandedExit[batch.id] && (
                      <tr>
                        <td colSpan="9" style={{ padding: 0 }}>
                          <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '1rem',
                            borderTop: '1px solid rgba(0, 0, 0, 0.05)'
                          }}>
                            <h4 style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: '#059669',
                              margin: '0 0 0.5rem 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              ✅ Exit Information
                            </h4>
                            <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6' }}>
                              <p style={{ margin: '0 0 0.25rem 0' }}>
                                📅 Exit Date: {new Date(batch.out_time).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {batch.destination_name && (
                                <p style={{ margin: '0 0 0.25rem 0' }}>
                                  📍 Destination: {batch.destination_name}
                                </p>
                              )}
                              {batch.transport_type && (
                                <p style={{ margin: '0 0 0.25rem 0' }}>
                                  🚛 Transport: {batch.transport_type === 'company' ? 'Company Transport' : 'External Transport'}
                                  {batch.vehicle_registration && (
                                    <span style={{ fontFamily: 'monospace', marginLeft: '0.5rem', fontWeight: '600' }}>
                                      ({batch.vehicle_registration})
                                    </span>
                                  )}
                                </p>
                              )}
                              {batch.exit_notes && (
                                <p style={{ margin: '0.25rem 0 0 0' }}>
                                  📝 Notes: {batch.exit_notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredBatches.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '1rem',
            marginTop: '2rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>📝</div>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No batches found</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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
              backdropFilter: 'blur(10px)'
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}