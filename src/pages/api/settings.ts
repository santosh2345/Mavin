import type { NextApiRequest, NextApiResponse } from 'next';
import { ok } from '@/server/api-helpers';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return ok(res, {
    id: 'settings',
    options: {
      siteTitle: "Marvin's Den - healthy meals marketplace",
      siteSubtitle: 'healthy meals marketplace',
      currency: 'GBP',
      logo: {
        id: 'logo',
        original:
          'https://uploads-ssl.webflow.com/620ad29fb46ac6596379e3a5/620d0dde8482383154cce5b6_Less%20Background%20Logo.png',
        thumbnail:
          'https://uploads-ssl.webflow.com/620ad29fb46ac6596379e3a5/620d0dde8482383154cce5b6_Less%20Background%20Logo.png',
      },
      seo: {},
      contactDetails: { contact: 'support@marvinsden.com' },
    },
  });
}
