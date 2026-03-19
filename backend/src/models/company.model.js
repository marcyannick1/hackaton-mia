const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    siret: {
      type: String,
      required: [true, 'SIRET is required'],
      unique: true,
      match: [/^\d{14}$/, 'SIRET must be 14 digits'],
    },
    siren: {
      type: String,
      match: [/^\d{9}$/, 'SIREN must be 9 digits'],
    },
    tva: {
      type: String,
      match: [/^FR\d{11}$/, 'TVA must be in format FR followed by 11 digits'],
    },
    address: {
      street: String,
      postalCode: String,
      city: String,
      country: {
        type: String,
        default: 'FR',
      },
    },
    email: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    phone: String,
    website: String,
    iban: String,
    bic: String,
    complianceStatus: {
      type: String,
      enum: ['compliant', 'non-compliant', 'pending', 'unknown'],
      default: 'unknown',
    },
    attestationExpiry: {
      urssaf: Date,
      kbis: Date,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Company', companySchema);