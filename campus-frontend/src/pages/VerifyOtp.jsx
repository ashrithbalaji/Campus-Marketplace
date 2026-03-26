import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the email passed from the Signup page via React Router state
  const email = location.state?.email;

  if (!email) {
    // If accessed directly without signing up first, redirect to signup
    navigate('/signup');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/verify-otp', { email, otp });
      alert('Email Verified successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-color)' }}>
          An OTP has been sent to <strong>{email}</strong>
        </p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Enter 6-Digit OTP</label>
            <input 
              type="text" 
              maxLength="6"
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
              placeholder="e.g 123456"
              required 
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading || otp.length < 6}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
