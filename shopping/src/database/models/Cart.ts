import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  customerId: string;
  items: Array<any>;
}

const CartSchema: Schema = new Schema({
  customerId: { type: String },
  items: [
    {
      product: {
        _id: { type: String, require: true },
        name: { type: String },
        desc: { type: String },
        banner: { type: String },
        type: { type: String },
        unit: { type: Number },
        price: { type: Number },
        suplier: { type: String },
      },
      unit: { type: Number, require: true },
    },
  ],
});

export default mongoose.model<ICart>('cart', CartSchema);
