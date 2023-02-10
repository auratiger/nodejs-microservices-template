import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import amqplib from 'amqplib';

//Utility functions
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string,
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: '30d' });
  } catch (error) {
    logger.info(error);
    return error;
  }
};

export const ValidateSignature = async (req) => {
  try {
    const signature = req.get('Authorization');
    logger.info(signature);
    const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    logger.info(error);
    return false;
  }
};

export const FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error('Data Not found!');
  }
};

// module.exports.SubscribeMessage = async (channel, service) => {
//   await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
//   const q = await channel.assertQueue('', { exclusive: true });
//   console.log(` Waiting for messages in queue: ${q.queue}`);

//   channel.bindQueue(q.queue, EXCHANGE_NAME, SHOPPING_SERVICE);

//   channel.consume(
//     q.queue,
//     (msg) => {
//       if (msg.content) {
//         console.log('the message is:', msg.content.toString());
//         service.SubscribeEvents(msg.content.toString());
//       }
//       console.log('[X] received');
//     },
//     {
//       noAck: true,
//     },
//   );
// };
