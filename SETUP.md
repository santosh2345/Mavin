# MealHub — Local Setup

A worldwide meal-prep marketplace built on Next.js (pages router). The
backend runs **fully self-contained** as Next.js API routes inside
`src/pages/api/`, backed by **MongoDB (Mongoose)**, **Stripe**, and
**Nodemailer**. Address autocomplete uses **OpenStreetMap Nominatim**
(no API key, no credit card).

## 1. Prerequisites

- Node.js 18.17+ (Next 14 requirement)
- A MongoDB instance — local (`mongod`) or a free Atlas cluster
- A Stripe account (test mode is fine — supports any currency)
- An SMTP account (Mailtrap / Gmail app password / SendGrid / …) — optional;
  the server falls back to a console-logging transport if you leave it blank

## 2. Install dependencies

```bash
yarn install
# or
npm install
```

## 3. Configure environment

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

| Variable                             | Required | Notes                                    |
| ------------------------------------ | -------- | ---------------------------------------- |
| `MONGODB_URI`                        | yes      | e.g. `mongodb://127.0.0.1:27017/mealhub` |
| `JWT_SECRET`                         | yes      | long random string                       |
| `STRIPE_SECRET_KEY`                  | yes      | `sk_test_...`                            |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | yes      | `pk_test_...`                            |
| `NEXT_PUBLIC_REST_API_ENDPOINT`      | yes      | leave as `/api`                          |
| `SMTP_*` / `MAIL_FROM`               | no       | leave blank to log emails to console     |
| `CONTACT_RECIPIENT`                  | no       | inbox for contact-form submissions       |
| `NEXT_PUBLIC_GTM_ID`                 | no       | Google Tag Manager — disabled if blank   |
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`      | no       | Facebook Pixel — disabled if blank       |
| `NEXT_PUBLIC_FIREBASE_*`             | no       | Firebase Analytics — disabled if blank   |

No Google Maps API key is required. Address autocomplete uses
[Nominatim](https://nominatim.openstreetmap.org/) which is free and has
no signup. Please respect their usage policy in production (1 req/sec,
identify your app via User-Agent).

## 4. Seed the database

The seed script populates restaurant types, 5 demo restaurants ("preppers")
spread across **NYC (USD), London (GBP), Paris (EUR), Tokyo (JPY), and
Berlin (EUR)**, their categories, items, two coupons, and a demo user.

```bash
yarn seed
# or
npx tsx scripts/seed.ts
```

Demo login:

- email: `demo@mealhub.test`
- password: `demo1234`

Demo coupons: `WELCOME10` (10% off, max 5, min 15) and `FIVEOFF` (5 off, min 25).

## 5. Run the app

```bash
yarn dev
```

Open <http://localhost:3000>.

## 6. Build for production

```bash
yarn build && yarn start
```

## Architecture notes

- **API routes** live in `src/pages/api/`. Each route uses
  `withDb(handler)` from `src/server/api-helpers.ts`, which connects to
  MongoDB on demand and wraps responses in `{error, payload, status}` —
  the shape the frontend's react-query hooks already expect.
- **Models** are in `src/server/models/`. IDs use string prefixes
  (`CON…`, `RES…`, `ITM…`, …) so they round-trip cleanly through the
  existing frontend types.
- **Multi-currency**: each restaurant carries its own `currency` (display
  symbol) and `currency_code` (ISO 4217). When a customer adds an item to
  the cart, the cart inherits these. Stripe's PaymentIntent is created
  in the restaurant's local currency, so the same install works
  worldwide.
- **Auth**: `/auth/consumer/sign-in` and `/auth/consumer/sign-up` issue a
  JWT signed with `JWT_SECRET`. For backwards compatibility the existing
  frontend stores `consumer_id` (not the JWT) in cookies, so
  `getAuthUser()` accepts *either* a JWT *or* a raw consumer_id as
  `Bearer …`. New installs naturally migrate to JWT-only.
- **OTP** is sent via Nodemailer (`src/server/mailer.ts`). For
  mobile-only OTP requests we look up the user's email and deliver there
  (no SMS provider is wired up).
- **Geocoding / address autocomplete** uses OpenStreetMap Nominatim
  (`src/components/auth/address-auto.tsx`). No API keys required.
- **Uploads** are written to `public/uploads/` so they're served directly
  by Next. Swap to S3 by editing `src/pages/api/attachments.ts`.

## Useful scripts

```bash
yarn dev       # next dev
yarn build     # next build
yarn start     # next start
yarn seed      # populate MongoDB with demo data
yarn lint      # eslint
```
