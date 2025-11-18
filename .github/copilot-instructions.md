# Copilot / AI Agent Instructions for D'Xpress

Purpose: give an AI coding assistant the minimum, high-value context to be productive in this repo.

- **Project type:** Static frontend (HTML/CSS/Vanilla JS) â€” no build system, no bundler. Open `index.html` in a browser or serve the folder with a static server.
- **Start (local):** `python -m http.server 8000` or `npx serve .` then open `http://localhost:8000`.

- **Big picture:** All logic runs client-side. Core files:
  - `js/script.js` â€” core eâ€‘commerce logic (products, cart, currency, promo codes).
  - `js/auth.js` â€” authentication, session handling, RBAC and security events.
  - `js/tiktok-dashboard.js` â€” social/tiktok-style feed logic.
  - `css/styles.css` and `css/tiktok-dashboard.css` â€” design system and overrides.
  - `PROJECT_SUMMARY.md` / `README.md` â€” high-level documentation and manual test checklist.

- **Key patterns & conventions (do not change without cause):**
  - No frameworks: prefer plain DOM APIs and modular functions in the existing JS files.
  - Persistent state is stored in `localStorage` (see `cart`, `wishlist`, `orders`, `currentUser`, `dx_security_events`, and session keys prefixed with `dx_session_`).
  - Currency logic is centralized: update `EXCHANGE_RATE` and `formatCurrency()` in `js/script.js` to change currency behavior.
  - Promo codes live in `PROMO_CODES` inside `js/script.js` â€” modify there for new discounts.
  - Role checks use helpers in `js/auth.js` (`requiresAdmin`, `requiresVendor`, `hasRole`, `isLoggedIn`). Preserve these entry points when adding protected pages.

- **Files to inspect for similar changes:**
  - To add product-related behavior: edit `js/script.js` (functions: `getProducts`, `addToCart`, `getCartTotal`).
  - To modify authentication/session behavior: edit `js/auth.js` (session keys: `dx_session_{email}`; events stored under `dx_security_events`).
  - To change UI styles or theme variables: edit `css/styles.css` (CSS variables at `:root`).

- **Common developer workflows (manual):**
  - Serve locally: `python -m http.server 8000` â†’ open `http://localhost:8000/index.html`.
  - Manual tests are in `README.md` and `PROJECT_SUMMARY.md` (no automated test runner present).

- **How to make safe code edits (guidance for AI):**
  - Prefer minimal, focused edits. Keep public functions and exported global names unchanged unless updating all call sites.
  - When changing storage keys or session shape, update `js/auth.js` + any code that reads the keys (search for the string). Add migrations that read old keys for backward compatibility.
  - Avoid introducing Node-only packages or build steps â€” this repo expects static deployment.

- **Concrete examples (copyable hints):**
  - Add a new promo code:
    - Edit `js/script.js` â†’ add key/value to `PROMO_CODES` (see existing entries `SAVE10`, `FLAT50`).
  - Change currency formatting:
    - Edit `EXCHANGE_RATE` and `CURRENCY_FORMAT` near top of `js/script.js`.
    - Use `formatCurrency(price)` helper â€” updates automatically across UI.
  - Protect a new admin page `reports.html`:
    - Add `reports.html` to `requiresAdmin` list in `js/auth.js` or use `hasRole('admin')` checks on page load and redirect to `login.html` if not allowed.

- **Integration & external dependencies:**
  - The repo currently simulates APIs and real-time features in-client (see `simulateRealTimeUpdate` usages). If you wire a real backend, centralize fetch logic and replace simulated functions.

- **What not to do / gotchas:**
  - Do not assume a build pipeline; changes must work in plain static hosting.
  - Be careful editing global variables in `script.js` â€” many UI functions depend on them (e.g., `cart`, `currentUser`).
  - Security functions in `js/auth.js` are simulated: do not copy the `hashPassword` approach into a real backend.

- **Where to update docs:**
  - Update `PROJECT_SUMMARY.md` and `README.md` when features or flows change. Keep the â€œQuick Startâ€ and demo credentials accurate.

