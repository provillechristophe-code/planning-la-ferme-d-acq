import React, { useState } from 'react';
import axios from 'axios';
var s = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 20 },
  card: { background: '#ffffff', borderRadius: 24, padding: 48, width: '100%', maxWidth: 440, boxShadow: '0 32px 64px rgba(102, 126, 234, 0.25)', position: 'relative', overflow: 'hidden' },
  title: { fontSize: 28, fontWeight: 800, color: '#1e293b', textAlign: 'center', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { textAlign: 'center', color: '#94a3b8', fontSize: 14, fontWeight: 500, marginBottom: 32 },
  logoIcon: { width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 },
  input: { width: '100%', padding: '14px 16px', border: '2px solid #f1f5f9', borderRadius: 12, fontSize: 15, color: '#1e293b', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s', background: '#fafbfc' },
  btn: { width: '100%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#ffffff', border: 'none', padding: '16px 24px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)', transition: 'all 0.2s', letterSpacing: 0.2, marginTop: 4 },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 16 },
  successBox: { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 16 },
  linkRow: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' },
  link: { color: '#6366f1', textDecoration: 'none', fontWeight: 700, borderBottom: '1px solid transparent', transition: 'border-color 0.2s' },
  footer: { textAlign: 'center', marginTop: 32, fontSize: 12, color: '#94a3b8', opacity: 0.8 }
};
function Register({ onLogin }) {
  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [password, setPassword] = useState('');
  var [error, setError] = useState('');
  var [success, setSuccess] = useState('');
  var [loading, setLoading] = useState(false);
  var handleSubmit = function(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    axios.post('/api/auth/register', { name: name, email: email, password: password }).then(function() {
      setLoading(false);
      setSuccess('Inscription réussie ! Redirection...');
      setTimeout(function() {
        window.location.href = '/login';
      }, 2000);
    }).catch(function(err) {
      setLoading(false);
      setError(err.response && err.response.data && err.response.data.error ? err.response.data.error : "Erreur d'inscription");
    });
  };
  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <div style={s.logoIcon}>🐾</div>
        <h2 style={s.title}>Créer un compte</h2>
        <p style={s.subtitle}>Rejoignez la communauté <strong>La Ferme d'Acq</strong></p>
        {error && (
          <div style={s.errorBox}>
            <span style={{ fontWeight: 700 }}>⚠ Erreur : </span>{error}
          </div>
        )}
        {success && (
          <div style={s.successBox}>
            <span style={{ fontWeight: 700 }}>✓ {success}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={s.formGroup}>
            <label style={s.label} htmlFor="name">Nom complet</label>
            <input
              id="name"
              type="text"
              style={s.input}
              placeholder="Votre nom"
              value={name}
              onChange={function(e) { setName(e.target.value); }}
              required
            />
          </div>
          <div style={s.formGroup}>
            <label style={s.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              style={s.input}
              placeholder="votre@email.com"
              value={email}
              onChange={function(e) { setEmail(e.target.value); }}
              required
            />
          </div>
          <div style={s.formGroup}>
            <label style={s.label} htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              style={s.input}
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={function(e) { setPassword(e.target.value); }}
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            style={Object.assign({}, s.btn, loading ? { opacity: 0.7, pointerEvents: 'none' } : {})}
            onMouseOver={function(e) { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={function(e) { if (!loading) e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? 'Inscription en cours...' : 'Créer mon compte →'}
          </button>
        </form>
        <div style={s.linkRow}>
          <span>Déjà un compte ? </span>
          <a href="/login" style={s.link}>Se connecter</a>
        </div>
        <div style={s.footer}>
          La Ferme d'Acq — Pension Animalière
        </div>
      </div>
    </div>
  );
}
export default Register;