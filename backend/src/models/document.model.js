const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["Facture", "Devis", "Attestation", "Kbis", "RIB", "Inconnu"],
      default: "Inconnu",
    },

    status: {
      type: String,
      enum: ["En attente", "Traité", "Erreur de cohérence", "Expiré"],
      default: "En attente",
    },

    extractedData: {
      siret: { type: String },
      tva: { type: Number },
      montantHT: { type: Number },
      montantTTC: { type: Number },
      dateEmission: { type: Date },
      dateExpiration: { type: Date },
    },

    alerts: [
      {
        message: String,
        severity: { type: String, enum: ["Low", "High"], default: "High" },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Document", documentSchema);
