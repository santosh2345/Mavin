import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { OrderModel } from '@/server/models/Order';
import { UserModel } from '@/server/models/User';
import { CartModel } from '@/server/models/Cart';
import { RestaurantModel } from '@/server/models/Restaurant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { place_order_json } = req.body || {};
  if (!place_order_json) return fail(res, 'place_order_json is required', 422);
  let payload: any;
  try {
    payload = JSON.parse(place_order_json);
  } catch {
    return fail(res, 'place_order_json is not valid JSON', 422);
  }

  const { consumer_id, restaurant_id, credit_deduct_amount = 0 } = payload;
  if (!consumer_id || !restaurant_id) return fail(res, 'consumer_id and restaurant_id are required', 422);

  const user = await UserModel.findOne({ consumer_id });
  if (!user) return fail(res, 'User not found', 404);

  const cart = await CartModel.findOne({ owner_id: consumer_id, owner_type: 'consumer' });
  const restaurant = await RestaurantModel.findOne({ restaurant_id });

  const order = await OrderModel.create({
    consumer_id,
    restaurant_id,
    restaurant_name: restaurant?.name || '',
    cover_photo: restaurant?.cover_photo || '',
    logo: restaurant?.logo || '',
    items: cart?.items || [],
    coupon_id: payload.coupon_id || '',
    coupon_discount: Number(payload.coupon_discount) || 0,
    coupon_type: payload.coupon_type || '',
    coupon_value: Number(payload.coupon_value) || 0,
    credit_deduct_amount: Number(credit_deduct_amount) || 0,
    deliver_to: payload.deliver_to || '',
    deliver_to_latitude: Number(payload.deliver_to_latitude) || 0,
    deliver_to_longitude: Number(payload.deliver_to_longitude) || 0,
    delivery_fee: Number(payload.delivery_fee) || 0,
    discount_type: payload.discount_type || '',
    discount_value: Number(payload.discount_value) || 0,
    floor: payload.floor != null ? String(payload.floor) : '',
    food_allergies_note: payload.food_allergies_note || '',
    gross_amount: Number(payload.gross_amount) || 0,
    net_amount: Number(payload.net_amount) || 0,
    restaurant_discount: Number(payload.restaurant_discount) || 0,
    special_instruction: payload.special_instruction || '',
    total_tax_amount: Number(payload.total_tax_amount) || 0,
    status: 'placed',
    created_at_str: new Date().toDateString(),
  });

  // Deduct used credit from user balance
  if (credit_deduct_amount > 0) {
    user.credit = Math.max(0, user.credit - Number(credit_deduct_amount));
    await user.save();
  }

  // Empty the cart
  if (cart) {
    cart.items = [];
    cart.restaurant_id = '';
    cart.order_pickup_date = '';
    await cart.save();
  }

  return ok(res, {
    order_id: order.order_id,
    credit: user.credit,
  });
}

export default withDb(handler);
