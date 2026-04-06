import type { NextApiRequest, NextApiResponse } from 'next';
import { withDb } from '@/server/api-helpers';
import { RestaurantModel } from '@/server/models/Restaurant';

async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const data = (await RestaurantModel.find({}).lean()).map((r) => ({
    id: r.restaurant_id,
    name: r.name,
    slug: r.restaurant_id,
    description: r.description,
    orders_count: 0,
    products_count: 0,
    logo: { id: 'logo', original: r.logo, thumbnail: r.logo },
    cover_image: { id: 'cover', original: r.cover_photo, thumbnail: r.cover_photo },
    settings: { socials: [] },
    address: { street_address: r.address, city: '', state: '', zip: '', country: '' },
    owner: { id: '', name: '', email: '' },
  }));
  return res.status(200).json({
    current_page: 1,
    data,
    first_page_url: '',
    from: 1,
    last_page: 1,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    per_page: data.length,
    prev_page_url: null,
    to: data.length,
    total: data.length,
  });
}

export default withDb(handler);
