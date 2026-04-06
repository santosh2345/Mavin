import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { OtpModel } from '@/server/models/Otp';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { email_verification_code, email, type } = req.body || {};
  if (!email_verification_code || !email)
    return fail(res, 'email and code are required', 422);

  const record = await OtpModel.findOne({
    email: String(email).toLowerCase(),
    otp: String(email_verification_code),
    consumed: false,
    expires_at: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) return fail(res, 'Invalid or expired code', 422);
  record.consumed = true;
  await record.save();

  return ok(res, { verified: true });
}

export default withDb(handler);
