import React from 'react';

const CustomSelect = ({ label, error, required, children, ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`custom-select ${error ? 'custom-input-error' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-red-500 text-sm animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default CustomSelect;