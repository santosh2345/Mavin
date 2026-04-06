import type { AppProps } from 'next/app';
import type { NextPageWithLayout } from '@/types';
import { useState, useEffect } from 'react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { validateEnvironmentVariables } from '@/config/validate-environment-variables';
import { CartProvider } from '@/components/cart/lib/cart.context';
import { ModalProvider } from '@/components/modal-views/context';
import ModalsContainer from '@/components/modal-views/container';
import DrawersContainer from '@/components/drawer-views/container';
import SearchView from '@/components/search/search-view';
import DefaultSeo from '@/layouts/_default-seo';

// base css file
import '@/assets/css/scrollbar.css';
import '@/assets/css/swiper-carousel.css';
import '@/assets/css/globals.css';
import { useRouter } from 'next/router';
import Layout from '@/layouts/_general-layout';
import UserContextProvider from '@/components/preppers/context';
import { SpinnerIcon } from '@/components/icons/spinner-icon';

import dynamic from 'next/dynamic';

const PrivateRoute = dynamic(() => import('@/layouts/_private-route'), {
  ssr: false,
});

validateEnvironmentVariables();

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function CustomApp({ Component, pageProps }: AppPropsWithLayout) {
  const [queryClient] = useState(() => new QueryClient());
  const getLayout = Component.getLayout ?? ((page: any) => page);
  const authenticationRequired = Component.authorization ?? false;

  const router = useRouter();
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  // Defer browser-only platform detection to after hydration so the
  // server and first client render match.
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('IPHONE') >= 0);
  }, []);

  useEffect(() => {
    const handleStart = () => setPageLoading(true);
    const handleComplete = () => setPageLoading(false);
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  const [location, setLocation] = useState<any>({});

  // Initialise a stable, persisted guest id immediately so the cart can
  // start querying right away — even if the user denies geolocation.
  useEffect(() => {
    let guestId = '';
    try {
      guestId = window.localStorage.getItem('marvin_guest_id') || '';
      if (!guestId) {
        guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        window.localStorage.setItem('marvin_guest_id', guestId);
      }
    } catch {
      guestId = `guest_${Date.now()}`;
    }
    setLocation((prev: any) => ({ ...prev, guestInfo: guestId }));
  }, []);

  // Worldwide geolocation. Uses the browser API + OpenStreetMap Nominatim
  // for reverse-geocoding (free, no API key, no card required).
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { headers: { Accept: 'application/json' } }
          );
          const data = await res.json();
          setLocation((prev: any) => ({
            ...prev,
            latitude,
            longitude,
            address: data?.display_name || '',
            postcode: data?.address?.postcode || '',
            country_code: data?.address?.country_code || '',
            guestInfo: prev?.guestInfo,
          }));
        } catch {
          setLocation((prev: any) => ({
            ...prev,
            latitude,
            longitude,
            guestInfo: prev?.guestInfo,
          }));
        }
      },
      () => {
        // Permission denied / unavailable — that's fine, the cart still
        // works with just the guest id. We don't show a noisy toast.
      },
      { timeout: 8000, maximumAge: 60_000 * 30 }
    );
  }, []);

  // Optional Google Tag Manager — only loads if NEXT_PUBLIC_GTM_ID is set.
  useEffect(() => {
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
    if (!gtmId) return;
    let cancelled = false;
    import('react-gtm-module').then((mod) => {
      if (cancelled) return;
      mod.default.initialize({ gtmId });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Optional Facebook Pixel — only loads if NEXT_PUBLIC_FACEBOOK_PIXEL_ID is set.
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    if (!pixelId) return;
    let cancelled = false;
    import('react-facebook-pixel').then((mod) => {
      if (cancelled) return;
      const ReactPixel = mod.default;
      ReactPixel.init(pixelId);
      ReactPixel.pageView();
      const onRoute = () => ReactPixel.pageView();
      router.events.on('routeChangeComplete', onRoute);
    });
    return () => {
      cancelled = true;
    };
  }, [router.events]);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <UserContextProvider location={location} setLocation={setLocation}>
            <CartProvider>
              <ModalProvider>
                <AnimatePresence
                  exitBeforeEnter
                  initial={false}
                  onExitComplete={() => window.scrollTo(0, 0)}
                >
                  {pageLoading ? (
                    <Layout>
                      <div className="flex h-full min-h-[calc(100vh-200px)] items-center justify-center">
                        <SpinnerIcon className="h-auto w-12 animate-spin" />
                      </div>
                    </Layout>
                  ) : (
                    <>
                      <DefaultSeo />
                      {authenticationRequired ? (
                        <PrivateRoute>
                          {getLayout(<Component {...pageProps} />)}
                        </PrivateRoute>
                      ) : (
                        getLayout(<Component {...pageProps} />)
                      )}
                      <SearchView />
                      <ModalsContainer />
                      <DrawersContainer />
                      {!isMac && (
                        <Toaster containerClassName="!top-16 sm:!top-3.5 !bottom-16 sm:!bottom-3.5" />
                      )}
                    </>
                  )}
                </AnimatePresence>
              </ModalProvider>
            </CartProvider>
          </UserContextProvider>
        </ThemeProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default CustomApp;
