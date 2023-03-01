const Joi = require("joi");

const orderValidationSchema = (req, res, next) => {
  const orderValidationSchema = Joi.object({
    shippingInfo: Joi.required(),
    orderItems: Joi.required(),
    paymentInfo: Joi.required(),
    itemsPrice: Joi.required(),
    taxPrice: Joi.required(),
    shippingPrice: Joi.required(),
    totalPrice: Joi.required(),
  });
  const { error } = orderValidationSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0]);
  next();
};

module.exports = orderValidationSchema;
