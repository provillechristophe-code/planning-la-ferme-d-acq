import React, { useState, useEffect } from 'react';
import axios from 'axios';
var s = {
  page: { maxWidth: 1100, margin: '0 auto' },
  headerTitle: { fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 4 },
  headerSub: { color: '#94a3b8', fontSize: 14, margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginTop: 28, marginBottom: 28 },
  statCard: { background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, position: 'relative', overflow: 'hidden' },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  statIcon: { width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  statLabel: { fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 4 },
  statValue: { fontSize: 32, fontWeight: 800, color: '#1e293b', lineHeight: 1 },
  statStripe: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4 },
  card: { background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24 },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 },
  cardSub: { fontSize: 12, color: '#94a3b8', margin: '2px 0 0 0' },
  cardBody: { padding: 24 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  barRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 },
  barLabel: { width: 80, fontSize: 13, fontWeight: 600, color: '#475569', textAlign: 'right', flexShrink: 0 },
  barTrack: { flex: 1, height: 32, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden', position: 'relative' },
  barFill: { height: '100%', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10, transition: 'width 0.6s ease' },
  barValue: { fontSize: 12, fontWeight: 800, color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' },
  barAmount: { width: 80, fontSize: 14, fontWeight: 700, color: '#1e293b', textAlign: 'right', flexShrink: 0 },
  pendingCard: { background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', border: '1px solid #fde68a', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 20 },
  pendingIcon: { width: 56, height: 56, borderRadius: 14, background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 },
  pendingValue: { fontSize: 28, fontWeight: 800, color: '#92400e' },
  pendingLabel: { fontSize: 14, color: '#b45309', fontWeight: 500 },
  monthName: { fontSize: 13, fontWeight: 600, color: '#475569' },
  emptyState: { padding: 50, textAlign: 'center', color: '#94a3b8' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#94a3b8' },
  spinner: { width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  kpiCard: { background: '#f8fafc', borderRadius: 12, padding: 20, textAlign: 'center' },
  kpiValue: { fontSize: 24, fontWeight: 800, color: '#1e293b' },
  kpiLabel: { fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }
};
var monthNames = {
  '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril',
  '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août',
  '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
};
var barColors = [
  'linear-gradient(135deg, #6366f1, #818cf8)',
  'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  'linear-gradient(135deg, #3b82f6, #60a5fa)',
  'linear-gradient(135deg, #06b6d4, #22d3ee)',
  'linear-gradient(135deg, #10b981, #34d399)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #ef4444, #f87171)',
  'linear-gradient(135deg, #ec4899, #f472b6)',
  'linear-gradient(135deg, #8b5cf6, #c084fc)',
  'linear-gradient(135deg, #14b8a6, #2dd4bf)',
  'linear-gradient(135deg, #f97316, #fb923c)',
  'linear-gradient(135deg, #6366f1, #818cf8)'
];
function formatMonthLabel(monthStr) {
  if (!monthStr) return '—';
  var parts = monthStr.split('-');
  if (parts.length === 2) {
    var mKey = parts[1];
    var year = parts[0];
    return (monthNames[mKey] || mKey) + ' ' + year;
  }
  return monthStr;
}
function Stats() {
  var [stats, setStats] = useState(null);
  var [monthlyRevenue, setMonthlyRevenue] = useState([]);
  var [loading, setLoading] = useState(true);
  useEffect(function() {
    fetchStats();
  }, []);
  var fetchStats = function() {
    Promise.all([
      axios.get('/api/stats'),
      axios.get('/api/stats/revenue/monthly')
    ]).then(function(results) {
      setStats(results[0].data);
      setMonthlyRevenue(results[1].data);
      setLoading(false);
    }).catch(function(err) {
      console.error(err);
      setLoading(false);
    });
  };
  var getValue = function(key) {
    if (stats && stats[key] !== undefined && stats[key] !== null) return stats[key];
    return 0;
  };
  var getRevenue = function() {
    if (stats && stats.totalRevenue) return stats.totalRevenue.toFixed(2);
    return '0.00';
  };
  var getPending = function() {
    if (stats && stats.pendingInvoices) return stats.pendingInvoices;
    return 0;
  };
  var maxRevenue = 0;
  if (monthlyRevenue && monthlyRevenue.length > 0) {
    monthlyRevenue.forEach(function(m) {
      var val = m.total || 0;
      if (val > maxRevenue) maxRevenue = val;
    });
  }
  if (maxRevenue === 0) maxRevenue = 1;
  var avgPerMonth = 0;
  if (monthlyRevenue && monthlyRevenue.length > 0) {
    var totalAll = 0;
    monthlyRevenue.forEach(function(m) { totalAll += (m.total || 0); });
    avgPerMonth = totalAll / monthlyRevenue.length;
  }
  var bestMonth = null;
  if (monthlyRevenue && monthlyRevenue.length > 0) {
    bestMonth = monthlyRevenue[0];
    monthlyRevenue.forEach(function(m) {
      if ((m.total || 0) > (bestMonth.total || 0)) bestMonth = m;
    });
  }
  if (loading) {
    return (
      <div style={s.loading}>
        <div style={s.spinner}></div>
        <p>Chargement des statistiques...</p>
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    );
  }
  return (
    <div style={s.page}>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      {/* Header */}
      <div>
        <h2 style={s.headerTitle}>📊 Statistiques</h2>
        <p style={s.headerSub}>Vue d'ensemble de votre activité</p>
      </div>
      {/* Stats principales */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statTop}>
            <div style={Object.assign({}, s.statIcon, { background: '#eef2ff' })}>👥</div>
          </div>
          <p style={s.statLabel}>Total Clients</p>
          <p style={s.statValue}>{getValue('totalClients')}</p>
          <div style={Object.assign({}, s.statStripe, { background: 'linear-gradient(90deg, #6366f1, #818cf8)' })}></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statTop}>
            <div style={Object.assign({}, s.statIcon, { background: '#fef3c7' })}>🐾</div>
          </div>
          <p style={s.statLabel}>Total Animaux</p>
          <p style={s.statValue}>{getValue('totalAnimals')}</p>
          <div style={Object.assign({}, s.statStripe, { background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' })}></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statTop}>
            <div style={Object.assign({}, s.statIcon, { background: '#e0f2fe' })}>📋</div>
          </div>
          <p style={s.statLabel}>Réservations</p>
          <p style={s.statValue}>{getValue('totalReservations')}</p>
          <div style={Object.assign({}, s.statStripe, { background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' })}></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statTop}>
            <div style={Object.assign({}, s.statIcon, { background: '#ecfdf5' })}>💰</div>
          </div>
          <p style={s.statLabel}>Revenu Total</p>
          <p style={Object.assign({}, s.statValue, { color: '#059669' })}>{getRevenue()}€</p>
          <div style={Object.assign({}, s.statStripe, { background: 'linear-gradient(90deg, #10b981, #34d399)' })}></div>
        </div>
      </div>
      <div style={s.grid2}>
        {/* Graphique Revenus */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={Object.assign({}, s.cardIcon, { background: '#eef2ff' })}>📈</div>
            <div>
              <h3 style={s.cardTitle}>Revenu par mois</h3>
              <p style={s.cardSub}>Évolution de votre chiffre d'affaires</p>
            </div>
          </div>
          <div style={s.cardBody}>
            {(!monthlyRevenue || monthlyRevenue.length === 0) ? (
              <div style={s.emptyState}>
                <p style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>📈</p>
                <p>Pas encore de données de revenus</p>
              </div>
            ) : (
              <div>
                {monthlyRevenue.map(function(m, index) {
                  var val = m.total || 0;
                  var pct = Math.max(5, (val / maxRevenue) * 100);
                  var color = barColors[index % barColors.length];
                  return (
                    <div key={m.month || index} style={s.barRow}>
                      <div style={s.barLabel}>{formatMonthLabel(m.month)}</div>
                      <div style={s.barTrack}>
                        <div style={Object.assign({}, s.barFill, { width: pct + '%', background: color })}>
                          {pct > 20 && <span style={s.barValue}>{val.toFixed(0)}€</span>}
                        </div>
                      </div>
                      {pct <= 20 && <div style={s.barAmount}>{val.toFixed(0)}€</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* Colonne droite */}
        <div>
          {/* Factures en attente */}
          <div style={s.pendingCard}>
            <div style={s.pendingIcon}>⏳</div>
            <div>
              <div style={s.pendingValue}>{getPending()}</div>
              <div style={s.pendingLabel}>Factures en attente de paiement</div>
            </div>
          </div>
          {/* KPIs */}
          <div style={Object.assign({}, s.card, { marginTop: 24 })}>
            <div style={s.cardHeader}>
              <div style={Object.assign({}, s.cardIcon, { background: '#fce7f3' })}>🎯</div>
              <div>
                <h3 style={s.cardTitle}>Indicateurs clés</h3>
                <p style={s.cardSub}>Performance de votre pension</p>
              </div>
            </div>
            <div style={s.cardBody}>
              <div style={s.kpiRow}>
                <div style={s.kpiCard}>
                  <div style={Object.assign({}, s.kpiValue, { color: '#6366f1' })}>
                    {avgPerMonth.toFixed(0)}€
                  </div>
                  <div style={s.kpiLabel}>Moyenne / mois</div>
                </div>
                <div style={s.kpiCard}>
                  <div style={Object.assign({}, s.kpiValue, { color: '#10b981' })}>
                    {bestMonth ? (bestMonth.total || 0).toFixed(0) + '€' : '—'}
                  </div>
                  <div style={s.kpiLabel}>Meilleur mois</div>
                </div>
                <div style={s.kpiCard}>
                  <div style={Object.assign({}, s.kpiValue, { color: '#f59e0b' })}>
                    {monthlyRevenue ? monthlyRevenue.length : 0}
                  </div>
                  <div style={s.kpiLabel}>Mois actifs</div>
                </div>
              </div>
              {bestMonth && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#15803d', fontWeight: 600, margin: 0 }}>
                    🏆 Meilleur mois : <strong>{formatMonthLabel(bestMonth.month)}</strong> avec <strong>{(bestMonth.total || 0).toFixed(2)}€</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Répartition rapide */}
          <div style={Object.assign({}, s.card, { marginTop: 24 })}>
            <div style={s.cardHeader}>
              <div style={Object.assign({}, s.cardIcon, { background: '#ede9fe' })}>🧮</div>
              <div>
                <h3 style={s.cardTitle}>Répartition</h3>
                <p style={s.cardSub}>Votre portefeuille</p>
              </div>
            </div>
            <div style={s.cardBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>👥</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Clients</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{getValue('totalClients')}</span>
                </div>
                <div style={{ height: 1, background: '#f1f5f9' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🐾</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Animaux</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{getValue('totalAnimals')}</span>
                </div>
                <div style={{ height: 1, background: '#f1f5f9' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>📋</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Réservations</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{getValue('totalReservations')}</span>
                </div>
                <div style={{ height: 1, background: '#f1f5f9' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>💰</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Revenu total</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>{getRevenue()}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Stats;