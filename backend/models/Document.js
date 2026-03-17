const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
    },
    originalName: String,
    fileSize: Number,
    filePath: String,
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'other'],
      required: true,
    },
    mimeType: String,
    documentType: {
      type: String,
      enum: [
        'invoice',
        'quote',
        'attestation_siret',
        'attestation_urssaf',
        'kbis',
        'rib',
        'other',
      ],
      default: 'other',
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
    },
    extractedData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Extraction',
    },
    ocrText: {
      type: String,
      default: null,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isValidated: {
      type: Boolean,
      default: false,
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    validationDate: Date,
    storageZone: {
      type: String,
      enum: ['raw', 'clean', 'curated'],
      default: 'raw',
    },
    errors: [String],
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
