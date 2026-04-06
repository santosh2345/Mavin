import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { UserModel } from '@/server/models/User';
import { getAuthUser } from '@/server/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { old_password, new_password, conform_password, user_id } = req.body || {};
  if (!new_password || new_password !== conform_password) {
    return fail(res, 'Passwords do not match', 422);
  }

  let user = await getAuthUser(req);
  if (!user && user_id) user = await UserModel.findOne({ consumer_id: user_id });
  if (!user) return fail(res, 'Not authorized', 401);

  if (old_password) {
    const valid = await user.comparePassword(old_password);
    if (!valid) return fail(res, 'Old password is incorrect', 401);
  }
  user.password = new_password;
  await user.save();
  return ok(res, { status: 'changed' });
}

export default withDb(handler);
