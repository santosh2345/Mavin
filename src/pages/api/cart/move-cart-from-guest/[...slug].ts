import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { CartModel } from '@/server/models/Cart';
import { getCartFor, serializeCart } from '@/server/cart-helpers';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['PUT'])) return;
  const slug = (req.query.slug as string[]) || [];
  const [guest_id, user_id] = slug;
  if (!guest_id || !user_id) return ok(res, { merged: false });

  const guestCart = await CartModel.findOne({ owner_id: guest_id, owner_type: 'guest' });
  const consumerCart = await getCartFor(user_id, 'consumer');

  if (guestCart && guestCart.items.length > 0) {
    // If consumer cart is empty, just take the guest cart
    if (consumerCart.items.length === 0) {
      consumerCart.items = guestCart.items;
      consumerCart.restaurant_id = guestCart.restaurant_id;
      consumerCart.order_pickup_date = guestCart.order_pickup_date;
    } else if (consumerCart.restaurant_id === guestCart.restaurant_id) {
      // Merge by item_id
      guestCart.items.forEach((gi) => {
        const idx = consumerCart.items.findIndex((ci) => ci.item_id === gi.item_id);
        if (idx >= 0) {
          consumerCart.items[idx].qty += gi.qty;
          consumerCart.items[idx].total_price =
            consumerCart.items[idx].qty * consumerCart.items[idx].price;
        } else {
          consumerCart.items.push(gi);
        }
      });
    }
    await consumerCart.save();
    await CartModel.deleteOne({ _id: guestCart._id });
  }

  return ok(res, serializeCart(consumerCart));
}

export default withDb(handler);
