import type { NextApiRequest, NextApiResponse } from 'next';
import { ok, methodGuard } from '@/server/api-helpers';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  return ok(res, true);
}
