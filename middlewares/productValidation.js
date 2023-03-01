const Joi = require("joi");

const productValidationSchema = (req, res, next) => {
  const productValidationSchema = Joi.object({
    productName: Joi.string().max(20).required(),
    productDescription: Joi.string().max(4000).required(),
    productPrice: Joi.number().required(),
    discountPrice: Joi.any(),
    color: Joi.string(),
    size: Joi.string(),
    productCategory: Joi.string().required(),
    productStock: Joi.number().required(),
  });
  const { error } = productValidationSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  next();
};

module.exports = productValidationSchema;
