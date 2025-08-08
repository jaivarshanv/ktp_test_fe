import React, { useEffect, useState } from 'react';
import API from '../api';

export default function CompanySelector({ value, onChange }) {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState('');

  useEffect(() => {
    API.get('/companies').then(res => setCompanies(res.data));
  }, []);

  const handleAdd = () => {
    if (newCompany.trim()) {
      API.post('/companies', { name: newCompany.trim() }).then(res => {
        setCompanies([...companies, res.data]);
        onChange(res.data.id);
        setNewCompany('');
      });
    }
  };

  return (
    <div>
      <select value={value || ''} onChange={e => onChange(Number(e.target.value))} required>
        <option value="">Select Company</option>
        {companies.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <div className="form-row">
        <input
          placeholder="Add new company"
          value={newCompany}
          onChange={e => setNewCompany(e.target.value)}
        />
        <button type="button" className="add-btn" onClick={handleAdd}>
          Add Company
        </button>
      </div>
    </div>
  );
}