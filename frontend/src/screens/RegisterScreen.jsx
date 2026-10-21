import { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('doctor'); // Valeur par défaut : médecin

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
    } else {
      try {
        // Envoi du rôle à la mutation backend
        const res = await register({ name, email, password, role }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate('/');
      } catch (err) {
        toast.error(err?.data?.message || err.error || 'Échec de l\'inscription');
      }
    }
  };

  return (
    <FormContainer>
      <h1>S'inscrire</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className='my-2' controlId='name'>
          <Form.Label>Nom complet</Form.Label>
          <Form.Control
            type='text'
            placeholder='Entrez votre nom'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='email'>
          <Form.Label>Adresse e-mail</Form.Label>
          <Form.Control
            type='email'
            placeholder='Entrez votre e-mail'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        {/* Sélection du rôle (Médecin ou Pharmacie) */}
        <Form.Group className='my-2' controlId='role'>
          <Form.Label>Sélectionner le rôle</Form.Label>
          <Form.Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value='doctor'>Médecin</option>
            <option value='pharmacist'>Pharmacie</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className='my-2' controlId='password'>
          <Form.Label>Mot de passe</Form.Label>
          <Form.Control
            type='password'
            placeholder='Entrez le mot de passe'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='confirmPassword'>
          <Form.Label>Confirmer le mot de passe</Form.Label>
          <Form.Control
            type='password'
            placeholder='Confirmez le mot de passe'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Button type='submit' variant='primary' className='mt-3' disabled={isLoading}>
          {isLoading ? 'Inscription en cours...' : "S'inscrire"}
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className='py-3'>
        <Col>
          Vous avez déjà un compte ? <Link to={`/login`}>Se connecter</Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;