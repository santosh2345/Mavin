import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';
import { ok, fail, methodGuard } from '@/server/api-helpers';
import { parseForm } from '@/server/parse-form';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ['POST'])) return;
  try {
    const { files } = await parseForm(req);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const list: any[] = [];
    const raw = files['attachment[]'] || files.attachment || files.file;
    const fileArray = Array.isArray(raw) ? raw : raw ? [raw] : [];

    for (const f of fileArray) {
      if (!f) continue;
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${f.originalFilename || 'file'}`;
      const dest = path.join(uploadsDir, filename);
      await fs.copyFile(f.filepath, dest);
      const url = `/uploads/${filename}`;
      list.push({ id: filename, original: url, thumbnail: url });
    }
    return ok(res, list);
  } catch (e: any) {
    return fail(res, e?.message || 'Upload failed', 500);
  }
}
