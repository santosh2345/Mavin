import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, ok } from '@/server/api-helpers';
import { getCartFor } from '@/server/cart-helpers';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = (req.query.slug as string[]) || [];
  const [user_id, type, item_id] = slug;
  if (!user_id || !type) return ok(res, { exists: false });
  const cart = await getCartFor(user_id, type as 'consumer' | 'guest');
  return ok(res, { exists: cart.items.some((i) => i.item_id === item_id) });
}

export default withDb(handler);
