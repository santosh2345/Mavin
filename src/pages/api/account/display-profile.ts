import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { UserModel } from '@/server/models/User';
import { getAuthUser } from '@/server/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['GET', 'POST'])) return;
  const params = req.method === 'GET' ? req.query : req.body;
  const { user_id } = params || {};

  let user = await getAuthUser(req);
  if (!user && user_id) {
    user = await UserModel.findOne({ consumer_id: String(user_id) });
  }
  if (!user) return fail(res, 'User not found', 404);

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
  });
}

export default withDb(handler);
