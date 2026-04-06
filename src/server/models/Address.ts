import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress extends Document {
  address_id: string;
  consumer_id: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  floor?: string;
  landmark?: string;
  title?: string;
}

const AddressSchema = new Schema<IAddress>(
  {
    address_id: { type: String, unique: true, index: true },
    consumer_id: { type: String, required: true, index: true },
    type: { type: String, default: 'other' },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    floor: { type: String, default: '' },
    landmark: { type: String, default: '' },
    title: { type: String, default: '' },
  },
  { timestamps: true }
);

AddressSchema.pre('save', function (next) {
  if (!this.address_id) {
    this.address_id = `ADR${Date.now()}${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

export const AddressModel: Model<IAddress> =
  mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);
