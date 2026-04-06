import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRestaurant extends Document {
  restaurant_id: string;
  store_type: string;
  availability_status: string;
  name: string;
  avg_rating: number;
  avg_rating_by_consumer: number;
  avg_rating_by_delivery_boy: number;
  address: string;
  logo: string;
  cover_photo: string;
  discount_type: string;
  discount_value: number;
  range: number;
  preparation_time: string;
  delivery_charge: number;
  email?: string;
  mobile?: string;
  mobile_country_code?: string;
  description?: string;
  minimum_order_amount?: number;
  nick_name?: string;
  restaurant_category_id?: string[];
  restaurant_type_id?: string;
  restaurant_type_title?: string;
  is_free_delivery?: boolean;
  banner?: any[];
  is_favorite?: boolean;
  currency?: string;
  is_mobile_update?: boolean;
  facebookURL?: string;
  instagramURL?: string;
  youtubeURL?: string;
  restaurant_longitude: number;
  restaurant_latitude: number;
  timing: any;
  open_time?: any;
  close_time?: any;
  status?: string;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    restaurant_id: { type: String, unique: true, index: true },
    store_type: { type: String, default: 'restaurant' },
    availability_status: { type: String, default: 'online' },
    name: { type: String, required: true },
    avg_rating: { type: Number, default: 4.5 },
    avg_rating_by_consumer: { type: Number, default: 4.5 },
    avg_rating_by_delivery_boy: { type: Number, default: 4.5 },
    address: { type: String, default: '' },
    logo: { type: String, default: '' },
    cover_photo: { type: String, default: '' },
    discount_type: { type: String, default: 'amount' },
    discount_value: { type: Number, default: 0 },
    range: { type: Number, default: 10 },
    preparation_time: { type: String, default: '30' },
    delivery_charge: { type: Number, default: 2.99 },
    email: { type: String, default: '' },
    mobile: { type: String, default: '' },
    mobile_country_code: { type: String, default: '+44' },
    description: { type: String, default: '' },
    minimum_order_amount: { type: Number, default: 0 },
    nick_name: { type: String, default: '' },
    restaurant_category_id: [{ type: String }],
    restaurant_type_id: { type: String, default: 'TYPE_GENERAL' },
    restaurant_type_title: { type: String, default: 'General' },
    is_free_delivery: { type: Boolean, default: false },
    banner: { type: [Schema.Types.Mixed], default: [] },
    is_favorite: { type: Boolean, default: false },
    currency: { type: String, default: '£' },
    is_mobile_update: { type: Boolean, default: false },
    facebookURL: { type: String, default: '' },
    instagramURL: { type: String, default: '' },
    youtubeURL: { type: String, default: '' },
    restaurant_longitude: { type: Number, default: 0 },
    restaurant_latitude: { type: Number, default: 0 },
    timing: {
      type: Schema.Types.Mixed,
      default: {
        sunday: '9:00-22:00',
        monday: '9:00-22:00',
        tuesday: '9:00-22:00',
        wednesday: '9:00-22:00',
        thursday: '9:00-22:00',
        friday: '9:00-22:00',
        saturday: '9:00-22:00',
      },
    },
    open_time: { type: Schema.Types.Mixed },
    close_time: { type: Schema.Types.Mixed },
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
);

RestaurantSchema.pre('save', function (next) {
  if (!this.restaurant_id) {
    this.restaurant_id = `RES${Date.now()}${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

export const RestaurantModel: Model<IRestaurant> =
  mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
