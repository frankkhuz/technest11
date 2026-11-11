# Backend requests — mobile UI work

These are the backend changes the frontend needs to finish the mobile UI checklist (`mobile-ui-checklist.html`).
The frontend already handles each field as optional, so they can ship in any order.

**Priority:** 🔴 needed to finish a checklist item · 🟡 improves the experience · ⚪ nice to have

---

## 🔴 1. Product ratings (checklist item 9)

Product cards must show ratings, but products have no rating data. Today reviews only exist for
*users* (`GET /api/reviews/users/{userId}`), not for catalog products.

Add to every product returned by `GET /api/products`, `GET /api/products/{id}`,
`GET /api/products/search` and `GET /api/products/flash-sale`:

```json
"rating": { "average": 4.6, "count": 128 }
```

- `average`: 0–5, one decimal place. `count`: number of ratings. Send `null` (or omit) when there are none.
- The source can be buyer reviews of completed catalog orders, if that's simpler than separate product reviews.
  The rule just needs to be decided and documented.

## 🔴 2. Product images

`GET /api/products` currently returns products **without an `image` field** (checked 11 Nov 2026 on the first 3
products). Cards fall back to a placeholder icon, which looks unfinished.

- Return `image` (main photo URL) on every catalog product. Optionally also return `images: string[]`.
- Host images on Cloudinary if possible (already used for uploads via `POST /api/uploads/signature`).
  That lets the frontend request correctly sized images for phones.
- Optional: include `imageWidth` / `imageHeight` so the frontend can reserve the exact space and avoid layout shift.

## 🔴 3. Admin: one call for a vendor's documents (admin document review)

The admin vendor panel now shows the CAC certificate, ID document and selfie before approval. To get the ID photos,
the frontend has to scan `GET /api/admin/identity?status=pending|verified|rejected` and match the user id, which can
take up to 3 calls per vendor.

Please add either:

- `GET /api/admin/identity/{userId}` returns that user's identity check (same shape as one item of `people`), **or**
- include `identity: { status, idType, fullName, idDocumentUrl, selfieUrl, nameMatch, submittedAt }` in each vendor
  of `GET /api/admin/vendors/pending`.

Also:

- Send the **file type** with each document (`cacCertificateMime: "application/pdf"` or `"image/jpeg"`, and the same
  for ID/selfie). The viewer currently guesses PDF vs image from the URL.
- Make signed links last **at least 30 minutes** so they don't expire while an admin is reviewing.

## 🟡 4. Rate limiting on public browsing

During testing, `GET /api/listings` returned **429 Too Many Requests** after a handful of page loads from one
machine. The user then sees "Could not load listings".

- Raise the limit for anonymous **GET** browsing endpoints (`/api/listings`, `/api/products*`), or key it per
  user/session rather than per IP. Many Nigerian mobile users share carrier IPs (CGNAT).
- Always send a `Retry-After` header with 429s so the frontend can retry automatically.

## 🟡 5. Vendor summary for the home-screen vendor card

The home page now shows verified vendors a shop card with Dashboard / Requests / Orders / Profile shortcuts.
To show "3 new" style badges on those shortcuts, please add:

`GET /api/vendor/summary` → `{ newRequests, pendingOrders, unreadNotifications, activeListings, rating: { average, count } }`

(The existing `GET /api/vendor/dashboard` returns full listings, which is too heavy for a home-page card.)

## 🟡 6. Vendor application status

The home card works out "application not finished" vs "under review" from whether `vendorProfile.phone` exists.
That is fragile. Please add to `GET /api/me`:

```json
"vendorApplication": { "status": "not_started" | "submitted" | "approved" | "rejected", "submittedAt": "...", "rejectionReason": "..." }
```

`rejected` + `rejectionReason` would also let the card tell a rejected vendor what to fix.
(Today, rejecting a vendor clears their profile, so the frontend can't tell "rejected" apart from "never applied".)

## 🟡 7. Server-side catalog paging and sorting

The Shop page loads the **entire** catalog in one go and filters and sorts in the browser. That is fine at today's
size but will get slow on phones as the catalog grows.

- Support `page`, `limit`, `sort=price-asc|price-desc|newest`, `brand`, `storage`, `color` and `q` on
  `GET /api/products`, with `total` and `pages` (paging fields already exist).

## ⚪ 8. Flash sale extras

`GET /api/products/flash-sale` already returns `products`, `upcoming` and `serverTime`, which the new Flash Sales page
uses. Nice to have:

- `upcoming[].sale.priceUkUsed / priceBrandNew` populated, so "Coming up" cards can show the sale price in advance.
- `sale.stockLimit` and `sale.sold`, for a "70% claimed" progress bar.

## ⚪ 9. Web push notifications (if the site becomes an installable app)

If you want "Your order shipped" or "Flash sale starts now" alerts on phones:

- `POST /api/push/subscribe` and `DELETE /api/push/subscribe`, storing the browser's push subscription
  (endpoint + keys) per user.
- A VAPID key pair, with the public key exposed via `GET /api/push/public-key`.
- Send pushes alongside the existing notifications (`GET /api/notifications`).

---

### Nothing needed from the backend for

The fixed nav bars, layout-shift fixes, filter drawer, Flash Sales page, admin duplicate-list fix and the
document viewer. Those are frontend-only and already done.
