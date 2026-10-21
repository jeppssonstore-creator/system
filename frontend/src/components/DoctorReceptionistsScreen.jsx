import { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaUserShield, FaPlus, FaTrash, FaSearch, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const DoctorReceptionistsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const userRole = userInfo?.role?.toLowerCase() || '';
  const isDoctor = userRole === 'doctor' || userRole === 'doktor' || userRole === 'läkare';

  const [receptionists, setReceptionists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Formulär för ny receptionist
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sökfält för personnummer
  const [searchPersonalId, setSearchPersonalId] = useState('');

  const fetchReceptionists = async () => {
    try {
      const { data } = await axios.get('/api/users/receptionists', { withCredentials: true });
      setReceptionists(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des réceptionnistes:', err);
      toast.error('Impossible de récupérer les réceptionnistes');
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get('/api/patients/appointments', { withCredentials: true });
      setAppointments(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des rendez-vous:', err);
    }
  };

  useEffect(() => {
    if (isDoctor) {
      fetchReceptionists();
      fetchAppointments();
    }
  }, [isDoctor]);

  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!searchPersonalId.trim()) return;

    try {
      const { data } = await axios.get(`/api/patients/${searchPersonalId.trim()}`, { withCredentials: true });
      if (data && data.personalId) {
        navigate(`/patients/${data.personalId}`);
      }
    } catch (err) {
      toast.error("Patient introuvable avec ce numéro d'identité");
    }
  };

  const handleCreateReceptionist = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/users/receptionists',
        { name, email, password },
        { withCredentials: true }
      );
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchReceptionists();
      toast.success('Réceptionniste ajouté avec succès !');
    } catch (err) {
      toast.error(`Échec de l'ajout : ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce réceptionniste ?')) {
      try {
        await axios.delete(`/api/users/${id}`, { withCredentials: true });
        fetchReceptionists();
        toast.success('Réceptionniste supprimé.');
      } catch (err) {
        toast.error(`Échec de la suppression : ${err.response?.data?.message || err.message}`);
      }
    }
  };

  if (!isDoctor) return null;

  return (
    <div>
      {/* SÖKFÄLT FÖR PERSONNUMMER & SNABBÅTKOMST */}
      <Card className='shadow-sm mb-4 border-primary'>
        <Card.Body>
          <Form onSubmit={handleSearchPatient}>
            <Row className='align-items-center'>
              <Col md={4}>
                <h5 className='mb-0 text-primary'>
                  <FaSearch className='me-2' /> Recherche de patient
                </h5>
              </Col>
              <Col md={6}>
                <Form.Control
                  type='text'
                  placeholder="Entrer le numéro d'identité (ex. 19800811...)"
                  value={searchPersonalId}
                  onChange={(e) => setSearchPersonalId(e.target.value)}
                />
              </Col>
              <Col md={2} className='text-end'>
                <Button variant='primary' type='submit' className='w-100'>
                  Chercher
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* BOKNINGAR / KONSULTATIONER */}
      <Card className='shadow-sm mb-4'>
        <Card.Header className='bg-light fw-bold'>
          <FaCalendarAlt className='me-2 text-success' /> Consultations & Rendez-vous récents ({appointments.length})
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive size='sm' className='mb-0'>
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Patient</th>
                <th>N° d'identité</th>
                <th>Motif</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan='5' className='text-center py-3 text-muted'>
                    Aucun rendez-vous programmé pour le moment.
                  </td>
                </tr>
              ) : (
                appointments.map((app) => (
                  <tr key={app._id}>
                    <td>{app.date} à {app.time}</td>
                    <td>
                      <Button 
                        variant='link' 
                        className='p-0 text-decoration-none fw-bold'
                        onClick={() => navigate(`/patients/${app.patientPersonalId}`)}
                      >
                        <FaUser className='me-1' /> {app.patientName}
                      </Button>
                    </td>
                    <td>{app.patientPersonalId}</td>
                    <td>{app.reason}</td>
                    <td>
                      <Badge bg={app.status === 'Terminé' ? 'secondary' : 'success'}>
                        {app.status || 'Programmé'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* RECEPTIONISTER */}
      <Card className='shadow-sm mb-4'>
        <Card.Header className='bg-light d-flex justify-content-between align-items-center fw-bold'>
          <span>
            <FaUserShield className='me-2 text-primary' /> Mes réceptionnistes ({receptionists.length}/3)
          </span>
          
          {receptionists.length < 3 && (
            <Button variant='primary' size='sm' onClick={() => setShowModal(true)}>
              <FaPlus className='me-1' /> Ajouter un réceptionniste
            </Button>
          )}
        </Card.Header>

        <Card.Body>
          <Table striped bordered hover responsive size='sm' className='mb-0'>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse e-mail</th>
                <th className='text-end'>Action</th>
              </tr>
            </thead>
            <tbody>
              {receptionists.length === 0 ? (
                <tr>
                  <td colSpan='3' className='text-center py-3 text-muted'>
                    Aucun réceptionniste associé à votre compte pour le moment.
                  </td>
                </tr>
              ) : (
                receptionists.map((rec) => (
                  <tr key={rec._id}>
                    <td>{rec.name}</td>
                    <td>{rec.email}</td>
                    <td className='text-end'>
                      <Button
                        variant='outline-danger'
                        size='sm'
                        onClick={() => handleDelete(rec._id)}
                        title='Supprimer le réceptionniste'
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title><FaUserShield className='me-2' /> Ajouter un nouveau réceptionniste</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateReceptionist}>
              <Form.Group className='mb-3'>
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Prénom Nom'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Adresse e-mail</Form.Label>
                <Form.Control
                  type='email'
                  placeholder='nom@exemple.fr'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Au moins 6 caractères'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <div className='text-end'>
                <Button variant='secondary' className='me-2' onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button variant='primary' type='submit'>
                  Enregistrer & Associer
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Card>
    </div>
  );
};

export default DoctorReceptionistsScreen;