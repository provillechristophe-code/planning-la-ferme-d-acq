import React, { useState, useEffect } from 'react';
import axios from 'axios';
var styles = {
  page: {
    maxWidth: 1200,
    margin: '0 auto'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: 4
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 15
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 20,
    marginBottom: 32,
    marginTop: 32
  },
  card: {
    background: '#ffffff',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    padding: 24
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  cardLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: 600,
    marginBottom: 4
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 800,
    color: '#1e293b',
    lineHeight: 1
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 50,
    fontSize: 11,
    fontWeight: 700
  },
  revenueCard: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: 16,
    padding: 24,
    color: '#ffffff'
  },
  revenueIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22
  },
  revenueBadge: {
    background: 'rgba(255,255,255,0.2)',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: 50,
    fontSize: 11,
    fontWeight: 700
  },
  revenueLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 600,
    marginBottom: 4
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1,
    color: '#ffffff'
  },
  tableCard: {
    background: '#ffffff',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  tableHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9'
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e293b',
    margin: 0
  },
  tableSub: {
    fontSize: 13,
    color: '#94a3b8',
    margin: '4px 0 0 0'
  },
  emptyState: {
    padding: 60,
    textAlign: 'center',
    color: '#94a3b8'
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
    opacity: 0.3
  },
  animalCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  animalIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16
  },
  animalName: {
    fontWeight: 600,
    color: '#1e293b'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    marginTop: 32
  },
  actionLink: {
    textDecoration: 'none'
  },
  actionCard: {
    background: '#ffffff',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    cursor: 'pointer'
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24
  },
  actionTitle: {
    fontWeight: 700,
    color: '#1e293b',
    fontSize: 15,
    margin: 0
  },
  actionSub: {
    color: '#94a3b8',
    fontSize: 13,
    margin: '4px 0 0 0'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
    color: '#94a3b8'
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #e2e8f0',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: 16
  }
};
function Dashboard() {
  var [stats, setStats] = useState(null);
  var [loading, setLoading] = useState(true);
  useEffect(function() {
    fetchStats();
  }, []);
  var fetchStats = function() {
    axios.get('/api/stats').then(function(res) {
      setStats(res.data);
      setLoading(false);
    }).catch(function(err) {
      console.error(err);
      setLoading(false);
    });
  };
  var getValue = function(key) {
    if (stats && stats[key] !== undefined && stats[key] !== null) {
      return stats[key];
    }
    return 0;
  };
  var getRevenue = function() {
    if (stats && stats.totalRevenue) return stats.totalRevenue.toFixed(2);
    return '0.00';
  };

  var getMonthRevenue = function() {
    if (stats && stats.monthRevenue) return stats.monthRevenue.toFixed(2);
    return '0.00';
  };

  var getYearRevenue = function() {
    if (stats && stats.yearRevenue) return stats.yearRevenue.toFixed(2);
    return '0.00';
  };

  var getRecentReservations = function() {
    if (stats && stats.recentReservations) return stats.recentReservations;
    return [];
  };

  var getArrivals = function() {
    if (stats && stats.todayArrivals) return stats.todayArrivals;
    return [];
  };

  var getDepartures = function() {
    if (stats && stats.todayDepartures) return stats.todayDepartures;
    return [];
  };

  var getStatusStyle = function(status) {
    if (status === 'confirmed') return { padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, display: 'inline-block', background: '#ecfdf5', color: '#059669' };
    if (status === 'pending') return { padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, display: 'inline-block', background: '#fffbeb', color: '#d97706' };
    if (status === 'cancelled') return { padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, display: 'inline-block', background: '#fef2f2', color: '#dc2626' };
    return { padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, display: 'inline-block', background: '#f1f5f9', color: '#64748b' };
  };

  var getStatusLabel = function(status) {
    if (status === 'confirmed') return 'Confirmée';
    if (status === 'pending') return 'En attente';
    if (status === 'cancelled') return 'Annulée';
    return status;
  };
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Chargement du tableau de bord...</p>
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    );
  }
  return (
    <div style={styles.page}>
      <div>
        <h2 style={styles.headerTitle}>Bienvenue ! 👋</h2>
        <p style={styles.headerSub}>Voici un aperçu de votre pension aujourd'hui</p>
      </div>
      <div style={styles.grid4}>
        <div style={styles.card}>
          <div style={styles.cardTop}>
            <div style={Object.assign({}, styles.iconBox, { background: '#eef2ff' })}>👥</div>
            <span style={Object.assign({}, styles.badge, { background: '#ecfdf5', color: '#059669' })}>Actifs</span>
          </div>
          <p style={styles.cardLabel}>Total Clients</p>
          <p style={styles.cardValue}>{getValue('totalClients')}</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTop}>
            <div style={Object.assign({}, styles.iconBox, { background: '#fef3c7' })}>🐾</div>
            <span style={Object.assign({}, styles.badge, { background: '#fef3c7', color: '#d97706' })}>Pensionnaires</span>
          </div>
          <p style={styles.cardLabel}>Total Animaux</p>
          <p style={styles.cardValue}>{getValue('totalAnimals')}</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTop}>
            <div style={Object.assign({}, styles.iconBox, { background: '#e0f2fe' })}>📋</div>
            <span style={Object.assign({}, styles.badge, { background: '#e0f2fe', color: '#0284c7' })}>Total</span>
          </div>
          <p style={styles.cardLabel}>Réservations</p>
          <p style={styles.cardValue}>{getValue('totalReservations')}</p>
        </div>
        <div style={styles.revenueCard}>
          <div style={styles.cardTop}>
            <div style={styles.revenueIcon}>💰</div>
            <span style={styles.revenueBadge}>Revenu</span>
          </div>
             <p style={styles.revenueLabel}>Revenu Total</p>
          <p style={styles.revenueValue}>{getRevenue()}€</p>
          <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Ce mois</span>
              <span style={{ fontWeight: 700 }}>{getMonthRevenue()}€</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Cette année</span>
              <span style={{ fontWeight: 700 }}>{getYearRevenue()}€</span>
            </div>
          </div>
        </div>
      </div>
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          
**Ajoutez AVANT** cette ligne :

