import mongoose from 'mongoose';

const patientSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    personalId: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    allergies: { type: String, default: 'Inga kända allergier' },
    warnings: { type: String, default: 'Inga varningar' },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;