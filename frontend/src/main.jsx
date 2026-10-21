import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import PrescriptionScreen from './screens/PrescriptionScreen.jsx';
import PatientDetailScreen from './screens/PatientDetailScreen.jsx';
import AppointmentsScreen from './screens/AppointmentsScreen.jsx';
import DoctorReceptionistsScreen from './components/DoctorReceptionistsScreen'; // <-- Importerad här!
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import store from './store';
import { Provider } from 'react-redux';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen.jsx';
import RegisterScreen from './screens/RegisterScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import PharmacyScreen from './screens/PharmacyScreen.jsx';
import UserManagementScreen from './screens/UserManagementScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index={true} path='/' element={<HomeScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route path='' element={<PrivateRoute />}>
        <Route path='/profile' element={<ProfileScreen />} />
        <Route path='/prescriptions' element={<PrescriptionScreen />} />
        <Route path='/patient/:personalId' element={<PatientDetailScreen />} />
        <Route path='/patients/:personalId' element={<PatientDetailScreen />} /> {/* <-- Lägg till denna så båda fungerar! */}
        <Route path='/appointments' element={<AppointmentsScreen />} />
        <Route path='/receptionists' element={<DoctorReceptionistsScreen />} /> {/* <-- Ny route tillagd här! */}
        <Route path='/pharmacy' element={<PharmacyScreen />} />
        <Route path='/admin/userlist' element={<UserManagementScreen />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);