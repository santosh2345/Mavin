import { CartModel, ICartItem } from './models/Cart';
import { ItemModel } from './models/Item';
import { RestaurantModel } from './models/Restaurant';
import { nextDeliveryDate } from './prepper-builder';

export async function getCartFor(owner_id: string, owner_type: 'consumer' | 'guest') {
  let cart = await CartModel.findOne({ owner_id, owner_type });
  if (!cart) {
    cart = await CartModel.create({ owner_id, owner_type, items: [], restaurant_id: '' });
  }
  return cart;
}

export async function addItemToCart(params: {
  owner_id: string;
  owner_type: 'consumer' | 'guest';
  item_id: string;
  qty: number;
  item_options: any[];
  restaurant_id: string;
}) {
  const cart = await getCartFor(params.owner_id, params.owner_type);

  // If the cart already has items from a different restaurant, signal "replace"
  if (cart.items.length > 0 && cart.restaurant_id && cart.restaurant_id !== params.restaurant_id) {
    return { error: 'DIFFERENT_RESTAURANT' as const };
  }

  const item = await ItemModel.findOne({ item_id: params.item_id });
  if (!item) return { error: 'ITEM_NOT_FOUND' as const };
  const restaurant = await RestaurantModel.findOne({ restaurant_id: params.restaurant_id });

  const optionsTotal = (params.item_options || []).reduce((sum, group: any) => {
    const list = group.item_option_list || [];
    return (
      sum +
      list.reduce((s: number, opt: any) => s + (Number(opt.price) || 0), 0)
    );
  }, 0);
  const unitPrice = item.price + optionsTotal;

  const existingIdx = cart.items.findIndex((i) => i.item_id === params.item_id);
  if (existingIdx >= 0) {
    const existing = cart.items[existingIdx];
    existing.qty += params.qty;
    existing.total_price = existing.qty * unitPrice;
    cart.items[existingIdx] = existing;
  } else {
    const newItem: ICartItem = {
      cart_id: `CIT${Date.now()}${Math.floor(Math.random() * 100000)}`,
      item_id: item.item_id,
      item_name: item.title,
      item_cover_photo: item.cover_photo,
      item_ingredients: item.ingredients,
      restaurant_id: item.restaurant_id,
      restaurant_name: restaurant?.name || item.restaurant_name,
      price: unitPrice,
      qty: params.qty,
      total_price: unitPrice * params.qty,
      currency: restaurant?.currency || item.currency || '$',
      currency_code: restaurant?.currency_code || item.currency_code || 'usd',
      item_options: params.item_options || [],
      cart_item_options: [],
    };
    cart.items.push(newItem);
  }

  cart.restaurant_id = params.restaurant_id;
  cart.order_pickup_date = nextDeliveryDate();
  await cart.save();
  return { error: null, cart };
}

export function serializeCart(cart: any) {
  if (!cart) {
    return {
      cartItems: [],
      order_pickup_date: '',
      restaurant_id: '',
      total_items: 0,
      total_price: 0,
    };
  }
  return {
    cartItems: cart.items,
    order_pickup_date: cart.order_pickup_date,
    restaurant_id: cart.restaurant_id,
    total_items: cart.items.reduce((s: number, i: any) => s + i.qty, 0),
    total_price: cart.items.reduce((s: number, i: any) => s + i.total_price, 0),
  };
}
