const mongoose = require('mongoose');

const rawZoneSchema = new mongoose.Schema(
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
    cleanZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CleanZone',
    },
    curatedZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CuratedZone',
    },
    errors: [String],
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RawZone', rawZoneSchema);
