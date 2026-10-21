import mongoose from 'mongoose';

const medicalNoteSchema = mongoose.Schema(
  {
    patientPersonalId: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    diagnosis: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    treatmentPlan: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalNote = mongoose.model('MedicalNote', medicalNoteSchema);
export default MedicalNote;