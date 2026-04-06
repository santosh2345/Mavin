import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, ok } from '@/server/api-helpers';
import { ItemModel } from '@/server/models/Item';
import { serializeItemForBundle } from '@/server/prepper-builder';

async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const items = await ItemModel.find({}).sort({ avg_rating: -1 }).limit(20).lean();
  return ok(res, items.map(serializeItemForBundle));
}

export default withDb(handler);
