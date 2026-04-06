import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { OtpModel } from '@/server/models/Otp';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { otp, mobile, mobile_country_code, request_type = 'forgot' } = req.body || {};
  if (!otp || !mobile) return fail(res, 'otp and mobile are required', 422);

  const record = await OtpModel.findOne({
    mobile,
    otp: String(otp),
    request_type,
    consumed: false,
    expires_at: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) return fail(res, 'Invalid or expired OTP', 422);
  record.consumed = true;
  await record.save();

  return ok(res, { verified: true });
}

export default withDb(handler);
