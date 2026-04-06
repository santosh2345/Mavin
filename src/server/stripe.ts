import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to .env.local to enable payments.'
    );
  }
  stripe = new Stripe(key, { apiVersion: '2024-10-28.acacia' as any });
  return stripe;
}
