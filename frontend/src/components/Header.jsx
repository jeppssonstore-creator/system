import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaUser, FaSignOutAlt, FaHospital, FaUserMd, FaPrescriptionBottle, FaConciergeBell } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../slices/authSlice';
import axios from 'axios';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      await axios.post('/api/users/logout', {}, { withCredentials: true });
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  // Bestäm färg, ikon och text baserat på roll
  const getRoleBadge = (role) => {
    const r = role?.toLowerCase() || '';
    if (r.includes('doctor') || r.includes('doktor') || r.includes('läkare')) {
      return { bg: 'success', text: 'Médecin', icon: <FaUserMd className='me-1' /> };
    }
    if (r.includes('pharm') || r.includes('apotek') || r.includes('farm')) {
      return { bg: 'warning', text: 'Pharmacie', icon: <FaPrescriptionBottle className='me-1' /> };
    }
    if (r.includes('reception') || r.includes('mottag')) {
      return { bg: 'info', text: 'Réception', icon: <FaConciergeBell className='me-1' /> };
    }
    return { bg: 'secondary', text: role || 'Utilisateur', icon: <FaUser className='me-1' /> };
  };

  const roleInfo = userInfo ? getRoleBadge(userInfo.role) : null;

  return (
    <Navbar bg='dark' variant='dark' expand='lg' collapseOnSelect className='shadow-sm px-3'>
      <Container fluid>
        {/* TITEL UPPDATERAD HÄR */}
        <Navbar.Brand as={Link} to='/' className='fw-bold d-flex align-items-center gap-2 fs-5'>
          <FaHospital className='text-primary fs-4' />
          <span>Système de Gestion Hospitalière</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls='basic-navbar-nav' />

        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='ms-auto align-items-center gap-2'>
            {userInfo ? (
              <NavDropdown
                title={
                  <span className='d-inline-flex align-items-center gap-2 text-white fw-semibold'>
                    <FaUser className='text-light' />
                    {userInfo.name || 'Utilisateur'}
                    <Badge bg={roleInfo.bg} className='text-dark px-2 py-1 fs-7 rounded-pill d-flex align-items-center'>
                      {roleInfo.icon} {roleInfo.text}
                    </Badge>
                  </span>
                }
                id='username'
                align='end'
              >
                <NavDropdown.Item as={Link} to='/profile' className='d-flex align-items-center gap-2'>
                  <FaUser className='text-primary' /> Mon Profil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logoutHandler} className='d-flex align-items-center gap-2 text-danger'>
                  <FaSignOutAlt /> Déconnexion
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to='/login' className='text-white fw-bold'>
                Se connecter
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;