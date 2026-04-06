import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { buildPrepperDetails } from '@/server/prepper-builder';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['GET'])) return;
  const { restaurant_id } = req.query;
  if (!restaurant_id) return fail(res, 'restaurant_id is required', 422);
  const prepper = await buildPrepperDetails(String(restaurant_id));
  if (!prepper) return fail(res, 'Restaurant not found', 404);
  return ok(res, prepper);
}

export default withDb(handler);
