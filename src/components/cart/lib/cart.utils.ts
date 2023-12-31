export type Optional<T, K extends keyof T> = Partial<T> & Omit<T, K>;
export interface Item {
  cart_id?: string;
  item_name?: string;
  item_cover_photo?: string;
  restaurant_id?: string;
  price?: number;
  qty?: number;
  cart_item_options?: [];
  item_id?: string;
  item_ingredients?: string;
  total_price?: number;

  stock?: number;

  item_options?: any[];
  restaurant_name?: string;
}
export interface VerifiedResponse {
  clientSecret: string;
  customerId: string;
  customerEphemeralKeySecret: string;
}
export interface UpdateItemInput extends Partial<Omit<Item, 'id'>> {}

export function addItemWithQuantity(
  items: Item[],
  item: Optional<Item, 'qty'>,
  quantity: number
) {
  if (quantity <= 0) {
    throw new Error("cartQuantity can't be zero or less than zero");
  }
  const existingItemIndex = items.findIndex(
    (existingItem) => existingItem.item_id === item.item_id
  );

  if (existingItemIndex > -1) {
    const newItems = [...items];
    newItems[existingItemIndex].qty! += quantity;
    return newItems;
  }
  return [...items, { ...item, quantity }];
}

export function removeItemOrQuantity(
  items: Item[],
  id: Item['item_id'],
  quantity: number
) {
  return items.reduce((acc: Item[], item) => {
    if (item.item_id === id) {
      const newQuantity = item.qty! - quantity;

      return newQuantity > 0
        ? [...acc, { ...item, quantity: newQuantity }]
        : [...acc];
    }
    return [...acc, item];
  }, []);
}
// Simple CRUD for Item
export function addItem(items: Item[], item: Item) {
  return [...items, item];
}

export function getItem(items: Item[], id: Item['item_id']) {
  return items.find((item) => item.item_id === id);
}

export function updateItem(
  items: Item[],
  id: Item['item_id'],
  item: UpdateItemInput
) {
  return items.map((existingItem) =>
    existingItem.item_id === id ? { ...existingItem, ...item } : existingItem
  );
}

export function removeItem(items: Item[], id: Item['item_id']) {
  return items.filter((existingItem) => existingItem.item_id !== id);
}
export function inStock(items: Item[], id: Item['item_id']) {
  const item = getItem(items, id);
  if (item) return item['qty']! < item['stock']!;
  return false;
}
export const calculateItemTotals = (items: Item[]) =>
  items.map((item) => ({
    ...item,
    itemTotal: item.price! * item.qty!,
  }));

export const calculateTotal = (items: Item[]) =>
  items.reduce((total, item) => total + item.total_price!, 0);

export const calculateTotalItems = (items: Item[]) =>
  items.reduce((sum, item) => sum + item.qty!, 0);

export const calculateUniqueItems = (items: Item[]) => items.length;

interface PriceValues {
  totalAmount: number;
  tax: number;
  shipping_charge: number;
}
export const calculatePaidTotal = (
  { totalAmount, tax, shipping_charge }: PriceValues,
  discount?: number
) => {
  let paidTotal = totalAmount + tax + shipping_charge;
  if (discount) {
    paidTotal = paidTotal - discount;
  }
  return paidTotal;
};
