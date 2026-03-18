const mongoose = require('mongoose');

const cleanZoneSchema = new mongoose.Schema(
  {
    rawZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawZone',
      required: true,
    },
    ocrText: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    pageCount: Number,
    language: String,
    processingMethod: {
      type: String,
      enum: ['ocr', 'manual', 'api'],
      default: 'ocr',
    },
    qualityMetrics: {
      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },
      readabilityScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      qualityNotes: String,
    },
    processingLog: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        action: String,
        details: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    curatedZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CuratedZone',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CleanZone', cleanZoneSchema);
