import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  desc: string;
  banner: string;
  type: string;
  unit: number;
  price: number;
  available: boolean;
  suplier: string;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, unique: true },
  desc: String,
  banner: String,
  type: String,
  unit: Number,
  price: Number,
  available: Boolean,
  suplier: String,
});

export default mongoose.model<IProduct>('product', ProductSchema);
