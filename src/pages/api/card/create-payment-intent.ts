import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { getStripe } from '@/server/stripe';
import { UserModel } from '@/server/models/User';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { amount, consumer_id, restaurant_id } = req.body || {};
  if (!amount || amount < 30) return fail(res, 'Amount must be at least 30 (pence)', 422);
  if (!consumer_id) return fail(res, 'consumer_id is required', 422);

  const stripe = getStripe();

  const user = await UserModel.findOne({ consumer_id });
  if (!user) return fail(res, 'User not found', 404);

  // Find or create Stripe customer keyed by consumer_id
  let customerId: string | undefined = (user as any).stripe_customer_id;
  if (!customerId) {
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { consumer_id },
      });
      customerId = customer.id;
    }
    (user as any).stripe_customer_id = customerId;
    // best-effort save (field isn't in schema by default)
    try {
      await user.save();
    } catch {
      /* noop */
    }
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customerId },
    { apiVersion: '2024-10-28.acacia' as any }
  );

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount)),
    currency: 'gbp',
    customer: customerId,
    receipt_email: user.email,
    automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    metadata: { consumer_id, restaurant_id: restaurant_id || '' },
  });

  return ok(
    res,
    {
      clientSecret: intent.client_secret,
      customerId,
      customerEphemeralKeySecret: ephemeralKey.secret,
    },
    200
  );
}

export default withDb(handler);
