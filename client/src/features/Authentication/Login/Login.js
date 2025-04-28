import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../authSlice';
import LoginForm from './LoginForm';
import { authService } from '../../../services/authService';

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const handleLogin = async (credentials) => {
    try {
      dispatch(loginStart());
      const user = await authService.login(credentials);
      dispatch(loginSuccess(user));
    } catch (error) {
      dispatch(loginFailure(error.message));
    }
  };

  return (
    <div className="login-container">
      <h1>Login to AVEROX CRM</h1>
      <LoginForm onSubmit={handleLogin} loading={loading} />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Login;