# jamaal-web

Marketing and waitlist site for [Jamaal](https://jamaal.app): an Astro static site with React islands, built on `@fhdamd/threads` 2.x.

## Develop

```sh
pnpm install
pnpm --filter jamaal-web dev      # http://localhost:4321
pnpm --filter jamaal-web test
pnpm --filter jamaal-web build
```

## Notes

- Design references live outside the repo (Claude Design pages: Jamaal Landing and Jamaal Site Launched).
- Tokens, component styles and the optional base reset come from `@fhdamd/threads` (`/tokens`, `/styles`, `/base`); see the Layout.
- Fonts are loaded in the layout (Hanken Grotesk, Fraunces, JetBrains Mono); Threads does not bundle them.
- Tests alias `@fhdamd/threads` to a light mock in `src/test/mocks/threads.tsx`; extend it as you test more components.
- Hosting (Firebase), the waitlist backend and the page sections are tracked in #387, #388 and #390.

## The page and the launch flag

`src/pages/index.astro` composes the sections in `src/components/sections/` (Hero, Kinds, Anchors, Priority, NightPlanningSection, Wellbeing, Nots, Pricing, Closing). Copy and data live in `src/data/content.ts`; site-wide switches live in `src/data/site.ts`.

- **Site stage** is one of `waitlist`, `testflight` or `launched`. It lives in **Firebase Remote Config** (parameter `site_stage`, template in `remoteconfig.template.json`) and is baked into the static site at build time as `PUBLIC_SITE_STAGE` (`src/data/stage.ts`). `LAUNCHED` in `src/data/site.ts` is true only for `launched`; until the redesign gives `testflight` its own variant it shows the pre-launch page.
  - **CI** runs `scripts/stage.mjs` before the build. It reads the published Remote Config template with the deploy service account (needs `roles/cloudconfig.viewer`). A live (main) build **fails** if it cannot read it, so a deploy never ships a stale stage; preview builds fall back to `waitlist`.
  - **Flip the stage:** change `site_stage` in the Firebase console (Remote Config, then Publish), then re-run the live deploy (rebuild) for the site to pick it up. Remote Config keeps version history, so a flip can be rolled back.
  - **Locally:** set `SITE_STAGE=launched` (or `testflight`) in the shell, or `PUBLIC_SITE_STAGE` in `.env.local`, to preview another stage. With neither, you get `waitlist`.
  - Deploy the template with `firebase deploy --only remoteconfig --project jamaal-web`. Also set `APP_STORE_URL` to the real listing for launch.
- **Static by default.** Sections are Astro components with no client JavaScript. The only islands are the header and footer (Threads `SiteNav` / `SiteFooter`), the waitlist form and the Night Planning carousel.
- **Screens** are cropped to what the design shows and kept in `src/assets/screens/`; Astro builds AVIF and WebP at 1x and 2x.
- **Waitlist form:** `src/utils/signup.ts` posts to `PUBLIC_WAITLIST_URL` (the backend is #388). Without it, a production build refuses to say "you're on the list"; only local development pretends. Append `?joined` to the URL to review the confirmation state.
- **Links that need pages:** `/privacy` and the Contact mailto exist in the footer now; after launch it also links `/support`, `/journal`, `/press` and `/terms`. Those pages are #389; the legal ones must exist before any email is collected.

## Hosting and deploys

Hosted on Firebase Hosting, project `jamaal-web` (default site `jamaal-web`, https://jamaal-web.web.app). Config is in `firebase.json` and `.firebaserc`.

- **Pull requests:** `ci-jamaal-web.yml` builds the site and deploys it to a preview channel (one per PR, expires after 7 days). The preview URL is posted as a PR comment.
- **Merge to `main`:** the same workflow deploys to the `live` channel.
- **Secret:** deploys use the GitHub secret `FIREBASE_SERVICE_ACCOUNT_JAMAAL_WEB`, the JSON key of a service account in the `jamaal-web` project with the **Firebase Hosting Admin** role.
- **Headers:** hashed assets under `/_astro/` are cached for a year (immutable); every response gets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and HSTS. There is no Content-Security-Policy yet: the layout uses inline scripts and Astro islands, so a CSP needs hashes (tracked in #391).
- **Custom domain:** `jamaal.app` is connected in the Firebase console (Hosting > Add custom domain) by adding the DNS records Firebase shows.
- **Local check:** `firebase emulators:start --only hosting --project demo-jamaal-web` serves `dist` with the real headers. On macOS, port 5000 is taken by AirPlay Receiver, so the emulator falls back to another port.

## Functions

`functions/` holds the Cloud Functions codebase (`jamaal-web-functions`, Node 22). It currently has one placeholder endpoint, `healthCheck`, which proves the setup; the waitlist signup function (#388) replaces it.

- `pnpm --filter jamaal-web-functions build` compiles to `functions/lib`.
- `firebase emulators:start --only functions --project demo-jamaal-web` (run from `apps/jamaal-web`) serves it locally at `http://127.0.0.1:5001/demo-jamaal-web/us-central1/healthCheck`.
- **Not deployed by CI.** The hosting deploy uses `--only hosting`. Deploying functions needs the Blaze (pay-as-you-go) plan and a service account with more than Hosting Admin (Cloud Functions Admin, Service Account User and similar), so it is left for #388.

## The Journal (DatoCMS)

`/journal` and `/journal/<slug>` are built at deploy time from **DatoCMS**, so posts can be written and published without a developer. Without a token the site builds with the three articles bundled in `src/content/journal/*.json` (the same shape), so a fork or a local build still has a Journal.

- **Code:** `src/lib/datocms.ts` fetches the posts (Content Delivery API, GraphQL) and turns Structured Text into the site's own blocks (paragraphs, headings, lists, quotes, figures, detail rows, steps); `src/lib/journalPosts.ts` chooses the source and **fails the build** if DatoCMS can't be reached or a post is missing a field, so an outage can never deploy an empty Journal. Links in posts are limited to `http(s):`, `mailto:` and site-relative paths.
- **Model to create in DatoCMS** (API key `post`): `title` (single-line text, required), `accent` (single-line text, the part of the title set in italics), `slug` (slug from the title, required), `category` (single-line text with an enum validator: Story, Guides, How-to), `date` (date), `read_minutes` (integer), `excerpt` (single-line text), `featured_excerpt` (single-line text), `lede` (multi-paragraph text), `featured` (boolean; only one post should be featured), `cta_note` (single-line text, optional), `next` (link to another post), `cover` (single asset), and `body` (**Structured Text** with these allowed blocks and nodes: headings level 2, paragraphs with bold, italic and links, lists, block quotes, and the blocks below).
  - Blocks (API keys): `figure` (`image` asset, `caption` text), `pull_quote` (`text`, `cite`), `detail_row` (`label`, `value`) and `step` (`title`, `body`, `image` asset). Consecutive blocks of the same kind are grouped.
- **Token:** create a read-only Content Delivery API token and add it as the GitHub secret `JAMAAL_DATOCMS_TOKEN` (it reaches the build as `DATOCMS_API_TOKEN`; set `DATOCMS_ENVIRONMENT` to read a sandbox). For local builds put it in `.env.local`.
- **Editors:** invite them in DatoCMS with a role that can create, edit and publish `post` records and upload assets, but cannot change the schema. Check the plan's editor-seat limit first.
- **Publishing rebuilds the site:** add a DatoCMS webhook on `post` publish and unpublish that POSTs `{"event_type":"datocms-publish"}` to `https://api.github.com/repos/fahadahmed/fhdamd-org/dispatches` with the headers `Authorization: Bearer <GitHub token with Actions: write>`, `Accept: application/vnd.github+json` and `Content-Type: application/json`. `ci-jamaal-web.yml` runs on that event and deploys the site in about two minutes.
