import { Joi } from 'express-validation';

export const signUpValidation = {
  body: Joi.object({
    customerId: Joi.string().required(),
    items: Joi.array(),
  }),
};
