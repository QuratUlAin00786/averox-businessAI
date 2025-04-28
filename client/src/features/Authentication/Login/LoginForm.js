import React, { useState } from 'react';
import Button from '../../../components/Button';
import InputField from '../../../components/InputField';

const LoginForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <InputField
        type="text"
        name="username"
        label="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <InputField
        type="password"
        name="password"
        label="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <Button
        type="submit"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;