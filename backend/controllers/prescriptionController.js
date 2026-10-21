import asyncHandler from 'express-async-handler';
import Prescription from '../models/prescriptionModel.js';

// @desc    Hämta alla recept
// @route   GET /api/prescriptions
export const getPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({})
    .populate('patient')
    .populate('doctor', 'name email phone hospital address');
  res.json(prescriptions);
});

// @desc    Skapa nytt recept enligt Läkemedelskollen-struktur
// @route   POST /api/prescriptions
export const createPrescription = asyncHandler(async (req, res) => {
  const userRole = req.user?.role ? req.user.role.toLowerCase() : '';
  if (userRole === 'receptionist') {
    res.status(403);
    throw new Error('Behörighet saknas: Receptionister kan inte skapa eller skriva recept.');
  }

  const {
    patient,
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
  } = req.body;

  const prescription = await Prescription.create({
    patient,
    patientName,
    patientPersonalId,
    doctor: req.user?._id || null,
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
    status: 'Actif', // Sätts som standard på franska för systemet
  });

  res.status(201).json(prescription);
});

// @desc    Uppdatera status och uttag på recept (Apotek/Expediering)
// @route   PUT /api/prescriptions/:id
export const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const userRole = req.user?.role ? req.user.role.toLowerCase() : '';
  if (userRole === 'receptionist') {
    res.status(403);
    throw new Error('Behörighet saknas: Receptionister har inte rätt att expediera eller ändra recept status.');
  }

  const prescription = await Prescription.findById(req.params.id);

  if (prescription) {
    prescription.status = req.body.status || prescription.status;
    
    if (req.body.remainingWithdrawals !== undefined) {
      prescription.remainingWithdrawals = req.body.remainingWithdrawals;
    }

    if (req.body.lastWithdrawalDate) {
      prescription.lastWithdrawalDate = req.body.lastWithdrawalDate;
    } else if (req.body.status === 'Uthämtat' || req.body.status === 'Slutexpedierat' || req.body.status === 'Actif') {
      prescription.lastWithdrawalDate = new Date();
    }
    
    const updatedPrescription = await prescription.save(); 
    res.json(updatedPrescription);
  } else {
    res.status(404);
    throw new Error('Receptet hittades inte');
  }
});

// @desc    Radera recept
// @route   DELETE /api/prescriptions/:id
export const deletePrescription = asyncHandler(async (req, res) => {
  const userRole = req.user?.role ? req.user.role.toLowerCase() : '';
  if (userRole === 'receptionist') {
    res.status(403);
    throw new Error('Behörighet saknas: Receptionister kan inte radera recept.');
  }

  const prescription = await Prescription.findById(req.params.id);

  if (prescription) {
    await Prescription.deleteOne({ _id: req.params.id });
    res.json({ message: 'Receptet raderades framgångsrikt' });
  } else {
    res.status(404);
    throw new Error('Receptet hittades inte');
  }
});

// @desc    Hämta alla recept för en specifik patient via patient-ID
// @route   GET /api/prescriptions/patient/:patientId
export const getPrescriptionsByPatientId = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.params.patientId })
    .populate('doctor', 'name email phone hospital address');
  res.json(prescriptions);
});