import mongoose from 'mongoose';

const prescriptionSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    patientName: { type: String, required: true },
    patientPersonalId: { type: String, required: true },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    medicationName: { type: String, required: true },
    productName: { type: String },
    strength: { type: String },
    form: { type: String },
    activeSubstance: { type: String },
    genericsExchange: { type: String },
    remainingWithdrawals: { type: Number, required: true },
    totalWithdrawals: { type: Number, required: true },
    nextWithdrawalDate: { type: Date },
    lastWithdrawalDate: { type: Date },
    validUntil: { type: Date, required: true },
    usageInstructions: { type: String, required: true },
    status: {
      type: String,
      default: 'Actif',
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;