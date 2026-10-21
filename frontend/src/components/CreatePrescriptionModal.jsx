import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const CreatePrescriptionModal = ({ show, handleClose, patientId, onCreated }) => {
  const [formData, setFormData] = useState({
    medicationName: '',
    productName: '',
    strength: '',
    form: '',
    activeSubstance: '',
    genericsExchange: '',
    remainingWithdrawals: 3,
    totalWithdrawals: 4,
    nextWithdrawalDate: '',
    validUntil: '',
    usageInstructions: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Om du använder Bearer-token i LocalStorage:
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`,
        },
        body: JSON.stringify({ ...formData, patient: patientId }),
      });

      if (!response.ok) throw new Error('Kunde inte skapa receptet');

      toast.success('Receptet har skapats!');
      handleClose();
      if (onCreated) onCreated();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Utfärda nytt recept</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Läkemedelsnamn (t.ex. Sertralin)</Form.Label>
            <Form.Control type="text" name="medicationName" value={formData.medicationName} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Produktnamn & Styrka (t.ex. Sertraline SUN 50 mg)</Form.Label>
            <Form.Control type="text" name="productName" value={formData.productName} onChange={handleChange} required />
          </Form.Group>

          <Form.Row className="d-flex gap-2 mb-3">
            <Form.Group className="flex-fill">
              <Form.Label>Styrka</Form.Label>
              <Form.Control type="text" name="strength" value={formData.strength} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="flex-fill">
              <Form.Label>Beredningsform (t.ex. filmdragerad tablett)</Form.Label>
              <Form.Control type="text" name="form" value={formData.form} onChange={handleChange} required />
            </Form.Group>
          </Form.Row>

          <Form.Group className="mb-3">
            <Form.Label>Verksamt ämne</Form.Label>
            <Form.Control type="text" name="activeSubstance" value={formData.activeSubstance} onChange={handleChange} required />
          </Form.Group>

            <Form.Group className="mb-3">
            <Form.Label>Utbytesinfo (frivillig, t.ex. Byttes senast ut till...)</Form.Label>
            <Form.Control type="text" name="genericsExchange" value={formData.genericsExchange} onChange={handleChange} />
          </Form.Group>

          <Form.Row className="d-flex gap-2 mb-3">
            <Form.Group className="flex-fill">
              <Form.Label>Antal uttag kvar</Form.Label>
              <Form.Control type="number" name="remainingWithdrawals" value={formData.remainingWithdrawals} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="flex-fill">
              <Form.Label>Totalt antal uttag</Form.Label>
              <Form.Control type="number" name="totalWithdrawals" value={formData.totalWithdrawals} onChange={handleChange} required />
            </Form.Group>
          </Form.Row>

          <Form.Row className="d-flex gap-2 mb-3">
            <Form.Group className="flex-fill">
              <Form.Label>Nästa uttag inom förmån</Form.Label>
              <Form.Control type="date" name="nextWithdrawalDate" value={formData.nextWithdrawalDate} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="flex-fill">
              <Form.Label>Gäller till och med</Form.Label>
              <Form.Control type="date" name="validUntil" value={formData.validUntil} onChange={handleChange} required />
            </Form.Group>
          </Form.Row>

          <Form.Group className="mb-3">
            <Form.Label>Användning / Dosering</Form.Label>
            <Form.Control as="textarea" rows={3} name="usageInstructions" value={formData.usageInstructions} onChange={handleChange} required />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>Avbryt</Button>
            <Button variant="primary" type="submit">Spara recept</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreatePrescriptionModal;