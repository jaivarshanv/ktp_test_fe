import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <h1>Dyeing Entry/Exit System</h1>
      <button onClick={() => navigate('/entry')}>Entry</button>
      <button onClick={() => navigate('/exit')}>Exit</button>
      <button onClick={() => navigate('/view')}>View</button>
    </div>
  );
}