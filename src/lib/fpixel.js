/**
 * Facebook pixel helpers — safely no-op when no pixel id is configured.
 */
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export const pageview = () => {
  if (typeof window === 'undefined' || !window.fbq || !FB_PIXEL_ID) return;
  window.fbq('track', 'PageView');
};

export const event = (name, options = {}) => {
  if (typeof window === 'undefined' || !window.fbq || !FB_PIXEL_ID) return;
  window.fbq('track', name, options);
};
