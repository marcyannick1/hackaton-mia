// Dans companySchema.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        initiales: String,
        raisonSociale: {
            type: String,
            required: true,
        },
        siret: {
            type: String,
            required: true,
            unique: true,
        },
        tva: String,
        adresse: String,
        contact: String,
        telephone: String,
        iban: String,
        statut: {
            type: String,
            enum: ['conforme', 'non_conforme', 'en_cours'],
            default: 'en_cours',
        },
        depuis: String,
        urssafExpire: Date,
        urssafStatut: {
            type: String,
            enum: ['valide', 'expire', 'invalide'],
        }
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('Company', companySchema);