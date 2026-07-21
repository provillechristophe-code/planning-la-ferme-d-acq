import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Animals from './pages/Animals';
import Planning from './pages/Planning';
import Reservations from './pages/Reservations';
import Invoices from './pages/Invoices';
import Stats from './pages/Stats';
import Configuration from './pages/Configuration';
import Import from './pages/Import';

function App() {
  var savedToken = localStorage.getItem('token');
  var savedUser = localStorage.getItem('user');

  const [token, setToken] = useState(savedToken);
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  var handleLogin = function(newToken, newUser) {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  var handleLogout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  var getUserName = function() {
    if (user && user.name) {
      return user.name;
    }
    return 'Utilisateur';
  };

  var getUserInitial = function() {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (!token) {
    return (
      <BrowserRouter>
        <div className="auth-wrapper">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }

  var menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '🏠' },
    { path: '/clients', label: 'Clients', icon: '👥' },
    { path: '/animals', label: 'Animaux', icon: '🐾' },
    { path: '/planning', label: 'Planning', icon: '📅' },
    { path: '/reservations', label: 'Réservations', icon: '📋' },
    { path: '/invoices', label: 'Facturation', icon: '💶' },
    { path: '/stats', label: 'Statistiques', icon: '📊' },
    { path: '/import', label: 'Import', icon: '📥' },
    { path: '/configuration', label: 'Configuration', icon: '⚙️' }
  ];

  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className={sidebarOpen ? 'sidebar open' : 'sidebar closed'}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span className="logo-icon">🐾</span>
              {sidebarOpen && <span className="logo-text">La Ferme d'Acq</span>}
            </div>
            <button className="sidebar-toggle" onClick={function() { setSidebarOpen(!sidebarOpen); }}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map(function(item) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={function(navData) {
                    return navData.isActive ? 'nav-item active' : 'nav-item';
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            {sidebarOpen && user && (
              <div className="user-info">
                <div className="user-avatar">{getUserInitial()}</div>
                <div className="user-details">
                  <span className="user-name">{getUserName()}</span>
                  <span className="user-role">Administrateur</span>
                </div>
              </div>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              {sidebarOpen && <span className="nav-label">Déconnexion</span>}
            </button>
          </div>
        </aside>

        <div className="main-wrapper">
          <header className="top-header">
            <div className="header-left">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Rechercher un client, un animal..." />
              </div>
            </div>
            <div className="header-right">
              <button className="notif-btn">
                🔔
                <span className="notif-badge"></span>
              </button>
              <div className="header-user">
                <div className="header-avatar">{getUserInitial()}</div>
                <span className="header-username">{getUserName()}</span>
              </div>
            </div>
          </header>

          <main className="main-content">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/animals" element={<Animals />} />
              <Route path="/planning" element={<Planning />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/import" element={<Import />} />
              <Route path="/configuration" element={<Configuration />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;