const Joi = require("joi");

const uploadMetadataSchema = Joi.object({
  documentType: Joi.string()
    .valid(
      "invoice",
      "quote",
      "attestation_siret",
      "attestation_urssaf",
      "kbis",
      "rib",
      "other",
    )
    .optional(),
  company: Joi.string().optional(),
});

module.exports = {
  uploadMetadataSchema,
};
