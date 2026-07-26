import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GanttChart from '../components/GanttChart';

function Planning() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un petit délai de chargement initial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📅</div>
        <p>Chargement du planning...</p>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
          📅 Planning des Réservations
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          Visualisez l'occupation de votre pension en temps réel
        </p>
      </div>

      {/* Le composant GanttChart gère maintenant les deux vues (Liste & Planning) */}
      <GanttChart />
    </div>
  );
}

export default Planning;
