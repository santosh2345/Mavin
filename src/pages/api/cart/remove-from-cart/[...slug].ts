import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { getCartFor, serializeCart } from '@/server/cart-helpers';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['DELETE'])) return;
  const slug = (req.query.slug as string[]) || [];
  // Expected: [type, user_id, cart_id]
  const [type, user_id, cart_id] = slug;
  if (!type || !user_id || !cart_id) return fail(res, 'type, user_id and cart_id are required', 422);

  const cart = await getCartFor(user_id, type as 'consumer' | 'guest');
  cart.items = cart.items.filter((i) => i.cart_id !== cart_id);
  if (cart.items.length === 0) cart.restaurant_id = '';
  await cart.save();
  return ok(res, serializeCart(cart));
}

export default withDb(handler);
