import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItem extends Document {
  item_id: string;
  restaurant_id: string;
  restaurant_name: string;
  item_category_id: string;
  title: string;
  description: string;
  ingredients: string;
  price: number;
  cover_photo: string;
  image: string;
  banner: string[];
  status: string;
  availability_status: string;
  sort_id: number;
  avg_rating: number;
  badge_count: number;
  preparation_time: string;
  est_weight: string;
  currency: string;
  currency_code: string;
  item_options: any[];
  search_keywords: string[];
}

const ItemSchema = new Schema<IItem>(
  {
    item_id: { type: String, unique: true, index: true },
    restaurant_id: { type: String, required: true, index: true },
    restaurant_name: { type: String, default: '' },
    item_category_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    ingredients: { type: String, default: '' },
    price: { type: Number, required: true },
    cover_photo: { type: String, default: '' },
    image: { type: String, default: '' },
    banner: [{ type: String }],
    status: { type: String, default: 'active' },
    availability_status: { type: String, default: 'available' },
    sort_id: { type: Number, default: 0 },
    avg_rating: { type: Number, default: 4.5 },
    badge_count: { type: Number, default: 0 },
    preparation_time: { type: String, default: '20' },
    est_weight: { type: String, default: '300g' },
    currency: { type: String, default: '$' },
    currency_code: { type: String, default: 'usd' },
    item_options: { type: [Schema.Types.Mixed], default: [] },
    search_keywords: [{ type: String }],
  },
  { timestamps: true }
);

ItemSchema.pre('save', function (next) {
  if (!this.item_id) {
    this.item_id = `ITM${Date.now()}${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

export const ItemModel: Model<IItem> =
  mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);
