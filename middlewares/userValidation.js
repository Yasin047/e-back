const Joi = require("joi");

const userCreateValidationSchema = (req, res, next) => {
  const validationSchema = Joi.object({
    name: Joi.string().min(4).required(),
    email: Joi.string().email().empty().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .min(6)
      .max(30)
      .empty()
      .required(),
  });
  const { error } = validationSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0]);
  next();
};

const userLoginValidationSchema = (req, res, next) => {
  const validationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(6)
      .message("password length must be at least 6 characters long")
      .required(),
  });
  const { error } = validationSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0]);
  next();
};

const userForgotPasswordValidationSchema = (req, res, next) => {
  const validationSchema = Joi.object({
    email: Joi.string().email().required(),
  });
  const { error } = validationSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0]);
  next();
};

const userUpdateValidationSchema = (req, res, next) => {
  const validationSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).max(30),
  });
  const { error } = validationSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0]);
  next();
};

module.exports = {
  userCreateValidationSchema,
  userLoginValidationSchema,
  userForgotPasswordValidationSchema,
  userUpdateValidationSchema,
};
