const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('"company" doit être un ID MongoDB valide');
  }
  return value;
};

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
  company: Joi.string().custom(objectId).optional(),
});

module.exports = {
  uploadMetadataSchema,
};
