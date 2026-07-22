import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  resCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' },
  resLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  resAvatar: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  resName: { fontSize: 14, fontWeight: 700, color: '#1e293b' },
  resMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  resRight: { display: 'flex', alignItems: 'center', gap: 14, textAlign: 'right' },
  resDates: { fontSize: 13, color: '#475569' },
  resDateIcon: { color: '#94a3b8', fontSize: 11 },
  resPrice: { fontSize: 16, fontWeight: 800, color: '#1e293b' },
  statusBadge: { padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, display: 'inline-block' },
  btnDelete: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  countBadge: { background: '#eef2ff', color: '#6366f1', padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700 },
  emptyState: { padding: 50, textAlign: 'center', color: '#94a3b8' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#94a3b8' },
  spinner: { width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 },
  durationBadge: { background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, display: 'inline-block' }
};
function Reservations() {
  var [reservations, setReservations] = useState([]);
  var [animals, setAnimals] = useState([]);
  var [clients, setClients] = useState([]);
    var [form, setForm] = useState({ animal_id: '', client_id: '', box_id: '', check_in: '', check_out: '', daily_rate: '', services: '', notes: '', status: 'confirmed' });
  var [boxes, setBoxes] = useState([]);
  var [loading, setLoading] = useState(true);
  var [showForm, setShowForm] = useState(false);
  var [filter, setFilter] = useState('all');
    var [defaultRate, setDefaultRate] = useState(30);
  useEffect(function() {
    fetchData();
  }, []);
  var fetchData = function() {
   
      setLoading(false);
        Promise.all([
      axios.get('/api/reservations'),
      axios.get('/api/animals'),
      axios.get('/api/clients'),
      axios.get('/api/config/boxes')
    ]).then(function(results) {
      setReservations(results[0].data);
      setAnimals(results[1].data);
      setClients(results[2].data);
          setBoxes(results[3].data);
                axios.get('/api/config/config').then(function(configRes) {
        if (configRes.data && configRes.data.default_daily_rate) {
          setDefaultRate(configRes.data.default_daily_rate);
        }
      });
      setLoading(false);
    }).catch(function(err) {
      console.error(err);
      setLoading(false);
    });
  };
  var handleSubmit = function(e) {
    e.preventDefault();
    axios.post('/api/reservations', form).then(function() {
      setForm({ animal_id: '', client_id: '', box_id: '', check_in: '', check_out: '', daily_rate: '', services: '', notes: '', status: 'confirmed' });
      setShowForm(false);
      fetchData();
      alert('Réservation créée !');
    }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur';
      alert('Erreur: ' + msg);
    });
  };
  var handleDelete = function(id) {
    if (window.confirm('Supprimer cette réservation ?')) {
      axios.delete('/api/reservations/' + id).then(function() {
        fetchData();
      }).catch(function(err) {
        var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur';
        alert('Erreur: ' + msg);
      });
    }
  };
  var updateField = function(field, value) {
    var newForm = {};
    Object.keys(form).forEach(function(k) { newForm[k] = form[k]; });
    newForm[field] = value;
    setForm(newForm);
  };
  var getAnimalName = function(id) {
    var animal = animals.find(function(a) { return a.id === id; });
    if (animal && animal.name) return animal.name;
    return 'Animal #' + id;
  };
  var getAnimalSpecies = function(id) {
    var animal = animals.find(function(a) { return a.id === id; });
    if (animal && animal.species) return animal.species;
    return '';
  };
  var getClientName = function(id) {
    var client = clients.find(function(c) { return c.id === id; });
    if (client && client.name) return client.name;
    return 'Client #' + id;
  };
  var getSpeciesIcon = function(species) {
    var sp = (species || '').toLowerCase();
    if (sp === 'chien' || sp === 'dog') return '🐶';
    if (sp === 'chat' || sp === 'cat') return '🐱';
    return '🐾';
  };
  var getSpeciesBg = function(species) {
    var sp = (species || '').toLowerCase();
    if (sp === 'chien' || sp === 'dog') return '#eef2ff';
    if (sp === 'chat' || sp === 'cat') return '#fef3c7';
    return '#f1f5f9';
  };
  var getStatusStyle = function(status) {
    if (status === 'confirmed') return { background: '#ecfdf5', color: '#059669' };
    if (status === 'pending') return { background: '#fffbeb', color: '#d97706' };
    if (status === 'cancelled') return { background: '#fef2f2', color: '#dc2626' };
    return { background: '#f1f5f9', color: '#64748b' };
  };
  var getStatusLabel = function(status) {
    if (status === 'confirmed') return '✓ Confirmée';
    if (status === 'pending') return '⏳ En attente';
    if (status === 'cancelled') return '✗ Annulée';
    return status || '—';
  };
  var getDuration = function(checkIn, checkOut) {
    var start = new Date(checkIn);
    var end = new Date(checkOut);
    var days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
 
  var confirmed = reservations.filter(function(r) { return r.status === 'confirmed'; }).length;
  var pending = reservations.filter(function(r) { return r.status === 'pending'; }).length;
  
  var totalRevenue = reservations.reduce(function(sum, r) {
    var days = getDuration(r.check_in, r.check_out);
    return sum + (days * (parseFloat(r.daily_rate) || 0));
  }, 0);
  var filteredReservations = reservations.filter(function(r) {
    if (filter === 'all') return true;
    return r.status === filter;
  });
  if (loading) {
    return (
      <div style={s.loading}>
        <div style={s.spinner}></div>
        <p>Chargement des réservations...</p>
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    );
  }
  return (
    <div style={s.page}>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      {/* Header */}
      <div style={s.headerRow}>
        <div>
          <h2 style={s.headerTitle}>📋 Réservations</h2>
          <p style={s.headerSub}>Gérez les séjours de vos pensionnaires</p>
        </div>
        <button style={s.btnAdd} onClick={function() { setShowForm(!showForm); }}>
          {showForm ? '✕ Fermer' : '+ Nouvelle réservation'}
        </button>
      </div>
      {/* Stats */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={Object.assign({}, s.statIcon, { background: '#eef2ff' })}>📋</div>
          <div>
            <div style={s.statValue}>{reservations.length}</div>
            <div style={s.statLabel}>Total</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={Object.assign({}, s.statIcon, { background: '#ecfdf5' })}>✓</div>
          <div>
            <div style={Object.assign({}, s.statValue, { color: '#059669' })}>{confirmed}</div>
            <div style={s.statLabel}>Confirmées</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={Object.assign({}, s.statIcon, { background: '#fffbeb' })}>⏳</div>
          <div>
            <div style={Object.assign({}, s.statValue, { color: '#d97706' })}>{pending}</div>
            <div style={s.statLabel}>En attente</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={Object.assign({}, s.statIcon, { background: '#f0fdf4' })}>💰</div>
          <div>
            <div style={Object.assign({}, s.statValue, { color: '#15803d' })}>{totalRevenue.toFixed(0)}€</div>
            <div style={s.statLabel}>Revenu estimé</div>
          </div>
        </div>
      </div>
      <div style={showForm ? s.grid : {}}>
        {/* Formulaire */}
        {showForm && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={Object.assign({}, s.cardIcon, { background: '#eef2ff' })}>➕</div>
              <div>
                <h3 style={s.cardTitle}>Nouvelle réservation</h3>
                <p style={s.cardSub}>Planifier un séjour</p>
              </div>
            </div>
            <div style={s.cardBody}>
              <form onSubmit={handleSubmit}>
                <div style={s.formGroup}>
                  <label style={s.label}>Client</label>
                  <select style={s.select} value={form.client_id} onChange={function(e) { updateField('client_id', e.target.value); }} required>
                    <option value="">-- Sélectionner le client --</option>
                    {clients.map(function(c) {
                      return <option key={c.id} value={c.id}>{c.name}</option>;
                    })}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Animal</label>
                  <select style={s.select} value={form.animal_id} onChange={function(e) { updateField('animal_id', e.target.value); }} required>
                    <option value="">-- Sélectionner l'animal --</option>
                    {animals.map(function(a) {
                      return <option key={a.id} value={a.id}>{a.name} ({a.species})</option>;
                    })}
                  </select>
                </div>
                <div style={s.row2}>
                  <div style={s.formGroup}>
                    <label style={s.label}>📅 Arrivée</label>
                    <input style={s.input} type="date" value={form.check_in} onChange={function(e) { updateField('check_in', e.target.value); }} required />
                  </div>
                  <div style={s.formGroup}>
                   <label style={s.label}>💶 Tarif journalier (€)</label>
<input style={s.input} type="number" step="0.01" value={form.daily_rate || defaultRate} onChange={function(e) { updateField('daily_rate', e.target.value); }} placeholder={defaultRate + ''} required />
                  </div>
                </div>
                {form.check_in && form.check_out && getDuration(form.check_in, form.check_out) > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                    📆 Durée du séjour : {getDuration(form.check_in, form.check_out)} jours
                    {form.daily_rate && (
                      <span> • Total estimé : {(getDuration(form.check_in, form.check_out) * parseFloat(form.daily_rate)).toFixed(2)}€</span>
                    )}
                  </div>
                )}                <div style={s.formGroup}>
 <label style={s.label}>📦 Box</label>
<select style={s.select} value={form.box_id || ''} onChange={function(e) {
  var selectedBox = boxes.find(function(b) { return String(b.id) === String(e.target.value); });
  var newForm = {};
  Object.keys(form).forEach(function(k) { newForm[k] = form[k]; });
  newForm.box_id = e.target.value;
  if (selectedBox) { newForm.daily_rate = selectedBox.daily_rate; }
  setForm(newForm);
}}>
                    <option value="">-- Choisir un box --</option>
                    {boxes.map(function(b) {
                      return <option key={b.id} value={b.id}>{b.box_number} - {b.box_type} ({b.daily_rate}€/jour)</option>;
                    })}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>💶 Tarif journalier (€)</label>
                  <input style={s.input} type="number" step="0.01" value={form.daily_rate} onChange={function(e) { updateField('daily_rate', e.target.value); }} placeholder="30.00" required />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>🛎️ Services supplémentaires</label>
                  <input style={s.input} value={form.services} onChange={function(e) { updateField('services', e.target.value); }} placeholder="promenade, toilettage..." />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>📝 Notes</label>
                  <textarea style={s.textarea} value={form.notes} onChange={function(e) { updateField('notes', e.target.value); }} rows="3" placeholder="Informations supplémentaires..." />
                </div>
                                <div style={s.formGroup}>
                  <label style={s.label}>📋 Type de client</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={function() { updateField('status', 'confirmed'); }}
                      style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: (form.status || 'confirmed') === 'confirmed' ? '3px solid #059669' : '1px solid #e2e8f0', background: (form.status || 'confirmed') === 'confirmed' ? '#ecfdf5' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10b981', margin: '0 auto 6px auto' }}></div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>Habitué</div>
                    </button>
                    <button type="button" onClick={function() { updateField('status', 'pending'); }}
                      style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: form.status === 'pending' ? '3px solid #ec4899' : '1px solid #e2e8f0', background: form.status === 'pending' ? '#fdf2f8' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ec4899', margin: '0 auto 6px auto' }}></div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ec4899' }}>Nouveau</div>
                    </button>
                  </div>
                </div>
                <button type="submit" style={s.btnSubmit}>📋 Créer la réservation</button>
              </form>
            </div>
          </div>
        )}
        {/* Liste */}
        <div style={s.card}>
          <div style={Object.assign({}, s.cardHeader, { justifyContent: 'space-between' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={Object.assign({}, s.cardIcon, { background: '#eef2ff' })}>📋</div>
              <div>
                <h3 style={s.cardTitle}>Liste des réservations</h3>
                <p style={s.cardSub}>Toutes les réservations</p>
              </div>
            </div>
            <span style={s.countBadge}>{filteredReservations.length} résultats</span>
          </div>
          <div style={s.cardBody}>
            {/* Filtres */}
            <div style={s.filterRow}>
              <button style={filter === 'all' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('all'); }}>
                Toutes ({reservations.length})
              </button>
              <button style={filter === 'confirmed' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('confirmed'); }}>
                ✓ Confirmées ({confirmed})
              </button>
              <button style={filter === 'pending' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('pending'); }}>
                ⏳ En attente ({pending})
              </button>
              <button style={filter === 'cancelled' ? s.filterBtnActive : s.filterBtn} onClick={function() { setFilter('cancelled'); }}>
                ✗ Annulées
              </button>
            </div>
            {filteredReservations.length === 0 ? (
              <div style={s.emptyState}>
                <p style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📋</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>Aucune réservation trouvée</p>
              </div>
            ) : (
              <div>
                {filteredReservations.map(function(r) {
                  var species = getAnimalSpecies(r.animal_id);
                  var statusStyle = getStatusStyle(r.status);
                  var days = getDuration(r.check_in, r.check_out);
                  var total = (days * (parseFloat(r.daily_rate) || 0)).toFixed(0);
                  return (
                    <div key={r.id} style={s.resCard}>
                      <div style={s.resLeft}>
                        <div style={Object.assign({}, s.resAvatar, { background: getSpeciesBg(species) })}>
                          {getSpeciesIcon(species)}
                        </div>
                        <div>
                          <div style={s.resName}>{getAnimalName(r.animal_id)}</div>
                          <div style={s.resMeta}>
                            👤 {getClientName(r.client_id)}
                          </div>
                          <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={Object.assign({}, s.statusBadge, statusStyle)}>
                              {getStatusLabel(r.status)}
                            </span>
                            <span style={s.durationBadge}>
                              {days} jour{days > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={s.resRight}>
                        <div>
                          <div style={s.resDates}>
                            <span style={s.resDateIcon}>📅</span> {r.check_in}
                          </div>
                          <div style={s.resDates}>
                            <span style={s.resDateIcon}>📅</span> {r.check_out}
                          </div>
                          <div style={Object.assign({}, s.resPrice, { marginTop: 6 })}>{total}€</div>
                        </div>
                        <button style={s.btnDelete} onClick={function() { handleDelete(r.id); }}>
                          🗑️
                        </button>
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