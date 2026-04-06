import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, ok } from '@/server/api-helpers';
import { getCartFor, serializeCart } from '@/server/cart-helpers';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = (req.query.slug as string[]) || [];
  const [user_id, type] = slug;
  if (!user_id || !type) return ok(res, { cartItems: [] });
  const cart = await getCartFor(user_id, type as 'consumer' | 'guest');
  return ok(res, serializeCart(cart));
}

export default withDb(handler);