```jsx
      {/* Arrivées et Départs du jour */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        {/* Arrivées */}
        <div style={styles.card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>📥</span>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>Arrivées aujourd'hui</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{getArrivals().length} arrivée(s)</p>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            {getArrivals().length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: 20, fontSize: 13 }}>Aucune arrivée prévue</p>
            ) : (
              getArrivals().map(function(r) {
                var icon = (r.animal_species || '').toLowerCase() === 'chat' ? '🐱' : '🐶';
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{r.animal_name || 'Animal'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>👤 {r.client_name || 'Client'} {r.client_phone ? '• 📞 ' + r.client_phone : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>📥 Arrivée</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{r.box_name ? '📦 ' + r.box_name : ''}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Départs */}
        <div style={styles.card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>📤</span>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>Départs aujourd'hui</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{getDepartures().length} départ(s)</p>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            {getDepartures().length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: 20, fontSize: 13 }}>Aucun départ prévu</p>
            ) : (
              getDepartures().map(function(r) {
                var icon = (r.animal_species || '').toLowerCase() === 'chat' ? '🐱' : '🐶';
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{r.animal_name || 'Animal'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>👤 {r.client_name || 'Client'} {r.client_phone ? '• 📞 ' + r.client_phone : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>📤 Départ</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{r.box_name ? '📦 ' + r.box_name : ''}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
          <h3 style={styles.tableTitle}>📋 Réservations Récentes</h3>
          <p style={styles.tableSub}>Les dernières réservations enregistrées</p>
        </div>
        {getRecentReservations().length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📅</p>
            <p>Aucune réservation récente</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Animal</th>
                <th>Client</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {getRecentReservations().map(function(r) {
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={styles.animalCell}>
                        <div style={styles.animalIcon}>🐾</div>
                        <span style={styles.animalName}>{r.animal_name || ('Animal #' + r.animal_id)}</span>
                      </div>
                    </td>
                    <td>{r.client_name || ('Client #' + r.client_id)}</td>
                    <td>{r.check_in}</td>
                    <td>{r.check_out}</td>
                    <td>
                      <span style={getStatusStyle(r.status)}>
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div style={styles.actionsGrid}>
        <a href="/reservations" style={styles.actionLink}>
          <div style={styles.actionCard}>
            <div style={Object.assign({}, styles.actionIcon, { background: '#eef2ff' })}>➕</div>
            <div>
              <p style={styles.actionTitle}>Nouvelle réservation</p>
              <p style={styles.actionSub}>Ajouter une réservation rapidement</p>
            </div>
          </div>
        </a>
        <a href="/clients" style={styles.actionLink}>
          <div style={styles.actionCard}>
            <div style={Object.assign({}, styles.actionIcon, { background: '#ecfdf5' })}>👥</div>
            <div>
              <p style={styles.actionTitle}>Voir les clients</p>
              <p style={styles.actionSub}>Gérer votre base de clients</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
export default Dashboard;