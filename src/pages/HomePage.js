import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function HomePage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeBatches, setActiveBatches] = useState([]);
  const [stats, setStats] = useState({
    totalActiveBatches: 0,
    totalActiveRolls: 0,
    oldestBatch: null,
    companiesWithActiveBatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchLiveData();

    return () => clearInterval(timeInterval);
  }, []);

  const fetchLiveData = async () => {
    try {
      // Fetch active batches (not exited)
      const [batchesRes, itemsRes] = await Promise.all([
        API.get('/batches'),
        API.get('/batches') // We'll process this to get items for active batches
      ]);

      const allBatches = batchesRes.data;
      const activeBatchesData = allBatches.filter(batch => !batch.out_time);
      
      // Calculate stats
      const uniqueCompanies = new Set(activeBatchesData.map(batch => batch.company_name)).size;
      const oldestActiveBatch = activeBatchesData.length > 0 
        ? activeBatchesData.reduce((oldest, batch) => 
            new Date(batch.in_time) < new Date(oldest.in_time) ? batch : oldest
          )
        : null;

      setActiveBatches(activeBatchesData.slice(0, 8)); // Show first 8 active batches
      setStats({
        totalActiveBatches: activeBatchesData.length,
        totalActiveRolls: 0, // We'll calculate this if we have items data
        oldestBatch: oldestActiveBatch,
        companiesWithActiveBatches: uniqueCompanies
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching live data:', error);
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              🏭 Dyeing Entry/Exit System
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0
            }}>
              Complete management solution for your dyeing operations
            </p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white',
              fontFamily: 'Courier New, monospace'
            }}>
              {formatTime(currentTime)}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: '0.25rem'
            }}>
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Quick Actions */}
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 1rem 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            🚀 Quick Actions
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Entry Card */}
            <div
              onClick={() => navigate('/entry')}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1.5rem',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                color: '#d32f2f'
              }}>
                📝
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 0.5rem 0'
              }}>
                New Batch Entry
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0 0 1rem 0',
                lineHeight: '1.5'
              }}>
                Add new batches to the system with material details
              </p>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#d32f2f'
              }}>
                →
              </div>
            </div>

            {/* Exit Card */}
            <div
              onClick={() => navigate('/exit')}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1.5rem',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                color: '#059669'
              }}>
                🚛
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 0.5rem 0'
              }}>
                Process Exit
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0 0 1rem 0',
                lineHeight: '1.5'
              }}>
                Mark batches as completed and ready for exit
              </p>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#059669'
              }}>
                →
              </div>
            </div>

            {/* View Card */}
            <div
              onClick={() => navigate('/view')}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1.5rem',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                color: '#3b82f6'
              }}>
                📊
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 0.5rem 0'
              }}>
                View Records
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0 0 1rem 0',
                lineHeight: '1.5'
              }}>
                Browse all batch records and generate reports
              </p>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#3b82f6'
              }}>
                →
              </div>
            </div>
          </div>
        </div>

        {/* Live System Stats */}
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 1rem 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            📊 Live System Status
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
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
                {stats.totalActiveBatches}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                Active Batches
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
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>
                {stats.companiesWithActiveBatches}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                Companies
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
                {stats.oldestBatch ? getDaysInSystem(stats.oldestBatch.in_time) : 0}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                Days (Oldest)
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
              borderLeft: '4px solid #10b981'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>
                Live
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                Real-time Data
              </p>
            </div>
          </div>
        </div>

        {/* Active Batches List */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white',
              margin: 0,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              📦 Active Batches (In System)
            </h2>
            <button
              onClick={() => navigate('/view')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateX(3px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              View All →
            </button>
          </div>

          {activeBatches.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {activeBatches.map((batch, index) => (
                <div
                  key={batch.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                  }}
                  onClick={() => navigate('/view')}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {batch.company_name}
                      </h4>
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
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      ⏳ Active
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.875rem' }}>📅</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        Entry: {new Date(batch.in_time).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.875rem' }}>⏱️</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {getDaysInSystem(batch.in_time)} day(s) in system
                      </span>
                    </div>
                    {batch.mediator_name && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ fontSize: '0.875rem' }}>👤</span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          Via: {batch.mediator_name}
                        </span>
                      </div>
                    )}
                  </div>
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
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.7 }}>📝</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 0.5rem 0'
              }}>
                No Active Batches
              </h3>
              <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                All batches have been processed and exited
              </p>
              <button
                className="primary-btn"
                onClick={() => navigate('/entry')}
                style={{
                  width: 'auto',
                  padding: '0.75rem 1.5rem',
                  background: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create New Batch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}