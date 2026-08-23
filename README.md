# ADONISMOB15TH — Private Platform

This is the **private, invite-only** platform for ADONISMOB15TH members:
member-only clothing, custom orders, and an admin side for managing
products, invitations, members, orders, and production.

**There is no public storefront here.** No public registration, no public
product catalog, no marketing pages, nothing indexed by search engines.
A separate public brand site (`Adonis15th`) is a different, future project
and shares no code with this one. Do not add public-facing commerce
features to this app.

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

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@adonismob15th.com` | `Adonis15th!Admin` | Full access |
| Member, verified | `amara@example.com` | `Demo1234!` | Normal active member |
| Member, suspended | `tunde@example.com` | `Demo1234!` | Demonstrates access being cut off — lands on `/access-restricted` |
| Member, verified | `zainab@example.com` | `Demo1234!` | Normal active member |

A pending invitation is also seeded — visit `/invite/seed-demo-invite` to
walk through account creation the way a real invitee would.

All seeded data is clearly synthetic — see `prisma/seed.ts`. Nothing in the
admin dashboard is fabricated at runtime; analytics are computed live from
whatever is actually in the database.

## Access model — how someone becomes a member

**There is no public registration form.** The only way an account gets
created:

1. An admin issues an invitation from **Admin → Access** (just an email
   address).
2. That creates a single-use, 7-day-expiring `Invitation` row with a random
   code, and generates a link: `/invite/{code}`.
3. The admin shares that link with the invitee out of band (they are not
   emailed automatically — no email provider is wired up).
4. The invitee visits the link, sets their name and password, and their
   account + a `VERIFIED` membership are created together. The invitation
   is marked `ACCEPTED` and cannot be reused.

An admin can also **suspend or revoke** a member's access at any time from
**Admin → Members** — this cuts off access without deleting their order
history. A suspended/revoked member hitting any `/dashboard/*` route is
redirected to `/access-restricted`, not silently shown a broken page.

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

**No secrets are ever sent to the client or hardcoded.** Payment
initiation and verification happen exclusively in server code
(`src/lib/flutterwave.ts`, `src/lib/payment-verification.ts`).

## Route structure

- `/` — the private gate. Anonymous visitors see a sign-in prompt and
  nothing else; authenticated users are redirected straight to `/dashboard`.
- `/login`, `/invite/[code]` — the only two ways to reach an authenticated
  session. There is no `/register`.
- `/dashboard/*` — the member area (products, collections, cart, checkout,
  custom orders, orders, contact). Gated by a single `requireMember()` call
  in `src/app/(member)/layout.tsx` — every route under it inherits that
  guard.
- `/admin/*` — the admin dashboard. Gated by `requireAdmin()` in
  `src/app/(admin)/admin/layout.tsx`.
- `/access-restricted` — where a suspended/revoked member lands. Deliberately
  outside the `(member)` group so it doesn't loop back through the same guard
  that sent them there.

## Architecture notes

- **Server-side authorization, everywhere.** `src/lib/authz.ts` provides
  `requireAdmin` / `requireMember` / `requireUser`, used in every admin and
  member layout, page, and server action (not just the page — actions are
  independent endpoints and are guarded the same way). Client-side hiding of
  UI is never the only protection.
- **No public tier to leak.** `src/lib/catalog.ts` used to filter a
  public/members-only split; that split no longer exists — everything in
  the catalog is already private, and the only enforcement point is the
  `(member)` layout's `requireMember()` call. There is no `visibility` field
  left anywhere in the schema.
- **Invitations are real, not decorative.** `src/app/(admin)/admin/access/actions.ts`
  and `src/app/(auth)/actions.ts` (`redeemInvitation`) implement the full
  lifecycle: create → redeem → expire → revoke → reuse-rejected. This was a
  previously-unused schema model; it's now load-bearing.
- **Payments are never trusted from the client.** Checkout recomputes every
  line-item price from the database (`src/lib/orders.ts`) — client-supplied
  prices are never read. Payment confirmation
  (`src/lib/payment-verification.ts`) re-verifies the transaction directly
  against Flutterwave's API before marking an order paid, is idempotent, and
  is reachable from both the redirect callback and the webhook.
- **Pre-orders and limited drops are a real, minimal foundation** — not just
  UI. `Product.isPreOrder` / `preOrderClosesAt` control the pre-order badge;
  `dropQuantityLimit` / `dropQuantityRemaining` cap a product independently
  of per-variant stock, are decremented in the same transaction as the order
  (`src/lib/orders.ts`), and checkout rejects an order that would oversell a
  drop. There is deliberately no scheduling/auto-open-close system yet — set
  dates manually until real requirements justify more.
- **Custom order file uploads** (`src/app/api/uploads/route.ts`) are
  authenticated, mimetype-allowlisted (checked against actual file bytes,
  not just the browser-reported `Content-Type`), size-limited, and write to
  `/public/uploads` for demo purposes. Swap for S3/Cloudinary/Vercel Blob
  before deploying somewhere without persistent local disk.
- **Audit logging.** Sensitive admin actions (product/collection/design
  changes, membership status changes, invitation issuance/revocation, order
  status changes, supplier changes) are recorded in the `AdminAction` table
  via `src/lib/audit.ts`.
- **Rate limiting.** Login (per-IP and per-account), invitation redemption,
  contact form, custom order submission, checkout, and file uploads are all
  rate-limited (`src/lib/rate-limit.ts`) — in-memory, fine for a
  single-instance deployment; swap for Redis/Upstash if this ever runs
  across multiple instances.
- **Security headers** (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) are set globally in
  `next.config.ts`. No Content-Security-Policy yet — deliberately, since a
  wrong CSP silently breaks the app and this hasn't been tuned for one.
- **Nothing here is meant to be found.** `robots.txt` disallows everything
  and there is no `sitemap.xml`.

## Database

Core entities: `User`, `Membership`, `Invitation`, `Address`, `Collection`,
`Design`, `Product`, `ProductVariant`, `Order`, `OrderItem`,
`OrderStatusEvent`, `Payment`, `CustomOrder`, `CustomOrderStatusEvent`,
`Supplier`, `ProductionOrder`, `ContactMessage`, `AdminAction`. See
`prisma/schema.prisma` for the full schema and relations.

`Role` is `MEMBER | ADMIN` — there is no customer/public role. Costs,
pricing, and profit-sharing are stored per-product (`price`, `cost`) but
nothing about profit distribution is hard-coded anywhere; that's an
admin-configured number, not a business rule baked into the app.

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
8. Create your first real admin account directly in the database (there's
   no bootstrap UI for it yet — it's a one-time step), then issue every
   subsequent account as an invitation from that admin's Access page.

## What's demo-grade vs. production-ready

- **Production-ready**: auth, authorization model (including the
  invite-only access model and suspension/revocation), payment verification
  flow, order/production/custom-order state machines, database schema,
  rate limiting, security headers, robots lockdown.
- **Demo-grade, documented above**: local-disk file uploads, flat shipping
  fee, single hardcoded currency (NGN), in-memory (single-instance) rate
  limiting, no Content-Security-Policy yet, no email delivery for
  invitations (links are shared manually), no bootstrap flow for the very
  first admin account.
