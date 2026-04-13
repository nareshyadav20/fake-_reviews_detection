import React, { useState } from 'react';
import axios from 'axios';
import { UserIcon, LockIcon, EmailIcon, ShieldLoginIcon, EyeIcon, EyeOffIcon } from './LoginIcons';

const Signup = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !username || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const res = await axios.post(`${API_URL}/signup`, {
        name, username, password
      });
      alert("Signup successful! Please login with your new account.");
      onSignupSuccess();
    } catch (err) {
      alert("Signup failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <ShieldLoginIcon size={48} color="#667eea" />
          <h2>Create Account</h2>
          <p>Join us to start detecting fake reviews</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>
              <UserIcon size={18} />
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <EmailIcon size={18} />
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <LockIcon size={18} />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <span onClick={onSwitchToLogin}>Login</span></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
