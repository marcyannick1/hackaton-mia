const Joi = require("joi");

const signUpSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    company: Joi.string().optional()
});

const signInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

module.exports = {
    signUpSchema,
    signInSchema
}