import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import ProcurementApprovals from './pages/ProcurementApprovals';
import { api } from './services/api';

function Sidebar({ user, onLogout }) {
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">O</div>
        <div><h1>Oracle Procurement</h1><span>Retained workflow</span></div>
      </div>
      <nav className="sidebar-nav" aria-label="Primary">
        <div className="sidebar-section">WORKFLOW</div>
        <Link to="/procurement" className={location.pathname === '/procurement' ? 'active' : ''}>
          <span className="nav-icon">📦</span>Purchase orders
        </Link>
        <div className="sidebar-section">ACCOUNT</div>
        <button type="button" onClick={onLogout}><span className="nav-icon">↪</span>Sign out</button>
      </nav>
      <div className="sidebar-user">
        <div className="avatar">{user.name?.[0] || 'U'}</div>
        <div className="user-info"><div className="user-name">{user.name}</div><div className="user-role">{user.role}</div></div>
      </div>
    </aside>
  );
}

function AuthenticatedApp({ user, onLogout }) {
  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/procurement" element={<ProcurementApprovals user={user} />} />
          <Route path="*" element={<Navigate to="/procurement" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.me().then((currentUser) => {
      if (active) setUser(currentUser);
    }).catch(() => {
      if (active) setUser(null);
    }).finally(() => {
      if (active) setLoading(false);
    });
    const expire = () => setUser(null);
    window.addEventListener('oracle-auth-expired', expire);
    return () => {
      active = false;
      window.removeEventListener('oracle-auth-expired', expire);
    };
  }, []);

  const logout = async () => {
    try { await api.logout(); } finally { setUser(null); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <BrowserRouter>
      {user ? (
        <AuthenticatedApp user={user} onLogout={logout} />
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
