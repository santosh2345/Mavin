import { useState } from 'react';
import { useRouter } from 'next/router';
import routes from '@/config/routes';
import Button from '@/components/ui/button';
import Scrollbar from '@/components/ui/scrollbar';
import CartItemList from '@/components/cart/cart-item-list';
import CartEmpty from '@/components/cart/cart-empty';
import usePrice from '@/lib/hooks/use-price';
import { useCart } from '@/components/cart/lib/cart.context';
import { useDrawer } from '@/components/drawer-views/context';
import { CloseIcon } from '@/components/icons/close-icon';
import client from '@/data/client';
import { getAuthToken } from '@/data/client/token.utils';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';

export default function CartDrawerView() {
  const router = useRouter();
  const { closeDrawer } = useDrawer();
  const { items, total, isEmpty } = useCart();
  const { price: totalPrice } = usePrice({
    amount: total,
  });
  const token = getAuthToken();

  const { isLoading: loading, data: prepper } = useQuery(
    [items],
    () =>
      client.preppers.getDetails({
        restaurant_id: items[0].restaurant_id,
        consumer_id: token!,
        latitude: 52.2880069,
        longitude: 0.0522349,
        code: 'EN',
        searchKey: '',
      }),
    {
      enabled: !isEmpty,
    }
  );

  function handleCheckout() {
    if (prepper?.payload.minimum_order_amount! <= total) {
      router.push(routes.checkout);
    } else {
      toast.error(
        <b>
          Order amount should be more than £
          {prepper?.payload.minimum_order_amount!}.
        </b>,
        {
          className: '-mt-10 xs:mt-0',
        }
      );
    }
  }
  return (
    <>
      <div className="flex h-[70px] items-center justify-between py-2 px-5 sm:px-7">
        <h2 className="text-sm font-medium capitalize text-dark dark:text-light">
          Basket
        </h2>
        <div className="ml-3 flex h-7 items-center">
          <button
            type="button"
            className="-m-2 p-2 text-dark-800 outline-none transition-all hover:text-dark hover:dark:text-light-200"
            onClick={closeDrawer}
          >
            <span className="sr-only">Close panel</span>
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Scrollbar className="cart-scrollbar w-full flex-1 py-6 px-6 sm:px-7">
        {!isEmpty ? (
          <CartItemList
            closeDrawer={closeDrawer}
            deliveryCharge={prepper?.payload.delivery_charge || 0}
            name={prepper?.payload.name}
          />
        ) : (
          <CartEmpty />
        )}
      </Scrollbar>
      <div className="border-t border-light-300 px-5 py-6 dark:border-dark-500 sm:px-7 sm:pb-8 sm:pt-7">
        <div className="flex justify-between text-sm font-medium text-dark dark:text-light">
          <span>Subtotal:</span>
          <span>{totalPrice}</span>
        </div>
        <div className="mt-5 md:mt-8">
          <Button
            disabled={isEmpty || loading}
            isLoading={loading}
            onClick={() => handleCheckout()}
            className="w-full text-sm md:h-[52px]"
          >
            Proceed to checkout
          </Button>
        </div>
      </div>
    </>
  );
}
