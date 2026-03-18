const mongoose = require('mongoose');

const curatedZoneSchema = new mongoose.Schema(
  {
    rawZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawZone',
      required: true,
    },
    cleanZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CleanZone',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    documentType: String,
    extractionMethod: {
      type: String,
      enum: ['ocr', 'manual', 'api'],
      default: 'ocr',
    },
    // Données extraites communes
    extractedData: {
      siret: String,
      siren: String,
      tva: String,
      companyName: String,
      issueDate: Date,
      expiryDate: Date,
    },
    // Données spécifiques aux factures
    invoiceData: {
      invoiceNumber: String,
      issuer: String,
      issuerSiret: String,
      issuerTva: String,
      issuerAddress: String,
      amount: {
        ht: Number, // HT = Hors Taxe
        ttc: Number, // TTC = Toutes Taxes Comprises
        tva: Number,
      },
      issueDate: Date,
      dueDate: Date,
      currency: {
        type: String,
        default: 'EUR',
      },
      lines: [
        {
          description: String,
          quantity: Number,
          unitPrice: Number,
          amount: Number,
        },
      ],
    },
    // Données spécifiques aux attestations
    attestationData: {
      attestationType: {
        type: String,
        enum: ['siret', 'urssaf', 'kbis'],
      },
      issuer: String,
      issuerSiret: String,
      issueDate: Date,
      expiryDate: Date,
      status: {
        type: String,
        enum: ['valid', 'expired', 'unknown'],
      },
    },
    // Données spécifiques aux RIB
    ribData: {
      iban: String,
      bic: String,
      accountHolder: String,
      bankName: String,
    },
    // Informations de qualité de l'extraction
    qualityMetrics: {
      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },
      pageCount: Number,
      qualityNotes: String,
    },
    // Détection d'incohérences
    inconsistencies: [
      {
        type: String,
        description: String,
        severity: {
          type: String,
          enum: ['info', 'warning', 'error'],
        },
      },
    ],
    // Historique des modifications
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
      enum: ['pending', 'in_review', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewDate: Date,
    reviewNotes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CuratedZone', curatedZoneSchema);
