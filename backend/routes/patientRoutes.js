import express from 'express';
import { 
  getPatients, 
  getPatientByPersonalId, 
  createPatient,
  updatePatientInfo,
  getPatientNotes,
  createPatientNote,
  getAppointments,
  createAppointment,
  updateAppointmentStatus
} from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Patienter
router.route('/').get(protect, getPatients).post(protect, createPatient);

// Bokningar / Mottagningsschema
router.route('/appointments')
  .get(protect, getAppointments)
  .post(protect, createAppointment);

router.route('/appointments/:id')
  .put(protect, updateAppointmentStatus);

// Enskild patient, uppdatering & Journalanteckningar
router.route('/:personalId')
  .get(protect, getPatientByPersonalId)
  .put(protect, updatePatientInfo);

router.route('/:personalId/notes')
  .get(protect, getPatientNotes)
  .post(protect, createPatientNote);

export default router;