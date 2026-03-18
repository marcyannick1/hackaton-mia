const Joi = require("joi");

const createCompanySchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Le nom de l'entreprise est requis",
    "any.required": "Le nom de l'entreprise est requis",
  }),
  siret: Joi.string()
    .pattern(/^\d{14}$/)
    .required()
    .messages({
      "string.pattern.base": "Le SIRET doit contenir exactement 14 chiffres",
      "string.empty": "Le SIRET est requis",
      "any.required": "Le SIRET est requis",
    }),
  siren: Joi.string()
    .pattern(/^\d{9}$/)
    .optional()
    .messages({
      "string.pattern.base": "Le SIREN doit contenir exactement 9 chiffres",
    }),
  tva: Joi.string()
    .pattern(/^FR\d{11}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Le numéro de TVA doit commencer par FR suivi de 11 chiffres",
    }),
  address: Joi.object({
    street: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().default("FR").optional(),
  }).optional(),
  email: Joi.string().email().optional().messages({
    "string.email": "L'adresse email n'est pas valide",
  }),
  phone: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  iban: Joi.string().optional(),
  bic: Joi.string().optional(),
  complianceStatus: Joi.string()
    .valid("compliant", "non-compliant", "pending", "unknown")
    .optional(),
  notes: Joi.string().optional(),
});

module.exports = {
  createCompanySchema,
};