If any section is unclear or you want more detail (for example, a list of all `localStorage` keys or an inventory of exported global functions), tell me which part to expand and I will update this file.

---

## LocalStorage keys (inventory)

- `dx_cart`: Shopping cart items (JSON array of {id,name,price,quantity,...}). Set/read in `js/script.js` (`saveCart` / `loadCart`).
- `dx_wishlist`: Wishlist items (JSON array). Used in `js/script.js`.
- `dx_orders`: Order history (JSON array). Used in `js/script.js`.
- `dx_current_user`: Current user object (JSON). Used in `js/script.js` for session persistence.
- `dx_realtime_updates`: Buffer for simulated real-time updates (JSON array). Used across `js/script.js` and `js/tiktok-dashboard.js`.
- `dx_analytics`: Client-side analytics/events (JSON array). Stored by `trackEvent()` in `js/script.js`.
- `dx_security_events`: Security event log (JSON array). Written in `js/auth.js` via `trackSecurityEvent()`.
- `dx_user_likes`, `dx_user_follows`, `dx_user_shares`, `dx_user_comments`, `dx_user_views`: TikTok social-data keys (per-user social state). Defined in `js/tiktok-dashboard.js`.
- `dx_account_lock_{email}`: Per-user account lockout JSON (lockoutUntil, reason, attempts). Used in `js/auth.js`.
- `dx_failed_attempts_{email}`: Per-user failed login counter (string/number). Used in `js/auth.js`.
- `dx_session_{email}`: Per-user session object (JSON) set by `js/auth.js` (`createSession` / `getSessionData`).

Also: `dx_session_id` is stored in `sessionStorage` (not localStorage) for ephemeral session tracking by `getSessionId()` in `js/script.js`.

Use this list when making changes that alter storage shape or keys â€” add a migration step to read the old key and transform data before switching.

## Migration checklist (client-side -> backend)

- Centralize network calls: create `js/api-client.js` that exposes `api.get`, `api.post`, `api.syncCart`, `api.syncSession` and use it from `script.js` / `auth.js`.
- Replace `simulateRealTimeUpdate(...)` with either WebSocket messages or POSTs to `/api/updates`. Keep a local fallback (write to `dx_realtime_updates`) when offline.
- Move authoritative state server-side for `cart`, `orders`, `currentUser`:
  - On write, call the API then update localStorage to reflect server response (optimistic update allowed but always reconcile with server response).
  - On init, try fetching server state; if unavailable, fall back to `localStorage`.
- For sessions: stop storing session tokens in localStorage. Use secure, HttpOnly cookies for real sessions and keep only a short client-side session-id (`dx_session_id`) for analytics.
- Keep `dx_security_events` client-side for local monitoring, but also POST critical events (`suspicious_activity`, `multiple_failed_logins`) to a server-side security endpoint.
- Document backwards-compatibility: when renaming a key, read old key and write new key during app initialization.

## Example: migrate cart writes (concept)

1. Create `js/api-client.js` with `post('/api/cart', cart)`.
2. In `saveCart()` (currently writes `dx_cart`), call the API and fall back to `localStorage` if the network call fails.

Pseudo-example:

```javascript
// In saveCart()
try {
  await api.post('/api/cart', { items: cart });
  localStorage.setItem('dx_cart', JSON.stringify(cart)); // local mirror
} catch (err) {
  // network failure: keep using localStorage, queue sync
  queueOfflineSync('cart', cart);
}
```

---

If you want, I can:
- produce the initial `js/api-client.js` scaffold and wire `saveCart()` to use it,
- add a small migration helper that runs at app start to upgrade old storage shapes,
- or create a branch and commit these changes for review.

Note: A minimal `js/api-client.js` scaffold and a conservative `migrateStorage()` helper
were added to the repo. `api` is exposed as `window.api` and `saveCart()` now attempts
to `api.syncCart()` and falls back to localStorage + offline queueing.

