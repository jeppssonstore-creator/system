import Patient from '../models/patientModel.js';
import MedicalNote from '../models/medicalNoteModel.js';
import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';

// @desc    Hämta alla patienter
// @route   GET /api/patients
// @access  Private
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Fel vid hämtning av patienter' });
  }
};

// @desc    Hämta enskild patient med personnummer
// @route   GET /api/patients/:personalId
// @access  Private
export const getPatientByPersonalId = async (req, res) => {
  try {
    const patient = await Patient.findOne({ personalId: req.params.personalId });
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patienten hittades inte' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Serverfel vid hämtning av patient' });
  }
};

// @desc    Skapa ny patient
// @route   POST /api/patients
// @access  Private
export const createPatient = async (req, res) => {
  const { name, personalId, phone, address, allergies, warnings } = req.body;

  try {
    const patientExists = await Patient.findOne({ personalId });
    if (patientExists) {
      return res.status(400).json({ message: 'Patient med detta personnummer finns redan' });
    }

    const patient = new Patient({
      name,
      personalId,
      phone,
      address,
      allergies,
      warnings,
    });

    const createdPatient = await patient.save();
    res.status(201).json(createdPatient);
  } catch (error) {
    res.status(400).json({ message: 'Kunde inte skapa patient' });
  }
};

// @desc    Uppdatera patientinformation (telefon, adress, allergi, varningar)
// @route   PUT /api/patients/:personalId
// @access  Private
export const updatePatientInfo = async (req, res) => {
  try {
    const patient = await Patient.findOne({ personalId: req.params.personalId });

    if (patient) {
      patient.phone = req.body.phone !== undefined ? req.body.phone : patient.phone;
      patient.address = req.body.address !== undefined ? req.body.address : patient.address;
      patient.allergies = req.body.allergies !== undefined ? req.body.allergies : patient.allergies;
      patient.warnings = req.body.warnings !== undefined ? req.body.warnings : patient.warnings;

      const updatedPatient = await patient.save();
      res.json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient introuvable' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- JOURNALANTECKNINGAR ---

// @desc    Hämta journalanteckningar för en patient
// @route   GET /api/patients/:personalId/notes
// @access  Private
export const getPatientNotes = async (req, res) => {
  try {
    const notes = await MedicalNote.find({ patientPersonalId: req.params.personalId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Fel vid hämtning av journalanteckningar' });
  }
};

// @desc    Skapa ny journalanteckning
// @route   POST /api/patients/:personalId/notes
// @access  Private (Doctor)
export const createPatientNote = async (req, res) => {
  const { diagnosis, note, treatmentPlan } = req.body;

  try {
    const newNote = new MedicalNote({
      patientPersonalId: req.params.personalId,
      doctorName: req.user?.name || 'Okänd läkare',
      doctorId: req.user?._id,
      diagnosis,
      note,
      treatmentPlan,
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: 'Kunde inte spara journalanteckningen' });
  }
};

// --- BOKNINGAR / MOTTAGNING ---

// @desc    Hämta bokningar (Läkare och receptionist ser sin mottagning, Admin ser alla)
// @route   GET /api/patients/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    let query = {};
    const userRole = req.user?.role ? req.user.role.toLowerCase() : '';

    if (userRole === 'doctor') {
      query = { doctorId: req.user?._id };
    } else if (userRole === 'receptionist') {
      query = { doctorId: req.user?.linkedDoctorId };
    }

    const appointments = await Appointment.find(query).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Fel vid hämtning av bokningar' });
  }
};

// @desc    Skapa ny bokning
// @route   POST /api/patients/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  const { patientName, patientPersonalId, date, time, reason } = req.body;

  try {
    const userRole = req.user?.role ? req.user.role.toLowerCase() : '';
    let targetDoctorId = req.user?._id;
    let targetDoctorName = req.user?.name || 'Okänd';

    if (userRole === 'receptionist' && req.user?.linkedDoctorId) {
      const linkedDoctor = await User.findById(req.user.linkedDoctorId);
      if (linkedDoctor) {
        targetDoctorId = linkedDoctor._id;
        targetDoctorName = linkedDoctor.name;
      }
    }

    const newApp = new Appointment({
      patientName,
      patientPersonalId,
      doctorName: targetDoctorName,
      doctorId: targetDoctorId,
      date,
      time,
      reason,
    });

    const savedApp = await newApp.save();
    res.status(201).json(savedApp);
  } catch (error) {
    res.status(400).json({ message: 'Kunde inte skapa bokningen' });
  }
};

// @desc    Uppdatera bokningsstatus
// @route   PUT /api/patients/appointments/:id
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  try {
    const app = await Appointment.findById(req.params.id);
    if (app) {
      app.status = req.body.status || app.status;
      const updatedApp = await app.save();
      res.json(updatedApp);
    } else {
      res.status(404).json({ message: 'Bokningen hittades inte' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Fel vid uppdatering av bokning' });
  }
};