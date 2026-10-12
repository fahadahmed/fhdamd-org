# jamaal-web

Marketing and waitlist site for [Jamaal](https://jamaal.app): an Astro static site with React islands, built on `@fhdamd/threads` 2.x.

## Develop

```sh
pnpm install
# put DATOCMS_API_TOKEN=<read-only Content Delivery token> in apps/jamaal-web/.env.local (see "Content (DatoCMS)")
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

## Styles

No `.astro` file defines styles: everything is in `src/styles/`, and a test (`src/styles/styles.test.ts`) fails on a `<style>` block or a plain inline `style` attribute.

- **Tokens and roles** come from `@fhdamd/threads` (`/tokens`, `/styles`, `/base`). Prefer its role classes (`th-label`, `th-meta`, `th-lede`, `th-body`, `th-hero`, `th-eyebrow`) and its components before writing a rule.
- `global.css` (fonts, site tokens), `landing.css` (layout: `.section`, `.section-inner`, `.split`, `.stack`, `.lede`, `.copy`, `.meta`) and `home.css` (home page sections) are the shared layers. `utilities.css` holds small patterns such as `.list-reset`; add to it when a pattern appears a second time.
- **One stylesheet per component or page** in `src/styles/components/`, all imported by `components.css`. Every rule is under the component's root class with `:where(.root)`, which keeps the zero specificity Astro's old scoped styles had and stops a generic name like `.card` leaking into another component. A new component adds a file there, with its root class in the markup, and one `@import`.
- **Data-driven values** (a device's position, a swatch colour) are CSS custom properties set with `cssVars()` from `src/lib/cssVars.ts`, and the stylesheet reads them with `var(--x)`.
- **Checking a restyle:** build before and after, then compare full-page screenshots of every page at 390, 768 and 1280px in light and dark. A change that should be invisible must leave every image identical.

## Hosting and deploys

Hosted on Firebase Hosting, project `jamaal-web` (default site `jamaal-web`, https://jamaal-web.web.app). Config is in `firebase.json` and `.firebaserc`.

- **Pull requests:** `ci-jamaal-web.yml` builds the site and deploys it to a preview channel (one per PR, expires after 7 days). The preview URL is posted as a PR comment.
- **Merge to `main`:** the same workflow deploys to the `live` channel.
- **Secret:** deploys use the GitHub secret `FIREBASE_SERVICE_ACCOUNT_JAMAAL_WEB`, the JSON key of a service account in the `jamaal-web` project with the **Firebase Hosting Admin** role.
- **Headers:** hashed assets under `/_astro/` are cached for a year (immutable); every response gets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and HSTS. There is no Content-Security-Policy yet: the layout uses inline scripts and Astro islands, so a CSP needs hashes (tracked in #391).
- **Custom domain:** `jamaal.app` is connected in the Firebase console (Hosting > Add custom domain) by adding the DNS records Firebase shows.
- **Local check:** `firebase emulators:start --only hosting --project demo-jamaal-web` serves `dist` with the real headers. On macOS, port 5000 is taken by AirPlay Receiver, so the emulator falls back to another port.

## Functions

`functions/` holds the Cloud Functions codebase (`jamaal-web-functions`, Node 22, region `us-central1`, next to the `nam5` Firestore).

- `pnpm --filter jamaal-web-functions build` compiles to `functions/lib`.
- `firebase emulators:start --only functions --project demo-jamaal-web` (run from `apps/jamaal-web`) serves it locally at `http://127.0.0.1:5001/demo-jamaal-web/us-central1/healthCheck`.

| Function | Trigger | What it does |
|---|---|---|
| `signup` | `POST /api/signup` (Hosting rewrite) | Validates, rate-limits and stores `signups/{email}`; answers `added`, `invited` (beta) or 409 (#422) |
| `rebuildOnConfigChange` | Remote Config published | Asks GitHub to run `ci-jamaal-web.yml`, which rebuilds and redeploys the static site (#425) |

- **The list** is the Firestore collection `signups`, one document per email address (the document id), whichever form it came from: `firstName`, `email`, `devices` (`iphone`, `ipad`, `mac`), `source` (`hero` or `join`), `stage` the form was on (`waitlist`, `testflight`, `launched`) and `createdAt`. To email everyone, read the whole collection. When an address already on the list joins the beta, the function adds the devices they chose now to `devices`, fills `firstName` if it was blank and sets `inviteRequestedAt`; `createdAt`, `stage` and `source` stay as first recorded.
- `pnpm --filter jamaal-web-functions test` runs the unit tests and `build` compiles to `functions/lib`.
- `firebase emulators:start --only functions,firestore --project demo-jamaal-web` (from `apps/jamaal-web`) serves them locally. Remote Config is not emulated, so the stage falls back to `waitlist` there.
- **Deploying:** `deploy-jamaal-functions.yml` deploys functions, Firestore rules and indexes when anything under `functions/` or the rules and indexes files change on `main`, or by hand from the Actions tab. By hand: `firebase deploy --only functions,firestore --project jamaal-web`.
  - The service account behind `FIREBASE_SERVICE_ACCOUNT_JAMAAL_WEB` needs, on `jamaal-web`: Cloud Functions Admin, Service Account User, Firebase Rules Admin, Cloud Datastore Index Admin, Artifact Registry Writer, Secret Manager Viewer and Cloud Build Editor, as well as Hosting Admin.
  - A new function must be public (`allUsers` has `roles/run.invoker`) to be reachable from the website. `signup` is; `rebuildOnConfigChange` is an event function and is not.
- **npm in Cloud Build:** the folder is uploaded on its own, so `functions/package-lock.json` and `.npmrc` (`legacy-peer-deps=true`) are needed or the build fails with `Cannot read properties of null (reading 'edgesOut')`. If dependencies change, regenerate the lock in a clean folder: copy `package.json` and `.npmrc` out, run `npm install --package-lock-only --legacy-peer-deps`, and copy `package-lock.json` back.

### Flipping the stage

The stage (`waitlist`, `testflight`, `launched`) is the `site_stage` parameter in Remote Config.

1. Change `site_stage` in the Firebase console (Remote Config) and **Publish**. Remote Config keeps version history, so it can be rolled back the same way.
2. `rebuildOnConfigChange` queues `ci-jamaal-web.yml` and the site is rebuilt and deployed in about two minutes. (Without the function, run that workflow by hand from the Actions tab: Run workflow, branch `main`.) The signup function reads the stage within a minute and needs no rebuild.
3. Check: the home page shows the new hero eyebrow and form, `jamaal.app/api/signup` answers the new stage (a test signup returns `invited` in the beta), and the workflow log says `Site stage: <stage> (Remote Config)`.
4. Don't flip to `testflight` until the invite function exists (#424): the API would say `invited` without inviting anyone.

**One-time setup for the automatic rebuild:** create a fine-grained GitHub token for this repository with *Actions: read and write*, then store it as the secret the function reads: `firebase functions:secrets:set GITHUB_DISPATCH_TOKEN --project jamaal-web`, and deploy.

## Content (DatoCMS)

Every word on the site comes from **DatoCMS** and is fetched at build time, so it can be edited and published without a developer. Nothing is bundled as a fallback: a build without a token, or against an unreachable or incomplete DatoCMS, **fails** rather than deploying a page with a hole in it.

**How a page gets its content**

- `src/lib/cms/client.ts` is the one client: `fetchCms(query, variables)` posts to the Content Delivery API (GraphQL) with the token, a timeout and retries on network errors, 429 and 5xx, and throws on any HTTP or GraphQL error. Published content only; there are no draft previews.
- `src/lib/cms/queries.ts` has **one query per page**, each fetching everything that page shows plus the site settings (the nav, the footer and the contact address) in a single request: `HOME_QUERY`, `JOURNAL_QUERY`, `POSTS_QUERY` (every article, fetched once for all the article pages), `CONTENT_PAGE_QUERY` (privacy, terms, support), `PRESS_QUERY` and `SITE_QUERY` (the 404 page).
- `src/lib/cms/pages.ts` has one loader per page (`loadHome()`, `loadJournal()`, ...). Each returns the site settings and the page, with the build's stage (waitlist, testflight, launched) already applied, so the pages and components only render.
- `src/lib/cms/mappers.ts` checks the response (`strict()` names every empty field in the error) and reshapes it into the models in `models.ts`. `types.ts` has the raw response types and `fixtures.ts` complete responses for tests.
- Structured Text (the legal pages and articles) becomes the site's blocks in `src/lib/datocms.ts` and `mappers.ts`. Links are limited to `http(s):`, `mailto:` and site-relative paths. Headings on the legal pages get anchor ids from their text ("This website" is `#this-website`).

**What stays in the code** is how the page is drawn, not what it says: `src/data/layout.ts` (which screenshot and where each device sits on the day story, the example tasks' grid positions, the Night Planning screens), the stage (`src/data/stage.ts`) and the feature flags (`src/data/site.ts`). These line up by position with DatoCMS records, and the build fails if the counts don't match. The Cookie banner and the signup form's labels and error messages are interface text in the code.

**Models in DatoCMS** (API keys): singletons `site_config`, `home_page`, `journal_page`, `press_page`; `content_page` (one per `page_key`: privacy, terms, support) with a Structured Text `body`; `post` (the Journal); `faq_item` and `day_chapter` (sortable). Repeating groups are blocks in Modular Content fields (`comparison_row`, `order_chip`, `device_card`, `plan_step`, `titled_text`, `price_plan`, `press_fact`, `brand_colour`, `press_file`) and in Structured Text (`figure`, `pull_quote`, `detail_row`, `step`, `conditional_note`, `faq_list`). Stage-specific copy has a field per stage (for example `hero_eyebrow_waitlist`, `hero_eyebrow_testflight`, `hero_eyebrow_launched`). Each FAQ question says in which stages it appears on the home page and whether it is also listed on the support page.

**Token and environment**

- Create a read-only Content Delivery API token (no Content Management access, no drafts) and add it as the GitHub secret `JAMAAL_DATOCMS_TOKEN`. It reaches the build as `DATOCMS_API_TOKEN`; set `DATOCMS_ENVIRONMENT` to read a sandbox.
- Locally, put it in `apps/jamaal-web/.env.local`: `DATOCMS_API_TOKEN=...`. Without it `pnpm dev` and `pnpm build` stop with a message saying so. Pull requests from forks have no secrets, so their builds fail by design.

**Editors** are invited in DatoCMS with a role that can create, edit and publish records and upload assets, but cannot change the schema. Check the plan's editor-seat limit first. Publishing a `post` in DatoCMS needs its `next` link to point at a published article, so publish a circular set together.

**Publishing rebuilds the site:** a DatoCMS webhook on Record publish and unpublish starts the CI workflow directly: `POST https://api.github.com/repos/fahadahmed/fhdamd-org/actions/workflows/ci-jamaal-web.yml/dispatches` with the custom payload `{"ref":"main"}` and the headers `Authorization: Bearer <fine-grained GitHub token with Actions: read and write>`, `Accept: application/vnd.github+json`, `Content-Type: application/json` and `X-GitHub-Api-Version: 2022-11-28`. It is the same call `rebuildOnConfigChange` makes, so one token with that permission serves both. The site is live about two minutes later. If a publish does nothing, open the webhook's call log in DatoCMS: 403 means the token lacks *Actions: read and write* on this repository, 404 a wrong URL, and 422 a missing payload.

## Error reporting (Sentry)

Errors only: no tracing, replay, breadcrumbs or user data, and the privacy page says so when it is on.

- **Site:** `src/lib/errorReporting.ts` listens for uncaught errors and unhandled rejections and downloads the Sentry SDK only when one happens (almost every visit pays nothing). Events are scrubbed of the user, cookies, headers and query string, and the page address keeps only its path. At most five reports per page view. It is **off unless the build has `PUBLIC_SENTRY_DSN`**, which CI takes from the GitHub secret `JAMAAL_SENTRY_DSN`.
- **Functions:** `functions/src/errors.ts` reports unexpected failures in `signup` and `rebuildOnConfigChange` and flushes before the instance freezes. Events drop the request and user entirely (a signup body holds a name and email). The DSN is `SENTRY_DSN` in `functions/.env.jamaal-web`; empty means off.
- **To switch it on:** create one Sentry project (the site and the functions share it), turn on *Prevent storing of IP addresses* in its settings, add its DSN as the GitHub secret `JAMAAL_SENTRY_DSN`, put the same DSN in `functions/.env.jamaal-web`, and redeploy the functions.
- **The app itself** (Swift, in its own repository) uses the Sentry Cocoa SDK with the same rules: crashes and errors only, `sendDefaultPii = false`, and scrubbed breadcrumbs so task, habit and Anchor text never leaves the device.
