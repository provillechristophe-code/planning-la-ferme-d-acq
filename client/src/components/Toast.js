import React, { useState, useEffect } from 'react';

function Toast({ message, type, onClose }) {
  useEffect(function() {
    var timer = setTimeout(function() {
      if (onClose) onClose();
    }, 2500);
    return function() { clearTimeout(timer); };
  }, []);

  var bg = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1';
  var icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      background: bg,
      color: '#fff',
      padding: '14px 24px',
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 700,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      animation: 'slideIn 0.3s ease'
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>{message}</span>
      <style>{'@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }'}</style>
    </div>
  );
}

export default Toast;