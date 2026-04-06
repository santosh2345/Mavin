import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb, methodGuard, ok, fail } from '@/server/api-helpers';
import { AddressModel } from '@/server/models/Address';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  const {
    consumer_id,
    request_type,
    type = 'other',
    address,
    latitude,
    longitude,
    floor,
    landmark,
    title,
    address_id,
  } = req.body || {};

  if (!consumer_id) return fail(res, 'consumer_id is required', 422);
  if (!request_type) return fail(res, 'request_type is required', 422);

  switch (request_type) {
    case 'list': {
      const list = await AddressModel.find({ consumer_id }).sort({ createdAt: -1 }).lean();
      return ok(res, list);
    }
    case 'add': {
      if (!address || latitude == null || longitude == null) {
        return fail(res, 'address, latitude and longitude are required', 422);
      }
      const created = await AddressModel.create({
        consumer_id,
        type,
        address,
        latitude,
        longitude,
        floor,
        landmark,
        title,
      });
      const list = await AddressModel.find({ consumer_id }).sort({ createdAt: -1 }).lean();
      return ok(res, list);
    }
    case 'update': {
      if (!address_id) return fail(res, 'address_id is required', 422);
      await AddressModel.findOneAndUpdate(
        { address_id, consumer_id },
        { $set: { type, address, latitude, longitude, floor, landmark, title } },
        { new: true }
      );
      const list = await AddressModel.find({ consumer_id }).sort({ createdAt: -1 }).lean();
      return ok(res, list);
    }
    case 'delete': {
      if (!address_id) return fail(res, 'address_id is required', 422);
      await AddressModel.deleteOne({ address_id, consumer_id });
      const list = await AddressModel.find({ consumer_id }).sort({ createdAt: -1 }).lean();
      return ok(res, list);
    }
    default:
      return fail(res, `Unknown request_type: ${request_type}`, 422);
  }
}

export default withDb(handler);
