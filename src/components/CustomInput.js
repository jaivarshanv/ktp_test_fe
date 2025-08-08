import React from 'react';

const CustomInput = ({ label, error, required, ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`custom-input ${error ? 'custom-input-error' : ''}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default CustomInput;