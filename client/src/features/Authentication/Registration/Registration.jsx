import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../authSlice';
import { authService } from '../../../services/authService';
import RegistrationForm from './RegistrationForm';

const Registration = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleRegistration = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Register the user
      const user = await authService.register(userData);
      
      // Auto-login after successful registration
      dispatch(loginSuccess(user));
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <h1>Create Account</h1>
      {success ? (
        <div className="success-message">
          <h3>Registration Successful!</h3>
          <p>Your account has been created successfully.</p>
        </div>
      ) : (
        <>
          <RegistrationForm onSubmit={handleRegistration} loading={loading} />
          {error && <div className="error-message">{error}</div>}
        </>
      )}
    </div>
  );
};

export default Registration;