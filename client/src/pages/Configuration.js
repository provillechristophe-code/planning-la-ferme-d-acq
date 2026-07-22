import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Configuration() {
  var [boxes, setBoxes] = useState([]);
  var [services, setServices] = useState([]);
  var [boxMode, setBoxMode] = useState('single');
  var [boxForm, setBoxForm] = useState({ box_number: '', box_type: 'standard', capacity: 1, daily_rate: 30 });
  var [batchForm, setBatchForm] = useState({ prefix: 'A', separator: '-', startNum: 1, count: 5, box_type: 'standard', capacity: 1, daily_rate: 30 });
  var [configForm, setConfigForm] = useState({ pension_name: '', total_boxes: 10, phone: '', address: '', tax_rate: 0.2 });
  var [serviceForm, setServiceForm] = useState({ service_name: '', service_type: '', price: 0, description: '' });
  var [activeTab, setActiveTab] = useState('general');
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    Promise.all([
      axios.get('/api/config/config'),
      axios.get('/api/config/boxes'),
      axios.get('/api/config/services')
    ]).then(function(results) {
      setConfigForm(results[0].data);
      setBoxes(results[1].data);
      setServices(results[2].data);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);

  var updateBox = function(field, value) {
    var newForm = {}; Object.keys(boxForm).forEach(function(k) { newForm[k] = boxForm[k]; });
    newForm[field] = value; setBoxForm(newForm);
  };

  var updateBatch = function(field, value) {
    var newForm = {}; Object.keys(batchForm).forEach(function(k) { newForm[k] = batchForm[k]; });
    newForm[field] = value; setBatchForm(newForm);
  };

  var updateService = function(field, value) {
    var newForm = {}; Object.keys(serviceForm).forEach(function(k) { newForm[k] = serviceForm[k]; });
    newForm[field] = value; setServiceForm(newForm);
  };

  var batchPreview = function() {
    var names = [];
    var start = parseInt(batchForm.startNum) || 1;
    var count = parseInt(batchForm.count) || 1;
    for (var i = 0; i < count; i++) {
      var num = start + i;
      var numStr = num < 10 ? '0' + num : '' + num;
      names.push(batchForm.prefix + batchForm.separator + numStr);
    }
    return names;
  };

  var handleAddBox = function() {
    axios.post('/api/config/boxes', boxForm).then(function() {
      setBoxForm({ box_number: '', box_type: 'standard', capacity: 1, daily_rate: 30 });
      axios.get('/api/config/boxes').then(function(r) { setBoxes(r.data); });
      alert('Box créé !');
    });
  };

  var handleBatchCreate = function() {
    var names = batchPreview();var created = 0; var idx = 0;
  
        var createNext = function() {
      if (idx >= names.length) {
        axios.get('/api/config/boxes').then(function(r) { setBoxes(r.data); });
        alert(created + ' boxes créés !');
        return;
      }
      var data = {
        box_number: names[idx],
        box_type: batchForm.box_type,
        capacity: batchForm.capacity,
        daily_rate: batchForm.daily_rate
      };
      axios.post('/api/config/boxes', data)
        .then(function() { created++; idx++; createNext(); })
        .catch(function() { idx++; createNext(); });
    };
    createNext();
  };

  var handleDeleteBox = function(box) {
    if (window.confirm('Supprimer ' + box.box_number + ' ?')) {
      axios.delete('/api/config/boxes/' + box.id).then(function() {
        axios.get('/api/config/boxes').then(function(r) { setBoxes(r.data); });
      });
    }
  };

  var handleAddService = function() {
    axios.post('/api/config/services', serviceForm).then(function() {
      setServiceForm({ service_name: '', service_type: '', price: 0, description: '' });
      axios.get('/api/config/services').then(function(r) { setServices(r.data); });
      alert('Service créé !');
    });
  };

  var handleDeleteService = function(service) {
    if (window.confirm('Supprimer ' + service.service_name + ' ?')) {
      axios.delete('/api/config/services/' + service.id).then(function() {
        axios.get('/api/config/services').then(function(r) { setServices(r.data); });
      });
    }
  };

  var updateConfig = function(field, value) {
    var newForm = {}; Object.keys(configForm).forEach(function(k) { newForm[k] = configForm[k]; });
    newForm[field] = value; setConfigForm(newForm);
  };

  var handleUpdateConfig = function() {
    axios.put('/api/config/config', configForm).then(function() { alert('Configuration sauvegardée !'); });
  };

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
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }
  };

  if (loading) return <p style={{ padding: 40 }}>Chargement...</p>;

  return (
    <div style={s.page}>
      <h2 style={s.title}>⚙️ Configuration</h2>
      <p style={s.sub}>Gérez les paramètres de votre pension</p>

      <div style={s.tabs}>
        <button style={activeTab === 'general' ? s.tabActive : s.tab} onClick={function() { setActiveTab('general'); }}>🏢 Général</button>
        <button style={activeTab === 'boxes' ? s.tabActive : s.tab} onClick={function() { setActiveTab('boxes'); }}>📦 Boxes ({boxes.length})</button>
        <button style={activeTab === 'services' ? s.tabActive : s.tab} onClick={function() { setActiveTab('services'); }}>🛎️ Services ({services.length})</button>
      </div>

      {activeTab === 'general' && (
        <div style={s.card}>
          <h3>Paramètres de la pension</h3>
          <div style={{ marginTop: 20 }}>
            <div style={s.grid2}>
              <div><label style={s.label}>Nom</label><input style={s.input} value={configForm.pension_name || ''} onChange={function(e) { updateConfig('pension_name', e.target.value); }} /></div>
              <div><label style={s.label}>Téléphone</label><input style={s.input} value={configForm.phone || ''} onChange={function(e) { updateConfig('phone', e.target.value); }} /></div>
            </div>
            <div style={{ marginTop: 16 }}><label style={s.label}>Adresse</label><input style={s.input} value={configForm.address || ''} onChange={function(e) { updateConfig('address', e.target.value); }} /></div>
            <div style={{ ...s.grid2, marginTop: 16 }}>
              <div><label style={s.label}>Nombre total de boxes</label><input style={s.input} type="number" value={configForm.total_boxes || ''} onChange={function(e) { updateConfig('total_boxes', e.target.value); }} /></div>
              <div><label style={s.label}>TVA (%)</label><input style={s.input} type="number" step="0.01" value={configForm.tax_rate ? (configForm.tax_rate * 100).toFixed(0) : ''}  onChange={function(e) {
  var val = parseFloat(e.target.value);
  if (isNaN(val)) val = 0;
  updateConfig('tax_rate', val / 100);
}}/></div>
            </div>
            <div>
  <label style={s.label}>💶 Tarif journalier par défaut (€)</label>
  <input style={s.input} type="number" step="0.01" value={configForm.default_daily_rate || ''} onChange={function(e) { updateConfig('default_daily_rate', e.target.value); }} placeholder="30.00" />
</div>
            <button style={{ ...s.btn, marginTop: 20 }} onClick={handleUpdateConfig}>💾 Enregistrer</button>
          </div>
        </div>
      )}

      {activeTab === 'boxes' && (
        <div>
          <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
            <button onClick={function() { setBoxMode('single'); }} style={{ padding: '10px 20px', borderRadius: 50, border: boxMode === 'single' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: boxMode === 'single' ? '#eef2ff' : '#fff', color: boxMode === 'single' ? '#6366f1' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>📦 Box unique</button>
            <button onClick={function() { setBoxMode('batch'); }} style={{ padding: '10px 20px', borderRadius: 50, border: boxMode === 'batch' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: boxMode === 'batch' ? '#eef2ff' : '#fff', color: boxMode === 'batch' ? '#6366f1' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>📦📦📦 Création en lot</button>
          </div>

          {boxMode === 'single' && (
            <div style={s.card}>
              <h3>Ajouter un box</h3>
              <div style={{ ...s.grid2, marginTop: 20 }}>
                <div><label style={s.label}>Numéro</label><input style={s.input} value={boxForm.box_number} onChange={function(e) { updateBox('box_number', e.target.value); }} placeholder="A-01" /></div>
                <div><label style={s.label}>Type</label><select style={s.select} value={boxForm.box_type} onChange={function(e) { updateBox('box_type', e.target.value); }}><option value="petit">Petit</option><option value="standard">Standard</option><option value="grand">Grand</option></select></div>
                <div><label style={s.label}>Capacité</label><input style={s.input} type="number" value={boxForm.capacity} onChange={function(e) { updateBox('capacity', e.target.value); }} /></div>
                <div><label style={s.label}>Tarif/jour</label><input style={s.input} type="number" step="0.01" value={boxForm.daily_rate} onChange={function(e) { updateBox('daily_rate', e.target.value); }} /></div>
              </div>
              <button style={{ ...s.btn, marginTop: 20 }} onClick={handleAddBox}>+ Ajouter le box</button>
            </div>
          )}

          {boxMode === 'batch' && (
            <div style={s.card}>
              <h3>📦📦📦 Création en lot</h3>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>Créez plusieurs boxes identiques d'un coup</p>
              <div style={{ ...s.grid2, marginTop: 20 }}>
                <div><label style={s.label}>Préfixe (ex: A, Box, Petit)</label><input style={s.input} value={batchForm.prefix} onChange={function(e) { updateBatch('prefix', e.target.value); }} placeholder="A" /></div>
                <div><label style={s.label}>Séparateur</label><select style={s.select} value={batchForm.separator} onChange={function(e) { updateBatch('separator', e.target.value); }}><option value="-">Tiret (A-01)</option><option value=" ">Espace (A 01)</option><option value="">Rien (A01)</option></select></div>
                <div><label style={s.label}>Numéro de départ</label><input style={s.input} type="number" value={batchForm.startNum} onChange={function(e) { updateBatch('startNum', e.target.value); }} /></div>
                <div><label style={s.label}>Nombre de boxes</label><input style={s.input} type="number" value={batchForm.count} onChange={function(e) { updateBatch('count', e.target.value); }} /></div>
                <div><label style={s.label}>Type</label><select style={s.select} value={batchForm.box_type} onChange={function(e) { updateBatch('box_type', e.target.value); }}><option value="petit">Petit</option><option value="standard">Standard</option><option value="grand">Grand</option></select></div>
                <div><label style={s.label}>Capacité</label><input style={s.input} type="number" value={batchForm.capacity} onChange={function(e) { updateBatch('capacity', e.target.value); }} /></div>
                <div><label style={s.label}>Tarif journalier (€)</label><input style={s.input} type="number" step="0.01" value={batchForm.daily_rate} onChange={function(e) { updateBatch('daily_rate', e.target.value); }} /></div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginTop: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', margin: 0 }}>📋 Aperçu : {batchPreview().join(', ')}</p>
              </div>
              <button style={{ ...s.btn, marginTop: 20 }} onClick={handleBatchCreate}>🚀 Créer {batchForm.count} boxes</button>
            </div>
          )}

          <div style={s.card}>
            <h3>📦 Liste des boxes ({boxes.length})</h3>
            <div style={{ marginTop: 20 }}>
              {boxes.map(function(box) {
                return (
                  <div key={box.id} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{box.box_number}</strong> - {box.box_type} - {box.capacity} places - {box.daily_rate}€/jour
                    </div>
                    <button onClick={function() { handleDeleteBox(box); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>🗑️</button>
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
            <h3>Ajouter un service</h3>
            <div style={{ ...s.grid2, marginTop: 20 }}>
              <div><label style={s.label}>Nom</label><input style={s.input} value={serviceForm.service_name} onChange={function(e) { updateService('service_name', e.target.value); }} /></div>
              <div><label style={s.label}>Type</label><select style={s.select} value={serviceForm.service_type} onChange={function(e) { updateService('service_type', e.target.value); }}><option value="">--</option><option value="promenade">Promenade</option><option value="nourriture">Nourriture</option><option value="toilettage">Toilettage</option><option value="jeux">Jeux</option><option value="medicament">Médicament</option><option value="autre">Autre</option></select></div>
              <div><label style={s.label}>Prix (€)</label><input style={s.input} type="number" step="0.01" value={serviceForm.price} onChange={function(e) { updateService('price', e.target.value); }} /></div>
              <div><label style={s.label}>Description</label><input style={s.input} value={serviceForm.description} onChange={function(e) { updateService('description', e.target.value); }} /></div>
            </div>
            <button style={{ ...s.btn, marginTop: 20 }} onClick={handleAddService}>+ Ajouter</button>
          </div>
          <div style={s.card}>
            <h3>🛎️ Services ({services.length})</h3>
            {services.map(function(service) {
              return (
                <div key={service.id} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <div><strong>{service.service_name}</strong> - {service.service_type} - {service.price}€</div>
                  <button onClick={function() { handleDeleteService(service); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>🗑️</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Configuration;