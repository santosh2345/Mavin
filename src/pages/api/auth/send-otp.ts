import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { OtpModel } from '@/server/models/Otp';
import { generateOtp } from '@/server/auth';
import { sendOtpEmail } from '@/server/mailer';
import { UserModel } from '@/server/models/User';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const {
    email,
    mobile,
    mobile_country_code = '+44',
    request_type = 'signUp',
  } = req.body || {};

  if (!email && !mobile) return fail(res, 'email or mobile is required', 422);

  const otp = generateOtp();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000);

  // For mobile-based OTP, look up the user's email and send the code there
  // (this project has no real SMS provider — Nodemailer is the only channel).
  let deliveryEmail: string | undefined = email;
  if (!deliveryEmail && mobile) {
    const user = await UserModel.findOne({ mobile });
    deliveryEmail = user?.email;
  }

  await OtpModel.create({
    email: email ? String(email).toLowerCase() : undefined,
    mobile: mobile || undefined,
    mobile_country_code,
    otp,
    request_type,
    channel: email ? 'email' : 'mobile',
    expires_at,
    consumed: false,
  });

  if (deliveryEmail) {
    try {
      await sendOtpEmail(deliveryEmail, otp, request_type);
    } catch (e) {
      console.error('[send-otp] mail error', e);
    }
  } else {
    console.log(`[send-otp] OTP for mobile ${mobile}: ${otp} (no email on file — printed to console)`);
  }

  // The frontend expects payload.otp to be truthy as a "code sent" signal.
  // We never return the actual OTP value to the client.
  return ok(res, { otp: 'sent' });
}

export default withDb(handler);
