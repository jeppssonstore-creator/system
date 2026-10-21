import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'admin') {
        navigate('/admin/userlist');
      } else if (userInfo.role === 'doctor' || userInfo.role === 'doktor' || userInfo.role === 'läkare') {
        navigate('/appointments'); // Redirection directe vers les rendez-vous pour les médecins
      } else {
        navigate('/prescriptions');
      }
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      
      if (res.role === 'admin') {
        navigate('/admin/userlist');
      } else if (res.role === 'doctor' || res.role === 'doktor' || res.role === 'läkare') {
        navigate('/appointments');
      } else {
        navigate('/prescriptions');
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Échec de la connexion');
    }
  };

  return (
    <FormContainer>
      <h1>Se connecter</h1>

      <Form onSubmit={submitHandler}>
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

        <Form.Group className='my-2' controlId='password'>
          <Form.Label>Mot de passe</Form.Label>
          <Form.Control
            type='password'
            placeholder='Entrez votre mot de passe'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Button
          disabled={isLoading}
          type='submit'
          variant='primary'
          className='mt-3'
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </Form>

      {isLoading && <Loader />}
    </FormContainer>
  );
};

export default LoginScreen;