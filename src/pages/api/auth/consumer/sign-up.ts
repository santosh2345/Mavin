import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { UserModel } from '@/server/models/User';
import { OtpModel } from '@/server/models/Otp';
import { signJwt } from '@/server/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const {
    name,
    email,
    password,
    mobile,
    mobile_country_code = '+44',
    register_type = 'email',
    otp,
    device_id,
    device_token,
    device_type,
    device_name,
  } = req.body || {};

  if (!name || !email || !password) {
    return fail(res, 'name, email and password are required', 422);
  }

  // Verify OTP if provided (mobile-based signup uses OTP)
  if (otp) {
    const otpRecord = await OtpModel.findOne({
      $or: [{ email: String(email).toLowerCase() }, { mobile }],
      otp: String(otp),
      consumed: false,
      expires_at: { $gt: new Date() },
    }).sort({ createdAt: -1 });
    if (!otpRecord) return fail(res, 'Invalid or expired OTP', 422);
    otpRecord.consumed = true;
    await otpRecord.save();
  }

  const existing = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    return fail(res, 'A user with this email already exists', 409, {
      payload: { email: 'A user with this email already exists' },
    });
  }

  const user = await UserModel.create({
    name,
    email,
    password,
    mobile: mobile || '',
    mobile_country_code,
    register_type,
    device_id: device_id || null,
    device_token: device_token || null,
    device_type: device_type || null,
    device_name: device_name || null,
  });

  const token = await signJwt({ consumer_id: user.consumer_id, sub: user.consumer_id });

  return ok(res, {
    consumer_id: user.consumer_id,
    register_type: user.register_type,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    mobile_country_code: user.mobile_country_code,
    credit: user.credit,
    profile_photo: user.profile_photo,
    device_id: user.device_id,
    device_token: user.device_token,
    device_type: user.device_type,
    device_name: user.device_name,
    login_address: user.login_address,
    status: user.status,
    token,
  });
}

export default withDb(handler);
