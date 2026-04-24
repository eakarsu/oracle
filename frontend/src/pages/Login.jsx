import React, { useState } from 'react';
import { api } from '../services/api';

const DEMO_ACCOUNTS = [
  { label: 'Admin', name: 'John Administrator', email: 'admin@oracle-erp.com', role: 'admin', dept: 'Executive' },
  { label: 'Finance Mgr', name: 'Sarah Mitchell', email: 'sarah.finance@oracle-erp.com', role: 'manager', dept: 'Finance' },
  { label: 'HR Manager', name: 'Mike Johnson', email: 'mike.hr@oracle-erp.com', role: 'manager', dept: 'Human Resources' },
  { label: 'Sales Mgr', name: 'Emily Davis', email: 'emily.sales@oracle-erp.com', role: 'manager', dept: 'Sales' },
  { label: 'IT User', name: 'David Wilson', email: 'david.it@oracle-erp.com', role: 'user', dept: 'IT' },
  { label: 'Ops User', name: 'Lisa Chen', email: 'lisa.ops@oracle-erp.com', role: 'user', dept: 'Operations' },
];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAutoFill = (account) => {
    setEmail(account.email);
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      onLogin(user, token);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-lg">O</div>
          <h2>Oracle ERP</h2>
          <p className="login-subtitle">Enterprise Resource Planning System</p>
        </div>

        <div className="demo-accounts">
          <p className="demo-accounts-label">Demo Accounts (click to auto-fill)</p>
          <div className="demo-accounts-grid">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className={`demo-account-btn ${email === account.email ? 'active' : ''}`}
                onClick={() => handleAutoFill(account)}
              >
                <span className="demo-account-role">{account.role}</span>
                <span className="demo-account-name">{account.name}</span>
                <span className="demo-account-dept">{account.dept}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
