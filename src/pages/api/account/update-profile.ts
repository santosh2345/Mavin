import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { UserModel } from '@/server/models/User';
import { getAuthUser } from '@/server/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { user_id, name, mobile, profile_photo, mobile_country_code } = req.body || {};

  let user = await getAuthUser(req);
  if (!user && user_id) user = await UserModel.findOne({ consumer_id: user_id });
  if (!user) return fail(res, 'Not authorized', 401);

  if (name !== undefined) user.name = name;
  if (mobile !== undefined) user.mobile = mobile;
  if (profile_photo !== undefined) user.profile_photo = profile_photo;
  if (mobile_country_code !== undefined) user.mobile_country_code = mobile_country_code;
  await user.save();

  return ok(res, {
    consumer_id: user.consumer_id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    mobile_country_code: user.mobile_country_code,
    profile_photo: user.profile_photo,
  });
}

export default withDb(handler);
