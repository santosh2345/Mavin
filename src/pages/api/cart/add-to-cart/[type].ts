import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { addItemToCart, serializeCart } from '@/server/cart-helpers';
import { parseForm } from '@/server/parse-form';

export const config = { api: { bodyParser: false } };

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { type } = req.query;
  if (type !== 'consumer' && type !== 'guest') {
    return fail(res, 'type must be consumer or guest', 422);
  }

  let data: Record<string, any> = {};
  const ct = String(req.headers['content-type'] || '');
  if (ct.includes('multipart/form-data')) {
    const { fields } = await parseForm(req);
    data = fields;
    if (typeof data.item_options === 'string') {
      try {
        data.item_options = JSON.parse(data.item_options);
      } catch {
        data.item_options = [];
      }
    }
  } else {
    // fallback: rely on default JSON parser by importing buffer
    let body = '';
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => resolve());
      req.on('error', reject);
    });
    try {
      data = body ? JSON.parse(body) : {};
    } catch {
      data = {};
    }
  }

  const { item_id, qty, item_options, restaurant_id, consumer_id, device_id } = data;
  if (!item_id || !restaurant_id) return fail(res, 'item_id and restaurant_id are required', 422);

  const owner_id = type === 'consumer' ? consumer_id : device_id;
  if (!owner_id) return fail(res, `${type === 'consumer' ? 'consumer_id' : 'device_id'} is required`, 422);

  const result = await addItemToCart({
    owner_id,
    owner_type: type as 'consumer' | 'guest',
    item_id,
    qty: Number(qty) || 1,
    item_options: item_options || [],
    restaurant_id,
  });

  if (result.error === 'DIFFERENT_RESTAURANT') {
    return res.status(406).json({
      error: { message: 'Cart contains items from a different restaurant' },
      payload: null,
      status: '406',
    });
  }
  if (result.error === 'ITEM_NOT_FOUND') {
    return fail(res, 'Item not found', 404);
  }

  return ok(res, serializeCart(result.cart));
}

export default withDb(handler);
