import React from 'react';
import './InputField.css';

/**
 * Reusable Input Field component
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.name - Input field name
 * @param {string} props.label - Field label
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} InputField component
 */
const InputField = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  className = '',
  ...rest
}) => {
  const inputClass = `input-field ${error ? 'input-error' : ''} ${className}`.trim();
  const id = `input-${name}`;

  return (
    <div className="input-container">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClass}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      
      {error && (
        <div id={`${id}-error`} className="input-error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default InputField;