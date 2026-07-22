import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GanttChart() {
  var [reservations, setReservations] = useState([]);
  var [animals, setAnimals] = useState([]);
  var [clients, setClients] = useState([]);
  var [boxes, setBoxes] = useState([]);
  var [loading, setLoading] = useState(true);
  var today = new Date();
  var todayStr = today.toISOString().split('T')[0];

  var defaultEnd = new Date(today);
  defaultEnd.setDate(defaultEnd.getDate() + 30);
  var [dateFrom, setDateFrom] = useState(todayStr);
  var [dateTo, setDateTo] = useState(defaultEnd.toISOString().split('T')[0]);
  var [popup, setPopup] = useState(null);
  var [editMode, setEditMode] = useState(false);
  var [editForm, setEditForm] = useState({});
  var [newResForm, setNewResForm] = useState({ animal_id: '', client_id: '', box_id: '', check_in: '', check_out: '', daily_rate: '', notes: '' });

  useEffect(function() { fetchData(); }, []);

  var fetchData = function() {
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
      setLoading(false);
    }).catch(function(err) { console.error(err); setLoading(false); });
  };

  var goToToday = function() {
    var end = new Date();
    end.setDate(end.getDate() + 30);
    setDateFrom(todayStr);
    setDateTo(end.toISOString().split('T')[0]);
  };

  var goThisWeek = function() {
    var end = new Date();
    end.setDate(end.getDate() + 7);
    setDateFrom(todayStr);
    setDateTo(end.toISOString().split('T')[0]);
  };

  var goThisMonth = function() {
    var start = new Date(today.getFullYear(), today.getMonth(), 1);
    var end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setDateFrom(start.toISOString().split('T')[0]);
    setDateTo(end.toISOString().split('T')[0]);
  };

  var goNextMonth = function() {
    var start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    var end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    setDateFrom(start.toISOString().split('T')[0]);
    setDateTo(end.toISOString().split('T')[0]);
  };

  var generateDateRange = function() {
    var dates = [];
    var start = new Date(dateFrom);
    var end = new Date(dateTo);
    var current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  var calculatePosition = function(checkIn, checkOut, dates) {
    var resStart = new Date(checkIn);
    var resEnd = new Date(checkOut);
    var firstDate = new Date(dates[0]);
    var dayStart = Math.max(0, Math.floor((resStart - firstDate) / (1000 * 60 * 60 * 24)));
    var dayEnd = Math.min(dates.length, Math.ceil((resEnd - firstDate) / (1000 * 60 * 60 * 24)));
    return { dayStart: dayStart, width: Math.max(1, dayEnd - dayStart) };
  };

  var getAnimalName = function(animalId) {
    var a = animals.find(function(x) { return x.id === animalId; });
    return a && a.name ? a.name : 'Animal #' + animalId;
  };

  var getAnimalSpecies = function(animalId) {
    var a = animals.find(function(x) { return x.id === animalId; });
    return a && a.species ? a.species : '';
  };

  var getClientName = function(clientId) {
    var c = clients.find(function(x) { return x.id === clientId; });
    return c && c.name ? c.name : 'Client #' + clientId;
  };

  var isNewClient = function(clientId) {
    var clientReservations = reservations.filter(function(r) { return r.client_id === clientId; });
    return clientReservations.length <= 1;
  };

  var getBarColor = function(res) {
    if (res.status === 'confirmed') return '#10b981';   // vert = habituel
    if (res.status === 'pending') return '#ec4899';     // rose = nouveau
    if (res.status === 'cancelled') return '#94a3b8';   // gris = annulé
    return '#10b981';
  };

  var getBoxStyle = function(type) {
    if (type === 'petit') return { icon: '🏠', bg: '#dbeafe' };
    if (type === 'grand') return { icon: '🏰', bg: '#fef3c7' };
    return { icon: '🏡', bg: '#d1fae5' };
  };

  var getStatusLabel = function(status) {
    if (status === 'confirmed') return '🟢 Client habituel';
    if (status === 'pending') return '🩷 Nouveau client';
    if (status === 'cancelled') return '⚪ Annulé';
    return status;
  };

  var getStatusColor = function(status) {
    if (status === 'confirmed') return '#6366f1';
    if (status === 'cancelled') return '#94a3b8';
    return '#f59e0b';
  };

  var getDurationDays = function(checkIn, checkOut) {
    var start = new Date(checkIn);
    var end = new Date(checkOut);
    var diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  var getReservationTotal = function(reservation) {
    var days = getDurationDays(reservation.check_in, reservation.check_out);
    var rate = parseFloat(reservation.daily_rate || 0);
    return (days * rate).toFixed(2);
  };

  var isWeekend = function(dateStr) {
    var d = new Date(dateStr).getDay();
    return d === 0 || d === 6;
  };

  var formatDayHeader = function(dateStr) {
    var d = new Date(dateStr);
    var days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    return days[d.getDay()];
  };

  var openNewReservation = function(box, date) {
    var nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    setNewResForm({ animal_id: '', client_id: '', box_id: box.id, check_in: date, check_out: nextDay.toISOString().split('T')[0], daily_rate: box.daily_rate || '', notes: '' });
    setPopup({ type: 'new', box: box, date: date });
  };

  var openReservationDetails = function(res) {
    setPopup({ type: 'details', reservation: res });
    setEditMode(false);
  };

  var closePopup = function() {
    setPopup(null);
    setEditMode(false);
  };

  var updateNewRes = function(field, value) {
    var f = {};
    Object.keys(newResForm).forEach(function(k) { f[k] = newResForm[k]; });
    f[field] = value;
    setNewResForm(f);
  };

  var handleCreateReservation = function() {
    if (!newResForm.animal_id || !newResForm.client_id) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    axios.post('/api/reservations', newResForm).then(function() {
      closePopup();
      fetchData();
      alert('Réservation créée !');
    }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur';
      alert('Erreur: ' + msg);
    });
  };

  var startEdit = function(res) {
    setEditForm({ animal_id: res.animal_id || '', client_id: res.client_id || '', box_id: res.box_id || '', check_in: res.check_in || '', check_out: res.check_out || '', daily_rate: res.daily_rate || '', status: res.status || 'confirmed', notes: res.notes || '' });
    setEditMode(true);
  };

  var updateEditForm = function(field, value) {
    var f = {};
    Object.keys(editForm).forEach(function(k) { f[k] = editForm[k]; });
    f[field] = value;
    setEditForm(f);
  };

  var handleSaveEdit = function() {
    axios.put('/api/reservations/' + popup.reservation.id, editForm).then(function() {
      closePopup();
      fetchData();
      alert('Réservation modifiée !');
    }).catch(function(err) {
      var msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Erreur';
      alert('Erreur: ' + msg);
    });
  };

  var handleDeleteReservation = function(id) {
    if (window.confirm('Supprimer cette réservation ?')) {
      axios.delete('/api/reservations/' + id).then(function() {
        closePopup();
        fetchData();
      });
    }
  };  if (loading) return <div style={{ padding: 40 }}>Chargement...</div>;
  if (boxes.length === 0) return <div style={{ padding: 40, textAlign: 'center' }}>📦 Aucun box configuré</div>;

  var dates = generateDateRange();
  var totalDays = dates.length;

  var ss = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' },
    modalHeader: { padding: '24px 28px 0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    modalTitle: { fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 },
    modalSub: { fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' },
    modalClose: { background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 15, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalBody: { padding: 28 },
    formGroup: { marginBottom: 16 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 },
    input: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 16, color: '#1e293b', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 16, color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#fff' },
    btnCreate: { width: '100%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
    btnDelete: { width: '100%', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '13px 24px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
    btnCancel: { width: '100%', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '13px 24px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
    detailRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
    detailLabel: { fontSize: 13, color: '#94a3b8', fontWeight: 600 },
    detailValue: { fontSize: 16, fontWeight: 700, color: '#1e293b' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    statusBadge: { padding: '6px 14px', borderRadius: 50, fontSize: 13, fontWeight: 700, display: 'inline-block' }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Du</label>
          <input type="date" value={dateFrom} onChange={function(e) { setDateFrom(e.target.value); }} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13 }} />
          <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>au</label>
          <input type="date" value={dateTo} onChange={function(e) { setDateTo(e.target.value); }} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13 }} />
        </div>
        <div style={{ borderLeft: '1px solid #e2e8f0', height: 30, margin: '0 4px' }}></div>
        <button onClick={goToToday} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #6366f1', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Aujourd'hui</button>
        <button onClick={goThisWeek} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>7 jours</button>
        <button onClick={goThisMonth} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Ce mois</button>
        <button onClick={goNextMonth} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Mois suivant</button>
      </div>

      {/* Légende */}
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Légende :</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 14, height: 14, borderRadius: 4, background: '#10b981' }}></div><span style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>Client habitué</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 14, height: 14, borderRadius: 4, background: '#ec4899' }}></div><span style={{ fontSize: 16, fontWeight: 600, color: '#ec4899' }}>Nouveau client</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 14, height: 14, borderRadius: 4, background: '#94a3b8' }}></div><span style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8' }}>Annulée</span></div>
        <div style={{ borderLeft: '1px solid #cbd5e1', height: 20 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 14, height: 14, borderRadius: 4, background: '#1e40af' }}></div><span style={{ fontSize: 16, fontWeight: 700, color: '#1e40af' }}>Aujourd'hui</span></div>
        <div style={{ borderLeft: '1px solid #cbd5e1', height: 20 }}></div>
        <span style={{ fontSize: 12 }}>🏠 Petit</span>
        <span style={{ fontSize: 12 }}>🏡 Standard</span>
        <span style={{ fontSize: 12 }}>🏰 Grand</span>
        <div style={{ borderLeft: '1px solid #cbd5e1', height: 20 }}></div>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>💡 Cliquez sur une cellule pour réserver</span>
      </div>

      {/* Header jours */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
        <div style={{ width: 200, fontWeight: 700, color: '#64748b', fontSize: 16, textTransform: 'uppercase', padding: '8px 12px' }}>📦 Box</div>
        <div style={{ flex: 1, display: 'flex' }}>
          {dates.map(function(date) {
            var d = new Date(date);
            var isWeekendDate = d.getDay() === 0 || d.getDay() === 6;
            var isTodayDate = date === todayStr;
            return (
              <div key={date} style={{ flex: 1, minWidth: 26, padding: '4px 2px', textAlign: 'center', fontSize: isTodayDate ? 12 : 10, background: isTodayDate ? '#1e40af' : isWeekendDate ? '#fafafa' : '#fff', color: isTodayDate ? '#fff' : '#475569', borderRight: '1px solid #f1f5f9', borderLeft: isTodayDate ? '3px solid #1e3a8a' : 'none', fontWeight: isTodayDate ? 800 : 600 }}>
                <div style={{ fontSize: 9 }}>{formatDayHeader(date)}</div>
                <div>{d.getDate()}</div>
                {isTodayDate && <div style={{ fontSize: 7, color: '#bfdbfe' }}>AUJ</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Boxes */}
      {boxes.map(function(box) {
        var boxStyle = getBoxStyle(box.box_type);
        var boxReservations = reservations.filter(function(r) { return r.box_id === box.id; });
        return (
          <div key={box.id} style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', minHeight: 50 }}>
            <div style={{ width: 200, padding: '8px 12px', background: '#fafbfc', display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid #e2e8f0' }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: boxStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{boxStyle.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{box.box_number}</div>
                <div style={{ fontSize: 16, color: '#94a3b8' }}>{box.box_type} • {box.daily_rate}€/j</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
              {dates.map(function(date) {
                var isWeekendDate = isWeekend(date);
                var isTodayDate = date === todayStr;
                var isOccupied = boxReservations.some(function(r) { return r.check_in <= date && r.check_out > date && r.status !== 'cancelled'; });
                return (
                  <div key={date} onClick={function() { if (!isOccupied) openNewReservation(box, date); }}
                    style={{ flex: 1, minWidth: 26, borderRight: '1px solid #f8f9fa', background: isTodayDate ? '#dbeafe' : isWeekendDate ? '#fafafa' : '#fff', borderLeft: isTodayDate ? '3px solid #1e40af' : 'none', cursor: isOccupied ? 'default' : 'pointer' }}
                    title={isOccupied ? '' : 'Réserver le ' + date}></div>
                );
              })}
              {boxReservations.map(function(res) {
                var pos = calculatePosition(res.check_in, res.check_out, dates);
                if (pos.dayStart >= totalDays || pos.dayStart + pos.width < 0) return null;
                var species = getAnimalSpecies(res.animal_id);
                var icon = species === 'chat' || species === 'Chat' ? '🐱' : '🐶';
                return (
                  <div key={res.id} onClick={function() { openReservationDetails(res); }}
                    style={{ position: 'absolute', top: 4, bottom: 4, left: 'calc(' + pos.dayStart + ' * (100% / ' + totalDays + '))', width: 'calc(' + pos.width + ' * (100% / ' + totalDays + '))', background: getBarColor(res), borderRadius: 6, color: 'white', fontSize: 16, fontWeight: 700, padding: '0 6px', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', cursor: 'pointer', zIndex: 5, opacity: res.status === 'cancelled' ? 0.5 : 1 }}
                    title={getAnimalName(res.animal_id) + ' - ' + getClientName(res.client_id)}>
                    <span>{icon}</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 16, fontWeight: 800 }}>{pos.width > 2 ? getAnimalName(res.animal_id) + ' - ' + getClientName(res.client_id) : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}      {/* POPUP Nouvelle réservation */}
      {popup && popup.type === 'new' && (
        <div style={ss.overlay} onClick={closePopup}>
          <div style={ss.modal} onClick={function(e) { e.stopPropagation(); }}>
            <div style={ss.modalHeader}>
              <div>
                <h3 style={ss.modalTitle}>📋 Nouvelle réservation</h3>
                <p style={ss.modalSub}>Box {popup.box.box_number} • {popup.date}</p>
              </div>
              <button style={ss.modalClose} onClick={closePopup}>✕</button>
            </div>
            <div style={ss.modalBody}>
              <div style={ss.formGroup}>
                <label style={ss.label}>Client *</label>
                <select style={ss.select} value={newResForm.client_id} onChange={function(e) { updateNewRes('client_id', e.target.value); }}>
                  <option value="">-- Choisir --</option>
                  {clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}</option>; })}
                </select>
              </div>
              <div style={ss.formGroup}>
                <label style={ss.label}>Animal *</label>
                <select style={ss.select} value={newResForm.animal_id} onChange={function(e) { updateNewRes('animal_id', e.target.value); }}>
                  <option value="">-- Choisir --</option>
                  {animals.map(function(a) { return <option key={a.id} value={a.id}>{a.name} ({a.species})</option>; })}
                </select>
              </div>
              <div style={ss.grid2}>
                <div style={ss.formGroup}>
                  <label style={ss.label}>📅 Arrivée</label>
                  <input style={ss.input} type="date" value={newResForm.check_in} onChange={function(e) { updateNewRes('check_in', e.target.value); }} />
                </div>
                <div style={ss.formGroup}>
                  <label style={ss.label}>📅 Départ</label>
                  <input style={ss.input} type="date" value={newResForm.check_out} onChange={function(e) { updateNewRes('check_out', e.target.value); }} />
                </div>
              </div>
              <div style={ss.formGroup}>
                <label style={ss.label}>💶 Tarif/jour (€)</label>
                <input style={ss.input} type="number" step="0.01" value={newResForm.daily_rate} onChange={function(e) { updateNewRes('daily_rate', e.target.value); }} />
              </div>
              <div style={ss.formGroup}>
                <label style={ss.label}>📝 Notes</label>
                <input style={ss.input} value={newResForm.notes} onChange={function(e) { updateNewRes('notes', e.target.value); }} placeholder="Optionnel..." />
              </div>
                            <div style={ss.formGroup}>
                <label style={ss.label}>📋 Type de client</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={function() { updateNewRes('status', 'confirmed'); }}
                    style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: (newResForm.status || 'confirmed') === 'confirmed' ? '3px solid #059669' : '1px solid #e2e8f0', background: (newResForm.status || 'confirmed') === 'confirmed' ? '#ecfdf5' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10b981', margin: '0 auto 6px auto' }}></div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>Habitué</div>
                  </button>
                  <button type="button" onClick={function() { updateNewRes('status', 'pending'); }}
                    style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: newResForm.status === 'pending' ? '3px solid #ec4899' : '1px solid #e2e8f0', background: newResForm.status === 'pending' ? '#fdf2f8' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ec4899', margin: '0 auto 6px auto' }}></div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#ec4899' }}>Nouveau</div>
                  </button>
                </div>
              </div>
              <button style={ss.btnCreate} onClick={handleCreateReservation}>📋 Créer la réservation</button>
              <button style={ss.btnCancel} onClick={closePopup}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP Détails réservation */}
      {popup && popup.type === 'details' && (
        <div style={ss.overlay} onClick={closePopup}>
          <div style={ss.modal} onClick={function(e) { e.stopPropagation(); }}>
            <div style={ss.modalHeader}>
              <div>
                <h3 style={ss.modalTitle}>📋 Détails de la réservation</h3>
                <p style={ss.modalSub}>#{popup.reservation.id}</p>
              </div>
              <button style={ss.modalClose} onClick={closePopup}>✕</button>
            </div>
            <div style={ss.modalBody}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <span style={Object.assign({}, ss.statusBadge, {
                background: popup.reservation.status === 'cancelled' ? '#f1f5f9' : popup.reservation.status === 'pending' ? '#fdf2f8' : '#ecfdf5',
color: popup.reservation.status === 'cancelled' ? '#94a3b8' : popup.reservation.status === 'pending' ? '#ec4899' : '#10b981'
                })}>
                  {getStatusLabel(popup.reservation.status)}
                </span>
              </div>

              <div style={ss.detailRow}>
                <span style={ss.detailLabel}>🐾 Animal</span>
                <span style={ss.detailValue}>{getAnimalName(popup.reservation.animal_id)}</span>
              </div>
              <div style={ss.detailRow}>
                <span style={ss.detailLabel}>👤 Client</span>
                <span style={ss.detailValue}>{getClientName(popup.reservation.client_id)}</span>
              </div>
              <div style={ss.detailRow}>
                <span style={ss.detailLabel}>📅 Arrivée</span>
                <span style={ss.detailValue}>{popup.reservation.check_in}</span>
              </div>
              <div style={ss.detailRow}>
                <span style={ss.detailLabel}>📅 Départ</span>
                <span style={ss.detailValue}>{popup.reservation.check_out}</span>
              </div>
              <div style={ss.detailRow}>
                <span style={ss.detailLabel}>📅 Durée</span>
                <span style={ss.detailValue}>{getDurationDays(popup.reservation.check_in, popup.reservation.check_out)} jour(s)</span>
              </div>
              <div style={ss.detailRow}>
                <span style={ss.detailLabel}>💶 Tarif / jour</span>
                <span style={ss.detailValue}>{popup.reservation.daily_rate}€</span>
              </div>
              <div style={ss.detailRow}>
                <span style={ss.detailLabel}>💰 Total estimé</span>
                <span style={Object.assign({}, ss.detailValue, { color: '#059669', fontSize: 16 })}>
                  {getReservationTotal(popup.reservation)}€
                </span>
              </div>
              {popup.reservation.notes && (
                <div style={ss.detailRow}>
                  <span style={ss.detailLabel}>📝 Notes</span>
                  <span style={ss.detailValue}>{popup.reservation.notes}</span>
                </div>
              )}

                            {!editMode ? (
                <div>
                  <button style={ss.btnCreate} onClick={function() { startEdit(popup.reservation); }}>✏️ Modifier</button>
                  <button style={ss.btnDelete} onClick={function() { handleDeleteReservation(popup.reservation.id); }}>🗑️ Supprimer</button>
                  <button style={ss.btnCancel} onClick={closePopup}>Fermer</button>
                </div>
              ) : (
                <div>
                  <div style={ss.formGroup}>
                    <label style={ss.label}>📋 Statut du client</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={function() { updateEditForm('status', 'confirmed'); }}
                        style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: editForm.status === 'confirmed' ? '3px solid #059669' : '1px solid #e2e8f0', background: editForm.status === 'confirmed' ? '#ecfdf5' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10b981', margin: '0 auto 6px auto' }}></div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>Habitué</div>
                      </button>
                      <button type="button" onClick={function() { updateEditForm('status', 'pending'); }}
                        style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: editForm.status === 'pending' ? '3px solid #ec4899' : '1px solid #e2e8f0', background: editForm.status === 'pending' ? '#fdf2f8' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ec4899', margin: '0 auto 6px auto' }}></div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#ec4899' }}>Nouveau</div>
                      </button>
                      <button type="button" onClick={function() { updateEditForm('status', 'cancelled'); }}
                        style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: editForm.status === 'cancelled' ? '3px solid #94a3b8' : '1px solid #e2e8f0', background: editForm.status === 'cancelled' ? '#f1f5f9' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#94a3b8', margin: '0 auto 6px auto' }}></div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>Annulé</div>
                      </button>
                    </div>
                  </div>
                  <div style={ss.grid2}>
                    <div style={ss.formGroup}>
                      <label style={ss.label}>📅 Arrivée</label>
                      <input style={ss.input} type="date" value={editForm.check_in} onChange={function(e) { updateEditForm('check_in', e.target.value); }} />
                    </div>
                    <div style={ss.formGroup}>
                      <label style={ss.label}>📅 Départ</label>
                      <input style={ss.input} type="date" value={editForm.check_out} onChange={function(e) { updateEditForm('check_out', e.target.value); }} />
                    </div>
                  </div>
                  <div style={ss.formGroup}>
                    <label style={ss.label}>📦 Box</label>
                    <select style={ss.select} value={editForm.box_id} onChange={function(e) { updateEditForm('box_id', e.target.value); }}>
                      <option value="">-- Sans box --</option>
                      {boxes.map(function(b) { return <option key={b.id} value={b.id}>{b.box_number} ({b.daily_rate}€/j)</option>; })}
                    </select>
                  </div>
                  <div style={ss.formGroup}>
                    <label style={ss.label}>💶 Tarif/jour (€)</label>
                    <input style={ss.input} type="number" step="0.01" value={editForm.daily_rate} onChange={function(e) { updateEditForm('daily_rate', e.target.value); }} />
                  </div>
                  <div style={ss.formGroup}>
                    <label style={ss.label}>📝 Notes</label>
                    <input style={ss.input} value={editForm.notes} onChange={function(e) { updateEditForm('notes', e.target.value); }} />
                  </div>
                  <button style={ss.btnCreate} onClick={handleSaveEdit}>💾 Enregistrer</button>
                  <button style={ss.btnCancel} onClick={function() { setEditMode(false); }}>Annuler</button>
                </div>
              )}
              <button style={ss.btnDelete} onClick={function() { handleDeleteReservation(popup.reservation.id); }}>🗑️ Supprimer</button>
              <button style={ss.btnCancel} onClick={closePopup}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GanttChart;