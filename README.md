# ReySo

Online store for ReySo, a women's clothing atelier. This is the existing static site ported to Next.js (App Router) + React + TypeScript, with the same look: the original stylesheets live in `src/styles` and the markup keeps the original class names.

```bash
npm install
npm run dev   # http://localhost:3000
npm run build && npm start
```

## Layout

- `src/app`: routes. Old `.html` addresses redirect to the new ones (`next.config.ts`, `src/proxy.ts`).
- `src/components`: site shell (`layout/`), product UI, shop, checkout, profile and page parts.
- `src/lib`: catalogue (`products.ts`), lessons, cart/wishlist/customer stores (localStorage, same keys as the old site), orders and order status, config.
- `src/styles`: the old site's CSS, unchanged apart from font paths.
- `public`: images, video, fonts and icons from the old site.

## Configuration

Backend endpoints and contact handles come from environment variables (see `.env.example`). Leaving one empty keeps the old demo behaviour: orders and accounts stay in the visitor's browser, the OTP code is `12345`, the support chat answers with a canned reply.

Before taking real orders, `NEXT_PUBLIC_ORDER_API_URL` and the OTP endpoints must point at a real backend.
