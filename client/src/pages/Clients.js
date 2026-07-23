import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';

var s = {
  page: { maxWidth: 1200, margin: '0 auto', position: 'relative' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
  headerTitle: { fontSize: 30, fontWeight: 800, color: '#1e293b', marginBottom: 6 },
  headerSub: { color: '#94a3b8', fontSize: 14, margin: 0 },
  btnAdd: { background: 'linear-gradient(135deg, #0e9384, #12b76a)', color: '#ffffff', border: 'none', padding: '13px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  searchBar: { position: 'relative', marginBottom: 24, maxWidth: 460 },
  searchInput: { width: '100%', padding: '13px 16px 13px 44px', border: '1px solid #e2e8f0', borderRadius: 14, fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#ffffff' },
  searchIcon: { position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.5 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  card: { background: '#ffffff', borderRadius: 18, border: '1px solid #e2e8f0', padding: 24, position: 'relative', overflow: 'hidden' },
  cardStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  avatar: { width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 },
  cardActions: { display: 'flex', gap: 6 },
  iconBtn: { width: 34, height: 34, borderRadius: 10, border: '1px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  iconBtnDanger: { width: 34, height: 34, borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  clientName: { fontSize: 18, fontWeight: 800, color: '#1e293b', margin: 0 },
  clientCity: { fontSize: 12, fontWeight: 600, color: '#0e9384', background: '#ccfbf1', padding: '2px 10px', borderRadius: 50, display: 'inline-block', marginTop: 6 },
  contactList: { marginTop: 16, paddingTop: 16, borderTop: '1px dashed #e2e8f0', display: 'flex', flexDirection: 'column', gap: 10 },
  contactRow: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#64748b' },
  contactIcon: { width: 28, height: 28, borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal: { background: '#ffffff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' },
  modalHeader: { padding: '24px 28px 0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 },
  modalSub: { fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' },
  modalClose: { background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 15, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: 28 },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 11, fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  btnRow: { display: 'flex', gap: 10, marginTop: 22 },
  btnSubmit: { flex: 1, background: 'linear-gradient(135deg, #0e9384, #12b76a)', color: '#ffffff', border: 'none', padding: '13px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  btnCancel: { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '13px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  emptyState: { padding: 80, textAlign: 'center', color: '#94a3b8', background: '#ffffff', borderRadius: 18, border: '1px dashed #cbd5e1' }
};

var avatarPalette = [
  { bg: '#fee4e2', color: '#d92d20', stripe: '#f97066' },
  { bg: '#ccfbf1', color: '#0e9384', stripe: '#2dd4bf' },
  { bg: '#fef0c7', color: '#b54708', stripe: '#fdb022' },
  { bg: '#ebe9fe', color: '#6938ef', stripe: '#a48fff' },
  { bg: '#fce7f3', color: '#c11574', stripe: '#f670c7' },
  { bg: '#dbe9ff', color: '#175cd3', stripe: '#619dff' },
  { bg: '#d1fadf', color: '#067647', stripe: '#47cd89' },
  { bg: '#ffead5', color: '#dc6803', stripe: '#f79009' }
];

function getAvatarTheme(name) {
  var str = name || 'client';
  var sum = 0;
  for (var i = 0; i < str.length; i++) { sum += str.charCodeAt(i); }
  return avatarPalette[sum % avatarPalette.length];
}

function getInitials(name) {
  if (!name) return '?';
  var parts = name.trim().split(' ');
  var first = parts[0].charAt(0);
  var last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}function Clients() {
  var [clients, setClients] = useState([]);
  var [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '' });
  var [editingId, setEditingId] = useState(null);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState('');
  var [showModal, setShowModal] = useState(false);
  var [toast, setToast] = useState(null);
  var showToast = function(message, type) { setToast({ message: message, type: type || 'success' }); };

  useEffect(function() { fetchClients(); }, []);

  var fetchClients = function() {
    axios.get('/api/clients').then(function(res) {
      setClients(res.data);
      setLoading(false);
    }).catch(function(err) { console.error(err); setLoading(false); });
  };

  var handleSubmit = function(e) {
    e.preventDefault();
    var request;
    if (editingId) {
      request = axios.put('/api/clients/' + editingId, form);
    } else {
      request = axios.post('/api/clients', form);
    }
    request.then(function() {
      showToast(editingId ? 'Client modifié !' : 'Client ajouté !');
      closeModal();
      fetchClients();
    }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur';
      showToast('Erreur: ' + msg, 'error');
    });
  };

  var openAdd = function() {
    setForm({ name: '', email: '', phone: '', address: '', city: '' });
    setEditingId(null);
    setShowModal(true);
  };

  var openEdit = function(client) {
    setForm({ name: client.name || '', email: client.email || '', phone: client.phone || '', address: client.address || '', city: client.city || '' });
    setEditingId(client.id);
    setShowModal(true);
  };

  var closeModal = function() {
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', address: '', city: '' });
  };

  var handleDelete = function(client) {
    axios.delete('/api/clients/' + client.id).then(function() {
      fetchClients();
      showToast('Client supprimé !');
    }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur';
      showToast('Erreur: ' + msg, 'error');
    });
  };

  var updateField = function(field, value) {
    var newForm = {};
    Object.keys(form).forEach(function(key) { newForm[key] = form[key]; });
    newForm[field] = value;
    setForm(newForm);
  };

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}>Chargement des clients...</div>
    );
  }

  var query = search.toLowerCase();
  var filteredClients = clients.filter(function(c) {
    var name = (c.name || '').toLowerCase();
    var email = (c.email || '').toLowerCase();
    var city = (c.city || '').toLowerCase();
    var phone = (c.phone || '').toLowerCase();
    return name.indexOf(query) !== -1 || email.indexOf(query) !== -1 || city.indexOf(query) !== -1 || phone.indexOf(query) !== -1;
  });  return (
    <div style={s.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={function() { setToast(null); }} />}

      <div style={s.headerRow}>
        <div>
          <h2 style={s.headerTitle}>👥 Clients</h2>
          <p style={s.headerSub}>Votre carnet d'adresses</p>
        </div>
        <button style={s.btnAdd} onClick={openAdd}>+ Nouveau client</button>
      </div>

      <div style={s.searchBar}>
        <span style={s.searchIcon}>🔍</span>
        <input style={s.searchInput} placeholder="Rechercher par nom, email, ville ou téléphone..." value={search} onChange={function(e) { setSearch(e.target.value); }} />
      </div>

      {filteredClients.length === 0 ? (
        <div style={s.emptyState}>
          <p style={{ fontSize: 44, marginBottom: 12, opacity: 0.35 }}>🔎</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#475569', margin: 0 }}>{search ? 'Aucun résultat pour "' + search + '"' : 'Aucun client'}</p>
          {!search && <button style={Object.assign({}, s.btnAdd, { marginTop: 16 })} onClick={openAdd}>+ Nouveau client</button>}
        </div>
      ) : (
        <div style={s.grid}>
          {filteredClients.map(function(c) {
            var theme = getAvatarTheme(c.name);
            return (
              <div key={c.id} style={s.card}>
                <div style={Object.assign({}, s.cardStripe, { background: theme.stripe })}></div>
                <div style={s.cardTop}>
                  <div style={Object.assign({}, s.avatar, { background: theme.bg, color: theme.color })}>{getInitials(c.name)}</div>
                  <div style={s.cardActions}>
                    <button style={s.iconBtn} title="Modifier" onClick={function() { openEdit(c); }}>✏️</button>
                    <button style={s.iconBtnDanger} title="Supprimer" onClick={function() { handleDelete(c); }}>🗑️</button>
                  </div>
                </div>
                <p style={s.clientName}>{c.name}</p>
                {c.city && <span style={s.clientCity}>📍 {c.city}</span>}
                <div style={s.contactList}>
                  <div style={s.contactRow}><span style={s.contactIcon}>✉️</span><span>{c.email || '—'}</span></div>
                  <div style={s.contactRow}><span style={s.contactIcon}>📞</span><span>{c.phone || '—'}</span></div>
                  {c.address && <div style={s.contactRow}><span style={s.contactIcon}>🏠</span><span>{c.address}</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={s.modalOverlay} onClick={closeModal}>
          <div style={s.modal} onClick={function(e) { e.stopPropagation(); }}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>{editingId ? '✏️ Modifier le client' : '🧑‍🤝‍🧑 Nouveau client'}</h3>
                <p style={s.modalSub}>{editingId ? 'Mettez à jour les coordonnées' : 'Ajoutez une personne'}</p>
              </div>
              <button style={s.modalClose} onClick={closeModal}>✕</button>
            </div>
            <div style={s.modalBody}>
              <form onSubmit={handleSubmit}>
                <div style={s.formGroup}>
                  <label style={s.label}>Nom complet *</label>
                  <input style={s.input} placeholder="Ex: Marie Dupont" value={form.name} onChange={function(e) { updateField('name', e.target.value); }} required autoFocus />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Email</label>
                  <input style={s.input} type="email" placeholder="marie.dupont@email.com" value={form.email} onChange={function(e) { updateField('email', e.target.value); }} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Téléphone</label>
                  <input style={s.input} placeholder="06 12 34 56 78" value={form.phone} onChange={function(e) { updateField('phone', e.target.value); }} />
                </div>
                <div style={s.row2}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Adresse</label>
                    <input style={s.input} placeholder="12 rue des Chats" value={form.address} onChange={function(e) { updateField('address', e.target.value); }} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Ville</label>
                    <input style={s.input} placeholder="Lyon" value={form.city} onChange={function(e) { updateField('city', e.target.value); }} />
                  </div>
                </div>
                <div style={s.btnRow}>
                  <button type="submit" style={s.btnSubmit}>{editingId ? '💾 Enregistrer' : '➕ Ajouter le client'}</button>
                  <button type="button" style={s.btnCancel} onClick={closeModal}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;