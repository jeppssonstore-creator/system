import { useState, useEffect } from 'react';
import { Nav, Button, Modal, Form, Row, Col, Table, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUsers, 
  FaUserPlus, 
  FaFileMedical, 
  FaPlusCircle, 
  FaUserTie, 
  FaBars, 
  FaTimes,
  FaSearch
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const role = userInfo?.role?.toLowerCase() || '';
  const isPharmacy = role.includes('pharm') || role.includes('apotek') || role.includes('farm');
  const isDoctor = role === 'doctor' || role === 'doktor' || role === 'läkare';

  // State för "Registre des patients"-modalen
  const [showPatientsModal, setShowPatientsModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  // State för "Enregistrer un nouveau patient"-modalen
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPersonalId, setNewPersonalId] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newAllergies, setNewAllergies] = useState('');
  const [newWarnings, setNewWarnings] = useState('');

  // State för "Établir une nouvelle e-ordonnance"-modalen
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);
  const [prescriptionPatientId, setPrescriptionPatientId] = useState('');
  const [prescriptionPatientName, setPrescriptionPatientName] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [productName, setProductName] = useState('');
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState('');
  const [activeSubstance, setActiveSubstance] = useState('');
  const [remainingWithdrawals, setRemainingWithdrawals] = useState(3);
  const [totalWithdrawals, setTotalWithdrawals] = useState(4);
  const [validUntil, setValidUntil] = useState('');
  const [genericsExchange, setGenericsExchange] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');

  // Hämta patienter när modalen öppnas
  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const { data } = await axios.get('/api/patients', { withCredentials: true });
      setPatients(data);
    } catch (err) {
      toast.error("Impossible de charger la liste des patients.");
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleOpenPatientsModal = () => {
    setShowPatientsModal(true);
    fetchPatients();
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/patients',
        {
          name: newName,
          personalId: newPersonalId,
          phone: newPhone,
          address: newAddress,
          allergies: newAllergies,
          warnings: newWarnings,
        },
        { withCredentials: true }
      );
      setShowNewPatientModal(false);
      setNewName('');
      setNewPersonalId('');
      setNewPhone('');
      setNewAddress('');
      setNewAllergies('');
      setNewWarnings('');
      toast.success('Patient enregistré avec succès !');
    } catch (err) {
      toast.error(`Erreur : ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCreatePrescriptionGlobal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/prescriptions',
        {
          patientPersonalId: prescriptionPatientId,
          patientName: prescriptionPatientName || 'Patient',
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
      setShowNewPrescriptionModal(false);
      setPrescriptionPatientId('');
      setPrescriptionPatientName('');
      setMedicationName('');
      setProductName('');
      setStrength('');
      setForm('');
      setActiveSubstance('');
      setRemainingWithdrawals(3);
      setTotalWithdrawals(4);
      setValidUntil('');
      setGenericsExchange('');
      setUsageInstructions('');
      toast.success("E-ordonnance enregistrée avec succès !");
    } catch (err) {
      toast.error(`Erreur : ${err.response?.data?.message || err.message}`);
    }
  };

  // Filtrera patienter baserat på sökning i modalen
  const filteredPatients = patients.filter((p) => {
    const query = patientSearchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.personalId && p.personalId.toLowerCase().includes(query)) ||
      (p.phone && p.phone.toLowerCase().includes(query)) ||
      (p.address && p.address.toLowerCase().includes(query)) ||
      (p.allergies && p.allergies.toLowerCase().includes(query)) ||
      (p.warnings && p.warnings.toLowerCase().includes(query))
    );
  });

  if (!userInfo) return null;

  return (
    <>
      <Button 
        variant='light' 
        className='d-md-none m-2 border' 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </Button>

      <div className={`sidebar-container bg-white border-end p-3 ${isOpen ? 'd-block' : 'd-none d-md-block'}`} 
           style={{ width: '260px', minHeight: 'calc(100vh - 56px)', position: 'sticky', top: '0' }}>
        
        <div className='text-muted small text-uppercase fw-bold mb-3 px-2'>
          Menu Principal
        </div>

        <Nav className='flex-column gap-1'>
          {/* Dashboard */}
          <Nav.Link 
            as={Link} 
            to='/' 
            active={location.pathname === '/'}
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded ${location.pathname === '/' ? 'bg-primary text-white' : 'text-dark'}`}
          >
            <FaHome /> Dashboard
          </Nav.Link>

          {/* Rendez-vous / Bokningar (Döljs för apotek) */}
          {!isPharmacy && (
            <Nav.Link 
              as={Link} 
              to='/appointments' 
              active={location.pathname === '/appointments'}
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded ${location.pathname === '/appointments' ? 'bg-primary text-white' : 'text-dark'}`}
            >
              <FaCalendarAlt /> Rendez-vous
            </Nav.Link>
          )}

          {/* Registre des patients / Öppnar modalen på bilden */}
          <Nav.Link 
            onClick={handleOpenPatientsModal}
            className='d-flex align-items-center gap-3 px-3 py-2 rounded text-dark'
            style={{ cursor: 'pointer' }}
          >
            <FaUsers className='text-primary' /> Registre des patients
          </Nav.Link>

          {/* Registrera ny patient (Öppnar Modal) */}
          {!isPharmacy && (
            <Nav.Link 
              onClick={() => setShowNewPatientModal(true)}
              className='d-flex align-items-center gap-3 px-3 py-2 rounded text-dark'
              style={{ cursor: 'pointer' }}
            >
              <FaUserPlus className='text-success' /> Nouveau patient
            </Nav.Link>
          )}

          {/* Prescriptions / Ordonnances */}
          <Nav.Link 
            as={Link} 
            to='/prescriptions' 
            active={location.pathname === '/prescriptions'}
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded ${location.pathname === '/prescriptions' ? 'bg-primary text-white' : 'text-dark'}`}
          >
            <FaFileMedical /> Prescriptions
          </Nav.Link>

          {/* Ny medicin / e-ordonnance (Endast läkare) */}
          {isDoctor && (
            <Nav.Link 
              onClick={() => setShowNewPrescriptionModal(true)}
              className='d-flex align-items-center gap-3 px-3 py-2 rounded text-dark'
              style={{ cursor: 'pointer' }}
            >
              <FaPlusCircle className='text-primary' /> Nouvelle ordonnance
            </Nav.Link>
          )}

          {/* Receptionister / Personal */}
          <Nav.Link 
            as={Link} 
            to='/receptionists' 
            active={location.pathname === '/receptionists'}
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded ${location.pathname === '/receptionists' ? 'bg-primary text-white' : 'text-dark'}`}
          >
            <FaUserTie /> Réceptionnistes
          </Nav.Link>
        </Nav>
      </div>

      {/* MODALE : REGISTRE DES PATIENTS (PATIENTS ENREGISTRÉS) */}
      <Modal show={showPatientsModal} onHide={() => setShowPatientsModal(false)} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title><FaUsers className='me-2' /> Patients enregistrés</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Sökfält i modalen */}
          <div className='mb-3 position-relative'>
            <Form.Control
              type='text'
              placeholder='Rechercher par nom, numéro d identité, téléphone, adresse, allergies ou avertissements...'
              value={patientSearchQuery}
              onChange={(e) => setPatientSearchQuery(e.target.value)}
              style={{ paddingLeft: '35px' }}
            />
            <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#888' }} />
          </div>

          {loadingPatients ? (
            <div className='text-center py-4'>
              <Spinner animation='border' variant='primary' />
            </div>
          ) : (
            <Table striped bordered hover responsive size='sm' className='align-middle'>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>N° d'identité</th>
                  <th>Téléphone</th>
                  <th>Adresse</th>
                  <th>Allergies</th>
                  <th>Avertissements</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan='6' className='text-center py-3 text-muted'>
                      Aucun patient trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p._id || p.personalId}>
                      <td>
                        <Button 
                          variant='link' 
                          className='p-0 text-start text-decoration-underline'
                          onClick={() => {
                            setShowPatientsModal(false);
                            navigate(`/patients/${p.personalId}`);
                          }}
                        >
                          {p.name}
                        </Button>
                      </td>
                      <td>{p.personalId}</td>
                      <td>{p.phone || '-'}</td>
                      <td>{p.address || '-'}</td>
                      <td>
                        <span className={p.allergies && p.allergies !== 'Aucune allergie connue' ? 'text-danger' : ''}>
                          {p.allergies || 'Inga kända allergier'}
                        </span>
                      </td>
                      <td>{p.warnings || 'Inga varningar'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowPatientsModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODALE : ENREGISTRER UN NOUVEAU PATIENT */}
      <Modal show={showNewPatientModal} onHide={() => setShowNewPatientModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FaUserPlus className='me-2' /> Enregistrer un nouveau patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegisterPatient}>
            <Form.Group className='mb-3'>
              <Form.Label>Nom complet</Form.Label>
              <Form.Control
                type='text'
                placeholder='Prénom Nom'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Numéro d'identité</Form.Label>
              <Form.Control
                type='text'
                placeholder='AAAAMMJJXXXX'
                value={newPersonalId}
                onChange={(e) => setNewPersonalId(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Numéro de téléphone</Form.Label>
              <Form.Control
                type='text'
                placeholder='01 23 45 67 89'
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type='text'
                placeholder='123 Rue de la République, Paris'
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Allergies</Form.Label>
              <Form.Control
                type='text'
                placeholder='Ex. Pénicilline, Pollen (ou Aucune)'
                value={newAllergies}
                onChange={(e) => setNewAllergies(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Avertissements / Antécédents médicaux</Form.Label>
              <Form.Control
                type='text'
                placeholder='Ex. Hémophilie, Diabète'
                value={newWarnings}
                onChange={(e) => setNewWarnings(e.target.value)}
              />
            </Form.Group>

            <div className='text-end'>
              <Button variant='secondary' className='me-2' onClick={() => setShowNewPatientModal(false)}>
                Annuler
              </Button>
              <Button variant='primary' type='submit'>
                Enregistrer le patient
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODALE : ÉTABLIR UNE NOUVELLE E-ORDONNANCE */}
      <Modal show={showNewPrescriptionModal} onHide={() => setShowNewPrescriptionModal(false)} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title><FaFileMedical className='me-2' /> Établir une nouvelle e-ordonnance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreatePrescriptionGlobal}>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Numéro d'identité</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='AAAAMMJJXXXX'
                    value={prescriptionPatientId}
                    onChange={(e) => setPrescriptionPatientId(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Nom du patient</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Récupéré automatiquement ou saisi manuellement'
                    value={prescriptionPatientName}
                    onChange={(e) => setPrescriptionPatientName(e.target.value)}
                  />
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
                  <Form.Label>Nombre total de renouvellements</Form.Label>
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
              <Form.Label>Informations de substitution (facultatif)</Form.Label>
              <Form.Control
                type='text'
                placeholder='Ex. Remplacé par Sertraline Zentiva 50 mg'
                value={genericsExchange}
                onChange={(e) => setGenericsExchange(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Posologie / Utilisation</Form.Label>
              <Form.Control
                as='textarea'
                rows={2}
                placeholder='Selon schéma thérapeutique distinct, 1 comprimé par jour...'
                value={usageInstructions}
                onChange={(e) => setUsageInstructions(e.target.value)}
                required
              />
            </Form.Group>

            <div className='text-end'>
              <Button variant='secondary' className='me-2' onClick={() => setShowNewPrescriptionModal(false)}>
                Annuler
              </Button>
              <Button variant='primary' type='submit'>
                Enregistrer l'e-ordonnance
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Sidebar;