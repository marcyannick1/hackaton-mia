const mongoose = require("mongoose");

// Modèle léger — la collection est gérée par l'API OCR
// On déclare uniquement les champs dont on a besoin
const curatedDocumentSchema = new mongoose.Schema(
  {
    rawDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    cleanDocumentId: mongoose.Schema.Types.ObjectId,
    documentType: String, // "invoice", "devis", etc.
    data: {
      siret: String,
      montant_ht: Number,
      montant_ttc: Number,
      tva: Number,
      date_emission: String,
      validite: String,
    },
    status: {
      type: String,
      enum: ["validated", "rejected", "suspicious"],
    },
    validation: {
      fraudScore: Number,
      anomalyCount: Number,
      anomalies: Array,
    },
    mlResult: {
      is_anomaly: Boolean,
      fraud_score: Number,
      raw_score: Number,
    },
  },
  {
    timestamps: true,
    collection: "curateddocuments", // ⚠️ doit correspondre exactement au nom de collection de l'API OCR
  }
);

module.exports = mongoose.model("CuratedDocument", curatedDocumentSchema);