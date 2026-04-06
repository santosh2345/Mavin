import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItemCategory extends Document {
  item_category_id: string;
  restaurant_id: string;
  categoryTitle: string;
  category_status: string;
  sort_order: number;
}

const ItemCategorySchema = new Schema<IItemCategory>(
  {
    item_category_id: { type: String, unique: true, index: true },
    restaurant_id: { type: String, required: true, index: true },
    categoryTitle: { type: String, required: true },
    category_status: { type: String, default: 'active' },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ItemCategorySchema.pre('save', function (next) {
  if (!this.item_category_id) {
    this.item_category_id = `ITC${Date.now()}${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

export const ItemCategoryModel: Model<IItemCategory> =
  mongoose.models.ItemCategory ||
  mongoose.model<IItemCategory>('ItemCategory', ItemCategorySchema);
