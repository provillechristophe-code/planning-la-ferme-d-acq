import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';

var s = {
  page: { maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 4 },
  sub: { color: '#94a3b8', fontSize: 14, margin: 0 },
  tabs: { display: 'flex', gap: 6, marginTop: 28, marginBottom: 28, borderBottom: '1px solid #e2e8f0' },
  tab: { padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '3px solid transparent' },
  tabActive: { padding: '12px 20px', fontSize: 14, fontWeight: 700, color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '3px solid #6366f1' },
  card: { background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, marginBottom: 24 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' },
  select: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', background: '#fff' },
  btn: { background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnPrimary: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnDanger: { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  statCard: { background: '#f8fafc', borderRadius: 12, padding: 20, textAlign: 'center' },
  statValue: { fontSize: 28, fontWeight: 800, color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 4 },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 12, fontSize: 13 },
  th: { background: '#f1f5f9', color: '#334155', padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 700 },
  td: { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569' }
};

function Configuration() {
  var [boxes, setBoxes] = useState([]);
  var [services, setServices] = useState([]);
  var [loading, setLoading] = useState(true);
  var [activeTab, setActiveTab] = useState('general');
  var [toast, setToast] = useState(null);
  var showToast = function(message, type) { setToast({ message: message, type: type || 'success' }); };
  var [boxMode, setBoxMode] = useState('single');

  var [configForm, setConfigForm] = useState({ pension_name: '', total_boxes: 10, phone: '', address: '', tax_rate: 0, default_daily_rate: 30 });
  var [boxForm, setBoxForm] = useState({ box_number: '', box_type: 'standard', capacity: 1, daily_rate: 30 });
  var [batchForm, setBatchForm] = useState({ prefix: 'A', separator: '-', startNum: 1, count: 5, box_type: 'standard', capacity: 1, daily_rate: 30 });
  var [serviceForm, setServiceForm] = useState({ service_name: '', service_type: '', price: 0, description: '' });

  // Base de données complète pour l'onglet visualiseur
  var [dbData, setDbData] = useState({ clients: [], animals: [], boxes: [], reservations: [], invoices: [] });
  var [selectedDbTable, setSelectedDbTable] = useState('clients');
  var restoreInputRef = useRef(null);

  useEffect(function() { fetchData(); }, []);

  var fetchData = function() {
    Promise.all([
      axios.get('/api/config/config'),
      axios.get('/api/config/boxes'),
      axios.get('/api/config/services'),
      axios.get('/api/config/db-tables')
    ]).then(function(results) {
      if (results[0].data) setConfigForm(results[0].data);
      setBoxes(results[1].data);
      setServices(results[2].data);
      if (results[3].data) setDbData(results[3].data);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  };

  var updateConfig = function(field, value) { var f = {}; Object.keys(configForm).forEach(function(k) { f[k] = configForm[k]; }); f[field] = value; setConfigForm(f); };
  var updateBox = function(field, value) { var f = {}; Object.keys(boxForm).forEach(function(k) { f[k] = boxForm[k]; }); f[field] = value; setBoxForm(f); };
  var updateBatch = function(field, value) { var f = {}; Object.keys(batchForm).forEach(function(k) { f[k] = batchForm[k]; }); f[field] = value; setBatchForm(f); };
  var updateService = function(field, value) { var f = {}; Object.keys(serviceForm).forEach(function(k) { f[k] = serviceForm[k]; }); f[field] = value; setServiceForm(f); };

  var handleUpdateConfig = function() {
    axios.put('/api/config/config', configForm).then(function() { showToast('Configuration sauvegardée !'); fetchData(); }).catch(function() { showToast('Erreur', 'error'); });
  };

  var handleDownloadBackup = function() {
    showToast('Téléchargement de la sauvegarde en cours...');
    axios.get('/api/backup-db', { responseType: 'blob' })
      .then(function(res) {
        var url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
        var link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'pattes_douces_backup_' + new Date().toISOString().slice(0, 10) + '.json');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        showToast('Sauvegarde téléchargée avec succès !');
      })
      .catch(function(err) {
        console.error('Erreur téléchargement sauvegarde :', err);
        showToast('Erreur lors du téléchargement de la sauvegarde', 'error');
      });
  };

  var handleRestoreFileSelect = function(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(evt) {
      try {
        var content = evt.target.result;
        var data = JSON.parse(content);

        showToast('Restauration des données en cours...');
        axios.post('/api/reservations/restore-full', data)
          .then(function(res) {
            var msg = 'Base restaurée avec succès !';
            if (res.data && res.data.counts) {
              var c = res.data.counts;
              msg += ' (' + (c.clients || 0) + ' clients, ' + (c.animals || 0) + ' animaux, ' + (c.reservations || 0) + ' réservations)';
            }
            showToast(msg);
            fetchData();
          })
          .catch(function(err) {
            console.error('Erreur restauration :', err);
            showToast('Erreur lors de la restauration.', 'error');
          });
      } catch (err) {
        showToast('Fichier invalide. Veuillez sélectionner un fichier de sauvegarde (.json) téléchargé depuis cette application.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  var handleAddBox = function() {
    axios.post('/api/config/boxes', boxForm).then(function() {
      setBoxForm({ box_number: '', box_type: 'standard', capacity: 1, daily_rate: 30 });
      fetchData(); showToast('Box créé !');
    }).catch(function() { showToast('Erreur', 'error'); });
  };

  var handleDeleteBox = function(box) {
    axios.delete('/api/config/boxes/' + box.id).then(function() { fetchData(); showToast('Box supprimé !'); });
  };

  var handleDeleteDbRow = function(table, id) {
    if (!window.confirm('Voulez-vous vraiment supprimer cet enregistrement de la base de données ?')) return;
    axios.delete('/api/config/db-table-row/' + table + '/' + id)
      .then(function() {
        showToast('Enregistrement supprimé de la base de données !');
        fetchData();
      })
      .catch(function(err) {
        console.error('Erreur suppression ligne base :', err);
        showToast('Erreur lors de la suppression.', 'error');
      });
  };

  var batchPreview = function() {
    var names = []; var start = parseInt(batchForm.startNum) || 1; var count = parseInt(batchForm.count) || 1;
    for (var i = 0; i < count; i++) { var num = start + i; var numStr = num < 10 ? '0' + num : '' + num; names.push(batchForm.prefix + batchForm.separator + numStr); }
    return names;
  };

  var handleBatchCreate = function() {
    var names = batchPreview(); var created = 0; var idx = 0;
    var createNext = function() {
      if (idx >= names.length) { fetchData(); showToast(created + ' boxes créés !'); return; }
      var data = { box_number: names[idx], box_type: batchForm.box_type, capacity: batchForm.capacity, daily_rate: batchForm.daily_rate };
      axios.post('/api/config/boxes', data).then(function() { created++; idx++; createNext(); }).catch(function() { idx++; createNext(); });
    };
    createNext();
  };

  var handleAddService = function() {
    axios.post('/api/config/services', serviceForm).then(function() {
      setServiceForm({ service_name: '', service_type: '', price: 0, description: '' });
      fetchData(); showToast('Service créé !');
    }).catch(function() { showToast('Erreur', 'error'); });
  };

  var handleDeleteService = function(service) {
    axios.delete('/api/config/services/' + service.id).then(function() { fetchData(); showToast('Service supprimé !'); });
  };

  if (loading) return <p style={{ padding: 40 }}>Chargement...</p>;

  // Dictionnaires de correspondance ID -> Libellé lisible
  var clientMap = {};
  (dbData.clients || []).forEach(function(c) { clientMap[c.id] = c.name; });

  var animalMap = {};
  (dbData.animals || []).forEach(function(a) { animalMap[a.id] = a.name; });

  var boxMap = {};
  (dbData.boxes || []).forEach(function(b) { boxMap[b.id] = b.box_number; });

  var renderDbCell = function(columnKey, val) {
    if (val === null || val === undefined) return '-';
    
    // Remplacement explicite des ID par "ID (Nom / Numéro)" pour faciliter la lecture
    if (columnKey === 'client_id' && clientMap[val]) {
      return val + ' (' + clientMap[val] + ')';
    }
    if (columnKey === 'animal_id' && animalMap[val]) {
      return val + ' (' + animalMap[val] + ')';
    }
    if (columnKey === 'box_id' && boxMap[val]) {
      return val + ' (Box ' + boxMap[val] + ')';
    }
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  var renderDbTable = function() {
    var rows = dbData[selectedDbTable] || [];
    if (rows.length === 0) {
      return <p style={{ color: '#94a3b8', padding: 16 }}>Aucun enregistrement trouvé dans cette table.</p>;
    }
    var headers = Object.keys(rows[0]);
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              {headers.map(function(h) {
                return <th key={h} style={s.th}>{h}</th>;
              })}
              <th style={{ ...s.th, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(function(row, idx) {
              return (
                <tr key={row.id || idx}>
                  {headers.map(function(h) {
                    return <td key={h} style={s.td}>{renderDbCell(h, row[h])}</td>;
                  })}
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    {row.id && (
                      <button 
                        onClick={function() { handleDeleteDbRow(selectedDbTable, row.id); }} 
                        style={s.btnDanger}
                        title="Supprimer cet enregistrement"
                      >
                        🗑️ Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={s.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={function() { setToast(null); }} />}

      <h2 style={s.title}>⚙️ Configuration</h2>
      <p style={s.sub}>Gérez les paramètres de votre pension</p>

      <div style={s.tabs}>
        <button style={activeTab === 'general' ? s.tabActive : s.tab} onClick={function() { setActiveTab('general'); }}>🏢 Général</button>
        <button style={activeTab === 'boxes' ? s.tabActive : s.tab} onClick={function() { setActiveTab('boxes'); }}>📦 Boxes ({boxes.length})</button>
        <button style={activeTab === 'services' ? s.tabActive : s.tab} onClick={function() { setActiveTab('services'); }}>🛎️ Services ({services.length})</button>
        <button style={activeTab === 'database' ? s.tabActive : s.tab} onClick={function() { setActiveTab('database'); }}>📊 Base de Données</button>
      </div>

      {activeTab === 'general' && (
        <div>
          <div style={s.grid3}>
            <div style={s.statCard}><div style={s.statValue}>{boxes.length}</div><div style={s.statLabel}>📦 Boxes</div></div>
            <div style={s.statCard}><div style={s.statValue}>{services.length}</div><div style={s.statLabel}>🛎️ Services</div></div>
            <div style={s.statCard}><div style={s.statValue}>{configForm.tax_rate ? (configForm.tax_rate * 100).toFixed(0) : 0}%</div><div style={s.statLabel}>💶 TVA</div></div>
          </div>
          <div style={Object.assign({}, s.card, { marginTop: 24 })}>
            <h3 style={{ marginTop: 0 }}>Paramètres de la pension</h3>
            <div style={{ marginTop: 20 }}>
              <div style={s.grid2}>
                <div><label style={s.label}>Nom</label><input style={s.input} value={configForm.pension_name || ''} onChange={function(e) { updateConfig('pension_name', e.target.value); }} /></div>
                <div><label style={s.label}>Téléphone</label><input style={s.input} value={configForm.phone || ''} onChange={function(e) { updateConfig('phone', e.target.value); }} /></div>
              </div>
              <div style={{ marginTop: 16 }}><label style={s.label}>Adresse</label><input style={s.input} value={configForm.address || ''} onChange={function(e) { updateConfig('address', e.target.value); }} /></div>
              <div style={{ ...s.grid2, marginTop: 16 }}>
                <div><label style={s.label}>Nombre de boxes</label><input style={s.input} type="number" value={configForm.total_boxes || ''} onChange={function(e) { updateConfig('total_boxes', e.target.value); }} /></div>
                <div><label style={s.label}>TVA (%)</label><input style={s.input} type="number" step="0.01" value={configForm.tax_rate ? (configForm.tax_rate * 100).toFixed(2) : 0} onChange={function(e) { var val = parseFloat(e.target.value); if (isNaN(val)) val = 0; updateConfig('tax_rate', val / 100); }} /></div>
              </div>
              <div style={{ marginTop: 16 }}><label style={s.label}>💶 Tarif journalier par défaut (€)</label><input style={s.input} type="number" step="0.01" value={configForm.default_daily_rate !== undefined && configForm.default_daily_rate !== null ? configForm.default_daily_rate : ''} onChange={function(e) { updateConfig('default_daily_rate', e.target.value); }} placeholder="30.00" /></div>
              <button style={{ ...s.btnPrimary, marginTop: 20 }} onClick={handleUpdateConfig}>💾 Enregistrer</button>
            </div>
          </div>

          <div style={Object.assign({}, s.card, { marginTop: 24, background: '#f0fdf4', border: '1px solid #bbf7d0' })}>
            <h3 style={{ marginTop: 0, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💾</span> Sauvegarde & Sécurité des données
            </h3>
            <p style={{ fontSize: 13, color: '#15803d', marginTop: 6, lineHeight: 1.5 }}>
              Téléchargez un fichier de sauvegarde (<code>.json</code>) pour conserver une copie complète de vos clients, animaux, réservations et factures. Vous pouvez le restaurer ici à tout moment d'un simple clic.
            </p>

            <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button 
                onClick={handleDownloadBackup} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                  cursor: 'pointer'
                }}
              >
                📥 Télécharger la sauvegarde de la base
              </button>

              <button 
                onClick={function() { if (restoreInputRef.current) restoreInputRef.current.click(); }} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  color: '#059669',
                  border: '2px solid #10b981',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                📤 Restaurer à partir d'un fichier de sauvegarde
              </button>
              
              <input 
                type="file" 
                ref={restoreInputRef} 
                onChange={handleRestoreFileSelect} 
                style={{ display: 'none' }} 
                accept=".json,.db" 
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'boxes' && (
        <div>
          <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
            <button onClick={function() { setBoxMode('single'); }} style={{ padding: '10px 20px', borderRadius: 50, border: boxMode === 'single' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: boxMode === 'single' ? '#eef2ff' : '#fff', color: boxMode === 'single' ? '#6366f1' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>📦 Box unique</button>
            <button onClick={function() { setBoxMode('batch'); }} style={{ padding: '10px 20px', borderRadius: 50, border: boxMode === 'batch' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: boxMode === 'batch' ? '#eef2ff' : '#fff', color: boxMode === 'batch' ? '#6366f1' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>📦📦📦 En lot</button>
          </div>

          {boxMode === 'single' && (
            <div style={s.card}>
              <h3 style={{ marginTop: 0 }}>Ajouter un box</h3>
              <div style={{ ...s.grid2, marginTop: 20 }}>
                <div><label style={s.label}>Numéro</label><input style={s.input} value={boxForm.box_number} onChange={function(e) { updateBox('box_number', e.target.value); }} placeholder="A-01" /></div>
                <div><label style={s.label}>Type</label><select style={s.select} value={boxForm.box_type} onChange={function(e) { updateBox('box_type', e.target.value); }}><option value="petit">Petit</option><option value="standard">Standard</option><option value="grand">Grand</option></select></div>
                <div><label style={s.label}>Capacité</label><input style={s.input} type="number" value={boxForm.capacity} onChange={function(e) { updateBox('capacity', e.target.value); }} /></div>
                <div><label style={s.label}>Tarif/jour</label><input style={s.input} type="number" step="0.01" value={boxForm.daily_rate} onChange={function(e) { updateBox('daily_rate', e.target.value); }} /></div>
              </div>
              <button style={{ ...s.btn, marginTop: 20 }} onClick={handleAddBox}>+ Ajouter</button>
            </div>
          )}

          {boxMode === 'batch' && (
            <div style={s.card}>
              <h3 style={{ marginTop: 0 }}>Création en lot</h3>
              <div style={{ ...s.grid2, marginTop: 20 }}>
                <div><label style={s.label}>Préfixe</label><input style={s.input} value={batchForm.prefix} onChange={function(e) { updateBatch('prefix', e.target.value); }} /></div>
                <div><label style={s.label}>Séparateur</label><select style={s.select} value={batchForm.separator} onChange={function(e) { updateBatch('separator', e.target.value); }}><option value="-">Tiret</option><option value=" ">Espace</option><option value="">Rien</option></select></div>
                <div><label style={s.label}>Début</label><input style={s.input} type="number" value={batchForm.startNum} onChange={function(e) { updateBatch('startNum', e.target.value); }} /></div>
                <div><label style={s.label}>Nombre</label><input style={s.input} type="number" value={batchForm.count} onChange={function(e) { updateBatch('count', e.target.value); }} /></div>
                <div><label style={s.label}>Type</label><select style={s.select} value={batchForm.box_type} onChange={function(e) { updateBatch('box_type', e.target.value); }}><option value="petit">Petit</option><option value="standard">Standard</option><option value="grand">Grand</option></select></div>
                <div><label style={s.label}>Capacité</label><input style={s.input} type="number" value={batchForm.capacity} onChange={function(e) { updateBatch('capacity', e.target.value); }} /></div>
                <div><label style={s.label}>Tarif</label><input style={s.input} type="number" step="0.01" value={batchForm.daily_rate} onChange={function(e) { updateBatch('daily_rate', e.target.value); }} /></div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginTop: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', margin: 0 }}>📋 Aperçu : {batchPreview().join(', ')}</p>
              </div>
              <button style={{ ...s.btn, marginTop: 20 }} onClick={handleBatchCreate}>🚀 Créer {batchForm.count} boxes</button>
            </div>
          )}

          <div style={s.card}>
            <h3 style={{ marginTop: 0 }}>📦 Boxes ({boxes.length})</h3>
            <div style={{ marginTop: 20 }}>
              {boxes.map(function(box) {
                return (
                  <div key={box.id} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>{box.box_number}</strong> - {box.box_type} - {box.capacity} places - {box.daily_rate}€/jour</div>
                    <button onClick={function() { handleDeleteBox(box); }} style={s.btnDanger}>🗑️</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div>
          <div style={s.card}>
            <h3 style={{ marginTop: 0 }}>Ajouter un service</h3>
            <div style={{ ...s.grid2, marginTop: 20 }}>
              <div><label style={s.label}>Nom</label><input style={s.input} value={serviceForm.service_name} onChange={function(e) { updateService('service_name', e.target.value); }} /></div>
              <div><label style={s.label}>Type</label><select style={s.select} value={serviceForm.service_type} onChange={function(e) { updateService('service_type', e.target.value); }}><option value="">--</option><option value="promenade">Promenade</option><option value="nourriture">Nourriture</option><option value="toilettage">Toilettage</option><option value="jeux">Jeux</option><option value="medicament">Médicament</option><option value="autre">Autre</option></select></div>
              <div><label style={s.label}>Prix (€)</label><input style={s.input} type="number" step="0.01" value={serviceForm.price} onChange={function(e) { updateService('price', e.target.value); }} /></div>
              <div><label style={s.label}>Description</label><input style={s.input} value={serviceForm.description} onChange={function(e) { updateService('description', e.target.value); }} /></div>
            </div>
            <button style={{ ...s.btn, marginTop: 20 }} onClick={handleAddService}>+ Ajouter</button>
          </div>
          <div style={s.card}>
            <h3 style={{ marginTop: 0 }}>🛎️ Services ({services.length})</h3>
            {services.map(function(service) {
              return (
                <div key={service.id} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <div><strong>{service.service_name}</strong> - {service.service_type} - {service.price}€</div>
                  <button onClick={function() { handleDeleteService(service); }} style={s.btnDanger}>🗑️</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div>
          <div style={s.card}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📊</span> Visualiseur de la Base de Données
            </h3>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
              Consultez et nettoyez directement le contenu brut enregistré dans les différentes tables de la base de données SQLite.
            </p>

            <div style={{ display: 'flex', gap: 8, marginTop: 20, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { key: 'clients', label: '👤 Clients (' + (dbData.clients ? dbData.clients.length : 0) + ')' },
                { key: 'animals', label: '🐾 Animaux (' + (dbData.animals ? dbData.animals.length : 0) + ')' },
                { key: 'boxes', label: '📦 Boxes (' + (dbData.boxes ? dbData.boxes.length : 0) + ')' },
                { key: 'reservations', label: '📅 Réservations (' + (dbData.reservations ? dbData.reservations.length : 0) + ')' },
                { key: 'invoices', label: '💶 Factures (' + (dbData.invoices ? dbData.invoices.length : 0) + ')' }
              ].map(function(t) {
                var isActive = selectedDbTable === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={function() { setSelectedDbTable(t.key); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: isActive ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: isActive ? '#eef2ff' : '#f8fafc',
                      color: isActive ? '#6366f1' : '#475569',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {renderDbTable()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Configuration;