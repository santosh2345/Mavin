import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  consumer_id: string;
  register_type: string;
  name: string;
  email: string;
  mobile: string;
  mobile_country_code: string;
  password: string;
  credit: number;
  profile_photo: string;
  device_id: string | null;
  device_token: string | null;
  device_type: string | null;
  device_name: string | null;
  login_address: string;
  login_latitude?: number;
  login_longitude?: number;
  status: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    consumer_id: { type: String, unique: true, index: true },
    register_type: { type: String, default: 'email' },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    mobile: { type: String, default: '' },
    mobile_country_code: { type: String, default: '+44' },
    password: { type: String, required: true },
    credit: { type: Number, default: 0 },
    profile_photo: { type: String, default: '' },
    device_id: { type: String, default: null },
    device_token: { type: String, default: null },
    device_type: { type: String, default: null },
    device_name: { type: String, default: null },
    login_address: { type: String, default: '' },
    login_latitude: { type: Number },
    login_longitude: { type: Number },
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  if (!this.consumer_id) {
    this.consumer_id = `CON${Date.now()}${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
