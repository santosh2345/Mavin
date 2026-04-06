import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  coupon_id: string;
  code: string;
  discount_type: 'amount' | 'percentage';
  value: number;
  maximum_discount_value: number;
  min_order_amount: number;
  expires_at?: Date;
  status: string;
}

const CouponSchema = new Schema<ICoupon>(
  {
    coupon_id: { type: String, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    discount_type: { type: String, enum: ['amount', 'percentage'], default: 'amount' },
    value: { type: Number, default: 0 },
    maximum_discount_value: { type: Number, default: 0 },
    min_order_amount: { type: Number, default: 0 },
    expires_at: { type: Date },
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
);

CouponSchema.pre('save', function (next) {
  if (!this.coupon_id) {
    this.coupon_id = `COU${Date.now()}${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

export const CouponModel: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
