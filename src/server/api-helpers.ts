import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from './db';

export type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<any> | any;

export function withDb(handler: Handler): Handler {
  return async (req, res) => {
    try {
      await dbConnect();
      return await handler(req, res);
    } catch (err: any) {
      console.error('[api error]', req.url, err);
      return res.status(500).json({
        error: { message: err?.message || 'Internal server error' },
        payload: null,
        status: '500',
      });
    }
  };
}

export function methodGuard(req: NextApiRequest, res: NextApiResponse, allowed: string[]) {
  if (!allowed.includes(req.method || '')) {
    res.setHeader('Allow', allowed);
    res.status(405).json({ error: { message: 'Method not allowed' }, payload: null, status: '405' });
    return false;
  }
  return true;
}

export function ok(res: NextApiResponse, payload: any, status: number | string = 200) {
  return res.status(typeof status === 'number' ? status : 200).json({
    error: null,
    payload,
    status: String(status),
  });
}

export function fail(
  res: NextApiResponse,
  message: string,
  status = 400,
  extra: Record<string, any> = {}
) {
  return res.status(status).json({
    error: { message },
    payload: null,
    status: String(status),
    ...extra,
  });
}
