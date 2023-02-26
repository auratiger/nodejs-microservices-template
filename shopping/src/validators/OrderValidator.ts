import { Joi } from 'express-validation';

export const signUpValidation = {
  body: Joi.object({
    orderId: Joi.string().required(),
    customerId: Joi.string().required(),
    amount: Joi.number().required(),
    status: Joi.string().required(),
    items: Joi.array(),
  }),
};
