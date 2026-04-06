/* eslint-disable no-console */
import 'dotenv/config';
import { dbConnect } from '../src/server/db';
import { RestaurantTypeModel } from '../src/server/models/RestaurantType';
import { RestaurantModel } from '../src/server/models/Restaurant';
import { ItemCategoryModel } from '../src/server/models/ItemCategory';
import { ItemModel } from '../src/server/models/Item';
import { CouponModel } from '../src/server/models/Coupon';
import { UserModel } from '../src/server/models/User';
import mongoose from 'mongoose';

const RESTAURANT_TYPES = [
  { restaurant_type_id: 'RTY_HIGH_PROTEIN', title: 'High Protein', sort_order: 1 },
  { restaurant_type_id: 'RTY_LOW_CARB', title: 'Low Carb', sort_order: 2 },
  { restaurant_type_id: 'RTY_VEGAN', title: 'Vegan', sort_order: 3 },
  { restaurant_type_id: 'RTY_KETO', title: 'Keto', sort_order: 4 },
  { restaurant_type_id: 'RTY_BALANCED', title: 'Balanced', sort_order: 5 },
];

const PLACEHOLDER_LOGO =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400';
const PLACEHOLDER_COVER =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200';

// Restaurants span multiple countries — each ships with its own currency.
// `currency` is the display symbol; `currency_code` is the ISO 4217 code that
// Stripe uses when creating PaymentIntents.
const RESTAURANTS = [
  {
    restaurant_id: 'RES_FUEL_KITCHEN',
    name: 'Fuel Kitchen',
    description: 'High-protein meal prep crafted by performance chefs.',
    address: '350 5th Ave, New York, NY 10118, USA',
    restaurant_type_id: 'RTY_HIGH_PROTEIN',
    restaurant_type_title: 'High Protein',
    delivery_charge: 3.99,
    minimum_order_amount: 20,
    restaurant_longitude: -73.9857,
    restaurant_latitude: 40.7484,
    currency: '$',
    currency_code: 'usd',
    logo: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
    cover_photo: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
  },
  {
    restaurant_id: 'RES_GREEN_BOWL',
    name: 'Green Bowl Co.',
    description: 'Plant-based bowls bursting with flavour and nutrition.',
    address: '88 Camden Lock, London NW1 8AF, UK',
    restaurant_type_id: 'RTY_VEGAN',
    restaurant_type_title: 'Vegan',
    delivery_charge: 1.99,
    minimum_order_amount: 12,
    restaurant_longitude: -0.1466,
    restaurant_latitude: 51.5419,
    currency: '£',
    currency_code: 'gbp',
    logo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    cover_photo: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200',
  },
  {
    restaurant_id: 'RES_KETO_LAB',
    name: 'Keto Lab',
    description: 'Low-carb, high-fat meals scientifically dialled in.',
    address: '10 Rue de Rivoli, 75004 Paris, France',
    restaurant_type_id: 'RTY_KETO',
    restaurant_type_title: 'Keto',
    delivery_charge: 3.49,
    minimum_order_amount: 18,
    restaurant_longitude: 2.3522,
    restaurant_latitude: 48.8566,
    currency: '€',
    currency_code: 'eur',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    cover_photo: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200',
  },
  {
    restaurant_id: 'RES_BALANCED_TABLE',
    name: 'The Balanced Table',
    description: 'Macro-balanced family meals delivered fresh.',
    address: '1 Chome-1 Marunouchi, Chiyoda City, Tokyo 100-0005, Japan',
    restaurant_type_id: 'RTY_BALANCED',
    restaurant_type_title: 'Balanced',
    delivery_charge: 350,
    minimum_order_amount: 1500,
    restaurant_longitude: 139.7671,
    restaurant_latitude: 35.6812,
    currency: '¥',
    currency_code: 'jpy',
    logo: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400',
    cover_photo: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200',
  },
  {
    restaurant_id: 'RES_LEAN_LARDER',
    name: 'Lean Larder',
    description: 'Low-carb chef-made meals for busy weekdays.',
    address: 'Unter den Linden 77, 10117 Berlin, Germany',
    restaurant_type_id: 'RTY_LOW_CARB',
    restaurant_type_title: 'Low Carb',
    delivery_charge: 2.99,
    minimum_order_amount: 15,
    restaurant_longitude: 13.3777,
    restaurant_latitude: 52.5163,
    currency: '€',
    currency_code: 'eur',
    logo: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400',
    cover_photo: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=1200',
  },
];

const CATEGORIES_PER_RESTAURANT = [
  { suffix: 'BREAKFAST', title: 'Breakfast', sort_order: 1 },
  { suffix: 'LUNCH', title: 'Lunch', sort_order: 2 },
  { suffix: 'DINNER', title: 'Dinner', sort_order: 3 },
  { suffix: 'SNACKS', title: 'Snacks', sort_order: 4 },
];

