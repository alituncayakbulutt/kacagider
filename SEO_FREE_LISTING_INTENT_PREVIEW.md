# KaçaGider — SEO Free Listing Intent Preview

Branch: `seo-free-listing-intent-preview`
Base: `main` @ `ff9701de014bdc9e08fdf765eee30f047362eee7`

## Goal

Strengthen seller-intent organic search coverage without creating duplicate model URLs or changing the existing valuation, auth, marketplace, Analytics, canonical, brand/model, or pricing structures.

The program connects two real KaçaGider capabilities in search-visible content:

1. Learn the device's current second-hand market value.
2. Continue to a free listing flow. Listing publication/management requires membership.

## Coverage

- Phone: 418 models
- Tablet: 103 models
- Computer: 53 models
- Smart watch: 42 models
- Game console: 16 models
- Total: 632 model pages
- Added seller/listing intent phrases: 3,792

Each model keeps its existing canonical URL. No query-specific doorway URLs are created.

## New intent group

Up to six missing seller-intent variants are added per model, such as:

- `[MODEL] ücretsiz ilan ver`
- `[MODEL] ilan ver`
- `[MODEL] ikinci el ilan ver`
- `[MODEL] satmak istiyorum`
- `[MODEL] fiyatını öğren ilan ver`
- `[MODEL] piyasa değerini öğren sat`

The generator removes/rebuilds only its own `listing-intent-v1` block, skips content already covered elsewhere on the page, and preserves the existing `model-intent-v1` price-query block.

## Global landing

A new canonical landing page is prepared at:

`/ucretsiz-ilan-ver/`

Target promise:

**Cihaz Değerini Öğren ve Ücretsiz İlan Ver**

It links to all five valuation categories and the public listings page. It is also added to `sitemap.xml`.

## Internal linking

Every model page receives one internal seller-flow link:

**Değerini öğren ve ücretsiz ilan ver → /ucretsiz-ilan-ver/**

The listing hub explains the value-to-listing flow and its main CTA then sends the user to the existing homepage marketplace entry flow. This strengthens one seller-intent SEO hub without introducing a second model URL.

## Validation

Workflow: `SEO Free Listing Intent Preview`

Checks passed:

- Generator completed successfully.
- Scope check: only model pages and `sitemap.xml` were generated/changed by the workflow.
- Free-listing intent audit: PASS on 632 model pages.
- Existing price-intent cluster preserved: PASS.
- Existing site-wide SEO audit: PASS on 1,959 canonical SEO pages.
- Existing 44 low-priority warnings remain unchanged and are unrelated to this preview.

## SEO boundary

The program intentionally does **not** target buyer-first phrases such as `[MODEL] satılık` as a model-page synonym. Those phrases can represent a different search intent (looking for listings to buy) and are better handled by marketplace/listing pages rather than seller valuation pages.

## Live status

NOT LIVE. No changes from this branch have been merged or fast-forwarded to `main`.
