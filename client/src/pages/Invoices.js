import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import InvoicePrint from '../components/InvoicePrint';

var s = {
  page: { maxWidth: 1200, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
  headerTitle: { fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 4 },
  headerSub: { color: '#94a3b8', fontSize: 14, margin: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  statCard: { background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 },
  statIcon: { width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  statValue: { fontSize: 22, fontWeight: 800, color: '#1e293b', lineHeight: 1 },
  statLabel: { fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  grid: { display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24, alignItems: 'flex-start' },
  card: { background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 },
  cardSub: { fontSize: 12, color: '#94a3b8', margin: '2px 0 0 0' },
  cardBody: { padding: 24 },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 },
  helper: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  select: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#fff' },
  btnCalc: { width: '100%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  btnCreate: { width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 12 },
  calcResult: { marginTop: 20, background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' },
  calcHeader: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '16px 20px', color: '#ffffff' },
  calcTitle: { fontSize: 14, fontWeight: 700, margin: 0 },
  calcBody: { padding: 20 },
  calcRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' },
  calcLabel: { fontSize: 13, color: '#64748b', fontWeight: 500 },
  calcValue: { fontSize: 14, fontWeight: 700, color: '#1e293b' },
  calcTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', marginTop: 8, borderTop: '2px solid #e2e8f0' },
  calcTotalLabel: { fontSize: 15, fontWeight: 800, color: '#1e293b' },
  calcTotalValue: { fontSize: 24, fontWeight: 800, color: '#10b981' },
  filterRow: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', borderRadius: 50, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer' },
  filterBtnActive: { padding: '8px 16px', borderRadius: 50, border: '1px solid #6366f1', background: '#eef2ff', fontSize: 13, fontWeight: 700, color: '#6366f1', cursor: 'pointer' },
  invCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  invLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  invIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  invNumber: { fontSize: 15, fontWeight: 800, color: '#1e293b' },
  invMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  invRight: { display: 'flex', alignItems: 'center', gap: 14, textAlign: 'right' },
  invAmount: { fontSize: 18, fontWeight: 800, color: '#10b981' },
  invDate: { fontSize: 12, color: '#94a3b8' },
  statusBadge: { padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, display: 'inline-block' },
  btnPrint: { background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  btnPaid: { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  btnDelete: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  countBadge: { background: '#eef2ff', color: '#6366f1', padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700 },
  emptyState: { padding: 50, textAlign: 'center', color: '#94a3b8' }
};

function Invoices() {
  var [invoices, setInvoices] = useState([]);
  var [reservations, setReservations] = useState([]);
  var [clients, setClients] = useState([]);
  var [form, setForm] = useState({ reservation_id: '', client_id: '' });
  var [calculation, setCalculation] = useState(null);
  var [loading, setLoading] = useState(true);
  var [printingInvoiceId, setPrintingInvoiceId] = useState(null);
  var [filter, setFilter] = useState('all');
  var [toast, setToast] = useState(null);
  var showToast = function(message, type) { setToast({ message: message, type: type || 'success' }); };

  useEffect(function() { fetchData(); }, []);

  var fetchData = function() {
    Promise.all([axios.get('/api/invoices'), axios.get('/api/reservations'), axios.get('/api/clients')]).then(function(results) {
      setInvoices(results[0].data); setReservations(results[1].data); setClients(results[2].data); setLoading(false);
    }).catch(function(err) { console.error(err); setLoading(false); });
  };

  var getClientName = function(clientId) { var c = clients.find(function(x) { return x.id === clientId; }); return c && c.name ? c.name : 'Client #' + clientId; };

  var handleCalculate = function(e) {
    e.preventDefault();
    if (!form.reservation_id) { showToast('Sélectionnez une réservation', 'error'); return; }
    axios.post('/api/invoices/calculate', { reservation_id: form.reservation_id }).then(function(res) { setCalculation(res.data); }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur';
      showToast('Erreur: ' + msg, 'error');
    });
  };

  var handleCreateInvoice = function() {
    if (!form.reservation_id || !form.client_id) { showToast('Remplissez tous les champs', 'error'); return; }
    axios.post('/api/invoices', { reservation_id: form.reservation_id, client_id: form.client_id }).then(function() {
      setForm({ reservation_id: '', client_id: '' }); setCalculation(null); fetchData(); showToast('Facture créée !');
    }).catch(function(err) { var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur'; showToast('Erreur: ' + msg, 'error'); });
  };

  var handleMarkPaid = function(inv) {
    axios.put('/api/invoices/' + inv.id + '/pay').then(function() { fetchData(); showToast('Facture marquée comme payée !'); }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur'; showToast('Erreur: ' + msg, 'error');
    });
  };

  var handleDelete = function(inv) {
    axios.delete('/api/invoices/' + inv.id).then(function() { fetchData(); showToast('Facture supprimée !'); }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur'; showToast('Erreur: ' + msg, 'error');
    });
  };

  var getStatusStyle = function(status) { if (status === 'paid') return { background: '#ecfdf5', color: '#059669' }; return { background: '#fffbeb', color: '#d97706' }; };
  var getStatusLabel = function(status) { if (status === 'paid') return '✓ Payée'; return '⏳ En attente'; };
  var safeNum = function(val) { var n = parseFloat(val); return isNaN(n) ? 0 : n; };

  var paidCount = invoices.filter(function(i) { return i.payment_status === 'paid'; }).length;
  var pendingCount = invoices.filter(function(i) { return i.payment_status !== 'paid'; }).length;
  var totalAmount = invoices.reduce(function(sum, i) { return sum + safeNum(i.total); }, 0);
  var filteredInvoices = invoices.filter(function(inv) { if (filter === 'all') return true; if (filter === 'paid') return inv.payment_status === 'paid'; if (filter === 'pending') return inv.payment_status !== 'paid'; return true; });

  // Exclure les réservations annulées ou déjà facturées de la liste des réservations à émettre
  var invoicedReservationIds = invoices.map(function(inv) { return String(inv.reservation_id); });
  var unbilledReservations = reservations.filter(function(r) {
    return r.status !== 'cancelled' && invoicedReservationIds.indexOf(String(r.id)) === -1;
  });

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}>Chargement...</div>;
  if (printingInvoiceId) return <InvoicePrint invoiceId={printingInvoiceId} onClose={function() { setPrintingInvoiceId(null); }} />;

  return (
    <div style={s.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={function() { setToast(null); }} />}

      <div style={s.headerRow}>
        <div>
          <h2 style={s.headerTitle}>💶 Facturation</h2>
          <p style={s.headerSub}>Gérez vos factures et encaissements</p>
        </div>
      </div>

      <div style={s.statsRow}>
        <div style={s.statCard}><div style={Object.assign({}, s.statIcon, { background: '#eef2ff' })}>📄</div><div><div style={s.statValue}>{invoices.length}</div><div style={s.statLabel}>Total</div></div></div>
        <div style={s.statCard}><div style={Object.assign({}, s.statIcon, { background: '#ecfdf5' })}>✓</div><div><div style={Object.assign({}, s.statValue, { color: '#059669' })}>{paidCount}</div><div style={s.statLabel}>Payées</div></div></div>
        <div style={s.statCard}><div style={Object.assign({}, s.statIcon, { background: '#fffbeb' })}>⏳</div><div><div style={Object.assign({}, s.statValue, { color: '#d97706' })}>{pendingCount}</div><div style={s.statLabel}>En attente</div></div></div>
        <div style={s.statCard}><div style={Object.assign({}, s.statIcon, { background: '#f0fdf4' })}>💰</div><div><div style={Object.assign({}, s.statValue, { color: '#15803d' })}>{totalAmount.toFixed(0)}€</div><div style={s.statLabel}>Montant total</div></div></div>
      </div>

      <div style={s.grid}>
        <div>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={Object.assign({}, s.cardIcon, { background: '#dbeafe' })}>🧮</div>
              <div><h3 style={s.cardTitle}>Calculer une facture</h3><p style={s.cardSub}>Depuis une réservation</p></div>
            </div>
            <div style={s.cardBody}>
              <form onSubmit={handleCalculate}>
                <div style={s.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={s.label}>Réservation à émettre</label>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: 20 }}>
                      {unbilledReservations.length} à facturer
                    </span>
                  </div>
                  <select style={s.select} value={form.reservation_id} onChange={function(e) { var rid = e.target.value; var r = reservations.find(function(x) { return String(x.id) === String(rid); }); setForm({ reservation_id: rid, client_id: r ? r.client_id : '' }); }} required>
                    <option value="">-- Sélectionner une réservation non facturée --</option>
                    {unbilledReservations.map(function(r) { return <option key={r.id} value={r.id}>#{r.id} - {getClientName(r.client_id)} ({r.check_in} → {r.check_out})</option>; })}
                  </select>
                  {unbilledReservations.length === 0 && (
                    <p style={{ fontSize: 12, color: '#10b981', marginTop: 6, fontWeight: 600 }}>✓ Toutes les réservations ont été facturées ! Aucune facture en attente d'émission.</p>
                  )}
                </div>
                <button type="submit" style={s.btnCalc}>🧮 Calculer</button>
              </form>

              {calculation && (
                <div style={s.calcResult}>
                  <div style={s.calcHeader}><h4 style={s.calcTitle}>📊 Détail</h4></div>
                  <div style={s.calcBody}>
                    <div style={s.calcRow}><span style={s.calcLabel}>Durée</span><span style={s.calcValue}>{calculation.days} jours</span></div>
                    <div style={s.calcRow}><span style={s.calcLabel}>Tarif/jour</span><span style={s.calcValue}>{calculation.boxRate}€</span></div>
                    <div style={s.calcRow}><span style={s.calcLabel}>Pension</span><span style={Object.assign({}, s.calcValue, { color: '#3b82f6' })}>{safeNum(calculation.boxAmount).toFixed(2)}€</span></div>
                    <div style={s.calcRow}><span style={s.calcLabel}>Services</span><span style={Object.assign({}, s.calcValue, { color: '#8b5cf6' })}>{safeNum(calculation.servicesAmount).toFixed(2)}€</span></div>
                    <div style={s.calcRow}><span style={s.calcLabel}>Sous-total HT</span><span style={s.calcValue}>{safeNum(calculation.subtotal).toFixed(2)}€</span></div>
                    <div style={s.calcRow}><span style={s.calcLabel}>TVA ({safeNum(calculation.taxRate).toFixed(0)}%)</span><span style={Object.assign({}, s.calcValue, { color: '#ef4444' })}>{safeNum(calculation.tax).toFixed(2)}€</span></div>
                    <div style={s.calcTotal}><span style={s.calcTotalLabel}>TOTAL TTC</span><span style={s.calcTotalValue}>{safeNum(calculation.total).toFixed(2)}€</span></div>
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px dashed #e2e8f0' }}>
                      <div style={s.formGroup}>
                        <label style={s.label}>Client</label>
                        <p style={s.helper}>Rempli automatiquement.</p>
                        <select style={s.select} value={form.client_id} onChange={function(e) { setForm({ reservation_id: form.reservation_id, client_id: e.target.value }); }} required disabled={!!form.reservation_id}>
                          <option value="">-- Client --</option>
                          {clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}</option>; })}
                        </select>
                      </div>
                      <button type="button" style={s.btnCreate} onClick={handleCreateInvoice}>✓ Créer la facture</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={s.card}>
          <div style={Object.assign({}, s.cardHeader, { justifyContent: 'space-between' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={Object.assign({}, s.cardIcon, { background: '#fef3c7' })}>📄</div>
              <div><h3 style={s.cardTitle}>Mes factures</h3></div>
            </div>
            <span style={s.countBadge}>{filteredInvoices.length}</span>
          </div>
          <div style={s.cardBody}>
            <div style={s.filterRow}>
              <button style={filter === 'all' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('all'); }}>Toutes ({invoices.length})</button>
              <button style={filter === 'paid' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('paid'); }}>✓ Payées ({paidCount})</button>
              <button style={filter === 'pending' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('pending'); }}>⏳ En attente ({pendingCount})</button>
            </div>
            {filteredInvoices.length === 0 ? (
              <div style={s.emptyState}><p style={{ fontSize: 40, opacity: 0.3 }}>📄</p><p>Aucune facture</p></div>
            ) : (
              <div>
                {filteredInvoices.map(function(inv) {
                  var statusStyle = getStatusStyle(inv.payment_status);
                  return (
                    <div key={inv.id} style={s.invCard}>
                      <div style={s.invLeft}>
                        <div style={Object.assign({}, s.invIcon, { background: statusStyle.background })}>{inv.payment_status === 'paid' ? '✓' : '📄'}</div>
                        <div>
                          <div style={s.invNumber}>Facture #{inv.id}</div>
                          <div style={s.invMeta}>👤 {getClientName(inv.client_id)}</div>
                          <div style={{ marginTop: 6 }}><span style={Object.assign({}, s.statusBadge, statusStyle)}>{getStatusLabel(inv.payment_status)}</span></div>
                        </div>
                      </div>
                      <div style={s.invRight}>
                        <div>
                          <div style={s.invAmount}>{safeNum(inv.total).toFixed(2)}€</div>
                          <div style={s.invDate}>📅 {inv.invoice_date}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>HT: {safeNum(inv.amount).toFixed(2)}€ • TVA: {safeNum(inv.tax).toFixed(2)}€</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {inv.payment_status !== 'paid' && <button style={s.btnPaid} onClick={function() { handleMarkPaid(inv); }}>✓ Payée</button>}
                          <button style={s.btnPrint} onClick={function() { setPrintingInvoiceId(inv.id); }}>🖨️</button>
                          <button style={s.btnDelete} onClick={function() { handleDelete(inv); }}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoices;