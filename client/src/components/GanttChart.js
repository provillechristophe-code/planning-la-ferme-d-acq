import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast';

function GanttChart({ onViewChange, currentView = 'gantt' }) {
  const [reservations, setReservations] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [clients, setClients] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeView, setActiveView] = useState(currentView);
  const [searchQuery, setSearchQuery] = useState('');
  const [tooltip, setTooltip] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Conflit detection
  const hasConflict = (box_id, check_in, check_out, excludeId = null) => {
    if (!box_id || !check_in || !check_out) return null;
    const conflict = reservations.find((r) => {
      if (String(r.box_id) !== String(box_id)) return false;
      if (excludeId && String(r.id) === String(excludeId)) return false;
      if (r.status === 'cancelled') return false;
      // overlap: new_start < existing_end && new_end > existing_start
      return check_in < r.check_out && check_out > r.check_in;
    });
    return conflict || null;
  };

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const parseDate = (str) => new Date(str + 'T12:00:00');

  const displayDate = (str) => {
    if (!str) return '';
    const parts = str.split('-');
    if (parts.length !== 3) return str;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const today = new Date();
  const todayStr = formatDate(today);
  const defaultEnd = new Date(today);
  defaultEnd.setDate(defaultEnd.getDate() + 30);

  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState(formatDate(defaultEnd));
  const [popup, setPopup] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newResForm, setNewResForm] = useState({
    animal_id: '', client_id: '', box_id: '', check_in: '', check_out: '',
    daily_rate: '', notes: '', status: 'confirmed'
  });
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    Promise.all([
      axios.get('/api/reservations'),
      axios.get('/api/animals'),
      axios.get('/api/clients'),
      axios.get('/api/config/boxes')
    ])
      .then((r) => {
        setReservations(r[0].data);
        setAnimals(r[1].data);
        setClients(r[2].data);
        setBoxes(r[3].data);
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  };

  const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const dayLetters = ['D','L','M','M','J','V','S'];

  const currentViewDate = parseDate(dateFrom);
  const currentMonthLabel = `${monthNames[currentViewDate.getMonth()]} ${currentViewDate.getFullYear()}`;

  const goToToday = () => {
    const e = new Date();
    e.setDate(e.getDate() + 30);
    setDateFrom(todayStr);
    setDateTo(formatDate(e));
  };

  const goThisWeek = () => {
    const e = new Date();
    e.setDate(e.getDate() + 7);
    setDateFrom(todayStr);
    setDateTo(formatDate(e));
  };

  const goThisMonth = () => {
    const s = new Date(today.getFullYear(), today.getMonth(), 1);
    const e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setDateFrom(formatDate(s));
    setDateTo(formatDate(e));
  };

  const goPrevMonth = () => {
    const current = parseDate(dateFrom);
    const s = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    const e = new Date(current.getFullYear(), current.getMonth(), 0);
    setDateFrom(formatDate(s));
    setDateTo(formatDate(e));
  };

  const goNextMonth = () => {
    const current = parseDate(dateFrom);
    const s = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    const e = new Date(current.getFullYear(), current.getMonth() + 2, 0);
    setDateFrom(formatDate(s));
    setDateTo(formatDate(e));
  };

  const generateDateRange = () => {
    const dates = [];
    const s = parseDate(dateFrom);
    const e = parseDate(dateTo);
    const c = new Date(s);
    while (c <= e) {
      dates.push(formatDate(c));
      c.setDate(c.getDate() + 1);
    }
    return dates;
  };

  const getMonthHeaders = (dates) => {
    const headers = [];
    let cm = -1, cy = -1, count = 0;
    for (let i = 0; i < dates.length; i++) {
      const d = parseDate(dates[i]);
      const m = d.getMonth();
      const y = d.getFullYear();
      if (m !== cm || y !== cy) {
        if (count > 0) headers.push({ label: `${monthNames[cm]} ${cy}`, span: count });
        cm = m; cy = y; count = 1;
      } else { count++; }
    }
    if (count > 0) headers.push({ label: `${monthNames[cm]} ${cy}`, span: count });
    return headers;
  };

  const calculatePosition = (checkIn, checkOut, dates) => {
    const rs = parseDate(checkIn);
    const re = parseDate(checkOut);
    const f = parseDate(dates[0]);
    const ds = Math.max(0, Math.floor((rs - f) / 86400000));
    const de = Math.min(dates.length, Math.ceil((re - f) / 86400000));
    return { dayStart: ds, width: Math.max(1, de - ds) };
  };

  const getAnimalName = (id) => { const a = animals.find((x) => x.id === id); return a?.name || `Animal #${id}`; };
  const getAnimalSpecies = (id) => { const a = animals.find((x) => x.id === id); return a?.species || ''; };
  const getClientName = (id) => { const c = clients.find((x) => x.id === id); return c?.name || `Client #${id}`; };
  const getBarColor = (r) => { if (r.status === 'confirmed') return '#10b981'; if (r.status === 'pending') return '#ec4899'; return '#94a3b8'; };
  const getBoxStyle = (t) => { if (t === 'petit') return { icon: '🏠', bg: '#dbeafe' }; if (t === 'grand') return { icon: '🏰', bg: '#fef3c7' }; return { icon: '🏡', bg: '#d1fae5' }; };
  const getStatusLabel = (st) => { if (st === 'confirmed') return '🟢 Habituel'; if (st === 'pending') return '🩷 Nouveau'; return '⚪ Annulé'; };
  const getDurationDays = (a, b) => { const d = Math.ceil((parseDate(b) - parseDate(a)) / 86400000); return d > 0 ? d : 0; };
  const getReservationTotal = (r) => (getDurationDays(r.check_in, r.check_out) * parseFloat(r.daily_rate || 0)).toFixed(2);
  const isWeekend = (d) => { const x = parseDate(d).getDay(); return x === 0 || x === 6; };

  const getWeekendHeaderBg = (d) => parseDate(d).getDay() === 0 ? '#fff7ed' : '#fee2e2';
  const getWeekendHeaderColor = (d) => parseDate(d).getDay() === 0 ? '#ea580c' : '#dc2626';
  const getWeekendCellBg = (d) => parseDate(d).getDay() === 0 ? '#fff7ed' : '#fff5f5';
  const getWeekendBorderColor = (d) => parseDate(d).getDay() === 0 ? '#fdba74' : '#fecaca';

  const openNewReservation = (box, date) => {
    const endDate = parseDate(date);
    endDate.setDate(endDate.getDate() + 3);
    setNewResForm({
      animal_id: '', client_id: '', box_id: box.id,
      check_in: date, check_out: formatDate(endDate),
      daily_rate: box.daily_rate || '', notes: '', status: 'confirmed'
    });
    setPopup({ type: 'new', box, date });
  };

  const openReservationDetails = (res) => { setPopup({ type: 'details', reservation: res }); setEditMode(false); };
  const closePopup = () => { setPopup(null); setEditMode(false); };
  const updateNewRes = (field, value) => setNewResForm((prev) => ({ ...prev, [field]: value }));

  const handleCreateReservation = () => {
    if (!newResForm.animal_id || !newResForm.client_id) { showToast('Remplissez tous les champs', 'error'); return; }
    const conflict = hasConflict(newResForm.box_id, newResForm.check_in, newResForm.check_out);
    if (conflict) {
      showToast(`❌ Conflit : Box occupé par ${getAnimalName(conflict.animal_id)} du ${displayDate(conflict.check_in)} au ${displayDate(conflict.check_out)}`, 'error');
      return;
    }
    axios.post('/api/reservations', newResForm)
      .then(() => { closePopup(); fetchData(); showToast('Réservation créée !'); })
      .catch((err) => { showToast(`Erreur: ${err.response?.data?.error || 'Erreur'}`, 'error'); });
  };

  const startEdit = (res) => {
    setEditForm({
      animal_id: res.animal_id || '', client_id: res.client_id || '',
      box_id: res.box_id || '', check_in: res.check_in || '',
      check_out: res.check_out || '', daily_rate: res.daily_rate || '',
      status: res.status || 'confirmed', notes: res.notes || ''
    });
    setEditMode(true);
  };

  const updateEditForm = (field, value) => setEditForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveEdit = () => {
    const conflict = hasConflict(editForm.box_id, editForm.check_in, editForm.check_out, popup.reservation.id);
    if (conflict) {
      showToast(`❌ Conflit : Box occupé par ${getAnimalName(conflict.animal_id)} du ${displayDate(conflict.check_in)} au ${displayDate(conflict.check_out)}`, 'error');
      return;
    }
    axios.put(`/api/reservations/${popup.reservation.id}`, editForm)
      .then(() => { closePopup(); fetchData(); showToast('Réservation modifiée !'); })
      .catch((err) => { showToast(`Erreur: ${err.response?.data?.error || 'Erreur'}`, 'error'); });
  };

  const handleDeleteReservation = (id) => {
    axios.delete(`/api/reservations/${id}`)
      .then(() => { closePopup(); fetchData(); showToast('Réservation supprimée !'); });
  };

  const dates = generateDateRange();
  const totalDays = dates.length;
  const monthHeaders = getMonthHeaders(dates);
  const colWidth = 40;
  const todayIndex = dates.indexOf(todayStr);

  // Filtrage par recherche - version robuste
  const filteredBoxes = boxes.filter((box) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    if (box.box_number.toLowerCase().includes(q)) return true;
    if (box.box_type && box.box_type.toLowerCase().includes(q)) return true;
    // recherche directe dans les animaux / clients
    const matchingAnimalIds = animals.filter((a) => (a.name || '').toLowerCase().includes(q)).map((a) => String(a.id));
    const matchingClientIds = clients.filter((c) => (c.name || '').toLowerCase().includes(q)).map((c) => String(c.id));
    // cherche dans les réservations de ce box
    const hasMatchingRes = reservations.some((r) => {
      if (String(r.box_id) !== String(box.id)) return false;
      if (matchingAnimalIds.includes(String(r.animal_id))) return true;
      if (matchingClientIds.includes(String(r.client_id))) return true;
      const animalName = getAnimalName(r.animal_id).toLowerCase();
      const clientName = getClientName(r.client_id).toLowerCase();
      return animalName.includes(q) || clientName.includes(q);
    });
    return hasMatchingRes;
  });

  const liveConflictNew = hasConflict(newResForm.box_id, newResForm.check_in, newResForm.check_out);
  const liveConflictEdit = popup?.type === 'details' && editMode ? hasConflict(editForm.box_id, editForm.check_in, editForm.check_out, popup.reservation.id) : null;

  if (loading) return <div style={{ padding: 40 }}>Chargement...</div>;
  if (boxes.length === 0) return <div style={{ padding: 40, textAlign: 'center' }}>📦 Aucun box configuré</div>;

  const arrowBtnStyle = {
    width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 14, color: '#6366f1',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
  };

  const viewBtnStyle = (isActive) => ({
    padding: '6px 14px', borderRadius: 8,
    border: isActive ? '2px solid #6366f1' : '1px solid #e2e8f0',
    background: isActive ? '#eef2ff' : '#fff',
    color: isActive ? '#6366f1' : '#64748b',
    cursor: 'pointer', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
  });

  const ss = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' },
    modalHeader: { padding: '24px 28px 0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    modalTitle: { fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 },
    modalSub: { fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' },
    modalClose: { background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 15, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalBody: { padding: 28 },
    formGroup: { marginBottom: 16 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 },
    input: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#fff' },
    btnCreate: { width: '100%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    btnDelete: { width: '100%', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '13px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
    btnCancel: { width: '100%', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '13px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
    detailRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
    detailLabel: { fontSize: 13, color: '#94a3b8', fontWeight: 600 },
    detailValue: { fontSize: 14, fontWeight: 700, color: '#1e293b' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    statusBadge: { padding: '6px 14px', borderRadius: 50, fontSize: 13, fontWeight: 700, display: 'inline-block' }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ═══ BARRE UNIQUE COMPACTE ═══ */}
      <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: '#fafbfc' }}>

        {/* Titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap' }}>Planning de réservation</span>
        </div>

        {/* Séparateur */}
        <div style={{ borderLeft: '1px solid #e2e8f0', height: 24 }}></div>

        {/* ══ BOUTONS VUE CORRIGÉS ══ */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            style={viewBtnStyle(activeView === 'list')}
            onClick={() => handleViewChange('list')}
          >
            📋 Liste
          </button>
          <button
            style={viewBtnStyle(activeView === 'gantt')}
            onClick={() => handleViewChange('gantt')}
          >
            📊 Planning
          </button>
        </div>

        {/* Séparateur */}
        <div style={{ borderLeft: '1px solid #e2e8f0', height: 24 }}></div>

        {/* Boutons rapides */}
        <button onClick={goToToday} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #6366f1', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>📍 Aujourd'hui</button>
        <button onClick={goThisWeek} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>7j</button>

        {/* Navigateur mois */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#f1f5f9', borderRadius: 8, padding: '2px 4px' }}>
          <button onClick={goPrevMonth} style={arrowBtnStyle} title="Mois précédent">◀</button>
          <button onClick={goThisMonth} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: 12, color: '#1e293b', minWidth: 120, textAlign: 'center', whiteSpace: 'nowrap' }} title="Mois en cours">{currentMonthLabel}</button>
          <button onClick={goNextMonth} style={arrowBtnStyle} title="Mois suivant">▶</button>
        </div>

        {/* Recherche */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 10px' }}>
          <span style={{ fontSize: 12 }}>🔍</span>
          <input
            type="text"
            placeholder="Animal, client, box..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 12, width: 160, background: 'transparent' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, width: 18, height: 18, cursor: 'pointer', fontSize: 10 }}>✕</button>
          )}
        </div>
        {searchQuery && <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 700 }}>{filteredBoxes.length}/{boxes.length} box</span>}

        {/* Séparateur */}
        <div style={{ borderLeft: '1px solid #e2e8f0', height: 24 }}></div>

        {/* Dates manuelles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>Du</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, width: 120 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>au</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, width: 120 }} />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }}></div>

        {/* Légende mini */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowLegend(!showLegend)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>🎨 Légende</button>
          {showLegend && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: 14, zIndex: 100, minWidth: 180 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }}></div><span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>Habitué</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#ec4899' }}></div><span style={{ fontSize: 12, fontWeight: 600, color: '#ec4899' }}>Nouveau</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#94a3b8' }}></div><span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Annulé</span></div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6 }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#1e40af' }}></div><span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>Aujourd'hui</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#fee2e2', border: '1px solid #fca5a5' }}></div><span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }}>Samedi</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#fff7ed', border: '1px solid #fdba74' }}></div><span style={{ fontSize: 12, fontWeight: 600, color: '#ea580c' }}>Dimanche</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ VUE LISTE ═══ */}
      {activeView === 'list' && (
        <div style={{ padding: 20 }}>
          {reservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              <span style={{ fontSize: 40 }}>📭</span>
              <p style={{ marginTop: 12, fontWeight: 600 }}>Aucune réservation trouvée</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Statut</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>🐾 Animal</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>👤 Client</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>📦 Box</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>📅 Arrivée</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>📅 Départ</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>⏱ Durée</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>💰 Total</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations
                  .filter((r) => {
                    if (dateFrom && r.check_out < dateFrom) return false;
                    if (dateTo && r.check_in > dateTo) return false;
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      const animalName = getAnimalName(r.animal_id).toLowerCase();
                      const clientName = getClientName(r.client_id).toLowerCase();
                      const box = boxes.find((b) => b.id === r.box_id);
                      const boxNum = box?.box_number?.toLowerCase() || '';
                      if (!animalName.includes(q) && !clientName.includes(q) && !boxNum.includes(q)) return false;
                    }
                    return true;
                  })
                  .sort((a, b) => a.check_in > b.check_in ? 1 : -1)
                  .map((res) => {
                    const sp = getAnimalSpecies(res.animal_id);
                    const icon = sp === 'chat' || sp === 'Chat' ? '🐱' : '🐶';
                    const box = boxes.find((b) => b.id === res.box_id);
                    const statusColors = {
                      confirmed: { bg: '#ecfdf5', color: '#059669', label: '🟢 Habitué' },
                      pending: { bg: '#fdf2f8', color: '#ec4899', label: '🩷 Nouveau' },
                      cancelled: { bg: '#f1f5f9', color: '#94a3b8', label: '⚪ Annulé' }
                    };
                    const st = statusColors[res.status] || statusColors.cancelled;

                    return (
                      <tr key={res.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: res.status === 'cancelled' ? 0.5 : 1 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{icon} {getAnimalName(res.animal_id)}</td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{getClientName(res.client_id)}</td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{box ? box.box_number : '-'}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{displayDate(res.check_in)}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{displayDate(res.check_out)}</td>
                        <td style={{ padding: '10px 14px', color: '#6366f1', fontWeight: 700 }}>{getDurationDays(res.check_in, res.check_out)}j</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>{getReservationTotal(res)}€</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button onClick={() => openReservationDetails(res)} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#6366f1' }}>
                            👁 Voir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ═══ GRILLE GANTT ═══ */}
      {activeView === 'gantt' && <div style={{ display: 'flex' }}>
        {/* Colonne gauche - Box */}
        <div style={{ width: 160, flexShrink: 0, background: '#fafbfc', borderRight: '2px solid #e2e8f0', zIndex: 2 }}>
          <div style={{ height: 72, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>📦 Box {searchQuery ? `(${filteredBoxes.length})` : ''}</div>
          {filteredBoxes.map((box) => {
            const bs = getBoxStyle(box.box_type);
            const countRes = reservations.filter((r) => String(r.box_id) === String(box.id) && r.status !== 'cancelled' && r.check_out >= todayStr && r.check_in <= dateTo).length;
            return (
              <div key={box.id} style={{ height: 48, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', borderBottom: '1px solid #f1f5f9', background: countRes > 0 ? '#fff' : '#f8fafc' }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: bs.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{bs.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 4 }}>{box.box_number} {countRes > 0 && <span style={{ background: '#eef2ff', color: '#6366f1', borderRadius: 10, padding: '0 5px', fontSize: 9 }}>{countRes}</span>}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>{box.box_type} • {box.daily_rate}€</div>
                </div>
              </div>
            );
          })}
          {filteredBoxes.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>Aucun box trouvé pour "{searchQuery}"</div>}
        </div>

        {/* Colonne droite - Calendrier */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}>
          <div style={{ minWidth: totalDays * colWidth, position: 'relative' }}>
            {/* Ligne aujourd'hui verticale */}
            {todayIndex >= 0 && (
              <div style={{ position: 'absolute', left: todayIndex * colWidth + colWidth / 2, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, #6366f1, transparent)', zIndex: 15, pointerEvents: 'none' }}>
                <div style={{ position: 'sticky', top: 0, background: '#6366f1', color: 'white', fontSize: 8, fontWeight: 800, padding: '3px 6px', borderRadius: '0 0 6px 6px', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}>📍 AUJ</div>
              </div>
            )}
            {/* Header Mois */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', height: 28 }}>
              {monthHeaders.map((mh, i) => (
                <div key={i} style={{ width: mh.span * colWidth, textAlign: 'center', lineHeight: '28px', fontWeight: 700, fontSize: 13, color: '#6366f1', background: '#eef2ff', borderRight: '1px solid #c7d2fe' }}>{mh.label}</div>
              ))}
            </div>
            {/* Header Jours */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', height: 44 }}>
              {dates.map((date) => {
                const d = parseDate(date);
                const we = d.getDay() === 0 || d.getDay() === 6;
                const td = date === todayStr;
                return (
                  <div key={date} style={{
                    width: colWidth, textAlign: 'center', height: 44,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    fontSize: 10,
                    background: td ? '#1e40af' : we ? getWeekendHeaderBg(date) : '#fff',
                    color: td ? '#fff' : we ? getWeekendHeaderColor(date) : '#475569',
                    borderRight: '1px solid #f1f5f9',
                    fontWeight: td ? 800 : we ? 700 : 500
                  }}>
                    <div style={{ fontSize: 9 }}>{dayLetters[d.getDay()]}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{d.getDate()}</div>
                    {td && <div style={{ fontSize: 7, color: '#bfdbfe' }}>AUJ</div>}
                  </div>
                );
              })}
            </div>
            {/* Lignes des boxes */}
            {filteredBoxes.map((box) => {
              const br = reservations.filter((r) => String(r.box_id) === String(box.id));
              return (
                <div key={box.id} style={{ display: 'flex', position: 'relative', height: 48, borderBottom: '1px solid #f1f5f9' }}>
                  {dates.map((date) => {
                    const we = isWeekend(date);
                    const td = date === todayStr;
                    const occ = br.some((r) => r.check_in <= date && r.check_out > date && r.status !== 'cancelled');
                    return (
                      <div key={date} onClick={() => { if (!occ) openNewReservation(box, date); }} style={{
                        width: colWidth,
                        borderRight: we ? `1px solid ${getWeekendBorderColor(date)}` : '1px solid #f8f9fa',
                        background: td ? '#dbeafe' : we ? getWeekendCellBg(date) : '#fff',
                        borderLeft: td ? '3px solid #1e40af' : 'none',
                        cursor: occ ? 'default' : 'pointer'
                      }} title={occ ? '' : `Réserver le ${displayDate(date)}`}></div>
                    );
                  })}
                  {br.map((res) => {
                    // filtre recherche aussi sur les barres - version robuste
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase().trim();
                      const animalName = getAnimalName(res.animal_id).toLowerCase();
                      const clientName = getClientName(res.client_id).toLowerCase();
                      const matching = animalName.includes(q) || clientName.includes(q);
                      // fallback avec IDs directs
                      const matchingAnimalIds = animals.filter((a) => (a.name || '').toLowerCase().includes(q)).map((a) => String(a.id));
                      const matchingClientIds = clients.filter((c) => (c.name || '').toLowerCase().includes(q)).map((c) => String(c.id));
                      const isMatch = matching || matchingAnimalIds.includes(String(res.animal_id)) || matchingClientIds.includes(String(res.client_id));
                      if (!isMatch) return null;
                    }
                    const pos = calculatePosition(res.check_in, res.check_out, dates);
                    if (pos.dayStart >= totalDays || pos.dayStart + pos.width < 0) return null;
                    const sp = getAnimalSpecies(res.animal_id);
                    const icon = sp === 'chat' || sp === 'Chat' ? '🐱' : '🐶';
                    return (
                      <div key={res.id}
                        onClick={() => openReservationDetails(res)}
                        onMouseEnter={(e) => setTooltip({ reservation: res, x: e.clientX, y: e.clientY })}
                        onMouseMove={(e) => setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          position: 'absolute', top: 4, bottom: 4,
                          left: pos.dayStart * colWidth, width: pos.width * colWidth - 2,
                          background: getBarColor(res), borderRadius: 6, color: 'white',
                          fontSize: 11, fontWeight: 700, padding: '0 6px',
                          display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden',
                          cursor: 'pointer', zIndex: tooltip?.reservation?.id === res.id ? 20 : 5,
                          opacity: res.status === 'cancelled' ? 0.5 : 1,
                          transform: tooltip?.reservation?.id === res.id ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: tooltip?.reservation?.id === res.id ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                          transition: 'all 0.15s ease',
                          border: tooltip?.reservation?.id === res.id ? '2px solid white' : 'none'
                        }}>
                        <span>{icon}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pos.width > 2 ? `${getAnimalName(res.animal_id)} - ${getClientName(res.client_id)}` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>}

      {/* ═══ POPUPS ═══ */}
      {popup && popup.type === 'new' && (
        <div style={ss.overlay} onClick={closePopup}>
          <div style={ss.modal} onClick={(e) => e.stopPropagation()}>
            <div style={ss.modalHeader}>
              <div>
                <h3 style={ss.modalTitle}>📋 Nouvelle réservation</h3>
                <p style={ss.modalSub}>Box {popup.box.box_number} • {displayDate(popup.date)}</p>
              </div>
              <button style={ss.modalClose} onClick={closePopup}>✕</button>
            </div>
            <div style={ss.modalBody}>
              <div style={ss.formGroup}>
                <label style={ss.label}>Client *</label>
                <select style={ss.select} value={newResForm.client_id} onChange={(e) => updateNewRes('client_id', e.target.value)}>
                  <option value="">-- Choisir --</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={ss.formGroup}>
                <label style={ss.label}>Animal *</label>
                <select style={ss.select} value={newResForm.animal_id} onChange={(e) => updateNewRes('animal_id', e.target.value)}>
                  <option value="">-- Choisir --</option>
                  {animals.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.species})</option>)}
                </select>
              </div>
              <div style={ss.grid2}>
                <div style={ss.formGroup}>
                  <label style={ss.label}>📅 Arrivée</label>
                  <input style={ss.input} type="date" value={newResForm.check_in} onChange={(e) => updateNewRes('check_in', e.target.value)} />
                </div>
                <div style={ss.formGroup}>
                  <label style={ss.label}>📅 Départ</label>
                  <input style={ss.input} type="date" value={newResForm.check_out} onChange={(e) => updateNewRes('check_out', e.target.value)} />
                </div>
              </div>
              <div style={ss.formGroup}>
                <label style={ss.label}>💶 Tarif/jour (€)</label>
                <input style={ss.input} type="number" step="0.01" value={newResForm.daily_rate} onChange={(e) => updateNewRes('daily_rate', e.target.value)} />
              </div>
              {liveConflictNew && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18 }}>❌</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#ef4444' }}>Conflit détecté !</div>
                    <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 2 }}>Box occupé par <b>{getAnimalName(liveConflictNew.animal_id)}</b> ({getClientName(liveConflictNew.client_id)}) du {displayDate(liveConflictNew.check_in)} au {displayDate(liveConflictNew.check_out)}</div>
                  </div>
                </div>
              )}
              <div style={ss.formGroup}>
                <label style={ss.label}>📝 Notes</label>
                <input style={ss.input} value={newResForm.notes} onChange={(e) => updateNewRes('notes', e.target.value)} placeholder="Optionnel..." />
              </div>
              <div style={ss.formGroup}>
                <label style={ss.label}>📋 Type de client</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => updateNewRes('status', 'confirmed')} style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: (newResForm.status || 'confirmed') === 'confirmed' ? '3px solid #059669' : '1px solid #e2e8f0', background: (newResForm.status || 'confirmed') === 'confirmed' ? '#ecfdf5' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10b981', margin: '0 auto 6px auto' }}></div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>Habitué</div>
                  </button>
                  <button type="button" onClick={() => updateNewRes('status', 'pending')} style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: newResForm.status === 'pending' ? '3px solid #ec4899' : '1px solid #e2e8f0', background: newResForm.status === 'pending' ? '#fdf2f8' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
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

      {popup && popup.type === 'details' && (
        <div style={ss.overlay} onClick={closePopup}>
          <div style={ss.modal} onClick={(e) => e.stopPropagation()}>
            <div style={ss.modalHeader}>
              <div>
                <h3 style={ss.modalTitle}>📋 Détails</h3>
                <p style={ss.modalSub}>#{popup.reservation.id}</p>
              </div>
              <button style={ss.modalClose} onClick={closePopup}>✕</button>
            </div>
            <div style={ss.modalBody}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <span style={{
                  ...ss.statusBadge,
                  background: popup.reservation.status === 'cancelled' ? '#f1f5f9' : popup.reservation.status === 'pending' ? '#fdf2f8' : '#ecfdf5',
                  color: popup.reservation.status === 'cancelled' ? '#94a3b8' : popup.reservation.status === 'pending' ? '#ec4899' : '#10b981'
                }}>{getStatusLabel(popup.reservation.status)}</span>
              </div>
              <div style={ss.detailRow}><span style={ss.detailLabel}>🐾 Animal</span><span style={ss.detailValue}>{getAnimalName(popup.reservation.animal_id)}</span></div>
              <div style={ss.detailRow}><span style={ss.detailLabel}>👤 Client</span><span style={ss.detailValue}>{getClientName(popup.reservation.client_id)}</span></div>
              <div style={ss.detailRow}><span style={ss.detailLabel}>📅 Arrivée</span><span style={ss.detailValue}>{displayDate(popup.reservation.check_in)}</span></div>
              <div style={ss.detailRow}><span style={ss.detailLabel}>📅 Départ</span><span style={ss.detailValue}>{displayDate(popup.reservation.check_out)}</span></div>
              <div style={ss.detailRow}><span style={ss.detailLabel}>📅 Durée</span><span style={ss.detailValue}>{getDurationDays(popup.reservation.check_in, popup.reservation.check_out)} jour(s)</span></div>
              <div style={ss.detailRow}><span style={ss.detailLabel}>💶 Tarif</span><span style={ss.detailValue}>{popup.reservation.daily_rate}€/j</span></div>
              <div style={ss.detailRow}><span style={ss.detailLabel}>💰 Total</span><span style={{ ...ss.detailValue, color: '#059669', fontSize: 16 }}>{getReservationTotal(popup.reservation)}€</span></div>
              {popup.reservation.notes && <div style={ss.detailRow}><span style={ss.detailLabel}>📝 Notes</span><span style={ss.detailValue}>{popup.reservation.notes}</span></div>}

              {!editMode ? (
                <div>
                  <button style={ss.btnCreate} onClick={() => startEdit(popup.reservation)}>✏️ Modifier</button>
                  <button style={ss.btnDelete} onClick={() => handleDeleteReservation(popup.reservation.id)}>🗑️ Supprimer</button>
                  <button style={ss.btnCancel} onClick={closePopup}>Fermer</button>
                </div>
              ) : (
                <div>
                  <div style={ss.formGroup}>
                    <label style={ss.label}>📋 Statut</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => updateEditForm('status', 'confirmed')} style={{ flex: 1, padding: '10px 6px', borderRadius: 10, border: editForm.status === 'confirmed' ? '3px solid #059669' : '1px solid #e2e8f0', background: editForm.status === 'confirmed' ? '#ecfdf5' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#10b981', margin: '0 auto 4px auto' }}></div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>Habitué</div>
                      </button>
                      <button type="button" onClick={() => updateEditForm('status', 'pending')} style={{ flex: 1, padding: '10px 6px', borderRadius: 10, border: editForm.status === 'pending' ? '3px solid #ec4899' : '1px solid #e2e8f0', background: editForm.status === 'pending' ? '#fdf2f8' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#ec4899', margin: '0 auto 4px auto' }}></div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#ec4899' }}>Nouveau</div>
                      </button>
                      <button type="button" onClick={() => updateEditForm('status', 'cancelled')} style={{ flex: 1, padding: '10px 6px', borderRadius: 10, border: editForm.status === 'cancelled' ? '3px solid #94a3b8' : '1px solid #e2e8f0', background: editForm.status === 'cancelled' ? '#f1f5f9' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#94a3b8', margin: '0 auto 4px auto' }}></div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Annulé</div>
                      </button>
                    </div>
                  </div>
                  {liveConflictEdit && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18 }}>❌</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#ef4444' }}>Conflit détecté !</div>
                        <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 2 }}>Box occupé par <b>{getAnimalName(liveConflictEdit.animal_id)}</b> du {displayDate(liveConflictEdit.check_in)} au {displayDate(liveConflictEdit.check_out)}</div>
                      </div>
                    </div>
                  )}
                  <div style={ss.grid2}>
                    <div style={ss.formGroup}><label style={ss.label}>📅 Arrivée</label><input style={ss.input} type="date" value={editForm.check_in} onChange={(e) => updateEditForm('check_in', e.target.value)} /></div>
                    <div style={ss.formGroup}><label style={ss.label}>📅 Départ</label><input style={ss.input} type="date" value={editForm.check_out} onChange={(e) => updateEditForm('check_out', e.target.value)} /></div>
                  </div>
                  <div style={ss.formGroup}>
                    <label style={ss.label}>📦 Box</label>
                    <select style={ss.select} value={editForm.box_id} onChange={(e) => updateEditForm('box_id', e.target.value)}>
                      <option value="">-- Sans box --</option>
                      {boxes.map((b) => <option key={b.id} value={b.id}>{b.box_number} ({b.daily_rate}€/j)</option>)}
                    </select>
                  </div>
                  <div style={ss.formGroup}><label style={ss.label}>💶 Tarif/jour</label><input style={ss.input} type="number" step="0.01" value={editForm.daily_rate} onChange={(e) => updateEditForm('daily_rate', e.target.value)} /></div>
                  <div style={ss.formGroup}><label style={ss.label}>📝 Notes</label><input style={ss.input} value={editForm.notes} onChange={(e) => updateEditForm('notes', e.target.value)} /></div>
                  <button style={ss.btnCreate} onClick={handleSaveEdit}>💾 Enregistrer</button>
                  <button style={ss.btnCancel} onClick={() => setEditMode(false)}>Annuler</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tooltip au survol */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 15,
          top: tooltip.y + 15,
          background: '#1e293b',
          color: '#fff',
          borderRadius: 12,
          padding: '12px 14px',
          fontSize: 12,
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
          minWidth: 200,
          maxWidth: 280,
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>{getAnimalSpecies(tooltip.reservation.animal_id) === 'chat' || getAnimalSpecies(tooltip.reservation.animal_id) === 'Chat' ? '🐱' : '🐶'}</span>
            <span style={{ fontWeight: 800, fontSize: 13 }}>{getAnimalName(tooltip.reservation.animal_id)}</span>
            <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: tooltip.reservation.status === 'confirmed' ? '#10b981' : tooltip.reservation.status === 'pending' ? '#ec4899' : '#64748b' }}>{getStatusLabel(tooltip.reservation.status)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#cbd5e1' }}>
            <div>👤 <span style={{ color: '#fff', fontWeight: 600 }}>{getClientName(tooltip.reservation.client_id)}</span></div>
            <div>📦 Box {boxes.find((b) => String(b.id) === String(tooltip.reservation.box_id))?.box_number || tooltip.reservation.box_id}</div>
            <div>📅 {displayDate(tooltip.reservation.check_in)} → {displayDate(tooltip.reservation.check_out)} ({getDurationDays(tooltip.reservation.check_in, tooltip.reservation.check_out)}j)</div>
            <div>💶 {tooltip.reservation.daily_rate}€/j • <span style={{ color: '#4ade80', fontWeight: 800 }}>{getReservationTotal(tooltip.reservation)}€</span></div>
            {tooltip.reservation.notes && <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #334155', color: '#94a3b8', fontStyle: 'italic' }}>📝 {tooltip.reservation.notes}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default GanttChart;
