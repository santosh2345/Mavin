import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { ContactModel } from '@/server/models/Contact';
import { sendMail } from '@/server/mailer';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { name, email, subject, description } = req.body || {};
  if (!name || !email || !description) {
    return fail(res, 'name, email and description are required', 422);
  }
  await ContactModel.create({ name, email, subject, description });
  try {
    if (process.env.CONTACT_RECIPIENT) {
      await sendMail({
        to: process.env.CONTACT_RECIPIENT,
        subject: `[Contact] ${subject || 'New message'} — ${name}`,
        html: `<p><b>${name}</b> &lt;${email}&gt; wrote:</p><p>${description}</p>`,
      });
    }
  } catch (e) {
    console.error('[contact-us] mail error', e);
  }
  return ok(res, { received: true });
}

export default withDb(handler);
