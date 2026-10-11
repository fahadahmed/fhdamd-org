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

## Error reporting (Sentry)

Errors only: no tracing, replay, breadcrumbs or user data, and the privacy page says so when it is on.

- **Site:** `src/lib/errorReporting.ts` listens for uncaught errors and unhandled rejections and downloads the Sentry SDK only when one happens (almost every visit pays nothing). Events are scrubbed of the user, cookies, headers and query string, and the page address keeps only its path. At most five reports per page view. It is **off unless the build has `PUBLIC_SENTRY_DSN`**, which CI takes from the GitHub secret `JAMAAL_SENTRY_DSN`.
- **Functions:** `functions/src/errors.ts` reports unexpected failures in `signup` and `rebuildOnConfigChange` and flushes before the instance freezes. Events drop the request and user entirely (a signup body holds a name and email). The DSN is `SENTRY_DSN` in `functions/.env.jamaal-web`; empty means off.
- **To switch it on:** create two Sentry projects (a browser one for the site, a Node one for the functions), turn on *Prevent storing of IP addresses* in each project's settings, add the browser DSN as the GitHub secret `JAMAAL_SENTRY_DSN`, put the Node DSN in `functions/.env.jamaal-web`, and redeploy the functions.
- **The app itself** (Swift, in its own repository) uses the Sentry Cocoa SDK with the same rules: crashes and errors only, `sendDefaultPii = false`, and scrubbed breadcrumbs so task, habit and Anchor text never leaves the device.
