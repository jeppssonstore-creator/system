import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Container, Nav, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserEdit, FaLock, FaHospital, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { setCredentials } from '../slices/authSlice';
import axios from 'axios';

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' ou 'password'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [hospital, setHospital] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Récupérer les données fraîches du profil directement depuis le backend au chargement du composant
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/users/profile', { withCredentials: true });
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setHospital(data.hospital || '');
        dispatch(setCredentials(data)); // Mettre à jour Redux avec les données fraîches
      } catch (err) {
        // En cas d'échec de la requête GET, utiliser userInfo depuis Redux en secours
        if (userInfo) {
          setName(userInfo.name || '');
          setEmail(userInfo.email || '');
          setPhone(userInfo.phone || '');
          setAddress(userInfo.address || '');
          setHospital(userInfo.hospital || '');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [dispatch]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSuccessMessage(null);

    if (activeTab === 'password' && password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          phone,
          address,
          hospital,
          ...(activeTab === 'password' && password ? { password } : {}),
        },
        { withCredentials: true }
      );

      // Mettre à jour Redux et l'état local
      dispatch(setCredentials(data));
      setName(data.name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setHospital(data.hospital || '');

      setSuccessMessage('Le profil a été mis à jour avec succès !');
      if (activeTab === 'password') {
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className='py-4'>
      <h2 className='mb-4'>Paramètres</h2>

      <Row>
        {/* Menu de gauche (Navigation des paramètres) */}
        <Col md={3} className='mb-3'>
          <Card className='shadow-sm'>
            <Card.Body className='p-0'>
              <Nav className='flex-column'>
                <Nav.Link 
                  className={`py-3 px-3 text-dark border-bottom ${activeTab === 'profile' ? 'fw-bold bg-light' : ''}`}
                  onClick={() => { setActiveTab('profile'); setMessage(null); setSuccessMessage(null); }}
                  style={{ cursor: 'pointer' }}
                >
                  <FaUserEdit className='me-2 text-primary' /> Paramètres du profil
                </Nav.Link>
                <Nav.Link 
                  className={`py-3 px-3 text-dark ${activeTab === 'password' ? 'fw-bold bg-light' : ''}`}
                  onClick={() => { setActiveTab('password'); setMessage(null); setSuccessMessage(null); }}
                  style={{ cursor: 'pointer' }}
                >
                  <FaLock className='me-2 text-primary' /> Changer de mot de passe
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        {/* Panneau de contenu de droite */}
        <Col md={9}>
          <Card className='shadow-sm'>
            <Card.Body className='p-4'>
              <h4 className='mb-3'>
                {activeTab === 'profile' ? 'Informations générales & Établissement' : 'Modifier le mot de passe'}
              </h4>
              <hr className='mb-4' />

              {message && <Alert variant='danger'>{message}</Alert>}
              {successMessage && <Alert variant='success'>{successMessage}</Alert>}

              {loading ? (
                <div className='text-center py-4'>
                  <Spinner animation='border' variant='primary' />
                </div>
              ) : (
                <Form onSubmit={submitHandler}>
                  {activeTab === 'profile' ? (
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group className='mb-3'>
                            <Form.Label>Nom complet *</Form.Label>
                            <Form.Control
                              type='text'
                              placeholder='Prénom Nom'
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className='mb-3'>
                            <Form.Label><FaEnvelope className='me-1 text-muted' /> Adresse e-mail *</Form.Label>
                            <Form.Control
                              type='email'
                              placeholder='nom@hopital.fr'
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className='mb-3'>
                            <Form.Label><FaPhone className='me-1 text-muted' /> Numéro de téléphone *</Form.Label>
                            <Form.Control
                              type='text'
                              placeholder='01 23 45 67 89'
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className='mb-3'>
                            <Form.Label><FaHospital className='me-1 text-muted' /> Hôpital / Clinique *</Form.Label>
                            <Form.Control
                              type='text'
                              placeholder='Établissement de Santé'
                              value={hospital}
                              onChange={(e) => setHospital(e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className='mb-3'>
                        <Form.Label><FaMapMarkerAlt className='me-1 text-muted' /> Adresse professionnelle</Form.Label>
                        <Form.Control
                          type='text'
                          placeholder='Ex. 1 Avenue de la République, Paris'
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </Form.Group>
                    </>
                  ) : (
                    <>
                      <Form.Group className='mb-3'>
                        <Form.Label>Nouveau mot de passe</Form.Label>
                        <Form.Control
                          type='password'
                          placeholder='Entrez le nouveau mot de passe'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                        <Form.Control
                          type='password'
                          placeholder='Répétez le nouveau mot de passe'
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </Form.Group>
                    </>
                  )}

                  <div className='text-end mt-4'>
                    <Button variant='primary' type='submit'>
                      Enregistrer les modifications
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileScreen;