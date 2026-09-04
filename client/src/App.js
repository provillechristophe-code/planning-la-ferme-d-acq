import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import axios from 'axios';
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
  var savedUserStr = localStorage.getItem('user');
  var parsedUser = null;
  if (savedUserStr) {
    try {
      parsedUser = JSON.parse(savedUserStr);
    } catch (e) {
      console.error('Erreur lecture utilisateur:', e);
    }
  }

  const [token, setToken] = useState(savedToken);
  const [user, setUser] = useState(parsedUser);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Synchronisation et restauration automatique sécurisée
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const startSyncProcess = async () => {
      // 1. Restaurer si une sauvegarde locale existe
      const savedBackupStr = localStorage.getItem('la_ferme_d_acq_backup');
      if (savedBackupStr) {
        try {
          const backupData = JSON.parse(savedBackupStr);
          await axios.post('/api/reservations/restore-full', backupData);
        } catch (e) {
          console.error('Erreur restauration locale:', e);
        }
      }

      // 2. Synchroniser régulièrement les données du serveur vers la sauvegarde locale du navigateur
      const syncBackup = () => {
        if (!isMounted) return;
        Promise.all([
          axios.get('/api/clients'),
          axios.get('/api/animals'),
          axios.get('/api/config/boxes'),
          axios.get('/api/reservations'),
          axios.get('/api/invoices')
        ])
          .then((results) => {
            const payload = {
              clients: results[0].data || [],
              animals: results[1].data || [],
              boxes: results[2].data || [],
              reservations: results[3].data || [],
              invoices: results[4].data || []
            };
            if (payload.reservations.length > 0 || payload.clients.length > 0) {
              localStorage.setItem('la_ferme_d_acq_backup', JSON.stringify(payload));
            }
          })
          .catch(() => {});
      };

      syncBackup();
      const interval = setInterval(syncBackup, 15000);
      return interval;
    };

    let syncInterval = null;
    startSyncProcess().then((interval) => {
      syncInterval = interval;
    });

    return () => {
      isMounted = false;
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [token]);

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

  var handleHeaderBackupDownload = function() {
    axios.get('/api/backup-db', { responseType: 'blob' })
      .then(function(res) {
        var url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
        var link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'pattes_douces_backup_' + new Date().toISOString().slice(0, 10) + '.json');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch(function(err) {
        console.error('Erreur téléchargement sauvegarde :', err);
      });
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
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
              <button 
                onClick={handleHeaderBackupDownload} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
                  cursor: 'pointer'
                }}
                title="Télécharger une sauvegarde instantanée de vos données"
              >
                💾 Sauvegarder la base
              </button>
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