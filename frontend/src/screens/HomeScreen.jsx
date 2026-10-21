import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaFileMedical, FaUserMd, FaCalendarCheck, FaShieldAlt, FaSearch, FaUser, FaUserPlus, FaPrescriptionBottleAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [searchPersonalId, setSearchPersonalId] = useState('');

  // States för modalen "Enregistrer un nouveau patient"
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPersonalId, setNewPersonalId] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newAllergies, setNewAllergies] = useState('');
  const [newWarnings, setNewWarnings] = useState('');

  // States för modalen "Établir une nouvelle e-ordonnance"
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

  const role = userInfo?.role?.toLowerCase() || '';
  const isPharmacy = role.includes('pharm') || role.includes('apotek') || role.includes('farm');
  const isDoctor = role === 'doctor' || role === 'doktor' || role === 'läkare';

  return (
    <div className='py-5'>
      {/* HERO SECTION */}
      <Container>
        <Row className='justify-content-center text-center mb-5'>
          <Col md={10} lg={8}>
            <div className='p-5 bg-light rounded-4 shadow-sm border'>
              <div className='text-primary mb-3'>
                <FaHospital size={64} />
              </div>
              <h1 className='display-5 fw-bold mb-3'>Système de Gestion Hospitalière</h1>
              <p className='lead text-muted mb-4'>
                Plateforme sécurisée pour la gestion des dossiers patients, des e-ordonnances et des flux de soins médicaux.
              </p>

              {userInfo ? (
                <div>
                  {/* SNABBSÖKNING FÖR INLOGGAD PERSONAL */}
                  <Card className='shadow-sm mb-4 border-primary bg-white'>
                    <Card.Body>
                      <Form onSubmit={handleSearchPatient}>
                        <Row className='align-items-center'>
                          <Col md={12} className='mb-2'>
                            <h6 className='text-primary fw-bold'>
                              <FaSearch className='me-2' /> Recherche rapide de patient par numéro d'identité
                            </h6>
                          </Col>
                          <Col md={8} className='mb-2 mb-md-0'>
                            <Form.Control
                              type='text'
                              placeholder="Entrer le numéro d'identité (ex. 19800811...)"
                              value={searchPersonalId}
                              onChange={(e) => setSearchPersonalId(e.target.value)}
                            />
                          </Col>
                          <Col md={4}>
                            <Button variant='primary' type='submit' className='w-100'>
                              Chercher
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </Card.Body>
                  </Card>

                  {/* SNABBVAL / KNAPPAR FÖR INLOGGAD ANVÄNDARE */}
                  <div className='d-flex justify-content-center gap-3 flex-wrap'>
                    {!isPharmacy && (
                      <Button variant='primary' size='md' onClick={() => navigate('/appointments')}>
                        <FaCalendarCheck className='me-2' /> Voir les rendez-vous
                      </Button>
                    )}
                    {!isPharmacy && (
                      <Button variant='success' size='md' onClick={() => setShowNewPatientModal(true)}>
                        <FaUserPlus className='me-2' /> Nouveau patient
                      </Button>
                    )}
                    {isDoctor && (
                      <Button variant='dark' size='md' onClick={() => setShowNewPrescriptionModal(true)}>
                        <FaPrescriptionBottleAlt className='me-2' /> Nouvelle ordonnance
                      </Button>
                    )}
                    <Button variant='info' size='md' className='text-white' onClick={() => navigate('/profile')}>
                      <FaUser className='me-2' /> Mon Profil
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='d-flex justify-content-center gap-3 flex-wrap'>
                  <Button variant='primary' size='lg' onClick={() => navigate('/login')} className='px-4'>
                    Se connecter
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* FUNKTIONSKORT / EGENSKAPER */}
        <Row className='g-4 text-center'>
          <Col md={4}>
            <Card className='h-100 shadow-sm border-0 rounded-4 p-3'>
              <Card.Body>
                <div className='text-primary mb-3'>
                  <FaFileMedical size={36} />
                </div>
                <Card.Title className='fw-bold'>E-Ordonnances</Card.Title>
                <Card.Text className='text-muted'>
                  Établissez et suivez l'historique des prescriptions médicales en toute sécurité et transparence.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className='h-100 shadow-sm border-0 rounded-4 p-3'>
              <Card.Body>
                <div className='text-success mb-3'>
                  <FaUserMd size={36} />
                </div>
                <Card.Title className='fw-bold'>Dossiers Patients</Card.Title>
                <Card.Text className='text-muted'>
                  Accédez rapidement aux antécédents, allergies et notes médicales via une recherche par identité.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className='h-100 shadow-sm border-0 rounded-4 p-3'>
              <Card.Body>
                <div className='text-warning mb-3'>
                  <FaShieldAlt size={36} />
                </div>
                <Card.Title className='fw-bold'>Accès Sécurisé</Card.Title>
                <Card.Text className='text-muted'>
                  Gestion des rôles (Médecins, Réceptionnistes, Administrateurs) avec une protection rigoureuse des données.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

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
    </div>
  );
};

export default HomeScreen;