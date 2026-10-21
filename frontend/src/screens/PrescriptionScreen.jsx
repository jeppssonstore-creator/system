import { useState, useEffect } from 'react';
import { Form, Button, Table, Row, Col, Badge, InputGroup, Modal, Alert, Spinner, Card } from 'react-bootstrap';
import { FaTrash, FaCheck, FaBan, FaPrint, FaSearch, FaPlus, FaExclamationTriangle, FaUserPlus, FaUser, FaFileMedical, FaUsers, FaClipboardCheck } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PrescriptionScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [prescriptions, setPrescriptions] = useState([]);
  
  // États des modales
  const [showModal, setShowModal] = useState(false); // Créer une ordonnance
  const [showPatientModal, setShowPatientModal] = useState(false); // Nouveau patient
  const [showRegistryModal, setShowRegistryModal] = useState(false); // Registre des patients
  
  const [patientsList, setPatientsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour la recherche dans la modale du registre des patients
  const [registrySearchTerm, setRegistrySearchTerm] = useState('');

  // États du formulaire
  const [patientName, setPatientName] = useState('');
  const [patientPersonalId, setPatientPersonalId] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [productName, setProductName] = useState('');
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState('');
  const [activeSubstance, setActiveSubstance] = useState('');
  const [genericsExchange, setGenericsExchange] = useState('');
  const [remainingWithdrawals, setRemainingWithdrawals] = useState(3);
  const [totalWithdrawals, setTotalWithdrawals] = useState(4);
  const [nextWithdrawalDate, setNextWithdrawalDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');

  // États du formulaire (Nouveau Patient)
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientId, setNewPatientId] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientAddress, setNewPatientAddress] = useState('');
  const [newPatientAllergies, setNewPatientAllergies] = useState('');
  const [newPatientWarnings, setNewPatientWarnings] = useState('');

  // États d'auto-remplissage et d'avertissement patient
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [patientError, setPatientError] = useState('');

  const fetchPrescriptions = async () => {
    try {
      const { data } = await axios.get('/api/prescriptions', { withCredentials: true });
      setPrescriptions(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des ordonnances :', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data } = await axios.get('/api/patients', { withCredentials: true });
      setPatientsList(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des patients :', err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  const handleOpenProfile = (personalId) => {
    if (!personalId) return;
    navigate(`/patient/${personalId}`);
  };

  const handlePersonalIdBlur = async () => {
    if (!patientPersonalId.trim()) return;

    setLoadingPatient(true);
    setPatientError('');
    setPatientInfo(null);

    try {
      const { data } = await axios.get(`/api/patients/${patientPersonalId}`, { withCredentials: true });
      if (data && data.name) {
        setPatientName(data.name);
        setPatientInfo(data);
      }
    } catch (err) {
      setPatientError("Patient introuvable dans le registre (vous pouvez saisir le nom manuellement ci-dessous).");
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setPatientInfo(null);
    setPatientError('');
    setPatientName('');
    setPatientPersonalId('');
    setMedicationName('');
    setProductName('');
    setStrength('');
    setForm('');
    setActiveSubstance('');
    setGenericsExchange('');
    setRemainingWithdrawals(3);
    setTotalWithdrawals(4);
    setNextWithdrawalDate('');
    setValidUntil('');
    setUsageInstructions('');
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert('Veuillez renseigner le nom du patient.');
      return;
    }

    if (!patientPersonalId.trim()) {
      alert("Veuillez renseigner le numéro d'identité du patient.");
      return;
    }

    try {
      await axios.post(
        '/api/prescriptions',
        {
          patientName,
          patientPersonalId,
          medicationName,
          productName,
          strength,
          form,
          activeSubstance,
          genericsExchange,
          remainingWithdrawals,
          totalWithdrawals,
          nextWithdrawalDate,
          validUntil,
          usageInstructions,
        },
        { withCredentials: true }
      );
      handleClose();
      fetchPrescriptions();
    } catch (err) {
      alert(`Impossible d'enregistrer l'ordonnance : ${err.response?.data?.message || err.message}`);
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/patients',
        { 
          name: newPatientName, 
          personalId: newPatientId, 
          phone: newPatientPhone, 
          address: newPatientAddress, 
          allergies: newPatientAllergies, 
          warnings: newPatientWarnings 
        },
        { withCredentials: true }
      );
      alert('Le patient a bien été enregistré dans le registre !');
      setNewPatientName('');
      setNewPatientId('');
      setNewPatientPhone('');
      setNewPatientAddress('');
      setNewPatientAllergies('');
      setNewPatientWarnings('');
      setShowPatientModal(false);
      fetchPatients();
    } catch (err) {
      alert(`Impossible d'enregistrer le patient : ${err.response?.data?.message || err.message}`);
    }
  };

  const updateStatusHandler = async (prescription, explicitStatus = null) => {
    try {
      if (explicitStatus === 'Makulerat' || explicitStatus === 'Annulé') {
        await axios.put(
          `/api/prescriptions/${prescription._id}`,
          { status: 'Annulé' },
          { withCredentials: true }
        );
        fetchPrescriptions();
        return;
      }

      if (prescription.remainingWithdrawals <= 0) {
        alert("Il ne reste plus aucun renouvellement disponible pour cette ordonnance !");
        return;
      }

      const newRemaining = prescription.remainingWithdrawals - 1;
      const updatedStatus = newRemaining === 0 ? 'Entièrement dispensé' : 'Actif';
      const now = new Date().toISOString();

      await axios.put(
        `/api/prescriptions/${prescription._id}`,
        { 
          status: updatedStatus,
          remainingWithdrawals: newRemaining,
          lastWithdrawalDate: now
        },
        { withCredentials: true }
      );

      fetchPrescriptions();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut :', err);
      alert(`Impossible d'effectuer le prélèvement : ${err.response?.data?.message || err.message}`);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette e-ordonnance ?')) {
      try {
        await axios.delete(`/api/prescriptions/${id}`, { withCredentials: true });
        fetchPrescriptions();
      } catch (err) {
        console.error('Erreur lors de la suppression :', err);
      }
    }
  };

  const printHandler = (p) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>E-Ordonnance - ${p.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .box { border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SYSTÈME DE GESTION - E-ORDONNANCE</h2>
            <p>Date d'émission : ${new Date(p.issueDate || Date.now()).toLocaleDateString('fr-FR')}</p>
          </div>
          <div class="box">
            <p><span class="label">Patient :</span> ${p.patientName}</p>
            <p><span class="label">N° d'identité :</span> ${p.patientPersonalId || p.personalId}</p>
          </div>
          <div class="box">
            <p><span class="label">Médicament :</span> ${p.medicationName || p.medication}</p>
            <p><span class="label">Produit & Dosage :</span> ${p.productName || ''} ${p.strength || ''}, ${p.form || ''}</p>
            <p><span class="label">Substance active :</span> ${p.activeSubstance || ''}</p>
            <p><span class="label">Renouvellements restants :</span> ${p.remainingWithdrawals} sur ${p.totalWithdrawals}</p>
            <p><span class="label">Dernier prélèvement :</span> ${p.lastWithdrawalDate ? new Date(p.lastWithdrawalDate).toLocaleDateString('fr-FR') : 'Aucun prélèvement pour le moment'}</p>
            <p><span class="label">Posologie / Utilisation :</span> ${p.usageInstructions || p.dosage || 'Aucune consigne particulière'}</p>
            <p><span class="label">Valide jusqu'au :</span> ${p.validUntil ? new Date(p.validUntil).toLocaleDateString('fr-FR') : 'Non spécifié'}</p>
            <p><span class="label">Statut :</span> ${p.status || 'Actif'}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    const name = p.patientName ? p.patientName.toLowerCase() : '';
    const id = p.patientPersonalId || p.personalId || '';
    const med = p.medicationName || p.medication || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || id.includes(search) || med.toLowerCase().includes(search);
  });

  const filteredRegistryPatients = patientsList.filter((pat) => {
    const term = registrySearchTerm.toLowerCase();
    return (
      (pat.name && pat.name.toLowerCase().includes(term)) ||
      (pat.personalId && pat.personalId.toLowerCase().includes(term)) ||
      (pat.phone && pat.phone.toLowerCase().includes(term)) ||
      (pat.address && pat.address.toLowerCase().includes(term)) ||
      (pat.allergies && pat.allergies.toLowerCase().includes(term)) ||
      (pat.warnings && pat.warnings.toLowerCase().includes(term))
    );
  });

  const totalPrescriptions = prescriptions.length;
  const activePrescriptions = prescriptions.filter((p) => !p.status || p.status === 'Aktivt' || p.status === 'Actif').length;
  const totalPatients = patientsList.length;

  return (
    <div>
      <Row className='align-items-center mb-3'>
        <Col>
          <h2>Gestion des Ordonnances</h2>
        </Col>
        <Col className='text-end'>
          <Button variant='outline-secondary' className='me-2' onClick={() => { fetchPatients(); setShowRegistryModal(true); }}>
            <FaUser className='me-1' /> Registre des patients
          </Button>

          {(userInfo?.role === 'doctor' || userInfo?.role === 'doktor' || userInfo?.role === 'läkare') && (
            <>
              <Button variant='outline-primary' className='me-2' onClick={() => setShowPatientModal(true)}>
                <FaUserPlus className='me-1' /> Nouveau patient
              </Button>
              <Button variant='primary' onClick={() => setShowModal(true)}>
                <FaPlus className='me-1' /> Créer une e-ordonnance
              </Button>
            </>
          )}
        </Col>
      </Row>

      {/* CARTES DE STATISTIQUES */}
      <Row className='mb-4'>
        <Col md={4} className='mb-2'>
          <Card bg='light' text='dark' className='shadow-sm'>
            <Card.Body className='d-flex align-items-center'>
              <FaFileMedical size={35} className='text-primary me-3' />
              <div>
                <Card.Title className='fs-6 mb-0 text-muted'>Total des ordonnances</Card.Title>
                <Card.Text className='fs-4 fw-bold mb-0'>{totalPrescriptions}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className='mb-2'>
          <Card bg='light' text='dark' className='shadow-sm'>
            <Card.Body className='d-flex align-items-center'>
              <FaClipboardCheck size={35} className='text-success me-3' />
              <div>
                <Card.Title className='fs-6 mb-0 text-muted'>Ordonnances actives</Card.Title>
                <Card.Text className='fs-4 fw-bold mb-0'>{activePrescriptions}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className='mb-2'>
          <Card bg='light' text='dark' className='shadow-sm'>
            <Card.Body className='d-flex align-items-center'>
              <FaUsers size={35} className='text-info me-3' />
              <div>
                <Card.Title className='fs-6 mb-0 text-muted'>Patients enregistrés</Card.Title>
                <Card.Text className='fs-4 fw-bold mb-0'>{totalPatients}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <InputGroup className='mb-3'>
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          placeholder="Rechercher par numéro d'identité, nom ou médicament..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <Table striped bordered hover responsive size='sm'>
        <thead>
          <tr>
            <th>Patient</th>
            <th>N° d'identité</th>
            <th>Médicament / Produit</th>
            <th>Substance active</th>
            <th>Renouvellements restants / Dernier prélèvement</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPrescriptions.length === 0 ? (
            <tr>
              <td colSpan='7' className='text-center py-3'>Aucune e-ordonnance trouvée.</td>
            </tr>
          ) : (
            filteredPrescriptions.map((p) => {
              const pid = p.patientPersonalId || p.personalId;
              return (
                <tr key={p._id}>
                  <td>
                    <span 
                      role='button' 
                      className='text-primary text-decoration-underline fw-bold' 
                      onClick={() => handleOpenProfile(pid)}
                    >
                      {p.patientName}
                    </span>
                  </td>
                  <td>{pid}</td>
                  <td>{p.medicationName || p.medication} {p.strength ? `(${p.strength})` : ''}</td>
                  <td>{p.activeSubstance || '-'}</td>
                  <td>
                    <div className='fw-bold'>{p.remainingWithdrawals !== undefined ? `${p.remainingWithdrawals} sur ${p.totalWithdrawals}` : '-'}</div>
                    <small className='text-muted'>
                      {p.lastWithdrawalDate ? `Dernier : ${new Date(p.lastWithdrawalDate).toLocaleDateString('fr-FR')}` : 'Aucun prélèvement'}
                    </small>
                  </td>
                  <td>
                    <Badge bg={p.status === 'Slutexpedierat' || p.status === 'Entièrement dispensé' ? 'secondary' : p.status === 'Makulerat' || p.status === 'Annulé' ? 'danger' : 'success'}>
                      {p.status === 'Aktivt' ? 'Actif' : p.status || 'Actif'}
                    </Badge>
                  </td>
                  <td>
                    <Button 
                      variant='outline-success' 
                      size='sm' 
                      className='me-1' 
                      title='Effectuer un prélèvement (dispenser)' 
                      onClick={() => updateStatusHandler(p)}
                      disabled={p.remainingWithdrawals <= 0 || p.status === 'Slutexpedierat' || p.status === 'Entièrement dispensé' || p.status === 'Makulerat' || p.status === 'Annulé'}
                    >
                      <FaCheck />
                    </Button>
                    
                    {(userInfo?.role === 'doctor' || userInfo?.role === 'doktor' || userInfo?.role === 'läkare') && (
                      <>
                        <Button variant='outline-warning' size='sm' className='me-1' title='Annuler' onClick={() => updateStatusHandler(p, 'Annulé')}><FaBan /></Button>
                        <Button variant='outline-primary' size='sm' className='me-1' title='Imprimer / PDF' onClick={() => printHandler(p)}><FaPrint /></Button>
                        <Button variant='outline-danger' size='sm' title='Supprimer' onClick={() => deleteHandler(p._id)}><FaTrash /></Button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      {/* MODALE : CRÉER UNE NOUVELLE E-ORDONNANCE */}
      <Modal show={showModal} onHide={handleClose} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title>Établir une nouvelle e-ordonnance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {patientError && <Alert variant='warning' className='py-2 small'>{patientError}</Alert>}
          <Form onSubmit={submitHandler}>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Numéro d'identité</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='AAAAMMJJXXXX'
                    value={patientPersonalId}
                    onChange={(e) => setPatientPersonalId(e.target.value)}
                    onBlur={handlePersonalIdBlur}
                    required
                  />
                  {loadingPatient && <Spinner animation='border' size='sm' className='mt-1' />}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Nom du patient</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Récupéré automatiquement ou saisi manuellement'
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {patientInfo && (
              <Alert variant='info' className='py-2'>
                <div className='small'>
                  <FaExclamationTriangle className='me-1 text-warning' />
                  <strong>Allergies :</strong> {patientInfo.allergies || 'Aucune'} <br />
                  <strong>Avertissements :</strong> {patientInfo.warnings || 'Aucun'}
                </div>
              </Alert>
            )}

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
              <Button variant='secondary' className='me-2' onClick={handleClose}>Annuler</Button>
              <Button variant='primary' type='submit'>Enregistrer l'e-ordonnance</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODALE : REGISTRE DES PATIENTS */}
      <Modal show={showRegistryModal} onHide={() => setShowRegistryModal(false)} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title>Patients enregistrés</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className='mb-3'>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder='Rechercher par nom, numéro d identité, téléphone, adresse, allergies ou avertissements...'
              value={registrySearchTerm}
              onChange={(e) => setRegistrySearchTerm(e.target.value)}
            />
          </InputGroup>

          <Table striped bordered hover size='sm'>
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
              {filteredRegistryPatients.length === 0 ? (
                <tr><td colSpan='6' className='text-center py-3 text-muted'>Aucun patient correspondant trouvé.</td></tr>
              ) : (
                filteredRegistryPatients.map((pat) => (
                  <tr key={pat._id}>
                    <td>
                      <span 
                        role='button' 
                        className='text-primary text-decoration-underline' 
                        onClick={() => { setShowRegistryModal(false); handleOpenProfile(pat.personalId); }}
                      >
                        {pat.name}
                      </span>
                    </td>
                    <td>{pat.personalId}</td>
                    <td>{pat.phone || '-'}</td>
                    <td>{pat.address || '-'}</td>
                    <td>{pat.allergies || '-'}</td>
                    <td>{pat.warnings || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowRegistryModal(false)}>Fermer</Button>
        </Modal.Footer>
      </Modal>

      {/* MODALE : NOUVEAU PATIENT */}
      <Modal show={showPatientModal} onHide={() => setShowPatientModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FaUserPlus className='me-2' /> Enregistrer un nouveau patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePatientSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Nom complet</Form.Label>
              <Form.Control
                type='text'
                placeholder='Prénom Nom'
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Numéro d'identité</Form.Label>
              <Form.Control
                type='text'
                placeholder='AAAAMMJJXXXX'
                value={newPatientId}
                onChange={(e) => setNewPatientId(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Numéro de téléphone</Form.Label>
              <Form.Control
                type='text'
                placeholder='01 23 45 67 89'
                value={newPatientPhone}
                onChange={(e) => setNewPatientPhone(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type='text'
                placeholder='123 Rue de la République, Paris'
                value={newPatientAddress}
                onChange={(e) => setNewPatientAddress(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Allergies</Form.Label>
              <Form.Control
                type='text'
                placeholder='Ex. Pénicilline, Pollen (ou Aucune)'
                value={newPatientAllergies}
                onChange={(e) => setNewPatientAllergies(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Avertissements / Antécédents médicaux</Form.Label>
              <Form.Control
                type='text'
                placeholder='Ex. Hémophilie, Diabète'
                value={newPatientWarnings}
                onChange={(e) => setNewPatientWarnings(e.target.value)}
              />
            </Form.Group>

            <div className='text-end'>
              <Button variant='secondary' className='me-2' onClick={() => setShowPatientModal(false)}>Annuler</Button>
              <Button variant='primary' type='submit'>Enregistrer le patient</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PrescriptionScreen;