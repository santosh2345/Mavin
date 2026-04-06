import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok } from '@/server/api-helpers';
import { RestaurantModel } from '@/server/models/Restaurant';
import { ItemModel } from '@/server/models/Item';
import { serializeItemForBundle } from '@/server/prepper-builder';

/**
 * Returns Bundles[] grouped by restaurant — used by the home and explore pages.
 * Frontend hook: useBundles -> data.payload is Bundles[]
 *   { restaurant_name, restaurant_id, data: Bundle[] }
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  const { searchKeyword = '', store_type } = req.query;

  const itemFilter: any = {};
  if (searchKeyword && searchKeyword !== 'all' && searchKeyword !== 'bundle') {
    const re = new RegExp(String(searchKeyword), 'i');
    itemFilter.$or = [
      { title: re },
      { description: re },
      { search_keywords: re },
    ];
  }

  const restaurantFilter: any = { status: 'active' };
  if (store_type) restaurantFilter.store_type = store_type;
  const restaurants = await RestaurantModel.find(restaurantFilter).lean();
  const items = await ItemModel.find(itemFilter).lean();

  const grouped = restaurants
    .map((r) => ({
      restaurant_name: r.name,
      restaurant_id: r.restaurant_id,
      data: items
        .filter((it) => it.restaurant_id === r.restaurant_id)
        .map((it) => ({
          ...serializeItemForBundle(it),
          restaurant_name: r.name,
          restaurant_longitude: r.restaurant_longitude,
          restaurant_latitude: r.restaurant_latitude,
          location: {
            type: 'Point',
            coordinates: [r.restaurant_longitude, r.restaurant_latitude],
          },
          discount_type: r.discount_type,
          discount_value: r.discount_value,
          range: r.range,
          open_time: r.open_time,
          close_time: r.close_time,
          availability_status: r.availability_status,
        })),
    }))
    .filter((r) => r.data.length > 0);

  return ok(res, grouped);
}

export default withDb(handler);
