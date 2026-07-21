import React, { useState, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

var s = {
  page: { maxWidth: 900, margin: '0 auto' },
  headerTitle: { fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 4 },
  headerSub: { color: '#94a3b8', fontSize: 14, margin: '0 0 28px 0' },
  dropZone: { border: '2px dashed #cbd5e1', borderRadius: 16, padding: 40, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 24, background: '#ffffff' },
  dropZoneHover: { border: '2px dashed #6366f1', background: '#f8fafc' },
  dropZoneIcon: { fontSize: 48, marginBottom: 16, opacity: 0.5 },
  dropZoneText: { fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 4 },
  dropZoneSub: { fontSize: 13, color: '#94a3b8' },
  previewCard: { background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24 },
  previewHeader: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  previewTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b' },
  previewCount: { fontSize: 12, color: '#94a3b8', background: '#f1f5f9', padding: '4px 10px', borderRadius: 50 },
  th: { padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #f1f5f9', background: '#fafbfc' },
  td: { padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: '#475569' },
  importBtn: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%', boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)' },
  resetBtn: { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 12 },
  resultBox: { padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 13, fontWeight: 500 },
  successBox: { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' },
  progressBar: { width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 4, transition: 'width 0.3s' },
  logBox: { background: '#1e293b', borderRadius: 12, padding: 16, maxHeight: 200, overflowY: 'auto', marginBottom: 16 },
  logLine: { fontSize: 12, fontFamily: 'monospace', marginBottom: 4 },
  logSuccess: { color: '#4ade80' },
  logError: { color: '#f87171' },
  logInfo: { color: '#94a3b8' },
  mappingMapped: { borderColor: '#10b981', background: '#f0fdf4' },
  combineSelect: { flex: 1, padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#1e293b', background: '#ffffff' },
  mappingSelect: { flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1e293b', background: '#ffffff' },
  label: { display: 'block', fontSize: 13, fontWeight: 700, color: '#475569' },
  mappingRequired: { color: '#ef4444', fontSize: 11, fontWeight: 700 }
};

var entityConfigs = {
  clients: {
    label: '👥 Clients',
    api: '/api/clients',
    fields: [
      { key: 'name', label: 'Nom complet', required: true, combine: true },
      { key: 'email', label: 'Email', required: false },
      { key: 'phone', label: 'Téléphone', required: false },
      { key: 'address', label: 'Adresse', required: false },
      { key: 'city', label: 'Ville', required: false }
    ]
  },
  animals: {
    label: '🐾 Animaux',
    api: '/api/animals',
    fields: [
      { key: 'name', label: 'Nom', required: true },
      { key: 'species', label: 'Espèce', required: true },
      { key: 'breed', label: 'Race', required: false },
      { key: 'age', label: 'Âge', required: false },
      { key: 'weight', label: 'Poids (kg)', required: false },
      { key: 'client_id', label: 'ID Client', required: true }
    ]
  }
};function Import() {
  var [csvData, setCsvData] = useState(null);
  var [headers, setHeaders] = useState([]);
  var [mapping, setMapping] = useState({});
  var [combineMapping, setCombineMapping] = useState({});
  var [isHovered, setIsHovered] = useState(false);
  var [importing, setImporting] = useState(false);
  var [result, setResult] = useState(null);
  var [selectedEntity, setSelectedEntity] = useState('clients');
  var [progress, setProgress] = useState(0);
  var [logs, setLogs] = useState([]);
  var [fileName, setFileName] = useState('');
  var fileInputRef = useRef(null);
  var currentConfig = entityConfigs[selectedEntity];

  var addLog = function(type, message) {
    setLogs(function(prev) {
      return prev.concat([{ type: type, message: message, time: new Date().toLocaleTimeString() }]);
    });
  };

  var handleFileUpload = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setLogs([]);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      delimiter: '',
      complete: function(results) {
        if (!results.data || results.data.length === 0) {
          setResult({ type: 'error', message: 'Le fichier CSV est vide' });
          return;
        }
        var detectedHeaders = results.meta.fields || [];
        setHeaders(detectedHeaders);
        setCsvData(results.data);
        addLog('info', 'Fichier : ' + results.data.length + ' lignes');
        addLog('info', 'Colonnes : ' + detectedHeaders.join(', '));
        var autoMap = {};
        var autoCombine = {};
        var frenchMap = {
          'email': ['email', 'mail', 'e-mail'],
          'phone': ['téléphone', 'telephone', 'tel', 'portable', 'mobile'],
          'address': ['adresse', 'address', 'rue'],
          'city': ['ville', 'city'],
          'species': ['espèce', 'espece', 'species'],
          'breed': ['race', 'breed'],
          'age': ['age', 'âge'],
          'weight': ['poids', 'weight']
        };
        currentConfig.fields.forEach(function(f) {
          if (f.combine) {
            var prenomCol = detectedHeaders.find(function(h) {
              var hl = h.toLowerCase().trim();
              return hl === 'prénom' || hl === 'prenom' || hl === 'firstname';
            });
            var nomCol = detectedHeaders.find(function(h) {
              var hl = h.toLowerCase().trim();
              return hl === 'nom' || hl === 'lastname' || hl === 'last_name';
            });
            if (prenomCol && nomCol) {
              autoCombine[f.key] = { col1: prenomCol, col2: nomCol };
              return;
            }
          }
          var exactMatch = detectedHeaders.find(function(h) {
            return h.toLowerCase().trim() === f.key.toLowerCase();
          });
          if (exactMatch) { autoMap[f.key] = exactMatch; return; }
          if (frenchMap[f.key]) {
            var frMatch = detectedHeaders.find(function(h) {
              return frenchMap[f.key].indexOf(h.toLowerCase().trim()) !== -1;
            });
            if (frMatch) autoMap[f.key] = frMatch;
          }
        });
        setMapping(autoMap);
        setCombineMapping(autoCombine);
      },
      error: function(err) {
        setResult({ type: 'error', message: 'Erreur: ' + err.message });
      }
    });
  };

  var handleDrop = function(e) { e.preventDefault(); setIsHovered(false); var file = e.dataTransfer.files[0]; if (file) { handleFileUpload({ target: { files: [file] } }); } };
  var handleDragOver = function(e) { e.preventDefault(); setIsHovered(true); };
  var handleDragLeave = function(e) { e.preventDefault(); setIsHovered(false); };

  var updateMapping = function(fieldKey, headerValue) {
    var newMap = {};
    Object.keys(mapping).forEach(function(k) { newMap[k] = mapping[k]; });
    newMap[fieldKey] = headerValue;
    setMapping(newMap);
    if (combineMapping[fieldKey]) {
      var newCombine = {};
      Object.keys(combineMapping).forEach(function(k) { if (k !== fieldKey) newCombine[k] = combineMapping[k]; });
      setCombineMapping(newCombine);
    }
  };

  var updateCombine = function(fieldKey, which, value) {
    var newCombine = {};
    Object.keys(combineMapping).forEach(function(k) { newCombine[k] = combineMapping[k]; });
    if (!newCombine[fieldKey]) newCombine[fieldKey] = { col1: '', col2: '' };
    if (which === 'col1') newCombine[fieldKey].col1 = value;
    if (which === 'col2') newCombine[fieldKey].col2 = value;
    setCombineMapping(newCombine);
    var newMap = {};
    Object.keys(mapping).forEach(function(k) { if (k !== fieldKey) newMap[k] = mapping[k]; });
    setMapping(newMap);
  };

  var cleanValue = function(val) {
    if (!val) return '';
    var cleaned = val.trim();
    if (cleaned === ',' || cleaned === '.' || cleaned === '?' || cleaned === '-') return '';
    return cleaned;
  };

  var buildRecord = function(row) {
    var item = {};
    currentConfig.fields.forEach(function(f) {
      if (f.combine && combineMapping[f.key]) {
        var part1 = cleanValue(row[combineMapping[f.key].col1]);
        var part2 = cleanValue(row[combineMapping[f.key].col2]);
        var combined = '';
        if (part1 && part2) { combined = part1 + ' ' + part2; }
        else if (part1) { combined = part1; }
        else if (part2) { combined = part2; }
        if (combined) item[f.key] = combined;
        return;
      }
      var headerKey = mapping[f.key];
      if (headerKey && row[headerKey] !== undefined) {
        var val = cleanValue(row[headerKey]);
        if (val) item[f.key] = val;
      }
    });
    return item;
  };

  var handleImport = function() {
    if (!csvData || csvData.length === 0) return;
    setImporting(true); setResult(null); setLogs([]); setProgress(0);
    var records = [];
    csvData.forEach(function(row, i) {
      var record = buildRecord(row);
      var hasRequired = true;
      currentConfig.fields.forEach(function(f) { if (f.required && !record[f.key]) hasRequired = false; });
      if (hasRequired) { record._row = i + 1; records.push(record); }
    });
    addLog('info', records.length + ' lignes valides');
    if (records.length === 0) {
      setImporting(false);
      setResult({ type: 'error', message: 'Aucune ligne valide.' });
      return;
    }
    var imported = 0; var errors = 0; var idx = 0;
    var importNext = function() {
      if (idx >= records.length) {
        setImporting(false); setProgress(100);
        if (errors === 0) { setResult({ type: 'success', message: '✓ ' + imported + ' importés !' }); }
        else { setResult({ type: 'error', message: imported + ' OK, ' + errors + ' erreurs' }); }
        return;
      }
      var record = records[idx]; var rowNum = record._row;
      var sendData = {};
      Object.keys(record).forEach(function(k) { if (k !== '_row') sendData[k] = record[k]; });
      setProgress(Math.round(((idx + 1) / records.length) * 100));
      var displayName = sendData.name || 'ligne ' + rowNum;
      axios.post(currentConfig.api, sendData).then(function() {
        imported++; addLog('success', 'Ligne ' + rowNum + ' : ✓ ' + displayName); idx++; setTimeout(importNext, 50);
      }).catch(function(err) {
        errors++;
        var msg = 'Erreur';
        if (err.response && err.response.data && err.response.data.error) msg = err.response.data.error;
        addLog('error', 'Ligne ' + rowNum + ' : ✗ ' + msg);
        idx++; setTimeout(importNext, 50);
      });
    };
    importNext();
  };

  var resetImport = function() {
    setCsvData(null); setHeaders([]); setMapping({}); setCombineMapping({});
    setResult(null); setLogs([]); setProgress(0); setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  var handleExportTemplate = function() {
    var cols = [];
    currentConfig.fields.forEach(function(f) {
      if (f.combine) { cols.push('Prénom'); cols.push('Nom'); } else { cols.push(f.key); }
    });
    var csv = cols.join(';') + '\n';
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modele_' + selectedEntity + '.csv';
    link.click();
  };  return (
    <div style={s.page}>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      <h2 style={s.headerTitle}>📥 Import CSV</h2>
      <p style={s.headerSub}>Importez vos données depuis un fichier CSV</p>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          {Object.keys(entityConfigs).map(function(key) {
            var conf = entityConfigs[key];
            var isSelected = selectedEntity === key;
            return (
              <button key={key} type="button" onClick={function() { setSelectedEntity(key); resetImport(); }}
                style={{ padding: '10px 20px', borderRadius: 50, border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0', background: isSelected ? '#eef2ff' : '#ffffff', fontSize: 13, fontWeight: isSelected ? 700 : 600, color: isSelected ? '#6366f1' : '#64748b', cursor: 'pointer' }}>
                {conf.label}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={handleExportTemplate} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>📄 Télécharger un modèle CSV</button>
      </div>
      {!csvData ? (
        <div style={isHovered ? Object.assign({}, s.dropZone, s.dropZoneHover) : s.dropZone} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={function() { fileInputRef.current.click(); }}>
          <input type="file" ref={fileInputRef} accept=".csv,text/csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
          <div style={s.dropZoneIcon}>📁</div>
          <p style={s.dropZoneText}>Glissez-déposez votre fichier CSV ici</p>
          <p style={s.dropZoneSub}>ou cliquez pour parcourir</p>
        </div>
      ) : (
        <div>
          <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#4338ca' }}>📄 {fileName} — {csvData.length} lignes</span>
            <button onClick={resetImport} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6366f1' }}>✕</button>
          </div>
          <div style={s.previewCard}>
            <div style={s.previewHeader}>
              <span style={s.previewTitle}>🗺️ Associer les colonnes</span>
              <span style={s.previewCount}>{headers.length} colonnes</span>
            </div>
            <div style={{ padding: 20 }}>
              {currentConfig.fields.map(function(f) {
                var isCombined = f.combine && combineMapping[f.key] && (combineMapping[f.key].col1 || combineMapping[f.key].col2);
                var isMapped = mapping[f.key];
                return (
                  <div key={f.key} style={{ marginBottom: 16, padding: 12, background: (isMapped || isCombined) ? '#f0fdf4' : '#fafbfc', borderRadius: 10, border: '1px solid ' + ((isMapped || isCombined) ? '#bbf7d0' : '#e2e8f0') }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                      {f.label} {f.required && <span style={s.mappingRequired}>*</span>}
                      {(isMapped || isCombined) && <span style={{ color: '#10b981', marginLeft: 8 }}>✓</span>}
                    </div>
                    {f.combine ? (
                      <div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>Combiner 2 colonnes (Prénom + Nom) :</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <select style={s.combineSelect} value={(combineMapping[f.key] && combineMapping[f.key].col1) || ''} onChange={function(e) { updateCombine(f.key, 'col1', e.target.value); }}>
                            <option value="">-- Prénom --</option>
                            {headers.map(function(h) { return <option key={h} value={h}>{h}</option>; })}
                          </select>
                          <span style={{ color: '#cbd5e1', fontWeight: 700 }}>+</span>
                          <select style={s.combineSelect} value={(combineMapping[f.key] && combineMapping[f.key].col2) || ''} onChange={function(e) { updateCombine(f.key, 'col2', e.target.value); }}>
                            <option value="">-- Nom --</option>
                            {headers.map(function(h) { return <option key={h} value={h}>{h}</option>; })}
                          </select>
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Ou une seule colonne :</div>
                        <select style={s.mappingSelect} value={mapping[f.key] || ''} onChange={function(e) { updateMapping(f.key, e.target.value); }}>
                          <option value="">-- Colonne unique --</option>
                          {headers.map(function(h) { return <option key={h} value={h}>{h}</option>; })}
                        </select>
                      </div>
                    ) : (
                      <select style={Object.assign({}, s.mappingSelect, isMapped ? s.mappingMapped : {})} value={mapping[f.key] || ''} onChange={function(e) { updateMapping(f.key, e.target.value); }}>
                        <option value="">-- Sélectionner --</option>
                        {headers.map(function(h) { return <option key={h} value={h}>{h}</option>; })}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {importing && (
            <div>
              <div style={s.progressBar}><div style={Object.assign({}, s.progressFill, { width: progress + '%' })}></div></div>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginBottom: 16 }}>Import... {progress}%</p>
            </div>
          )}
          {logs.length > 0 && (
            <div style={s.logBox}>
              {logs.map(function(log, i) {
                var logStyle = s.logInfo;
                if (log.type === 'success') logStyle = s.logSuccess;
                if (log.type === 'error') logStyle = s.logError;
                return <div key={i} style={Object.assign({}, s.logLine, logStyle)}>[{log.time}] {log.message}</div>;
              })}
            </div>
          )}
          {result && (
            <div style={Object.assign({}, s.resultBox, result.type === 'success' ? s.successBox : s.errorBox)}>{result.message}</div>
          )}
          {!importing && (
            <div>
              <button style={s.importBtn} onClick={handleImport}>🚀 Importer {csvData.length} lignes</button>
              <button style={s.resetBtn} onClick={resetImport}>↩️ Recommencer</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Import;