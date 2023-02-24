import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

const AddressSchema: Schema = new Schema({
  street: String,
  postalCode: String,
  city: String,
  country: String,
});

export default mongoose.model<IAddress>('Address', AddressSchema);
