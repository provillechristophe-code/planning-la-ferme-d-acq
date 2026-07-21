import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GanttChart from '../components/GanttChart';

function Planning() {
  var [reservations, setReservations] = useState([]);
  var [animals, setAnimals] = useState([]);
  var [loading, setLoading] = useState(true);
  var [view, setView] = useState('gantt');

  useEffect(function() {
    fetchData();
  }, []);

  var fetchData = function() {
    Promise.all([
      axios.get('/api/reservations'),
      axios.get('/api/animals')
    ]).then(function(results) {
      setReservations(results[0].data);
      setAnimals(results[1].data);
      setLoading(false);
    }).catch(function(err) {
      console.error(err);
      setLoading(false);
    });
  };

  var getAnimalName = function(animalId) {
    var animal = animals.find(function(a) { return a.id === animalId; });
    if (animal && animal.name) return animal.name;
    return 'Animal #' + animalId;
  };

  if (loading) return <div className="gantt-loading"><div className="gantt-loading-spinner"></div><p>Chargement...</p></div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>📅 Planning des Réservations</h2>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Visualisez l'occupation de votre pension en temps réel</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={function() { setView('gantt'); }}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: view === 'gantt' ? '2px solid #6366f1' : '1px solid #e2e8f0',
            background: view === 'gantt' ? '#eef2ff' : '#ffffff',
            color: view === 'gantt' ? '#6366f1' : '#64748b',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          📊 Vue Gantt
        </button>
        <button
          onClick={function() { setView('list'); }}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: view === 'list' ? '2px solid #6366f1' : '1px solid #e2e8f0',
            background: view === 'list' ? '#eef2ff' : '#ffffff',
            color: view === 'list' ? '#6366f1' : '#64748b',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          📋 Vue Liste
        </button>
      </div>

      {view === 'gantt' ? (
        <GanttChart />
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Animal</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Durée</th>
                <th>Tarif/jour</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(function(r) {
                var start = new Date(r.check_in);
                var end = new Date(r.check_out);
                var days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                var statusStyle = {
                  padding: '4px 12px',
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: 600
                };
                if (r.status === 'confirmed') {
                  statusStyle.background = '#eef2ff';
                  statusStyle.color = '#6366f1';
                } else if (r.status === 'pending') {
                  statusStyle.background = '#fffbeb';
                  statusStyle.color = '#f59e0b';
                } else {
                  statusStyle.background = '#fef2f2';
                  statusStyle.color = '#ef4444';
                }

                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{getAnimalName(r.animal_id)}</td>
                    <td>{r.check_in}</td>
                    <td>{r.check_out}</td>
                    <td>{days} jours</td>
                    <td>{r.daily_rate}€</td>
                    <td><span style={statusStyle}>{r.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Planning;