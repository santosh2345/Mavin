import { RestaurantModel, IRestaurant } from './models/Restaurant';
import { ItemModel } from './models/Item';
import { ItemCategoryModel } from './models/ItemCategory';

/**
 * Build the deeply-nested Prepper response shape that the frontend expects:
 * { ...restaurant, itemCategoryDetails: [{categoryTitle, item_category_id, itemList: [items]}] }
 */
export async function buildPrepperDetails(restaurant_id: string) {
  const restaurant = await RestaurantModel.findOne({ restaurant_id }).lean<IRestaurant | null>();
  if (!restaurant) return null;
  const categories = await ItemCategoryModel.find({ restaurant_id }).sort({ sort_order: 1 }).lean();
  const items = await ItemModel.find({ restaurant_id }).lean();

  const itemCategoryDetails = categories.map((cat) => ({
    categoryTitle: cat.categoryTitle,
    category_status: cat.category_status,
    item_category_id: cat.item_category_id,
    itemList: items
      .filter((it) => it.item_category_id === cat.item_category_id)
      .map(serializeItemForBundle),
  }));

  return {
    ...restaurant,
    _id: String((restaurant as any)._id),
    itemCategoryDetails,
    total_item: items.length,
    distance: 0,
    est_order_time: 30,
    order_pickup_date: nextDeliveryDate(),
  };
}

export function serializeItemForBundle(item: any) {
  return {
    item_id: item.item_id,
    title: item.title,
    description: item.description,
    ingredients: item.ingredients,
    price: item.price,
    cover_photo: item.cover_photo,
    image: item.image,
    banner: item.banner,
    status: item.status,
    availability_status: item.availability_status,
    sort_id: item.sort_id,
    avg_rating: item.avg_rating,
    badge_count: item.badge_count,
    preparation_time: item.preparation_time,
    est_weight: item.est_weight,
    restaurant_id: item.restaurant_id,
    restaurant_name: item.restaurant_name,
    currency: item.currency,
    currency_code: item.currency_code,
    item_options: item.item_options,
  };
}

export function nextDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toDateString();
}
