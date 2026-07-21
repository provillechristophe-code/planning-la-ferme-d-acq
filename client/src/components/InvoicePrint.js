import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InvoicePrint.css';

function InvoicePrint({ invoiceId, onClose }) {
  var [invoice, setInvoice] = useState(null);
  var [reservation, setReservation] = useState(null);
  var [client, setClient] = useState(null);
  var [animal, setAnimal] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    fetchData();
  }, [invoiceId]);

  var fetchData = function() {
    axios.get('/api/invoices/' + invoiceId).then(function(invRes) {
      setInvoice(invRes.data);
      return Promise.all([
        axios.get('/api/reservations/' + invRes.data.reservation_id),
        axios.get('/api/clients/' + invRes.data.client_id)
      ]);
    }).then(function(results) {
      setReservation(results[0].data);
      setClient(results[1].data);
      if (results[0].data && results[0].data.animal_id) {
        axios.get('/api/animals/' + results[0].data.animal_id).then(function(animalRes) {
          setAnimal(animalRes.data);
          setLoading(false);
        }).catch(function() { setLoading(false); });
      } else {
        setLoading(false);
      }
    }).catch(function(err) {
      console.error(err);
      setLoading(false);
    });
  };

  var handlePrint = function() {
    window.print();
  };

  var getDays = function() {
    if (!reservation) return 0;
    var start = new Date(reservation.check_in);
    var end = new Date(reservation.check_out);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement de la facture...</div>;
  if (!invoice || !client) return <div style={{ padding: 40, textAlign: 'center' }}>Erreur: Facture non trouvée</div>;

  return (
    <div className="invoice-container">
      <div className="invoice-controls no-print">
        <button onClick={handlePrint} style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          🖨️ Imprimer
        </button>
        <button onClick={onClose} style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
          ✕ Fermer
        </button>
      </div>

      <div className="invoice">
        <div className="invoice-header">
          <div className="company-info">
            <h1>🐾 La Ferme d'Acq</h1>
            <p>Pension Animalière</p>
            <p>chaussee brunehaut : Acq, 62144</p>
            <p>Tél : 06 10 10 65 68</p>
            <p>Email : christophe.proville@free.fr</p>
          </div>
          <div className="invoice-title">
            <h2>FACTURE</h2>
            <p className="invoice-number">N° FAC-{invoice.id}</p>
            <p className="invoice-date">Date : {invoice.invoice_date}</p>
            {invoice.due_date && <p className="invoice-date">Échéance : {invoice.due_date}</p>}
          </div>
        </div>

        <div className="invoice-section">
          <div className="section-title">Facturé à :</div>
          <div className="client-info">
            <p><strong>{client.name}</strong></p>
            {client.email && <p>{client.email}</p>}
            {client.phone && <p>Tél : {client.phone}</p>}
            {client.address && <p>{client.address}</p>}
            {client.city && <p>{client.city}</p>}
          </div>
        </div>

        {animal && (
          <div className="invoice-section">
            <div className="section-title">Animal :</div>
            <div className="client-info">
              <p><strong>{animal.name}</strong> - {animal.species} {animal.breed ? '(' + animal.breed + ')' : ''}</p>
            </div>
          </div>
        )}

        <div className="invoice-section">
          <div className="section-title">Période de séjour :</div>
          <div className="client-info">
            <p>Du <strong>{reservation ? reservation.check_in : '—'}</strong> au <strong>{reservation ? reservation.check_out : '—'}</strong></p>
            <p>Durée : <strong>{getDays()} jour(s)</strong></p>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Durée</th>
              <th>Tarif unitaire</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pension animalière - {animal ? animal.name : 'Animal'}</td>
              <td>{getDays()} jour(s)</td>
              <td>{reservation ? reservation.daily_rate : '—'}€/jour</td>
              <td>{invoice.amount.toFixed(2)}€</td>
            </tr>
          </tbody>
        </table>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>Sous-total HT :</span>
            <span>{invoice.amount.toFixed(2)}€</span>
          </div>
          <div className="summary-row">
            <span>TVA (20%) :</span>
            <span>{invoice.tax.toFixed(2)}€</span>
          </div>
          <div className="summary-row total">
            <span>TOTAL TTC :</span>
            <span>{invoice.total.toFixed(2)}€</span>
          </div>
          {invoice.payment_status === 'paid' ? (
            <div className="payment-status paid">✓ PAYÉE</div>
          ) : (
            <div className="payment-status pending">EN ATTENTE DE PAIEMENT</div>
          )}
        </div>

        <div className="invoice-footer">
          <p>Conditions de paiement : Net 30 jours</p>
          <p>La Ferme d'Acq - Pension Animalière</p>
          <p>Merci pour votre confiance !</p>
        </div>
      </div>
    </div>
  );
}

export default InvoicePrint;