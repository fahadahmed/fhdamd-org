# Changelog — Riqa PDF Toolkit (pdf-craft)

All notable changes to the `pdf-craft` application are documented here.
Tags follow the `riqa-vX.Y.Z[-rc.N]` scheme described in `docs/sad-pdfcraft.md §11.5`.

---

## [1.1.0] — 2026-07-10

### New operations

- **Split PDF** (`/splitpdf`) — divide a PDF by marking cut points between pages (Split mode) or pull out individual pages (Extract mode). Result is a single PDF or a ZIP of parts depending on the number of splits. Processed in-process using `pdf-lib` + `pdfjs-dist` for browser-side thumbnail rendering.
- **Compress PDF** (`/compresspdf`) — reduce file size via Ghostscript in `pdf-processor`. Result shows original vs compressed size and savings percentage.
- **Sign PDF** (`/signpdf`) — place a handwritten-style signature anywhere on any page. Signature drawn on canvas (9 font styles across 5 cursive typefaces, choice of ink colour), positioned by dragging a placement handle over the PDF preview, embedded as a PNG via `pdf-lib`.

### Anonymous user flow

Users can now perform any operation without creating an account first:

1. Upload a file and run the operation — a Firebase anonymous session is created transparently.
2. The result is held server-side. A prompt appears: sign up or sign in to download.
3. On sign-up, a pending claim token is redeemed to retrieve the result and deliver the download link without re-running the operation.
4. The `auth/email-already-in-use` case is handled gracefully — existing users are directed to sign in instead, with their claim token preserved.

### Resources section (how-to blog)

- `/resources` — listing page showing all articles from the DatoCMS `Articles` model, ordered by newest first.
- `/resources/[slug]` — single post with Markdown body rendered via `marked`, `Article` JSON-LD for SEO, and `@astrojs/sitemap` discovery via `prerender = true` + `getStaticPaths()`.
- "Resources" link added to the site header and footer.

### Area-scoped FAQs

DatoCMS FAQs are now scoped by page area (`area` JSON field). Each operation page fetches only the FAQs relevant to that tool rather than the full global list.

### GA4 purchase tracking

`purchase_complete` event fires on `/payment-success` using data written to `sessionStorage` at checkout initiation, including `currency`, `value`, `credits_purchased`, and `product_name`. Fires exactly once (cleared from `sessionStorage` immediately before logging).

### Dynamic sitemap

`@astrojs/sitemap` generates `sitemap-index.xml` + `sitemap-0.xml` at build time. Private routes (`/dashboard`, `/buy-credits`, `/payment-*`, `/sign*`, `/forgot-password`, `/reset-password`) are excluded via a filter. `robots.txt` updated to point to `sitemap-index.xml`.

### Footer

Reorganised from a single stale "Tools" column to five columns:
- **Edit & Convert** — Split PDF, Merge PDFs, Compress PDF, Image to PDF
- **Protect & Sign** — Sign PDF, Protect PDF, Unlock PDF
- **Resources** — Articles
- **Account** — Sign up, Log in, Buy credits
- **Legal** — Privacy Policy, Terms & Conditions, Contact

### E2E test coverage

New Playwright tests covering:
- Public (unauthenticated) access to `/splitpdf`, `/compresspdf`, `/signpdf`
- Split PDF end-to-end (extract mode)
- Compress PDF end-to-end
- Sign PDF page load + canvas render after upload
- Resources listing page and single-post navigation

### Bug fixes

- Firebase Functions emulator was silently targeting the production Firebase project via a stale global CLI override. Fixed by pinning `--project pdf-craft-dev` in the `functions/package.json` `serve` script.
- Stripe `success_url` / `cancel_url` were pointing to the old `pdf-craft.app` domain. Fixed by updating the `APP_BASE_URL` secret in Secret Manager to `riqa.app` for each environment.
- DatoCMS GraphQL errors (HTTP 200 with `errors` body, no `data` key) were passing through the CMS proxy silently and surfacing as cryptic `Cannot read properties of undefined` errors in Astro pages. Fixed by detecting and throwing on `payload.errors` in `fetchCMSData`.

### Infrastructure

- `CLAIM_SECRET` and `e2eContactBypassToken` added to `terraform/modules/firebase-env/main.tf` so all environments get these secret shells automatically on `terraform apply`. Both were previously missing from the module (created manually), causing the v1.1.0-rc.0 staging deploy to fail with a "secret not found" error.

---

## [1.0.5] — 2026-06-30

- Brand assets replaced with the new Riqa mark across the application.

## [1.0.4] — 2026-06-20

- `@fhdamd/threads` updated to `0.4.0` — `SiteNav`/`SiteFooter` decoupled from app-specific branding via a generic brand slot.

## [1.0.3] — 2026-06-15

- Initial public operation pages (Merge PDFs, Image to PDF, Protect PDF, Unlock PDF) made accessible without authentication.
- Area-scoped FAQ groundwork — `area` field added to DatoCMS FAQs model.

## [1.0.0] — 2026-05-01

Initial production release:
- Firebase Authentication (email/password, session cookies)
- Merge PDFs, Image to PDF, Protect PDF, Unlock PDF operations
- Stripe Checkout credit purchase flow
- Firestore credit balance, 24 h file retention with hourly cleanup job
- Transactional email via Resend
- DEV / STG / PRD environments on Firebase App Hosting
- RC → staging → Playwright E2E gate → manual approval → production pipeline
- Infrastructure as Code via Terraform
