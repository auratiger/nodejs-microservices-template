import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './Address.js';

export interface ICustomer extends Document {
  name: string;
  email: string;
  password: string;
  salt: string;
  phone: string;
  address: Array<IAddress>;
  cart: Array<any>;
  wishlist: Array<any>;
  orders: Array<any>;
}

export type ILogin = Pick<ICustomer, 'email' | 'password'>;
export type ISignUp = Pick<ICustomer, 'email' | 'password' | 'phone'>;

const CustomerSchema: Schema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    salt: String,
    phone: String,
    address: [{ type: Schema.Types.ObjectId, ref: 'address', require: true }],
    cart: [
      {
        product: {
          _id: { type: String, require: true },
          name: { type: String },
          banner: { type: String },
          price: { type: Number },
        },
        unit: { type: Number, require: true },
      },
    ],
    wishlist: [
      {
        _id: { type: String, require: true },
        productId: { type: String, require: true },
        date: { type: Date, default: Date.now() },
      },
    ],
    orders: [
      {
        _id: { type: String, required: true },
        amount: { type: String },
        date: { type: Date, default: Date.now() },
      },
    ],
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
      },
    },
    timestamps: true,
  },
);

export default mongoose.model<ICustomer>('customer', CustomerSchema);
