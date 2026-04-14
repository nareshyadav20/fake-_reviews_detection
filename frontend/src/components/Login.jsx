import React, { useState } from 'react';
import axios from 'axios';
import { LockIcon, EmailIcon, EyeIcon, EyeOffIcon, ShieldLoginIcon } from './LoginIcons';

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const res = await axios.post(`${API}/login`, {
        username, password
      });

      if (res.data.token) {
        onLoginSuccess(res.data.token);
      } else {
        alert("Login failed: No token received");
      }
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <ShieldLoginIcon size={48} color="#667eea" />
          <h2>Welcome Back</h2>
          <p>Login to your account to continue</p>
        </div>

        <form onSubmit={handleLogin}>
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
                placeholder="Enter your password"
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <span onClick={onSwitchToSignup}>Sign Up</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
