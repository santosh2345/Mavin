import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { ItemModel } from '@/server/models/Item';
import { RestaurantModel } from '@/server/models/Restaurant';
import { serializeItemForBundle } from '@/server/prepper-builder';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  const { item_id } = req.query;
  if (!item_id) return fail(res, 'item_id is required', 422);

  const item = await ItemModel.findOne({ item_id }).lean();
  if (!item) return fail(res, 'Item not found', 404);
  const restaurant = await RestaurantModel.findOne({ restaurant_id: item.restaurant_id }).lean();

  return ok(res, {
    ...serializeItemForBundle(item),
    restaurant_name: restaurant?.name || item.restaurant_name,
    currency: restaurant?.currency || (item as any).currency || '$',
    currency_code:
      restaurant?.currency_code || (item as any).currency_code || 'usd',
  });
}

export default withDb(handler);
