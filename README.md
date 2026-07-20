# RajwadiTukda Frontend

React 19 + TypeScript + Vite storefront for RajwadiTukda, consuming the Django
REST API documented in [`../backend/docs/API.md`](../backend/docs/API.md).
This app never assumes an endpoint that isn't documented there — if a feature
needs a backend change, that's called out explicitly rather than faked
client-side.

## Stack

React 19 · Vite · React Router 7 · Axios · Context API · React Hook Form ·
Tailwind CSS v4 · Framer Motion · Lucide Icons

## Folder structure

```
src/
├── components/
│   ├── ui/          Generic, reusable primitives (Button, Input, Card, Modal, Toast, ...)
│   ├── layout/       Navbar, Footer, MainLayout, AuthLayout
│   ├── common/       ProtectedRoute, GuestRoute
│   ├── product/      ProductCard, ProductGrid
│   ├── checkout/     AddressForm (also reused by the Address Book page)
│   └── orders/       OrderDetailCard (shared by Order Success and Order Detail)
├── pages/            One component per route (lazy-loaded)
├── routes/           router.tsx - the route tree
├── context/          AuthContext, CartContext, ToastContext (global state)
├── services/         apiClient.ts + one file per backend resource (authService, productService, ...)
├── types/            TypeScript types mirroring backend serializers exactly
├── hooks/            Small reusable hooks (useDocumentTitle, ...)
├── utils/            Pure helpers (formatCurrency, formatDate, cn)
└── constants/        routes.ts - central path definitions
```

**Views never call Axios directly.** Every network call goes through
`services/*`, which return typed, already-unwrapped data (the
`{success, message, data}` envelope is peeled off in one place). Pages call
services or context methods and handle loading/error/empty states.

## Authentication

- JWT access + refresh tokens are stored in `localStorage` (`services/tokenStorage.ts`).
- `services/apiClient.ts` attaches the access token to every request and,
  on a 401, transparently refreshes it once and retries the original
  request. If the refresh itself fails, tokens are cleared and
  `AuthContext` is notified via a tiny pub-sub (`services/authEvents.ts`)
  so it can log the user out and show a toast - no direct import cycle
  between the (non-React) API layer and the (React) context.
- `ProtectedRoute` / `GuestRoute` are route-level guards; `AuthContext`
  bootstraps the session on load by calling `GET /auth/profile/` if a
  token is present.

## Cart

The backend's cart is per-authenticated-user only - there is no guest/anonymous
cart endpoint. Accordingly, `CartContext` only fetches/holds cart state once
a user is logged in. "Add to Cart" on a product redirects a guest to
`/login` (preserving the page they were on) rather than faking a local cart.
The navbar cart icon (`components/layout/CartButton.tsx`) also opens a quick
preview dropdown, backed by the same `CartContext` - no extra API calls.

## Payments (prepaid, manual verification)

The business is prepaid-only right now with no payment gateway account, so
checkout uses a `manual` UPI/bank-transfer flow. `components/orders/
PaymentInstructions.tsx` builds a standard `upi://pay?...` deep link
client-side (from the static UPI ID fetched via `GET /payments/details/` and
the order's actual, discount-adjusted amount) and renders it two ways:

- as a QR code (`qrcode.react`) for scanning with any UPI app, and
- as a `<a href="upi://...">` button that launches the device's UPI app
  chooser directly on mobile.

This needs no merchant/gateway account - it's just the same URI format every
UPI QR code already uses. The trade-off: there's no webhook telling us a
payment succeeded, so an order stays `pending` until you manually mark its
Payment `success` in Django admin (see `backend/apps/payments/signals.py`).
Swapping in a real gateway later (Razorpay, PhonePe Business, etc.) for
automatic confirmation wouldn't touch this component - just `ManualGateway`
in `apps/payments/services.py` on the backend.

## Account pages

Beyond the MVP pass, these pages were added - all backed by endpoints the
backend already had:

- **`/profile`** - view/edit name and phone (`GET`/`PATCH /auth/profile/`).
- **`/orders`** and **`/orders/:orderId`** - order history and detail, with a
  cancel action for cancellable statuses (`GET /orders/`, `POST /orders/{id}/cancel/`).
- **`/addresses`** - full address book CRUD, reusing the checkout flow's
  `AddressForm` in both create and edit mode.
- **`/notifications`** - list + mark-as-read (`GET /notifications/`,
  `PATCH /notifications/{id}/read/`). The navbar bell's unread badge is an
  approximation from the most recent page of notifications - the backend has
  no dedicated unread-count endpoint, so exact counts beyond that first page
  aren't tracked (see `hooks/useUnreadNotifications.ts`).

## Environment variables

```
VITE_API_BASE_URL=http://localhost:8000/api
```

Copy `.env.example` to `.env` and point it at your backend. In production
(e.g. deploying alongside the Render-hosted backend), set this to the
deployed API's base URL.

## Local setup

```bash
cd frontend
npm install
cp .env.example .env    # adjust VITE_API_BASE_URL if needed
npm run dev
```

Requires the backend running (see `../backend/README.md`) with
`CORS_ALLOWED_ORIGINS` including `http://localhost:5173`.

## Build

```bash
npm run build      # tsc -b type-check + vite build -> dist/
npm run preview     # serve the production build locally
```

## What's intentionally not built yet

Per the current backend scope:

- **Razorpay checkout** - the payments API only has `cod` working today;
  the `gateway` field in `paymentService.initiate` already accepts
  `'razorpay'` in its type, so wiring in a real Razorpay button later is a
  UI-only addition once the backend's `RazorpayGateway` is implemented.
- **Contact form submission** - there's no backend endpoint for it, so the
  Contact page shows direct contact details (phone/email) instead of a fake
  form that goes nowhere.
