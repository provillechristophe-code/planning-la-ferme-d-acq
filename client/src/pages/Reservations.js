import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';

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
  grid: { display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'flex-start' },
  card: { background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 },
  cardSub: { fontSize: 12, color: '#94a3b8', margin: '2px 0 0 0' },
  cardBody: { padding: 24 },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#fff' },
  textarea: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  btnSubmit: { width: '100%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  btnAdd: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '13px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  filterRow: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', borderRadius: 50, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer' },
  filterBtnActive: { padding: '8px 16px', borderRadius: 50, border: '1px solid #6366f1', background: '#eef2ff', fontSize: 13, fontWeight: 700, color: '#6366f1', cursor: 'pointer' },
  resCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  resLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  resAvatar: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  resName: { fontSize: 14, fontWeight: 700, color: '#1e293b' },
  resMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  resRight: { display: 'flex', alignItems: 'center', gap: 14, textAlign: 'right' },
  resDates: { fontSize: 13, color: '#475569' },
  resPrice: { fontSize: 16, fontWeight: 800, color: '#1e293b' },
  statusBadge: { padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, display: 'inline-block' },
  btnDelete: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  countBadge: { background: '#eef2ff', color: '#6366f1', padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700 },
  emptyState: { padding: 50, textAlign: 'center', color: '#94a3b8' },
  durationBadge: { background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, display: 'inline-block' }
};

