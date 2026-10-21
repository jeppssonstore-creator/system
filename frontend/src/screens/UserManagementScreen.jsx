import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, InputGroup } from 'react-bootstrap';
import { FaTrash, FaUserPlus, FaEdit, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // État du formulaire (Créer un nouvel utilisateur)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('doctor');
  const [phone, setPhone] = useState('');
  const [hospital, setHospital] = useState('');
  const [address, setAddress] = useState('');

  // État du formulaire (Modifier un utilisateur existant)
  const [editUserId, setEditUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('doctor');
  const [editPhone, setEditPhone] = useState('');
  const [editHospital, setEditHospital] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Récupérer tous les utilisateurs
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/users', { withCredentials: true });
      setUsers(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Créer un nouvel utilisateur en tant qu'Admin
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/users/admin-create',
        { name, email, password, role, phone, hospital, address },
        { withCredentials: true }
      );
      setShowCreateModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('doctor');
      setPhone('');
      setHospital('');
      setAddress('');
      fetchUsers();
    } catch (err) {
      alert(`Impossible de créer l'utilisateur : ${err.response?.data?.message || err.message}`);
    }
  };

  // Ouvrir la modale de modification avec TOUTES les données du profil
  const handleOpenEdit = (user) => {
    setEditUserId(user._id);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditRole(user.role || 'doctor');
    setEditPhone(user.phone || '');
    setEditHospital(user.hospital || '');
    setEditAddress(user.address || '');
    setShowEditModal(true);
  };

  // Enregistrer les modifications pour un utilisateur existant
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/users/${editUserId}`,
        { 
          name: editName, 
          email: editEmail, 
          role: editRole,
          phone: editPhone,
          hospital: editHospital,
          address: editAddress
        },
        { withCredentials: true }
      );
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      alert(`Impossible de mettre à jour l'utilisateur : ${err.response?.data?.message || err.message}`);
    }
  };

  // Supprimer un utilisateur
  const deleteHandler = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`/api/users/${id}`, { withCredentials: true });
        fetchUsers();
      } catch (err) {
        console.error('Erreur lors de la suppression :', err);
      }
    }
  };

  const getRoleBadge = (userRole) => {
    if (userRole === 'admin') return <Badge bg='danger'>Admin</Badge>;
    if (userRole === 'doctor' || userRole === 'doktor' || userRole === 'läkare') return <Badge bg='primary'>Médecin</Badge>;
    if (userRole === 'pharmacist') return <Badge bg='success'>Pharmacien</Badge>;
    if (userRole === 'receptionist') return <Badge bg='info'>Réceptionniste</Badge>;
    return <Badge bg='secondary'>{userRole}</Badge>;
  };

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.hospital && u.hospital.toLowerCase().includes(term)) ||
      (u.phone && u.phone.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <Row className='align-items-center mb-3'>
        <Col md={6}>
          <h2>Gestion des utilisateurs (Personnel & Admin)</h2>
        </Col>
        <Col md={6} className='text-end'>
          <Button variant='primary' onClick={() => setShowCreateModal(true)}>
            <FaUserPlus className='me-1' /> Enregistrer un nouveau membre
          </Button>
        </Col>
      </Row>

      {/* BARRE DE RECHERCHE */}
      <Row className='mb-3'>
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text id='basic-addon1'>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder='Rechercher par nom, e-mail, hôpital, téléphone ou rôle...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Table striped bordered hover responsive size='sm'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Adresse e-mail</th>
            <th>Hôpital / Clinique</th>
            <th>Téléphone</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td 
                  style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }}
                  onClick={() => handleOpenEdit(user)}
                  title='Cliquer pour voir/modifier le profil complet'
                >
                  {user.name}
                </td>
                <td>{user.email}</td>
                <td>{user.hospital || '-'}</td>
                <td>{user.phone || '-'}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>
                  <Button 
                    variant='outline-primary' 
                    size='sm' 
                    className='me-2' 
                    onClick={() => handleOpenEdit(user)}
                    title='Modifier l utilisateur'
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    variant='outline-danger' 
                    size='sm' 
                    onClick={() => deleteHandler(user._id)}
                    title='Supprimer l utilisateur'
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan='7' className='text-center py-3 text-muted'>
                Aucun utilisateur correspondant aux critères de recherche.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* MODALE : CRÉER UN NOUVEAU MEMBRE */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title><FaUserPlus className='me-2' /> Enregistrer un nouveau membre du personnel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Nom complet</Form.Label>
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
                  <Form.Label>Adresse e-mail</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='email@hopital.fr'
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
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Au moins 6 caractères'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Rôle</Form.Label>
                  <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value='doctor'>Médecin (Doctor)</option>
                    <option value='pharmacist'>Pharmacien (Pharmacist)</option>
                    <option value='admin'>Administrateur (Admin)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Numéro de téléphone</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='01 23 45 67 89'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Hôpital / Clinique</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Établissement de Santé'
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3'>
              <Form.Label>Adresse professionnelle / Cabinet</Form.Label>
              <Form.Control
                type='text'
                placeholder='Adresse, Code postal, Ville'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Form.Group>

            <div className='text-end mt-4'>
              <Button variant='secondary' className='me-2' onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
              <Button variant='primary' type='submit'>
                Créer l'utilisateur
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODALE : MODIFIER UN UTILISATEUR & VOIR LE PROFIL COMPLET */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title><FaEdit className='me-2' /> Modifier le profil de l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Nom complet</Form.Label>
                  <Form.Control
                    type='text'
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Adresse e-mail</Form.Label>
                  <Form.Control
                    type='email'
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Rôle</Form.Label>
                  <Form.Select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                    <option value='doctor'>Médecin (Doctor)</option>
                    <option value='pharmacist'>Pharmacien (Pharmacist)</option>
                    <option value='admin'>Administrateur (Admin)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Numéro de téléphone</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='01 XX XX XX XX'
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Hôpital / Clinique</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Ex. Centre Hospitalier Universitaire'
                    value={editHospital}
                    onChange={(e) => setEditHospital(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Adresse professionnelle / Cabinet</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Adresse, Ville'
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className='text-end mt-4'>
              <Button variant='secondary' className='me-2' onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button variant='primary' type='submit'>
                Enregistrer les modifications
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserManagementScreen;