import { Joi } from 'express-validation';

export const productValidator = {
  body: Joi.object({
    name: Joi.string().required(),
    desc: Joi.string().required(),
    banner: Joi.string().required(),
    type: Joi.string().required(),
    unit: Joi.number().required(),
    price: Joi.number().required(),
    available: Joi.boolean().required(),
    suplier: Joi.string().required(),
  }),
};
