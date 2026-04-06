import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRestaurantType extends Document {
  restaurant_type_id: string;
  title: string;
  type: string;
  sort_order: number;
  status: string;
}

const RestaurantTypeSchema = new Schema<IRestaurantType>(
  {
    restaurant_type_id: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    type: { type: String, default: 'restaurant' },
    sort_order: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
);

RestaurantTypeSchema.pre('save', function (next) {
  if (!this.restaurant_type_id) {
    this.restaurant_type_id = `RTY${Date.now()}${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

export const RestaurantTypeModel: Model<IRestaurantType> =
  mongoose.models.RestaurantType ||
  mongoose.model<IRestaurantType>('RestaurantType', RestaurantTypeSchema);
