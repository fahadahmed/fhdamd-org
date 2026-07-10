# pdf-craft — Riqa PDF Toolkit

Pay-per-use PDF toolkit at [riqa.app](https://riqa.app). Astro 5 SSR application backed by Firebase, deployed on Firebase App Hosting.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Astro 5 (SSR, Firebase App Hosting adapter) + React 19 islands |
| Design system | `@fhdamd/threads` (monorepo package — bone/rust/sage palette) |
| Backend API | Astro Actions (`src/actions/`) |
| Auth | Firebase Authentication — email/password, anonymous, server session cookies |
| Database | Firestore |
| File storage | Firebase Storage (download tokens, 24 h retention) |
| Functions | Firebase Functions 2nd gen — payments, webhooks, CMS proxy, scheduled cleanup |
| PDF processing | pdf-lib (in-process), pdfjs-dist (browser rendering), Ghostscript via `pdf-processor` |
| Payments | Stripe Checkout |
| CMS | DatoCMS (GraphQL CDA) — articles, FAQs, operations catalogue, pricing, testimonials |
| Email | Resend |
| Analytics | Google Analytics 4 |
| Error tracking | Sentry |
| Tests | Vitest + React Testing Library (unit), Playwright (e2e) |

## Operations

| Route | Label | Processing | Credits |
|---|---|---|---|
| `/splitpdf` | Split PDF | In-process (pdf-lib + pdfjs-dist) | 3 |
| `/compresspdf` | Compress PDF | pdf-processor (Ghostscript) | 2 |
| `/signpdf` | Sign PDF | In-process (pdf-lib) | 2 |
| `/mergepdf` | Merge PDFs | In-process (pdf-lib) | 2 |
| `/imagetopdf` | Image to PDF | In-process (pdf-lib) | 1 |
| `/encryptpdf` | Protect PDF | pdf-processor (qpdf) | 2 |
| `/decryptpdf` | Unlock PDF | pdf-processor (qpdf) | 2 |

## User Flow

### Authenticated user
1. Upload file → operation runs → credits deducted → download link shown → email sent

### Anonymous user (v1.1.0+)
1. Upload file → anonymous Firebase session created → operation runs
2. Result held server-side → user prompted to sign up / sign in to download
3. On sign-up: pending claim token redeems the result → credits deducted → download link shown

## Local Development

### Prerequisites
- Node.js 22
- pnpm
- Firebase CLI (`npm i -g firebase-tools`)

### Setup

```bash
# From monorepo root
pnpm install

# Start the Firebase Functions emulator (from apps/pdf-craft/functions)
cd apps/pdf-craft/functions
npm run serve          # builds TypeScript + starts emulator

# In a separate terminal — start the Astro dev server (from apps/pdf-craft)
cd apps/pdf-craft
pnpm dev               # http://localhost:4321
```

### Environment variables

Copy `.env.local.example` to `.env.local` in `apps/pdf-craft/` and `apps/pdf-craft/functions/`. Key variables:

| Variable | Where | Purpose |
|---|---|---|
| `PUBLIC_BASE_FUNCTIONS_URL` | app | Local Functions emulator URL |
| `PUBLIC_FIREBASE_*` | app | Firebase client config |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | app | Admin SDK (Astro Actions) |
| `DATOCMS_API_TOKEN` | functions `.env.local` | DatoCMS read token |
| `DATOCMS_ENV` | functions `.env.local` | DatoCMS environment (`dev` / `main`) |
| `STRIPE_SECRET_KEY` | functions `.env.local` | Stripe secret key |
| `APP_BASE_URL` | functions `.env.local` | Base URL for Stripe success/cancel redirects |

## Commands

All commands run from `apps/pdf-craft/` unless noted.

| Command | Action |
|---|---|
| `pnpm dev` | Start Astro dev server at `localhost:4321` |
| `pnpm build` | Production build |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test --run` | Unit tests (CI mode, no watch) |
| `pnpm e2e` | Run Playwright e2e suite against staging |
| `pnpm e2e --ui` | Playwright UI mode |
| `npm run serve` (functions/) | Build + start Firebase emulator |
| `npm run build` (functions/) | Compile TypeScript only |

## Release Process

See `docs/sad-pdfcraft.md §11.3` for the full RC → staging → E2E gate → prod promotion flow.

```
# Cut a release candidate
git tag riqa-v1.1.0-rc.0 && git push origin riqa-v1.1.0-rc.0
# → deploys to stg.riqa.app, triggers Playwright e2e suite

# Promote to production (after e2e passes)
git tag riqa-v1.1.0 && git push origin riqa-v1.1.0
# → requires manual approval in GitHub → deploys to riqa.app
```

## Project Structure

```
apps/pdf-craft/
├── e2e/                    # Playwright e2e tests
├── functions/              # Firebase Functions (payments, CMS proxy, email, cleanup)
│   └── src/
│       ├── cms/            # DatoCMS GraphQL queries + proxy
│       ├── email/          # Resend email templates
│       └── events/         # Pub/Sub event handlers
├── public/                 # Static assets, robots.txt
├── src/
│   ├── actions/            # Astro Actions (server API layer)
│   ├── components/
│   │   ├── slices/         # Page section components (ResourceList, Operations, etc.)
│   │   ├── ui/             # Header, Footer, Brand
│   │   └── views/          # Operation views (SplitPdf, CompressPdf, SignPdf, ...)
│   ├── firebase/           # Firebase client + admin initialisation
│   ├── pages/              # Astro pages (routes)
│   ├── styles/             # Global CSS, prose styles
│   └── utils/              # Types, shared helpers, CMS client
└── terraform/              # Infrastructure as Code (per-environment modules)
```
