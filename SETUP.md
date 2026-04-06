# Marvin's Den — Local Setup

This project is a fork of Pickbazar (Next.js) that has been rebuilt to run
**fully self-contained**: the backend that used to live in a separate
service is now implemented as Next.js API routes inside `src/pages/api/`,
backed by **MongoDB (Mongoose)**, **Stripe**, and **Nodemailer**.

## 1. Prerequisites

- Node.js 18.17+ (Next 14 requirement)
- A MongoDB instance — local (`mongod`) or a free Atlas cluster
- A Stripe account (test mode is fine)
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

| Variable                            | Required | Notes                                       |
| ----------------------------------- | -------- | ------------------------------------------- |
| `MONGODB_URI`                       | yes      | e.g. `mongodb://127.0.0.1:27017/marvinsden` |
| `JWT_SECRET`                        | yes      | long random string                          |
| `STRIPE_SECRET_KEY`                 | yes      | `sk_test_...`                               |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | yes      | `pk_test_...`                               |
| `NEXT_PUBLIC_REST_API_ENDPOINT`     | yes      | leave as `/api`                             |
| `SMTP_*` / `MAIL_FROM`              | no       | leave blank to log emails to console        |
| `CONTACT_RECIPIENT`                 | no       | inbox for contact-form submissions          |
| `NEXT_PUBLIC_GOOGLE_API_KEY`        | no       | for the address autocomplete on checkout    |

## 4. Seed the database

The seed script populates restaurant types, 5 demo restaurants ("preppers"),
their categories, items, two coupons, and a demo user so the frontend has
something to render the first time you open it.

```bash
yarn seed
# or
npx tsx scripts/seed.ts
```

Demo login:

- email: `demo@marvinsden.test`
- password: `demo1234`

Demo coupons: `WELCOME10` (10% off, max £5, min £15) and `FIVEOFF` (£5 off, min £25).

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
- **Auth**: `/auth/consumer/sign-in` and `/auth/consumer/sign-up` issue a
  JWT signed with `JWT_SECRET`. For backwards compatibility the existing
  frontend stores `consumer_id` (not the JWT) in cookies, so
  `getAuthUser()` accepts *either* a JWT *or* a raw consumer_id as
  `Bearer …`. New installs naturally migrate to JWT-only.
- **OTP** is sent via Nodemailer (`src/server/mailer.ts`). For
  mobile-only OTP requests we look up the user's email and deliver there
  (no SMS provider is wired up).
- **Stripe**: `/api/card/create-payment-intent` creates a customer +
  ephemeral key + payment intent in GBP. The frontend's existing
  `<StripeCheckoutInlineForm />` consumes this unchanged.
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
