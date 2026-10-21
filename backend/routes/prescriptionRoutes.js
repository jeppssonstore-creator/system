import express from 'express';
import {
  getPrescriptions,
  createPrescription,
  updatePrescriptionStatus,
  deletePrescription,
  getPrescriptionsByPatientId,
} from '../controllers/prescriptionController.js';
import { protect, doctorOnly, pharmacistOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Hanterar /api/prescriptions (GET för inloggade, POST kräver läkare)
router.route('/')
  .get(protect, getPrescriptions)
  .post(protect, doctorOnly, createPrescription);

// Hämta recept för en specifik patient via personnummer
router.route('/patient/:personalId').get(protect, getPrescriptionsByPatientId);

// Statusuppdatering (tillåter inloggade att expediera) och radering (kräver läkare)
router.route('/:id')
  .put(protect, updatePrescriptionStatus) 
  .delete(protect, doctorOnly, deletePrescription);

export default router;