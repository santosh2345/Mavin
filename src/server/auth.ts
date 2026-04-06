import { SignJWT, jwtVerify } from 'jose';
import type { NextApiRequest } from 'next';
import { dbConnect } from './db';
import { UserModel, IUser } from './models/User';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-secret-change-me-please-change-me-please'
);

export async function signJwt(payload: Record<string, any>, ttl = '30d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(JWT_SECRET);
}

export async function verifyJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub?: string; consumer_id?: string };
  } catch {
    return null;
  }
}

/**
 * The frontend stores `consumer_id` (not a JWT) as the auth token in cookies
 * and sends it as `Authorization: Bearer <consumer_id>`. To stay compatible
 * we accept either: a real JWT or a raw consumer_id.
 */
export async function getAuthUser(req: NextApiRequest): Promise<IUser | null> {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  await dbConnect();
  const claims = await verifyJwt(token);
  const consumerId = claims?.consumer_id || claims?.sub || token;
  if (!consumerId) return null;
  return UserModel.findOne({ consumer_id: consumerId });
}

export function generateOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
