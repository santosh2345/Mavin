import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  order_id: string;
  consumer_id: string;
  restaurant_id: string;
  restaurant_name: string;
  cover_photo: string;
  logo: string;
  items: any[];
  coupon_id: string;
  coupon_discount: number;
  coupon_type: string;
  coupon_value: number;
  credit_deduct_amount: number;
  deliver_to: string;
  deliver_to_latitude: number;
  deliver_to_longitude: number;
  delivery_fee: number;
  discount_type: string;
  discount_value: number;
  floor: string;
  food_allergies_note: string;
  gross_amount: number;
  net_amount: number;
  restaurant_discount: number;
  special_instruction: string;
  total_tax_amount: number;
  status: string;
  payment_intent_id?: string;
  created_at_str?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    order_id: { type: String, unique: true, index: true },
    consumer_id: { type: String, required: true, index: true },
    restaurant_id: { type: String, required: true },
    restaurant_name: { type: String, default: '' },
    cover_photo: { type: String, default: '' },
    logo: { type: String, default: '' },
    items: { type: [Schema.Types.Mixed], default: [] },
    coupon_id: { type: String, default: '' },
    coupon_discount: { type: Number, default: 0 },
    coupon_type: { type: String, default: '' },
    coupon_value: { type: Number, default: 0 },
    credit_deduct_amount: { type: Number, default: 0 },
    deliver_to: { type: String, default: '' },
    deliver_to_latitude: { type: Number, default: 0 },
    deliver_to_longitude: { type: Number, default: 0 },
    delivery_fee: { type: Number, default: 0 },
    discount_type: { type: String, default: '' },
    discount_value: { type: Number, default: 0 },
    floor: { type: String, default: '' },
    food_allergies_note: { type: String, default: '' },
    gross_amount: { type: Number, default: 0 },
    net_amount: { type: Number, default: 0 },
    restaurant_discount: { type: Number, default: 0 },
    special_instruction: { type: String, default: '' },
    total_tax_amount: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
    payment_intent_id: { type: String, default: '' },
    created_at_str: { type: String },
  },
  { timestamps: true }
);

OrderSchema.pre('save', function (next) {
  if (!this.order_id) {
    this.order_id = `ORD${Date.now()}${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

export const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
