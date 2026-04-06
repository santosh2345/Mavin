import type { NextApiRequest } from 'next';
import formidable from 'formidable';

export const formidableConfig = {
  api: { bodyParser: false },
};

export async function parseForm(req: NextApiRequest): Promise<{
  fields: Record<string, any>;
  files: Record<string, any>;
}> {
  const form = formidable({ multiples: true, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      // Flatten formidable v3 array values
      const flatFields: Record<string, any> = {};
      Object.entries(fields).forEach(([k, v]) => {
        flatFields[k] = Array.isArray(v) && v.length === 1 ? v[0] : v;
      });
      const flatFiles: Record<string, any> = {};
      Object.entries(files).forEach(([k, v]) => {
        flatFiles[k] = Array.isArray(v) && v.length === 1 ? v[0] : v;
      });
      resolve({ fields: flatFields, files: flatFiles });
    });
  });
}
