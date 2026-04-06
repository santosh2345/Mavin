import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { UserModel } from '@/server/models/User';
import { signJwt } from '@/server/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { email, password, login_latitude, login_longitude, login_address } = req.body || {};
  if (!email || !password) return fail(res, 'email and password are required', 422);

  const user = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (!user) return fail(res, 'Invalid credentials', 401);
  const valid = await user.comparePassword(password);
  if (!valid) return fail(res, 'Invalid credentials', 401);

  if (login_latitude !== undefined) user.login_latitude = login_latitude;
  if (login_longitude !== undefined) user.login_longitude = login_longitude;
  if (login_address) user.login_address = login_address;
  await user.save();

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
