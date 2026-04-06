import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { getCartFor, serializeCart } from '@/server/cart-helpers';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['DELETE'])) return;
  const slug = (req.query.slug as string[]) || [];
  // Expected: [type, user_id]
  const [type, user_id] = slug;
  if (!type || !user_id) return fail(res, 'type and user_id are required', 422);

  const cart = await getCartFor(user_id, type as 'consumer' | 'guest');
  cart.items = [];
  cart.restaurant_id = '';
  cart.order_pickup_date = '';
  await cart.save();
  return ok(res, serializeCart(cart));
}

export default withDb(handler);
