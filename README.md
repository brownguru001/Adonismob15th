# ADONISMOB15TH

A modern clothing brand platform: public storefront, custom clothing orders,
an exclusive verified-members collection, order/production workflow, and a
business admin dashboard — built as an investor-demo prototype.

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript, Turbopack)
- **Database**: PostgreSQL via Prisma 7 (driver adapter: `@prisma/adapter-pg`)
- **Auth**: Auth.js (credentials, JWT sessions, server-side role/membership checks)
- **Payments**: Flutterwave (hosted checkout + server-side transaction verification)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts

## Getting started

```bash
npm install
```

Create a `.env` file (see `.env.example`) with at least:

```
DATABASE_URL="postgresql://user:password@localhost:5432/adonismob15th?schema=public"
AUTH_SECRET="<generate with: npx auth secret>"
NEXTAUTH_URL="http://localhost:3000"
```

Then run migrations and (optionally) seed demo data:

```bash
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run dev
```

### Demo accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@adonismob15th.com` | `Adonis15th!Admin` |
| Customer, verified member | `amara@example.com` | `Demo1234!` |
| Customer, pending membership | `tunde@example.com` | `Demo1234!` |
| Customer, no membership | `zainab@example.com` | `Demo1234!` |

All seeded orders, customers, and messages are clearly synthetic demo data —
see `prisma/seed.ts`. Nothing in the admin dashboard is fabricated at
runtime; analytics are computed live from whatever is actually in the
database, so they'll be small until real orders come in.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Auth.js session signing secret |
| `NEXTAUTH_URL` | Yes | Canonical app URL |
| `FLUTTERWAVE_SECRET_KEY` | For live payments | Server-side only — used to create payments and verify transactions |
| `FLUTTERWAVE_PUBLIC_KEY` | For live payments | Reserved for future client-side Flutterwave widget use |
| `FLUTTERWAVE_WEBHOOK_SECRET_HASH` | For live payments | Validates the Flutterwave webhook signature |
| `NEXT_PUBLIC_APP_URL` | Yes | Used for payment redirect URLs and metadata |

Without Flutterwave keys configured, checkout still creates the order and
records a pending payment — it just can't redirect to a live payment page.
This lets the rest of the platform be demoed/developed without live payment
credentials; wire in real (or Flutterwave test-mode) keys to exercise the
full payment flow.

**No secrets are ever sent to the client or hardcoded.** Payment
initiation and verification happen exclusively in server code
(`src/lib/flutterwave.ts`, `src/lib/payment-verification.ts`).

## Architecture notes

- **Visibility control is centralized.** All member-only vs. public catalog
  queries go through `src/lib/catalog.ts`, which computes visibility from
  the viewer's session server-side. No page hand-rolls its own visibility
  filter — this is the main IDOR/privilege-escalation defense for the
  Members Collection.
- **Server-side authorization.** `src/lib/authz.ts` provides
  `requireAdmin` / `requireVerifiedMember` / `requireUser`, used in every
  admin and member layout/page. Client-side hiding of UI is never the only
  protection.
- **Payments are never trusted from the client.** Checkout recomputes every
  line-item price from the database (`src/lib/orders.ts`) — client-supplied
  prices are never read. Payment confirmation
  (`src/lib/payment-verification.ts`) re-verifies the transaction directly
  against Flutterwave's API before marking an order paid, is idempotent, and
  is reachable from both the redirect callback and the webhook so a missed
  redirect doesn't leave an order stuck pending.
- **Custom order file uploads** (`src/app/api/uploads/route.ts`) are
  authenticated, mimetype-allowlisted, size-limited, and write to
  `/public/uploads` for demo purposes. Swap for S3/Cloudinary/Vercel Blob
  before deploying somewhere without persistent local disk (e.g. most
  serverless platforms).
- **Audit logging.** Sensitive admin actions (product/collection/design
  changes, membership status changes, order status changes, supplier
  changes) are recorded in the `AdminAction` table via `src/lib/audit.ts`.

## Database

Core entities: `User`, `Membership`, `Invitation`, `Address`, `Collection`,
`Design`, `Product`, `ProductVariant`, `Order`, `OrderItem`,
`OrderStatusEvent`, `Payment`, `CustomOrder`, `CustomOrderStatusEvent`,
`Supplier`, `ProductionOrder`, `ContactMessage`, `AdminAction`. See
`prisma/schema.prisma` for the full schema and relations.

Order status flow: `PENDING_PAYMENT → PAID → PROCESSING → PRODUCTION →
READY → SHIPPED → DELIVERED` (or `CANCELLED` / `REFUNDED`).

Custom order flow: `SUBMITTED → REVIEWING → QUOTE_SENT → CUSTOMER_APPROVED
→ PAYMENT → PRODUCTION → READY → FULFILLED` (or `DECLINED`).

Production flow: `QUEUED → ASSIGNED → PRINTING → QUALITY_CHECK → PACKED →
READY_FOR_DELIVERY → SHIPPED → DELIVERED`.

## Deployment

1. Provision a PostgreSQL database and set `DATABASE_URL`.
2. Run `npx prisma migrate deploy` against production.
3. Set `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, and the
   Flutterwave keys as environment variables on your hosting platform —
   never in source control.
4. `npm run build && npm run start`, or deploy to a platform that runs
   these for you (Vercel, Railway, Fly.io, a VPS behind a reverse proxy,
   etc.).
5. If self-hosting behind a reverse proxy (not Vercel), `trustHost: true`
   is already set in `src/lib/auth.ts` — required for Auth.js to accept
   the forwarded Host header.
6. Register your production redirect/webhook URLs
   (`{APP_URL}/api/payments/callback`, `{APP_URL}/api/webhooks/flutterwave`)
   in the Flutterwave dashboard.
7. Point product/collection/design images at real hosted photography
   (via the admin image uploader, or a CDN) — the seeded demo data uses
   placeholder Unsplash URLs.

## What's demo-grade vs. production-ready

- **Production-ready**: auth, authorization model, payment verification
  flow, order/production/custom-order state machines, database schema.
- **Demo-grade, documented above**: local-disk file uploads, flat shipping
  fee, single hardcoded currency (NGN).