function Reservations() {
  var [reservations, setReservations] = useState([]);
  var [animals, setAnimals] = useState([]);
  var [clients, setClients] = useState([]);
  var [boxes, setBoxes] = useState([]);
  var [loading, setLoading] = useState(true);
  var [showForm, setShowForm] = useState(false);
  var [filter, setFilter] = useState('all');
  var [defaultRate, setDefaultRate] = useState(30);
  var [toast, setToast] = useState(null);
  var showToast = function(message, type) { setToast({ message: message, type: type || 'success' }); };

  // ✅ Fonction pour afficher la date au format jj/mm/aaaa
  var displayDate = function(str) {
    if (!str) return '';
    var parts = str.split('-');
    if (parts.length !== 3) return str;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  };

  var makeInitialForm = function(rate) {
    return { animal_id: '', client_id: '', box_id: '', check_in: '', check_out: '', daily_rate: rate !== undefined && rate !== null ? String(rate) : '', services: '', notes: '', status: 'confirmed' };
  };

  var [form, setForm] = useState(makeInitialForm(''));

  useEffect(function() { fetchData(); }, []);

  var fetchData = function() {
    Promise.all([
      axios.get('/api/reservations'), axios.get('/api/animals'), axios.get('/api/clients'), axios.get('/api/config/boxes'), axios.get('/api/config/config')
    ]).then(function(results) {
      setReservations(results[0].data); setAnimals(results[1].data); setClients(results[2].data); setBoxes(results[3].data);
      var rate = 30;
      if (results[4] && results[4].data && results[4].data.default_daily_rate !== undefined && results[4].data.default_daily_rate !== null) { rate = results[4].data.default_daily_rate; }
      setDefaultRate(rate);
      setForm(function(prev) {
        if (prev.daily_rate !== '' && prev.daily_rate !== undefined && prev.daily_rate !== null) return prev;
        var newForm = {}; Object.keys(prev).forEach(function(k) { newForm[k] = prev[k]; }); newForm.daily_rate = String(rate); return newForm;
      });
      setLoading(false);
    }).catch(function(err) { console.error(err); setLoading(false); });
  };

  var resetForm = function() { setForm(makeInitialForm(defaultRate)); };

  var handleSubmit = function(e) {
    e.preventDefault();
    axios.post('/api/reservations', form).then(function() { resetForm(); setShowForm(false); fetchData(); showToast('Réservation créée !'); }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur';
      showToast('Erreur: ' + msg, 'error');
    });
  };

  var handleDelete = function(id) {
    axios.delete('/api/reservations/' + id).then(function() { fetchData(); showToast('Réservation supprimée !'); }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur';
      showToast('Erreur: ' + msg, 'error');
    });
  };

  var updateField = function(field, value) { var f = {}; Object.keys(form).forEach(function(k) { f[k] = form[k]; }); f[field] = value; setForm(f); };
  var getAnimalName = function(id) { var a = animals.find(function(x) { return x.id === id; }); return a && a.name ? a.name : 'Animal #' + id; };
  var getAnimalSpecies = function(id) { var a = animals.find(function(x) { return x.id === id; }); return a && a.species ? a.species : ''; };
  var getClientName = function(id) { var c = clients.find(function(x) { return x.id === id; }); return c && c.name ? c.name : 'Client #' + id; };
  var getSpeciesIcon = function(sp) { sp = (sp || '').toLowerCase(); if (sp === 'chien' || sp === 'dog') return '🐶'; if (sp === 'chat' || sp === 'cat') return '🐱'; return '🐾'; };
  var getSpeciesBg = function(sp) { sp = (sp || '').toLowerCase(); if (sp === 'chien' || sp === 'dog') return '#eef2ff'; if (sp === 'chat' || sp === 'cat') return '#fef3c7'; return '#f1f5f9'; };
  var getStatusStyle = function(st) { if (st === 'confirmed') return { background: '#ecfdf5', color: '#059669' }; if (st === 'pending') return { background: '#fdf2f8', color: '#ec4899' }; if (st === 'cancelled') return { background: '#f1f5f9', color: '#94a3b8' }; return { background: '#f1f5f9', color: '#64748b' }; };
  var getStatusLabel = function(st) { if (st === 'confirmed') return '🟢 Habitué'; if (st === 'pending') return '🩷 Nouveau'; if (st === 'cancelled') return '⚪ Annulée'; return st || '—'; };
  var getDuration = function(a, b) { var d = Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)); return d > 0 ? d : 0; };

  var confirmed = reservations.filter(function(r) { return r.status === 'confirmed'; }).length;
  var pending = reservations.filter(function(r) { return r.status === 'pending'; }).length;
  var totalRevenue = reservations.reduce(function(sum, r) { return sum + (getDuration(r.check_in, r.check_out) * (parseFloat(r.daily_rate) || 0)); }, 0);
  var filteredReservations = reservations.filter(function(r) { if (filter === 'all') return true; return r.status === filter; });

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}>Chargement...</div>;

  return (
    <div style={s.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={function() { setToast(null); }} />}

      <div style={s.headerRow}>
        <div>
          <h2 style={s.headerTitle}>📋 Réservations</h2>
          <p style={s.headerSub}>Gérez les séjours de vos pensionnaires</p>
        </div>
        <button style={s.btnAdd} onClick={function() { if (!showForm) resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ Fermer' : '+ Nouvelle réservation'}
        </button>
      </div>

      <div style={s.statsRow}>
        <div style={s.statCard}><div style={Object.assign({}, s.statIcon, { background: '#eef2ff' })}>📋</div><div><div style={s.statValue}>{reservations.length}</div><div style={s.statLabel}>Total</div></div></div>
        <div style={s.statCard}><div style={Object.assign({}, s.statIcon, { background: '#ecfdf5' })}>🟢</div><div><div style={Object.assign({}, s.statValue, { color: '#059669' })}>{confirmed}</div><div style={s.statLabel}>Habitués</div></div></div>
        <div style={s.statCard}><div style={Object.assign({}, s.statIcon, { background: '#fdf2f8' })}>🩷</div><div><div style={Object.assign({}, s.statValue, { color: '#ec4899' })}>{pending}</div><div style={s.statLabel}>Nouveaux</div></div></div>
        <div style={s.statCard}><div style={Object.assign({}, s.statIcon, { background: '#f0fdf4' })}>💰</div><div><div style={Object.assign({}, s.statValue, { color: '#15803d' })}>{totalRevenue.toFixed(0)}€</div><div style={s.statLabel}>Revenu estimé</div></div></div>
      </div>

      <div style={showForm ? s.grid : {}}>
        {showForm && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={Object.assign({}, s.cardIcon, { background: '#eef2ff' })}>➕</div>
              <div><h3 style={s.cardTitle}>Nouvelle réservation</h3><p style={s.cardSub}>Planifier un séjour</p></div>
            </div>
            <div style={s.cardBody}>
              <form onSubmit={handleSubmit}>
                <div style={s.formGroup}><label style={s.label}>Client</label><select style={s.select} value={form.client_id} onChange={function(e) { updateField('client_id', e.target.value); }} required><option value="">-- Client --</option>{clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}</option>; })}</select></div>
                <div style={s.formGroup}><label style={s.label}>Animal</label><select style={s.select} value={form.animal_id} onChange={function(e) { updateField('animal_id', e.target.value); }} required><option value="">-- Animal --</option>{animals.map(function(a) { return <option key={a.id} value={a.id}>{a.name} ({a.species})</option>; })}</select></div>
                <div style={s.row2}>
                  <div style={s.formGroup}><label style={s.label}>📅 Arrivée</label><input style={s.input} type="date" value={form.check_in} onChange={function(e) { updateField('check_in', e.target.value); }} required /></div>
                  <div style={s.formGroup}><label style={s.label}>📅 Départ</label><input style={s.input} type="date" value={form.check_out} onChange={function(e) { updateField('check_out', e.target.value); }} required /></div>
                </div>
                {form.check_in && form.check_out && getDuration(form.check_in, form.check_out) > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                    📆 {getDuration(form.check_in, form.check_out)} jours • Du {displayDate(form.check_in)} au {displayDate(form.check_out)}{form.daily_rate ? ' • Total: ' + (getDuration(form.check_in, form.check_out) * parseFloat(form.daily_rate)).toFixed(2) + '€' : ''}
                  </div>
                )}
                <div style={s.formGroup}><label style={s.label}>📦 Box</label><select style={s.select} value={form.box_id || ''} onChange={function(e) { var b = boxes.find(function(x) { return String(x.id) === String(e.target.value); }); var f = {}; Object.keys(form).forEach(function(k) { f[k] = form[k]; }); f.box_id = e.target.value; f.daily_rate = b ? String(b.daily_rate) : String(defaultRate); setForm(f); }}><option value="">-- Box --</option>{boxes.map(function(b) { return <option key={b.id} value={b.id}>{b.box_number} - {b.box_type} ({b.daily_rate}€/j)</option>; })}</select></div>
                <div style={s.formGroup}><label style={s.label}>💶 Tarif/jour (€)</label><input style={s.input} type="number" step="0.01" value={form.daily_rate} onChange={function(e) { updateField('daily_rate', e.target.value); }} placeholder={String(defaultRate)} required /></div>
                <div style={s.formGroup}>
                  <label style={s.label}>📋 Type de client</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={function() { updateField('status', 'confirmed'); }} style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: (form.status || 'confirmed') === 'confirmed' ? '3px solid #059669' : '1px solid #e2e8f0', background: (form.status || 'confirmed') === 'confirmed' ? '#ecfdf5' : '#fff', cursor: 'pointer', textAlign: 'center' }}><div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10b981', margin: '0 auto 6px auto' }}></div><div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>Habitué</div></button>
                    <button type="button" onClick={function() { updateField('status', 'pending'); }} style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: form.status === 'pending' ? '3px solid #ec4899' : '1px solid #e2e8f0', background: form.status === 'pending' ? '#fdf2f8' : '#fff', cursor: 'pointer', textAlign: 'center' }}><div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ec4899', margin: '0 auto 6px auto' }}></div><div style={{ fontSize: 11, fontWeight: 700, color: '#ec4899' }}>Nouveau</div></button>
                  </div>
                </div>
                <div style={s.formGroup}><label style={s.label}>🛎️ Services</label><input style={s.input} value={form.services} onChange={function(e) { updateField('services', e.target.value); }} placeholder="promenade, toilettage..." /></div>
                <div style={s.formGroup}><label style={s.label}>📝 Notes</label><textarea style={s.textarea} value={form.notes} onChange={function(e) { updateField('notes', e.target.value); }} rows="3" placeholder="Informations..." /></div>
                <button type="submit" style={s.btnSubmit}>📋 Créer la réservation</button>
              </form>
            </div>
          </div>
        )}

        <div style={s.card}>
          <div style={Object.assign({}, s.cardHeader, { justifyContent: 'space-between' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={Object.assign({}, s.cardIcon, { background: '#eef2ff' })}>📋</div>
              <div><h3 style={s.cardTitle}>Liste des réservations</h3></div>
            </div>
            <span style={s.countBadge}>{filteredReservations.length}</span>
          </div>
          <div style={s.cardBody}>
            <div style={s.filterRow}>
              <button style={filter === 'all' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('all'); }}>Toutes ({reservations.length})</button>
              <button style={filter === 'confirmed' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('confirmed'); }}>🟢 Habitués ({confirmed})</button>
              <button style={filter === 'pending' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('pending'); }}>🩷 Nouveaux ({pending})</button>
              <button style={filter === 'cancelled' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('cancelled'); }}>⚪ Annulées</button>
            </div>
            {filteredReservations.length === 0 ? (
              <div style={s.emptyState}><p style={{ fontSize: 40, opacity: 0.3 }}>📋</p><p>Aucune réservation</p></div>
            ) : (
              <div>
                {filteredReservations.map(function(r) {
                  var species = getAnimalSpecies(r.animal_id);
                  var days = getDuration(r.check_in, r.check_out);
                  var total = (days * (parseFloat(r.daily_rate) || 0)).toFixed(0);
                  return (
                    <div key={r.id} style={s.resCard}>
                      <div style={s.resLeft}>
                        <div style={Object.assign({}, s.resAvatar, { background: getSpeciesBg(species) })}>{getSpeciesIcon(species)}</div>
                        <div>
                          <div style={s.resName}>{getAnimalName(r.animal_id)}</div>
                          <div style={s.resMeta}>👤 {getClientName(r.client_id)}</div>
                          <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={Object.assign({}, s.statusBadge, getStatusStyle(r.status))}>{getStatusLabel(r.status)}</span>
                            <span style={s.durationBadge}>{days} jour{days > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div style={s.resRight}>
                        <div>
                          <div style={s.resDates}>📅 {displayDate(r.check_in)}</div>
                          <div style={s.resDates}>📅 {displayDate(r.check_out)}</div>
                          <div style={Object.assign({}, s.resPrice, { marginTop: 6 })}>{total}€</div>
                        </div>
                        <button style={s.btnDelete} onClick={function() { handleDelete(r.id); }}>🗑️</button>
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

export default Reservations;
