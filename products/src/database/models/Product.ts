import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  desc: String,
  banner: String,
  type: String,
  unit: Number,
  price: Number,
  available: Boolean,
  suplier: String,
});

export default mongoose.model('product', ProductSchema);
