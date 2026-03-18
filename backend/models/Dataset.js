const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dataset name is required'],
      trim: true,
      unique: true,
    },
    version: {
      type: String,
      required: [true, 'Version is required'],
      match: [/^\d+\.\d+\.\d+$/, 'Version must be in format x.y.z'],
    },
    description: String,
    source: {
      rawZone: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'RawZone',
        },
      ],
      cleanZone: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CleanZone',
        },
      ],
      curatedZone: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CuratedZone',
        },
      ],
      dateCreated: {
        type: Date,
        default: Date.now,
      },
    },
    stats: {
      totalRecords: {
        type: Number,
        default: 0,
      },
      validRecords: {
        type: Number,
        default: 0,
      },
      invalidRecords: {
        type: Number,
        default: 0,
      },
      dataTypes: {
        invoices: Number,
        attestations: Number,
        ribs: Number,
        others: Number,
      },
    },
    splits: {
      train: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 1,
      },
      test: {
        type: Number,
        default: 0.2,
        min: 0,
        max: 1,
      },
      validation: {
        type: Number,
        default: 0.1,
        min: 0,
        max: 1,
      },
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'ready', 'training', 'archived'],
      default: 'draft',
    },


    
    tags: [String],
    purpose: {
      type: String,
      enum: ['training', 'testing', 'validation', 'production'],
      default: 'training',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Dataset', datasetSchema);
