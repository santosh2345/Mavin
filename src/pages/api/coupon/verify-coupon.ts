import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { CouponModel } from '@/server/models/Coupon';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const { coupon_code, amount } = req.body || {};
  if (!coupon_code) return fail(res, 'coupon_code is required', 422);

  const coupon = await CouponModel.findOne({
    code: String(coupon_code).toUpperCase(),
    status: 'active',
  });
  if (!coupon) return fail(res, 'Invalid coupon code', 404);
  if (coupon.expires_at && coupon.expires_at < new Date()) {
    return fail(res, 'This coupon has expired', 410);
  }
  if (coupon.min_order_amount && Number(amount) < coupon.min_order_amount) {
    return fail(
      res,
      `Minimum order amount for this coupon is £${coupon.min_order_amount}`,
      422
    );
  }

  const discount =
    coupon.discount_type === 'percentage'
      ? (Number(amount) * coupon.value) / 100
      : coupon.value;

  return ok(res, {
    coupon_id: coupon.coupon_id,
    code: coupon.code,
    discount_type: coupon.discount_type,
    value: coupon.value,
    discount,
    maximum_discount_value: coupon.maximum_discount_value || discount,
  });
}

export default withDb(handler);
