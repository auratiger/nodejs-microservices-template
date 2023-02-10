// const ShoppingService = require("../services/shopping-service");

import logger from '../utils/logger.js';

export default (app) => {
  app.use('/app-events', async (req, res, next) => {
    const { payload } = req.body;

    logger.info('============= Products ================');
    logger.info(payload);

    return res.status(200).json({ message: 'notified!' });
  });
};
