import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';

var s = {
  page: { maxWidth: 1200, margin: '0 auto' },
  headerTitle: { fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 4 },
  headerSub: { color: '#94a3b8', fontSize: 14 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  grid2: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'flex-start' },
  card: { background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 },
  cardSub: { fontSize: 12, color: '#94a3b8', margin: '2px 0 0 0' },
  cardBody: { padding: 24 },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1e293b', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  select: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#ffffff' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  btnPrimary: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' },
  btnCancel: { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' },
  btnRow: { display: 'flex', gap: 10, marginTop: 8 },
  animalCell: { display: 'flex', alignItems: 'center', gap: 12 },
  animalAvatar: { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  animalName: { fontWeight: 700, color: '#1e293b', fontSize: 14 },
  animalBreed: { fontSize: 12, color: '#94a3b8' },
  speciesBadge: { padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, display: 'inline-block' },
  btnEdit: { background: '#eef2ff', color: '#6366f1', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 6 },
  btnDelete: { background: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  emptyState: { padding: 60, textAlign: 'center', color: '#94a3b8' },
  countBadge: { background: '#eef2ff', color: '#6366f1', padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700 },
  medicalTag: { background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }
};

var racesChien = [
  'Berger Allemand', 'Berger Australien', 'Berger Belge Malinois', 'Berger Blanc Suisse',
  'Beagle', 'Beauceron', 'Bichon Frisé', 'Bichon Maltais',
  'Border Collie', 'Bouledogue Français', 'Bouledogue Anglais', 'Boxer',
  'Braque Allemand', 'Braque de Weimar', 'Bull Terrier',
  'Caniche', 'Cavalier King Charles', 'Chihuahua', 'Chow Chow',
  'Cocker Anglais', 'Cocker Américain', 'Colley',
  'Dalmatien', 'Doberman', 'Dogue Allemand', 'Dogue Argentin',
  'Epagneul Breton', 'Fox Terrier',
  'Golden Retriever', 'Grand Danois',
  'Husky Sibérien',
  'Jack Russell', 'Labrador', 'Lévrier',
  'Malamute', 'Montagne des Pyrénées',
  'Pékinois', 'Pinscher', 'Pitbull',
  'Rottweiler',
  'Saint-Bernard', 'Samoyède', 'Schnauzer', 'Setter Anglais', 'Setter Irlandais',
  'Shiba Inu', 'Shih Tzu', 'Spitz', 'Staffordshire Bull Terrier',
  'Teckel', 'Terre-Neuve',
  'Welsh Corgi', 'Westie', 'Whippet',
  'Yorkshire Terrier',
  'Croisé', 'Autre'
];

var racesChat = [
  'Abyssin', 'American Shorthair', 'Bengal', 'Birman',
  'Bleu Russe', 'Bombay', 'British Shorthair', 'Burmese',
  'Chartreux', 'Devon Rex',
  'Européen', 'Exotic Shorthair',
  'Maine Coon', 'Manx',
  'Norvégien', 'Oriental',
  'Persan',
  'Ragdoll', 'Rex Cornish',
  'Sacré de Birmanie', 'Scottish Fold', 'Siamois', 'Sibérien', 'Sphynx',
  'Tonkinois', 'Turc de Van',
  'Gouttière', 'Croisé', 'Autre'
];

function Animals() {
  var [animals, setAnimals] = useState([]);
  var [clients, setClients] = useState([]);
  var [form, setForm] = useState({ client_id: '', name: '', species: '', breed: '', age: '', weight: '', medical_notes: '' });
  var [editingId, setEditingId] = useState(null);
  var [loading, setLoading] = useState(true);
  var [showForm, setShowForm] = useState(false);
  var [toast, setToast] = useState(null);
  var showToast = function(message, type) { setToast({ message: message, type: type || 'success' }); };

  useEffect(function() { fetchData(); }, []);

  var fetchData = function() {
    Promise.all([
      axios.get('/api/animals'),
      axios.get('/api/clients')
    ]).then(function(results) {
      setAnimals(results[0].data);
      setClients(results[1].data);
      setLoading(false);
    }).catch(function(err) { console.error(err); setLoading(false); });
  };

  var handleSubmit = function(e) {
    e.preventDefault();
    var request;
    if (editingId) { request = axios.put('/api/animals/' + editingId, form); }
    else { request = axios.post('/api/animals', form); }
    request.then(function() {
      showToast(editingId ? 'Animal modifié !' : 'Animal ajouté !');
      resetForm();
      fetchData();
    }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur';
      showToast('Erreur: ' + msg, 'error');
    });
  };

  var handleEdit = function(animal) {
    setForm(animal);
    setEditingId(animal.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  var resetForm = function() {
    setForm({ client_id: '', name: '', species: '', breed: '', age: '', weight: '', medical_notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  var handleDelete = function(id) {
    axios.delete('/api/animals/' + id).then(function() {
      fetchData();
      showToast('Animal supprimé !');
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

  var getSpeciesStyle = function(species) {
    var sp = (species || '').toLowerCase();
    if (sp === 'chien' || sp === 'dog') return { background: '#eef2ff', color: '#6366f1' };
    if (sp === 'chat' || sp === 'cat') return { background: '#fef3c7', color: '#d97706' };
    return { background: '#f1f5f9', color: '#64748b' };
  };

  var getSpeciesIcon = function(species) {
    var sp = (species || '').toLowerCase();
    if (sp === 'chien' || sp === 'dog') return '🐶';
    if (sp === 'chat' || sp === 'cat') return '🐱';
    return '🐾';
  };

  var getClientName = function(clientId) {
    var client = clients.find(function(c) { return c.id === clientId; });
    return client && client.name ? client.name : 'Client #' + clientId;
  };

  if (loading) {
    return <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}>Chargement des animaux...</div>;
  }  return (
    <div style={s.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={function() { setToast(null); }} />}

      <div style={s.headerRow}>
        <div>
          <h2 style={s.headerTitle}>🐾 Animaux</h2>
          <p style={s.headerSub}>Gérez les fiches de vos pensionnaires</p>
        </div>
        {!showForm && (
          <button style={s.btnPrimary} onClick={function() { setShowForm(true); }}>+ Ajouter un animal</button>
        )}
      </div>

      {showForm ? (
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div>
                <h3 style={s.cardTitle}>{editingId ? '✏️ Modifier' : '➕ Nouvel Animal'}</h3>
                <p style={s.cardSub}>{editingId ? 'Modifiez les informations' : 'Remplissez la fiche'}</p>
              </div>
            </div>
            <div style={s.cardBody}>
              <form onSubmit={handleSubmit}>
                <div style={s.formGroup}>
                  <label style={s.label}>Propriétaire</label>
                  <select style={s.select} value={form.client_id} onChange={function(e) { updateField('client_id', e.target.value); }} required>
                    <option value="">-- Sélectionner un client --</option>
                    {clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}</option>; })}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Nom de l'animal</label>
                  <input style={s.input} value={form.name} onChange={function(e) { updateField('name', e.target.value); }} placeholder="Ex: Rex, Luna..." required />
                </div>
                <div style={s.row2}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Espèce</label>
                    <select style={s.select} value={form.species} onChange={function(e) { updateField('species', e.target.value); }} required>
                      <option value="">-- Choisir --</option>
                      <option value="Chien">🐶 Chien</option>
                      <option value="Chat">🐱 Chat</option>
                      <option value="Autre">🐾 Autre</option>
                    </select>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Race</label>
                    <input style={s.input} list="race-list" value={form.breed} onChange={function(e) { updateField('breed', e.target.value); }} placeholder="Tapez ou choisissez..." />
                    <datalist id="race-list">
                      {(form.species === 'Chat' ? racesChat : racesChien).map(function(race) { return <option key={race} value={race} />; })}
                    </datalist>
                  </div>
                </div>
                <div style={s.row2}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Âge (ans)</label>
                    <input style={s.input} type="number" value={form.age} onChange={function(e) { updateField('age', e.target.value); }} placeholder="0" />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Poids (kg)</label>
                    <input style={s.input} type="number" step="0.1" value={form.weight} onChange={function(e) { updateField('weight', e.target.value); }} placeholder="0.0" />
                  </div>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Notes médicales</label>
                  <textarea style={s.textarea} value={form.medical_notes} onChange={function(e) { updateField('medical_notes', e.target.value); }} rows="3" placeholder="Allergies, traitements..." />
                </div>
                <div style={s.btnRow}>
                  <button type="submit" style={s.btnPrimary}>{editingId ? '✏️ Modifier' : '➕ Ajouter'}</button>
                  <button type="button" style={s.btnCancel} onClick={resetForm}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div><h3 style={s.cardTitle}>Liste des animaux</h3></div>
              <span style={s.countBadge}>{animals.length} animaux</span>
            </div>
            {renderTable()}
          </div>
        </div>
      ) : (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div><h3 style={s.cardTitle}>Liste des animaux</h3></div>
            <span style={s.countBadge}>{animals.length} animaux</span>
          </div>
          {renderTable()}
        </div>
      )}
    </div>
  );

  function renderTable() {
    if (animals.length === 0) {
      return (
        <div style={s.emptyState}>
          <p style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🐾</p>
          <p>Aucun animal enregistré</p>
          <button style={Object.assign({}, s.btnPrimary, { width: 'auto', marginTop: 16 })} onClick={function() { setShowForm(true); }}>+ Ajouter</button>
        </div>
      );
    }
    return (
      <table>
        <thead>
          <tr>
            <th>Animal</th>
            <th>Espèce</th>
            <th>Propriétaire</th>
            <th>Âge</th>
            <th>Poids</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {animals.map(function(a) {
            var speciesColor = getSpeciesStyle(a.species);
            return (
              <tr key={a.id}>
                <td>
                  <div style={s.animalCell}>
                    <div style={Object.assign({}, s.animalAvatar, { background: speciesColor.background })}>{getSpeciesIcon(a.species)}</div>
                    <div>
                      <div style={s.animalName}>{a.name}</div>
                      <div style={s.animalBreed}>{a.breed || '-'}</div>
                    </div>
                  </div>
                </td>
                <td><span style={Object.assign({}, s.speciesBadge, speciesColor)}>{a.species}</span></td>
                <td style={{ color: '#64748b', fontSize: 13 }}>{getClientName(a.client_id)}</td>
                <td style={{ color: '#64748b' }}>{a.age ? a.age + ' ans' : '-'}</td>
                <td style={{ color: '#64748b' }}>{a.weight ? a.weight + ' kg' : '-'}</td>
                <td>{a.medical_notes ? <span style={s.medicalTag}>📋 Notes</span> : <span style={{ color: '#cbd5e1', fontSize: 12 }}>-</span>}</td>
                <td>
                  <button style={s.btnEdit} onClick={function() { handleEdit(a); }}>✏️</button>
                  <button style={s.btnDelete} onClick={function() { handleDelete(a.id); }}>🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}

export default Animals;