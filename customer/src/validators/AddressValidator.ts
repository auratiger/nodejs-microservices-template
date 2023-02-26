import { Joi } from 'express-validation';

export const addressValidation = {
  body: Joi.object({
    street: Joi.string().required(),
    postalCode: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
  }),
};
