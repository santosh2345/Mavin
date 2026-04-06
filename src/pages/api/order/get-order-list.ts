import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok } from '@/server/api-helpers';
import { OrderModel } from '@/server/models/Order';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['GET', 'POST'])) return;
  const params = req.method === 'GET' ? req.query : req.body;
  const { consumer_id, request_type } = params || {};
  if (!consumer_id) return ok(res, []);

  const filter: any = { consumer_id };
  if (request_type === 'past') {
    filter.status = { $in: ['placed', 'preparing', 'picked_up', 'delivered', 'cancelled', 'canceled'] };
  } else if (request_type === 'current') {
    filter.status = { $in: ['placed', 'preparing', 'picked_up'] };
  }

  const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
  const serialized = orders.map((o) => ({
    order_id: o.order_id,
    name: o.restaurant_name,
    cover_photo: o.cover_photo,
    logo: o.logo,
    restaurent_id: o.restaurant_id, // frontend typo: "restaurent_id"
    restaurant_id: o.restaurant_id,
    status: o.status,
    gross_amount: o.gross_amount,
    net_amount: o.net_amount,
    items: o.items,
    deliver_to: o.deliver_to,
    created_at: (o as any).createdAt
      ? new Date((o as any).createdAt).toDateString()
      : o.created_at_str,
  }));
  return ok(res, serialized);
}

export default withDb(handler);
