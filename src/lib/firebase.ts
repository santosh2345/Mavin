/**
 * Firebase analytics — opt-in.
 *
 * If the host has set the NEXT_PUBLIC_FIREBASE_* env vars we initialise
 * the real client; otherwise we export a no-op stub so that existing
 * call-sites (`logEvent(analytics, ...)`) continue to work without
 * crashing or pulling in any third-party identity.
 */

type AnalyticsLike = Record<string, unknown>;

let analytics: AnalyticsLike = {};
let realLogEvent: ((a: any, name: string, params?: any) => void) | null = null;

export function logEvent(_a: any, name: string, params?: any) {
  if (realLogEvent) {
    try {
      realLogEvent(analytics, name, params);
    } catch {
      /* swallow analytics errors */
    }
  }
}

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

if (
  typeof window !== 'undefined' &&
  apiKey &&
  authDomain &&
  projectId &&
  appId
) {
  // Lazy require so the firebase SDK is only pulled into the bundle when
  // the host actually provides credentials.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { initializeApp } = require('firebase/app');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const firebaseAnalytics = require('firebase/analytics');
  const app = initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  });
  analytics = firebaseAnalytics.getAnalytics(app);
  realLogEvent = firebaseAnalytics.logEvent;
}

export { analytics };
