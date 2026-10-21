import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaFileMedical, FaArrowLeft, FaPrint, FaExclamationTriangle, FaStethoscope, FaPlus, FaCalendarAlt, FaEdit, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';

const PatientDetailScreen = () => {
  const { personalId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const role = userInfo?.role?.toLowerCase() || '';
  const isPharmacy = role.includes('pharm') || role.includes('apotek') || role.includes('farm');
  const isDoctor = role === 'doctor' || role === 'doktor' || role === 'läkare';
  const isAuthorizedStaff = isDoctor || role === 'receptionist' || role === 'receptionista';

  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redigera patient-state
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editWarnings, setEditWarnings] = useState('');

  // État du formulaire pour une nouvelle note de dossier médical
  const [diagnosis, setDiagnosis] = useState('');
  const [noteText, setNoteText] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // État pour la modal de création rapide d'e-ordonnance
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [productName, setProductName] = useState('');
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState('');
  const [activeSubstance, setActiveSubstance] = useState('');
  const [genericsExchange, setGenericsExchange] = useState('');
  const [remainingWithdrawals, setRemainingWithdrawals] = useState(3);
  const [totalWithdrawals, setTotalWithdrawals] = useState(4);
  const [validUntil, setValidUntil] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');

  // État pour la modal de réservation du prochain rendez-vous
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [appointmentReason, setAppointmentReason] = useState('');

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const patientRes = await axios.get(`/api/patients/${personalId}`, { withCredentials: true });
      setPatient(patientRes.data);
      setEditPhone(patientRes.data.phone || '');
      setEditAddress(patientRes.data.address || '');
      setEditAllergies(patientRes.data.allergies || '');
      setEditWarnings(patientRes.data.warnings || '');

      const prescriptionRes = await axios.get(`/api/prescriptions/patient/${personalId}`, { withCredentials: true });
      setPrescriptions(prescriptionRes.data);

      const notesRes = await axios.get(`/api/patients/${personalId}/notes`, { withCredentials: true });
      setNotes(notesRes.data);

      const appointmentsRes = await axios.get('/api/patients/appointments', { withCredentials: true });
      const filteredApps = appointmentsRes.data.filter(app => app.patientPersonalId === personalId);
      setPatientAppointments(filteredApps);
    } catch (err) {
      setError("Impossible de récupérer les informations du patient.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [personalId]);

  const handleUpdatePatientSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/patients/${personalId}`,
        {
          phone: editPhone,
          address: editAddress,
          allergies: editAllergies,
          warnings: editWarnings,
        },
        { withCredentials: true }
      );
      
      setShowEditPatientModal(false);
      fetchPatientData();
      alert('Informations du patient mises à jour avec succès !');
    } catch (err) {
      alert(`Erreur lors de la mise à jour : ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCreateNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingNote(true);
      await axios.post(
        `/api/patients/${personalId}/notes`,
        {
          diagnosis,
          note: noteText,
          treatmentPlan,
        },
        { withCredentials: true }
      );
      setDiagnosis('');
      setNoteText('');
      setTreatmentPlan('');
      fetchPatientData();
    } catch (err) {
      alert(`Impossible d'enregistrer la note médicale : ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleCreatePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/prescriptions',
        {
          patientName: patient.name,
          patientPersonalId: patient.personalId,
          medicationName,
          productName,
          strength,
          form,
          activeSubstance,
          genericsExchange,
          remainingWithdrawals,
          totalWithdrawals,
          validUntil,
          usageInstructions,
        },
        { withCredentials: true }
      );
      setShowPrescriptionModal(false);
      setMedicationName('');
      setProductName('');
      setStrength('');
      setForm('');
      setActiveSubstance('');
      setGenericsExchange('');
      setRemainingWithdrawals(3);
      setTotalWithdrawals(4);
      setValidUntil('');
      setUsageInstructions('');
      fetchPatientData();
    } catch (err) {
      alert(`Impossible de créer l'e-ordonnance : ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCreateAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/patients/appointments',
        {
          patientName: patient.name,
          patientPersonalId: patient.personalId,
          date: appointmentDate,
          time: appointmentTime,
          reason: appointmentReason,
        },
        { withCredentials: true }
      );
      setShowAppointmentModal(false);
      setAppointmentReason('');
      fetchPatientData();
      alert('Rendez-vous programmé avec succès !');
    } catch (err) {
      alert(`Impossible de programmer le rendez-vous : ${err.response?.data?.message || err.message}`);
    }
  };

  const printProfileHandler = () => {
    const printWindow = window.open('', '_blank');
    
    const rowsHtml = prescriptions.map(p => {
      const medName = p.medicationName || p.medication || '-';
      const prodName = p.productName ? `(${p.productName})` : '';
      const strengthForm = `${p.strength || ''} ${p.form || ''}`;
      const withdrawals = p.remainingWithdrawals !== undefined ? `${p.remainingWithdrawals} sur ${p.totalWithdrawals}` : '-';
      const lastDate = p.lastWithdrawalDate ? `(Dernier : ${new Date(p.lastWithdrawalDate).toLocaleDateString('fr-FR')})` : '';
      const instructions = p.usageInstructions || p.dosage || p.instructions || '-';
      
      const doctorName = p.doctor?.name ? `Émis par : ${p.doctor.name}` : 'Émis par : Médecin';
      const workplace = p.doctor?.hospital || "Établissement de Santé";
      const phone = p.doctor?.phone ? `, téléphone : ${p.doctor.phone}` : '';
      const workplaceInfo = `Lieu de travail : ${workplace}${phone}`;
      const status = p.status === 'Aktivt' ? 'Actif' : p.status || 'Actif';

      return `
        <tr>
          <td>
            <strong>${medName} ${prodName}</strong><br>
            <small style="color: #444;">${doctorName}</small><br>
            <small style="color: #666;">${workplaceInfo}</small>
          </td>
          <td>${strengthForm}</td>
          <td>${withdrawals} ${lastDate}</td>
          <td>${instructions}</td>
          <td>${status}</td>
        </tr>
      `;
    }).join('');

    const notesHtml = notes.map(n => `
      <div style="border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px;">
        <p><strong>Date :</strong> ${new Date(n.createdAt).toLocaleDateString('fr-FR')} | <strong>Médecin :</strong> ${n.doctorName}</p>
        <p><strong>Diagnostic :</strong> ${n.diagnosis}</p>
        <p><strong>Note :</strong> ${n.note}</p>
        ${n.treatmentPlan ? `<p><strong>Plan de traitement :</strong> ${n.treatmentPlan}</p>` : ''}
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Dossier patient - ${patient?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .box { border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
            .label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SYSTÈME DE GESTION HOSPITALIÈRE</h2>
            <h3>Dossier médical & Historique</h3>
            <p>Date d'impression : ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div class="box">
            <p><span class="label">Nom :</span> ${patient?.name}</p>
            <p><span class="label">N° d'identité :</span> ${patient?.personalId}</p>
            <p><span class="label">Téléphone :</span> ${patient?.phone || 'Non renseigné'}</p>
            <p><span class="label">Adresse :</span> ${patient?.address || 'Non renseignée'}</p>
            <p><span class="label">Allergies :</span> ${patient?.allergies || 'Aucune allergie connue'}</p>
            <p><span class="label">Avertissements :</span> ${patient?.warnings || 'Aucun avertissement'}</p>
          </div>

          <h4>Notes médicales</h4>
          ${notes.length === 0 ? '<p>Aucune note médicale enregistrée.</p>' : notesHtml}

          <h4>Historique des ordonnances</h4>
          <table>
            <thead>
              <tr>
                <th>Médicament / Produit / Médecin & Lieu de travail</th>
                <th>Dosage / Forme</th>
                <th>Renouvellements restants / Dernier prélèvement</th>
                <th>Consignes / Posologie</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <Container className='text-center py-5'>
        <Spinner animation='border' />
      </Container>
    );
  }

  if (error || !patient) {
    return (
      <Container className='py-5'>
        <Alert variant='danger'>{error || "Patient introuvable."}</Alert>
        <Button variant='secondary' onClick={() => navigate(-1)}><FaArrowLeft className='me-1' /> Retour</Button>
      </Container>
    );
  }

  return (
    <Container className='py-4'>
      <Button variant='outline-secondary' className='mb-3' onClick={() => navigate(-1)}>
        <FaArrowLeft className='me-1' /> Retour
      </Button>

      <Row className='align-items-center mb-4'>
        <Col md={5}>
          <h2><FaUser className='me-2 text-primary' /> {patient.name}</h2>
          <p className='text-muted mb-0'>Numéro d'identité : {patient.personalId}</p>
        </Col>
        <Col md={7} className='text-end d-flex justify-content-end gap-2 flex-wrap'>
          {!isPharmacy && (
            <Button variant='success' onClick={() => setShowAppointmentModal(true)}>
              <FaCalendarAlt className='me-1' /> Programmer un RDV
            </Button>
          )}
          {isDoctor && (
            <Button variant='primary' onClick={() => setShowPrescriptionModal(true)}>
              <FaPlus className='me-1' /> Créer une e-ordonnance
            </Button>
          )}
          <Button variant='outline-primary' onClick={printProfileHandler}>
            <FaPrint className='me-1' /> Imprimer le dossier
          </Button>
        </Col>
      </Row>

      {/* Informations de contact & Avertissements */}
      <Card className='mb-4 shadow-sm border-warning'>
        <Card.Body>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <Card.Title className='text-warning fs-5 mb-0'>
              <FaExclamationTriangle className='me-2' /> Informations de contact, Médicales & Avertissements
            </Card.Title>
            {isAuthorizedStaff && (
              <Button variant='outline-warning' size='sm' onClick={() => setShowEditPatientModal(true)}>
                <FaEdit className='me-1' /> Modifier les informations
              </Button>
            )}
          </div>
          <Row className='mt-3'>
            <Col md={6}>
              <p><FaPhone className='me-2 text-muted' /><strong>Téléphone :</strong> {patient.phone || 'Non renseigné'}</p>
              <p><FaMapMarkerAlt className='me-2 text-muted' /><strong>Adresse :</strong> {patient.address || 'Non renseignée'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Allergies :</strong> <span className='text-danger'>{patient.allergies || 'Aucune allergie connue'}</span></p>
              <p><strong>Avertissements / Antécédents :</strong> {patient.warnings || 'Aucun avertissement'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* MODALE : MODIFIER LES INFORMATIONS DU PATIENT */}
      <Modal show={showEditPatientModal} onHide={() => setShowEditPatientModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FaEdit className='me-2' /> Modifier les informations de {patient.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdatePatientSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Numéro de téléphone</Form.Label>
              <Form.Control
                type='text'
                placeholder='01 23 45 67 89'
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type='text'
                placeholder='123 Rue de la République, Paris'
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Allergies</Form.Label>
              <Form.Control
                type='text'
                placeholder='Ex. Pénicilline'
                value={editAllergies}
                onChange={(e) => setEditAllergies(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Avertissements / Antécédents</Form.Label>
              <Form.Control
                type='text'
                placeholder='Ex. Diabète'
                value={editWarnings}
                onChange={(e) => setEditWarnings(e.target.value)}
              />
            </Form.Group>

            <div className='text-end'>
              <Button variant='secondary' className='me-2' onClick={() => setShowEditPatientModal(false)}>
                Annuler
              </Button>
              <Button variant='warning' type='submit'>
                Enregistrer les modifications
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* NOTES MÉDICALES (LORSQU'UN MÉDECIN EST CONNECTÉ) */}
      {isDoctor && (
        <Card className='mb-4 shadow-sm'>
          <Card.Header className='bg-primary text-white fw-bold'>
            <FaStethoscope className='me-2' /> Rédiger une nouvelle note médicale
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleCreateNoteSubmit}>
              <Row>
                <Col md={12}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Diagnostic / Motif de consultation</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Ex. J45.0 Asthme allergique, F32.0 Épisode dépressif léger...'
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className='mb-3'>
                <Form.Label>Note médicale / Anamnèse & Statut</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={3}
                  placeholder='Le patient consulte pour...'
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Plan de traitement / Prescription (Facultatif)</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={2}
                  placeholder='Prescription de médicaments, visite de contrôle dans 2 semaines...'
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                />
              </Form.Group>
              <div className='text-end'>
                <Button variant='primary' type='submit' disabled={submittingNote}>
                  <FaPlus className='me-1' /> Enregistrer dans le dossier
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* HISTORIQUE DES NOTES MÉDICALES */}
      <Card className='mb-4 shadow-sm'>
        <Card.Header className='bg-light fw-bold'>
          <FaStethoscope className='me-2 text-primary' /> Historique du dossier médical ({notes.length})
        </Card.Header>
        <Card.Body>
          {notes.length === 0 ? (
            <p className='text-muted mb-0 py-2 text-center'>Aucune note médicale enregistrée pour ce patient.</p>
          ) : (
            notes.map((n) => (
              <div key={n._id} className='border-bottom pb-3 mb-3'>
                <div className='d-flex justify-content-between align-items-center mb-1'>
                  <span className='fw-bold text-primary'><FaCalendarAlt className='me-1' /> {new Date(n.createdAt).toLocaleDateString('fr-FR')}</span>
                  <small className='text-muted'>Médecin : {n.doctorName}</small>
                </div>
                <h6 className='mb-2'><strong>Diagnostic :</strong> {n.diagnosis}</h6>
                <p className='mb-1'>{n.note}</p>
                {n.treatmentPlan && (
                  <div className='bg-light p-2 rounded small border-start border-primary border-3 mt-2'>
                    <strong>Plan de traitement :</strong> {n.treatmentPlan}
                  </div>
                )}
              </div>
            ))
          )}
        </Card.Body>
      </Card>

      {/* Tableau de l'historique des ordonnances */}
      <Card className='mb-4 shadow-sm'>
        <Card.Header className='bg-light fw-bold'>
          <FaFileMedical className='me-2 text-primary' /> Historique des ordonnances ({prescriptions.length})
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive size='sm' className='mb-0'>
            <thead>
              <tr>
                <th>Médicament / Produit</th>
                <th>Dosage / Forme</th>
                <th>Renouvellements restants / Dernier prélèvement</th>
                <th>Consignes / Posologie</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan='5' className='text-center py-3'>Aucune ordonnance enregistrée pour ce patient.</td>
                </tr>
              ) : (
                prescriptions.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className='fw-bold'>{p.medicationName || p.medication || '-'}</div>
                      {p.productName && <div className='text-muted small'>{p.productName}</div>}
                      <div className='text-secondary small fst-italic'>
                        Émis par : {p.doctor?.name || 'Médecin'}
                      </div>
                      <div className='text-muted small'>
                        Lieu de travail : {p.doctor?.hospital || "Établissement de Santé"}
                        {p.doctor?.phone ? `, téléphone : ${p.doctor.phone}` : ''}
                      </div>
                    </td>
                    <td>
                      {p.strength ? `${p.strength} ` : ''}
                      {p.form ? `, ${p.form}` : ''}
                    </td>
                    <td>
                      <div className='fw-bold'>
                        {p.remainingWithdrawals !== undefined ? `${p.remainingWithdrawals} sur ${p.totalWithdrawals}` : '-'}
                      </div>
                      <small className='text-muted'>
                        {p.lastWithdrawalDate 
                          ? `Dernier : ${new Date(p.lastWithdrawalDate).toLocaleDateString('fr-FR')}` 
                          : 'Aucun prélèvement'}
                      </small>
                    </td>
                    <td>{p.usageInstructions || p.dosage || p.instructions || '-'}</td>
                    <td>
                      <Badge bg={p.status === 'Slutexpedierat' || p.status === 'Entièrement dispensé' ? 'secondary' : p.status === 'Makulerat' || p.status === 'Annulé' ? 'danger' : 'success'}>
                        {p.status === 'Aktivt' ? 'Actif' : p.status || 'Actif'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* HISTORIQUE DES RENDEZ-VOUS */}
      <Card className='shadow-sm'>
        <Card.Header className='bg-light fw-bold'>
          <FaCalendarAlt className='me-2 text-success' /> Rendez-vous & Consultations du patient ({patientAppointments.length})
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive size='sm' className='mb-0'>
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Motif</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {patientAppointments.length === 0 ? (
                <tr>
                  <td colSpan='3' className='text-center py-3 text-muted'>
                    Aucun rendez-vous programmé pour ce patient.
                  </td>
                </tr>
              ) : (
                patientAppointments.map((app) => {
                  let badgeBg = 'success';
                  let statusText = 'Programmé';

                  if (app.status === 'Avbokad' || app.status === 'Annulé') {
                    badgeBg = 'danger';
                    statusText = 'Annulé';
                  } else if (app.status === 'Terminé' || app.status === 'Genomförd') {
                    badgeBg = 'secondary';
                    statusText = 'Terminé';
                  } else if (app.status === 'Bokad' || app.status === 'Programmé' || !app.status) {
                    badgeBg = 'success';
                    statusText = 'Programmé';
                  } else {
                    statusText = app.status;
                  }

                  return (
                    <tr key={app._id}>
                      <td>{app.date} à {app.time}</td>
                      <td>{app.reason}</td>
                      <td>
                        <Badge bg={badgeBg}>
                          {statusText}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* MODALE : ÉTABLIR UNE E-ORDONNANCE */}
      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title><FaFileMedical className='me-2' /> Établir une e-ordonnance pour {patient.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreatePrescriptionSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Patient</Form.Label>
                  <Form.Control type='text' value={patient.name} disabled />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Numéro d'identité</Form.Label>
                  <Form.Control type='text' value={patient.personalId} disabled />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Nom du médicament (ex. Sertraline)</Form.Label>
                  <Form.Control
                    type='text'
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Nom du produit (ex. Sertraline SUN)</Form.Label>
                  <Form.Control
                    type='text'
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label>Dosage (ex. 50 mg)</Form.Label>
                  <Form.Control
                    type='text'
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label>Forme pharmaceutique</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='comprimé pelliculé'
                    value={form}
                    onChange={(e) => setForm(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label>Substance active</Form.Label>
                  <Form.Control
                    type='text'
                    value={activeSubstance}
                    onChange={(e) => setActiveSubstance(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label>Renouvellements restants</Form.Label>
                  <Form.Control
                    type='number'
                    value={remainingWithdrawals}
                    onChange={(e) => setRemainingWithdrawals(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label>Nombre total</Form.Label>
                  <Form.Control
                    type='number'
                    value={totalWithdrawals}
                    onChange={(e) => setTotalWithdrawals(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label>Valide jusqu'au</Form.Label>
                  <Form.Control
                    type='date'
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3'>
              <Form.Label>Posologie / Utilisation</Form.Label>
              <Form.Control
                as='textarea'
                rows={2}
                placeholder='1 comprimé par jour le matin...'
                value={usageInstructions}
                onChange={(e) => setUsageInstructions(e.target.value)}
                required
              />
            </Form.Group>

            <div className='text-end'>
              <Button variant='secondary' className='me-2' onClick={() => setShowPrescriptionModal(false)}>
                Annuler
              </Button>
              <Button variant='primary' type='submit'>
                Enregistrer l'e-ordonnance
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODALE : PROGRAMMER UN PROCHAIN RENDEZ-VOUS */}
      <Modal show={showAppointmentModal} onHide={() => setShowAppointmentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FaCalendarAlt className='me-2' /> Programmer un RDV pour {patient.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateAppointmentSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Date du RDV</Form.Label>
                  <Form.Control
                    type='date'
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Heure</Form.Label>
                  <Form.Control
                    type='time'
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3'>
              <Form.Label>Motif de la consultation / Suivi</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                placeholder='Ex. Consultation de suivi, contrôle de tension, renouvellement d ordonnance...'
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
                required
              />
            </Form.Group>

            <div className='text-end'>
              <Button variant='secondary' className='me-2' onClick={() => setShowAppointmentModal(false)}>
                Annuler
              </Button>
              <Button variant='success' type='submit'>
                Confirmer le rendez-vous
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PatientDetailScreen;