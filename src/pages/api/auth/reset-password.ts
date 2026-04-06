import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { UserModel } from '@/server/models/User';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const {
    email,
    mobile,
    mobile_country_code,
    new_password,
    conform_password,
    request_type = 'email',
  } = req.body || {};

  if (!new_password || new_password !== conform_password) {
    return fail(res, 'Passwords do not match', 422);
  }

  const user = await UserModel.findOne(
    request_type === 'email'
      ? { email: String(email || '').toLowerCase() }
      : { mobile, mobile_country_code }
  );
  if (!user) return fail(res, 'User not found', 404);

  user.password = new_password;
  await user.save();

  return ok(res, { status: 'reset' });
}

export default withDb(handler);
