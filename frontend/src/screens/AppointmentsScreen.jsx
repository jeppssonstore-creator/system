import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, InputGroup, ButtonGroup } from 'react-bootstrap';
import { FaCalendarAlt, FaPlus, FaSearch, FaCheck, FaTimes, FaClock, FaClipboardList, FaThLarge, FaTable, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

// Importera React Big Calendar
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import frFR from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Konfigurera franska för kalendern
const locales = {
  'fr': frFR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const AppointmentsScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Säkerhetskontroll: Om det är apoteket som försöker nå sidan, omdirigera dem direkt
  const role = userInfo?.role?.toLowerCase() || '';
  const isPharmacy = role.includes('pharm') || role.includes('apotek') || role.includes('farm');

  useEffect(() => {
    if (isPharmacy) {
      navigate('/prescriptions');
    }
  }, [isPharmacy, navigate]);

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // State för receptionist-modal
  const [showRecModal, setShowRecModal] = useState(false);
  const [recName, setRecName] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recPassword, setRecPassword] = useState('');
  
  // Växla vy: 'table' eller 'calendar'
  const [viewMode, setViewMode] = useState('table');

  // Form State för ny bokning
  const [patientName, setPatientName] = useState('');
  const [patientPersonalId, setPatientPersonalId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [reason, setReason] = useState('');

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get('/api/patients/appointments', { withCredentials: true });
      setAppointments(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des rendez-vous :', err);
    }
  };

  useEffect(() => {
    if (!isPharmacy) {
      fetchAppointments();
    }
  }, [isPharmacy]);

  if (isPharmacy) {
    return null;
  }

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/patients/appointments',
        { patientName, patientPersonalId, date, time, reason },
        { withCredentials: true }
      );
      setShowModal(false);
      setPatientName('');
      setPatientPersonalId('');
      setReason('');
      fetchAppointments();
      toast.success('Rendez-vous créé avec succès !');
    } catch (err) {
      toast.error(`Impossible de créer le rendez-vous : ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCreateReceptionist = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/users/receptionists',
        { name: recName, email: recEmail, password: recPassword },
        { withCredentials: true }
      );
      toast.success('Le compte réceptionniste a été créé et associé à votre profil !');
      setShowRecModal(false);
      setRecName('');
      setRecEmail('');
      setRecPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de créer le réceptionniste');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(
        `/api/patients/appointments/${id}`,
        { status },
        { withCredentials: true }
      );
      fetchAppointments();
    } catch (err) {
      alert(`Impossible de mettre à jour le rendez-vous : ${err.response?.data?.message || err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Genomförd' || status === 'Effectué') return <Badge bg='success'>Effectué</Badge>;
    if (status === 'Avbokad' || status === 'Annulé') return <Badge bg='danger'>Annulé</Badge>;
    return <Badge bg='primary'>Programmé</Badge>;
  };

  // Filtrera bokningar
  const filteredAppointments = appointments.filter((app) => {
    const term = searchTerm.toLowerCase();
    return (
      (app.patientName && app.patientName.toLowerCase().includes(term)) ||
      (app.patientPersonalId && app.patientPersonalId.toLowerCase().includes(term)) ||
      (app.reason && app.reason.toLowerCase().includes(term)) ||
      (app.date && app.date.includes(term))
    );
  });

  // Omvandla databashändelser till kalenderobjekt
  const calendarEvents = filteredAppointments.map((app) => {
    const [year, month, day] = app.date.split('-');
    const [hours, minutes] = app.time.split(':');
    
    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 minuters besökshorisont

    return {
      id: app._id,
      title: `${app.time} - ${app.patientName} (${app.reason})`,
      start: startDate,
      end: endDate,
      patientPersonalId: app.patientPersonalId,
      status: app.status
    };
  });

  return (
    <Container className='py-4'>
      <Row className='align-items-center mb-4'>
        <Col md={4}>
          <h2><FaCalendarAlt className='me-2 text-primary' /> Consultations & RDV</h2>
        </Col>
        <Col md={8} className='text-end d-flex justify-content-end align-items-center gap-2 flex-wrap'>
          {/* KNAPP FÖR ATT SKAPA RECEPTIONIST */}
          <Button variant='outline-secondary' onClick={() => setShowRecModal(true)}>
            <FaUserPlus className='me-1' /> Créer un Réceptionniste
          </Button>

          {/* VÄXLA VY: TABELL ELLER KALENDER */}
          <ButtonGroup>
            <Button 
              variant={viewMode === 'table' ? 'primary' : 'outline-primary'} 
              onClick={() => setViewMode('table')}
            >
              <FaTable className='me-1' /> Tableau
            </Button>
            <Button 
              variant={viewMode === 'calendar' ? 'primary' : 'outline-primary'} 
              onClick={() => setViewMode('calendar')}
            >
              <FaThLarge className='me-1' /> Calendrier
            </Button>
          </ButtonGroup>

          <Button variant='success' onClick={() => setShowModal(true)}>
            <FaPlus className='me-1' /> Nouveau RDV Patient
          </Button>
        </Col>
      </Row>

      {/* SÖKFÄLT */}
      <InputGroup className='mb-3'>
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          placeholder='Rechercher par nom de patient, numéro d identité, date ou motif...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {/* 1. VISNING: TABELLVY */}
      {viewMode === 'table' && (
        <Card className='shadow-sm'>
          <Card.Header className='bg-light fw-bold'>
            <FaClipboardList className='me-2 text-primary' /> Consultations programmées ({filteredAppointments.length})
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive size='sm' className='mb-0'>
              <thead>
                <tr>
                  <th>Date & Heure</th>
                  <th>Patient</th>
                  <th>N° d'identité</th>
                  <th>Motif de consultation</th>
                  <th>Médecin responsable</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan='7' className='text-center py-3 text-muted'>
                      Aucun rendez-vous trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div className='fw-bold'><FaCalendarAlt className='me-1 text-secondary' />{app.date}</div>
                        <small className='text-muted'><FaClock className='me-1' />{app.time}</small>
                      </td>
                      <td>
                        <span
                          role='button'
                          className='text-primary text-decoration-underline fw-bold'
                          onClick={() => navigate(`/patient/${app.patientPersonalId}`)}
                        >
                          {app.patientName}
                        </span>
                      </td>
                      <td>{app.patientPersonalId}</td>
                      <td>{app.reason}</td>
                      <td>{app.doctorName}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        {(app.status === 'Bokad' || app.status === 'Programmé') && (
                          <>
                            <Button
                              variant='outline-success'
                              size='sm'
                              className='me-1'
                              title='Marquer comme effectué'
                              onClick={() => handleStatusChange(app._id, 'Genomförd')}
                            >
                              <FaCheck />
                            </Button>
                            <Button
                              variant='outline-danger'
                              size='sm'
                              title='Annuler le rendez-vous'
                              onClick={() => handleStatusChange(app._id, 'Avbokad')}
                            >
                              <FaTimes />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* 2. VISNING: KALENDERVY */}
      {viewMode === 'calendar' && (
        <Card className='shadow-sm p-3'>
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor='start'
              endAccessor='end'
              culture='fr'
              messages={{
                next: "Suivant",
                previous: "Précédent",
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                agenda: "Agenda",
              }}
              onSelectEvent={(event) => navigate(`/patient/${event.patientPersonalId}`)}
            />
          </div>
        </Card>
      )}

      {/* MODAL: NY BOKNING */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FaCalendarAlt className='me-2' /> Programmer un nouveau rendez-vous</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateAppointment}>
            <Form.Group className='mb-3'>
              <Form.Label>Nom du patient</Form.Label>
              <Form.Control
                type='text'
                placeholder='Prénom Nom'
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Numéro d'identité / Sécurité Sociale</Form.Label>
              <Form.Control
                type='text'
                placeholder='AAAAMMJJXXXX'
                value={patientPersonalId}
                onChange={(e) => setPatientPersonalId(e.target.value)}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type='date'
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Heure</Form.Label>
                  <Form.Control
                    type='time'
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3'>
              <Form.Label>Motif de consultation / Symptômes</Form.Label>
              <Form.Control
                as='textarea'
                rows={2}
                placeholder='Ex. Suivi de tension artérielle, Visite de contrôle, Examen...'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Form.Group>

            <div className='text-end'>
              <Button variant='secondary' className='me-2' onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant='primary' type='submit'>
                Créer le rendez-vous
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL: SKAPA RECEPTIONIST */}
      <Modal show={showRecModal} onHide={() => setShowRecModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FaUserPlus className='me-2' /> Créer un compte réceptionniste</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateReceptionist}>
            <Form.Group className='mb-3'>
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type='text'
                placeholder='Prénom Nom'
                value={recName}
                onChange={(e) => setRecName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Adresse e-mail</Form.Label>
              <Form.Control
                type='email'
                placeholder='receptionniste@hopital.com'
                value={recEmail}
                onChange={(e) => setRecEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type='password'
                placeholder='Choisissez un mot de passe sécurisé'
                value={recPassword}
                onChange={(e) => setRecPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className='text-end'>
              <Button variant='secondary' className='me-2' onClick={() => setShowRecModal(false)}>
                Annuler
              </Button>
              <Button variant='primary' type='submit'>
                Enregistrer le Réceptionniste
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AppointmentsScreen;