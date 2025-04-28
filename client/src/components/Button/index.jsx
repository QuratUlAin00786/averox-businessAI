import React from 'react';
import './Button.css';

/**
 * Reusable Button component
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @returns {JSX.Element} Button component
 */
const Button = ({ 
  className = '', 
  type = 'button', 
  disabled = false, 
  onClick, 
  children, 
  ...rest 
}) => {
  const buttonClass = `btn ${className}`.trim();

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;