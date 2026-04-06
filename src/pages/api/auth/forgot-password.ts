import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { UserModel } from '@/server/models/User';
import { OtpModel } from '@/server/models/Otp';
import { generateOtp } from '@/server/auth';
import { sendOtpEmail } from '@/server/mailer';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { email, mobile, mobile_country_code = '+44', request_type = 'email' } =
    req.body || {};

  const user = await UserModel.findOne(
    request_type === 'email'
      ? { email: String(email || '').toLowerCase() }
      : { mobile, mobile_country_code }
  );

  // Don't leak which accounts exist — always return success-shaped response,
  // but only actually send if we found a user.
  if (!user) {
    console.log('[forgot-password] no user found for', email || mobile);
    return ok(res, { status: 'sent' });
  }

  const otp = generateOtp();
  await OtpModel.create({
    email: user.email,
    mobile: user.mobile,
    mobile_country_code: user.mobile_country_code,
    otp,
    request_type: request_type === 'email' ? 'forgot' : 'forgot',
    channel: request_type === 'email' ? 'email' : 'mobile',
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
    consumed: false,
  });

  try {
    await sendOtpEmail(user.email, otp, 'password reset');
  } catch (e) {
    console.error('[forgot-password] mail error', e);
  }

  return ok(res, { status: 'sent' });
}

export default withDb(handler);
