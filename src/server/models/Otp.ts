import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp extends Document {
  email?: string;
  mobile?: string;
  mobile_country_code?: string;
  otp: string;
  request_type: string; // 'signUp' | 'forgot' | 'login' etc.
  channel: 'email' | 'mobile';
  expires_at: Date;
  consumed: boolean;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, lowercase: true, index: true },
    mobile: { type: String, index: true },
    mobile_country_code: { type: String },
    otp: { type: String, required: true },
    request_type: { type: String, default: 'signUp' },
    channel: { type: String, enum: ['email', 'mobile'], required: true },
    expires_at: { type: Date, required: true },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OtpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const OtpModel: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);
