import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok } from '@/server/api-helpers';
import { RestaurantModel } from '@/server/models/Restaurant';
import { RestaurantTypeModel } from '@/server/models/RestaurantType';
import { ItemModel } from '@/server/models/Item';

/**
 * Returns Preppers[] grouped by restaurant_type — used by the preppers page.
 * Frontend hook: usePreppers -> data.payload is Preppers[]
 *   { type, title, count, restaurant_type_id, currency, data: Prepper[] }
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;

  const types = await RestaurantTypeModel.find({ status: 'active' }).sort({ sort_order: 1 }).lean();
  const restaurants = await RestaurantModel.find({ status: 'active' }).lean();
  const allItems = await ItemModel.find({}).select('restaurant_id').lean();
  const itemCountByRestaurant = allItems.reduce<Record<string, number>>((acc, it) => {
    acc[it.restaurant_id] = (acc[it.restaurant_id] || 0) + 1;
    return acc;
  }, {});

  const groups = types.map((t) => {
    const data = restaurants
      .filter((r) => r.restaurant_type_id === t.restaurant_type_id)
      .map((r) => ({
        ...r,
        _id: String((r as any)._id),
        total_item: itemCountByRestaurant[r.restaurant_id] || 0,
        distance: 0,
        est_order_time: 30,
        order_pickup_date: '',
      }));
    return {
      type: t.type,
      title: t.title,
      count: data.length,
      restaurant_type_id: t.restaurant_type_id,
      currency: '£',
      data,
    };
  });

  return ok(res, groups);
}

export default withDb(handler);
