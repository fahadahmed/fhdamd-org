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

- **`LAUNCHED`** (in `src/data/site.ts`) flips the whole site between the pre-launch page (early-access signup, "Join the list" header) and the launched page (App Store button, pricing section, Pricing / Support / Journal navigation, full footer). Launch day is a one-line change. Also set `APP_STORE_URL` to the real listing.
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

## Waitlist backend (Cloud Functions + Firestore)

The signup form posts to `/api/waitlist`, a Firebase Hosting rewrite to the `joinWaitlist` function in `functions/`, which stores one record per email in the Firestore `waitlist` collection.

- **One record per address:** the document id is a hash of the lower-cased email, so signing up twice is a no-op, and the response is the same either way (it never reveals who is on the list).
- **Stored:** first name, email, which form (`hero` or `join`) and a server timestamp. This matches the privacy page; change them together.
- **Protection:** strict validation (zod), a honeypot field (`company`, hidden from people), an origin allow-list (the live site, its Firebase hosts and preview channels, localhost), and Firestore rules that deny all client access. Only the function, using the Admin SDK, can write.
- **Not included yet:** rate limiting and App Check. Add them if the form gets abused.
- **Reading the list:** Firebase console > Firestore > `waitlist`, or export it with `gcloud firestore export`.
- **Local:** `firebase emulators:start --only hosting,functions,firestore --project demo-jamaal-web` (after `pnpm --filter jamaal-web build`), then `POST /api/waitlist` on the Hosting emulator port. The site's dev server has no rewrite, so the form only pretends to succeed in `pnpm dev`; a production build never does.
- **Tests:** `pnpm --filter jamaal-web-functions test` (CI runs them and compiles the functions on every PR).

### Deploying it (one-time, then per change)

CI deploys hosting only. Functions and rules are deployed by hand with an account that owns the project:

```sh
pnpm --filter jamaal-web build
pnpm --filter jamaal-web-functions build
cd apps/jamaal-web
firebase deploy --only functions,firestore:rules --project jamaal-web
```

Prerequisites: the **Blaze (pay-as-you-go)** plan on `jamaal-web` (Cloud Functions needs it; a waitlist stays well inside the free quota), and a **Firestore database** created in the project. To deploy from CI later, the `github-hosting-deploy` service account also needs Cloud Functions Admin, Service Account User, Firebase Rules Admin and Artifact Registry Writer.
