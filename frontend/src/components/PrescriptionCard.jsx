import React, { useState } from 'react';
import { Card, Button, Badge, Collapse } from 'react-bootstrap';

const PrescriptionCard = ({ prescription }) => {
  const [open, setOpen] = useState(false);

  return (
    <Card className="mb-3 border-light shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
      <Card.Body>
        {/* Rubrik & Ersättningsinfo */}
        <h3 className="text-primary fw-bold mb-1">
          {prescription.medicationName}
        </h3>
        <p className="text-secondary mb-2">
          {prescription.productName} {prescription.strength}, {prescription.form}
        </p>

        {prescription.genericsExchange && (
          <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
            <i className="bi bi-info-circle me-2"></i>
            <span>{prescription.genericsExchange}</span>
          </div>
        )}

        {/* Detaljlista */}
        <div className="mt-3">
          <p className="mb-1">
            <strong>Datum för utfärdande:</strong>{' '}
            {new Date(prescription.issueDate).toLocaleDateString('sv-SE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <p className="mb-1">
            <strong>Verksamt ämne:</strong> {prescription.activeSubstance}
          </p>

          <p className="mb-1">
            <strong>Antal uttag kvar:</strong> {prescription.remainingWithdrawals} av {prescription.totalWithdrawals} uttag kvar
          </p>

          {prescription.nextWithdrawalDate && (
            <p className="mb-1">
              <strong>Nästa uttag inom förmån:</strong>{' '}
              {new Date(prescription.nextWithdrawalDate).toLocaleDateString('sv-SE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}

          <p className="mb-1">
            <strong>Är utfärdat av:</strong> {prescription.doctor?.name || 'Läkare'}
          </p>

          <p className="mb-1">
            <strong>Gäller till och med:</strong>{' '}
            {new Date(prescription.validUntil).toLocaleDateString('sv-SE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <p className="mt-3 mb-1">
            <strong>Användning:</strong> {prescription.usageInstructions}
          </p>

          <p className="mb-3">
            <strong>Produktnamn:</strong> {prescription.productName}
          </p>
        </div>

        {/* Knappar längst ned */}
        <div className="d-grid gap-2 mt-4">
          <Button
            variant="outline-secondary"
            onClick={() => setOpen(!open)}
            aria-controls="prescription-details"
            aria-expanded={open}
            className="w-100 bg-white"
          >
            <i className="bi bi-info-circle me-2"></i>
            {open ? 'Dölj hela receptet' : 'Visa hela receptet'}
          </Button>

          <Collapse in={open}>
            <div id="prescription-details" className="p-3 mt-2 bg-white rounded border">
              <h5>Detaljerad förskrivningsinformation</h5>
              <hr />
              <p className="small mb-1"><strong>Recept-ID:</strong> {prescription._id}</p>
              <p className="small mb-1"><strong>Status:</strong> <Badge bg="success">{prescription.status}</Badge></p>
              <p className="small mb-0"><strong>Skapad datum:</strong> {new Date(prescription.createdAt).toLocaleString('sv-SE')}</p>
            </div>
          </Collapse>

          <Button variant="outline-secondary" className="w-100 bg-white">
            <i className="bi bi-info-circle me-2"></i>
            Uppgifter för att förnya receptet
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PrescriptionCard;