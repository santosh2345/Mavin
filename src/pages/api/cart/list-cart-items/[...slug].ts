import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { getCartFor, serializeCart } from '@/server/cart-helpers';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  const slug = (req.query.slug as string[]) || [];
  // Expected: [user_id, type, lang]
  const [user_id, type] = slug;
  if (!user_id || user_id === 'undefined' || user_id === 'null' || !type) {
    return ok(res, serializeCart(null));
  }
  if (type !== 'consumer' && type !== 'guest') {
    return fail(res, 'type must be consumer or guest', 422);
  }
  const cart = await getCartFor(user_id, type as 'consumer' | 'guest');
  return ok(res, serializeCart(cart));
}

export default withDb(handler);