const ITEM_TEMPLATES: Record<
  string,
  { title: string; description: string; price: number; image: string }[]
> = {
  BREAKFAST: [
    {
      title: 'Protein Oats Bowl',
      description: 'Steel-cut oats with whey, banana and almond butter.',
      price: 6.5,
      image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800',
    },
    {
      title: 'Veggie Shakshuka',
      description: 'Eggs poached in spiced tomato sauce with sourdough.',
      price: 7.25,
      image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800',
    },
  ],
  LUNCH: [
    {
      title: 'Grilled Chicken Bowl',
      description: 'Lean chicken breast, brown rice, broccoli, tahini.',
      price: 9.95,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    },
    {
      title: 'Salmon Poke',
      description: 'Sushi rice, sashimi salmon, edamame, avocado, soy.',
      price: 11.5,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    },
  ],
  DINNER: [
    {
      title: 'Beef Stir Fry',
      description: 'Wok-fried beef strips, jasmine rice, ginger garlic sauce.',
      price: 10.95,
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800',
    },
    {
      title: 'Tofu Buddha Bowl',
      description: 'Crispy tofu, quinoa, roasted veg, miso dressing.',
      price: 9.5,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    },
  ],
  SNACKS: [
    {
      title: 'Protein Bites',
      description: 'No-bake oat & whey energy balls (pack of 6).',
      price: 4.5,
      image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800',
    },
    {
      title: 'Greek Yogurt Parfait',
      description: 'Greek yogurt, honey, granola and seasonal berries.',
      price: 4.95,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    },
  ],
};

async function seed() {
  await dbConnect();
  console.log('connected to mongo');

  // wipe collections we own
  await Promise.all([
    RestaurantTypeModel.deleteMany({}),
    RestaurantModel.deleteMany({}),
    ItemCategoryModel.deleteMany({}),
    ItemModel.deleteMany({}),
    CouponModel.deleteMany({}),
  ]);
  console.log('cleared catalog collections');

  await RestaurantTypeModel.insertMany(
    RESTAURANT_TYPES.map((t) => ({ ...t, type: 'restaurant', status: 'active' }))
  );
  console.log(`inserted ${RESTAURANT_TYPES.length} restaurant types`);

  for (const r of RESTAURANTS) {
    await new RestaurantModel({
      ...r,
      logo: r.logo || PLACEHOLDER_LOGO,
      cover_photo: r.cover_photo || PLACEHOLDER_COVER,
    }).save();

    for (const cat of CATEGORIES_PER_RESTAURANT) {
      const catId = `ITC_${r.restaurant_id}_${cat.suffix}`;
      await new ItemCategoryModel({
        item_category_id: catId,
        restaurant_id: r.restaurant_id,
        categoryTitle: cat.title,
        sort_order: cat.sort_order,
      }).save();

      const templates = ITEM_TEMPLATES[cat.suffix] || [];
      for (let i = 0; i < templates.length; i++) {
        const t = templates[i];
        // JPY has no minor unit — bump baseline so prices feel right.
        const localPrice = r.currency_code === 'jpy' ? Math.round(t.price * 130) : t.price;
        await new ItemModel({
          item_id: `ITM_${r.restaurant_id}_${cat.suffix}_${i}`,
          restaurant_id: r.restaurant_id,
          restaurant_name: r.name,
          item_category_id: catId,
          title: t.title,
          description: t.description,
          ingredients: t.description,
          price: localPrice,
          currency: r.currency,
          currency_code: r.currency_code,
          cover_photo: t.image,
          image: t.image,
          banner: [t.image],
          search_keywords: t.title.toLowerCase().split(' '),
          sort_id: i,
        }).save();
      }
    }
    console.log(`seeded restaurant ${r.name}`);
  }

  await CouponModel.insertMany([
    {
      coupon_id: 'COU_WELCOME10',
      code: 'WELCOME10',
      discount_type: 'percentage',
      value: 10,
      maximum_discount_value: 5,
      min_order_amount: 15,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    },
    {
      coupon_id: 'COU_FIVEOFF',
      code: 'FIVEOFF',
      discount_type: 'amount',
      value: 5,
      maximum_discount_value: 5,
      min_order_amount: 25,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
    },
  ]);
  console.log('inserted coupons');

  // demo user (idempotent)
  const existing = await UserModel.findOne({ email: 'demo@mealhub.test' });
  if (!existing) {
    await new UserModel({
      consumer_id: 'CON_DEMO_USER',
      name: 'Demo User',
      email: 'demo@mealhub.test',
      password: 'demo1234',
      mobile: '5555550100',
      mobile_country_code: '+1',
      credit: 25,
      login_address: 'New York, NY, USA',
    }).save();
    console.log('created demo user (demo@mealhub.test / demo1234)');
  } else {
    console.log('demo user already exists');
  }

  await mongoose.disconnect();
  console.log('done.');
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
