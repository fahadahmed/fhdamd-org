# fhdamd-web

Personal site and portfolio for [fhdamd.dev](https://fhdamd.dev) — an Astro + React site built as a fully static, server-free brochure site: homepage, about, services, case studies, a blog, and a contact form backed by a single Firebase Cloud Function.

See [`docs/sad-fhdamd-web.md`](../../docs/sad-fhdamd-web.md) at the repo root for the full architecture record — this README covers what you need to run and change the site day to day.

## Content model — Content Collections, not a CMS

Repeating content (blog posts, case studies, employers, skills, products, service tiers, ...) lives in [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) (`src/content.config.ts`), backed by either MDX files (`src/content/blog/`, `src/content/case-studies/`) or YAML files (`src/content/*.yaml`) depending on whether the entry needs long-form body content. Page-level singleton copy (hero text, CTAs, section headings) lives in plain TypeScript objects under `src/content/site/*.ts`.

This site used to run on DatoCMS, the same headless CMS still used by [pdf-craft](../pdf-craft). It moved to Content Collections because the thing a CMS actually buys you — a non-technical collaborator publishing content without touching code — doesn't apply here: there's one maintainer, comfortable in a text editor, for whom an external CMS added a network dependency and an extra account with no corresponding benefit. DatoCMS remains the right call for [pdf-craft](../pdf-craft) and for client work like the RZest case study, where a non-technical team genuinely needs to self-publish. See the blog post [Why Astro, Firebase, and DatoCMS for small business builds](https://fhdamd.dev/blog/astro-firebase-datocms-for-small-business) for the fuller reasoning.

A thin data-access layer (`src/lib/content/index.ts`) is the only thing pages import from — one `get*Page()` function per page, each returning a plain object that merges singleton copy with whatever collection data that page needs (sorted, filtered, or shaped as required). Pages and components never call `getCollection()`/`getEntry()` directly.

## Running locally

```sh
# From the repo root
pnpm install

# Start the dev server (http://localhost:4321)
pnpm --filter fhdamd-web dev

# Type-check (astro check)
pnpm --filter fhdamd-web check

# Lint
pnpm --filter fhdamd-web lint

# Run the Vitest suite
pnpm --filter fhdamd-web test

# Production build (outputs to dist/)
pnpm --filter fhdamd-web build

# Preview a production build locally
pnpm --filter fhdamd-web preview
```

The contact form calls a Firebase Cloud Function (`apps/fhdamd-web/functions/`) rather than an Astro server endpoint — see that directory's own setup below if you need to work on it locally.

### The `functions/` package (contact form)

`apps/fhdamd-web/functions/` is a separate Firebase Functions v2 codebase (Node/TypeScript, not part of the Astro app's build) containing one HTTP-triggered function, `sendContactMessage`. It validates the submitted payload with Zod and sends the notification email via nodemailer over Resend's SMTP relay.

```sh
cd apps/fhdamd-web/functions
pnpm run build              # tsc
pnpm run serve              # build + start the Functions emulator against the fahad-web project
```

Three values are read via `defineSecret` (Firebase Secret Manager) rather than plain env vars or a committed `.env` — not because all three are sensitive, but to keep the pattern consistent with the API key they're deployed alongside: `RESEND_API_KEY`, `CONTACT_TO_ADDRESS`, `CONTACT_FROM_ADDRESS`. Set/update a value with:

```sh
printf '%s' "the-value" | firebase functions:secrets:set SECRET_NAME --project fahad-web
```

The Astro app itself only needs to know the deployed function's URL, via `PUBLIC_CONTACT_FUNCTION_URL` (set in `.env` locally against the emulator, and in `ci-fhdamd-web.yml` for preview/production builds against the real deployed function).

## Deploy pipeline

`.github/workflows/ci-fhdamd-web.yml`, scoped to changes under `apps/fhdamd-web/**`:

- **`test`** — every push and PR: Vitest with coverage, SonarCloud scan.
- **`preview`** — every PR: builds the site and deploys it to a Firebase Hosting **preview channel**, so every PR gets its own shareable, disposable URL.
- **`deploy`** — every push to `main`: builds, deploys to the **live** Firebase Hosting channel (`fhdamd.dev`), bumps `package.json`'s patch version, and publishes a GitHub Release.

There's no staging environment or manual approval gate for this app (unlike pdf-craft's RC/E2E-gated promotion) — it's a low-risk personal site with no user data or payment flow, so continuous deployment from `main` is an acceptable trade for faster iteration. See [`docs/sad-fhdamd-web.md`](../../docs/sad-fhdamd-web.md) for the full rationale.

## Design system

All UI is built from [`@fhdamd/threads`](../../packages/threads), the shared design system published to npm and consumed here as an ordinary dependency (`workspace:*` isn't used — this app deliberately consumes a released npm version, one or more versions behind threads' latest, bumped deliberately alongside a feature that needs the new version rather than automatically). Don't add bespoke one-off styling for something Threads already provides a component for.
