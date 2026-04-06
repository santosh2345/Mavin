import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem {
  cart_id: string;
  item_id: string;
  item_name: string;
  item_cover_photo: string;
  item_ingredients: string;
  restaurant_id: string;
  restaurant_name: string;
  price: number;
  qty: number;
  total_price: number;
  item_options: any[];
  cart_item_options: any[];
}

export interface ICart extends Document {
  owner_id: string; // consumer_id or guest device_id
  owner_type: 'consumer' | 'guest';
  restaurant_id: string;
  items: ICartItem[];
  order_pickup_date: string;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    cart_id: { type: String, required: true },
    item_id: { type: String, required: true },
    item_name: { type: String, default: '' },
    item_cover_photo: { type: String, default: '' },
    item_ingredients: { type: String, default: '' },
    restaurant_id: { type: String, required: true },
    restaurant_name: { type: String, default: '' },
    price: { type: Number, required: true },
    qty: { type: Number, default: 1 },
    total_price: { type: Number, default: 0 },
    item_options: { type: [Schema.Types.Mixed], default: [] },
    cart_item_options: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    owner_id: { type: String, required: true, index: true },
    owner_type: { type: String, enum: ['consumer', 'guest'], required: true },
    restaurant_id: { type: String, default: '' },
    items: { type: [CartItemSchema], default: [] },
    order_pickup_date: { type: String, default: '' },
  },
  { timestamps: true }
);

CartSchema.index({ owner_id: 1, owner_type: 1 }, { unique: true });

export const CartModel: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
