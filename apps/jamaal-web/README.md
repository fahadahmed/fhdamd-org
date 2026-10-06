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
