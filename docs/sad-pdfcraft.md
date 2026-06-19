# PDF-Craft Solution Architecture Document

**Product:** PDF-Craft \
**Organisation:** fhdamd \
**Repository:** fhdamd-org (Monorepo) \
**Author:** Fahad Ahmed \
**Status:** Draft \
**Last Updated:** 19 Jun 2026

## 1. Purpose & Scope

### 1.1 Purpose

This document describes the solution architecture of PDF-Craft.
It captures the system architecture, key architectural decisions, and operational assumptions made during the initial design and implementation.

The primary audience is future maintainers and architects of PDF-Craft (including the original author). The document prioritises clarity of intent and decision rationale over exhaustive detail.

### 1.2 In Scope

This document covers the **solution-level architecture** of the PDF-Craft platform. Specifically, it includes:

- The **overall system architecture**, including the interaction between the Astro Web application, Astro Actions, Firebase services and third-party providers.
- The **frontend architecture** of the Astro + React web application focusing on the responsibilities and trust boundaries rather than UI implementation details.
- The **backend execution model**, including:
  - Use of Astro Actions as the primary server-side API layer.
  - Use of Firebase Functions for asynchronous, long-running, and event-driven workloads.
- **Authentication and Authorization architecture**, including Firebase Authentication and access control decisions.
- **PDF processing flows**, including orchestration, background execution, idempotency expectations, and lifecycle management.
- **Data architecture**, covering Firebase data models, ownership boundaries, and state transitions.
- **Storage architecture**, including Firebase storage bucket separation, signed URL access patterns, and data retention policies.
- **Payment and billing integration**, including Stripe Checkout flows, webhook processing, and entitlement updates.
- **Transactional email architecture**, including event triggers, delivery flow via third-party providers, failure handling, and observability.
- **Operational architecture**, including:
  - Environment separation (DEV, STG, PRD)
  - Deployment and release strategy
  - Scheduled background jobs and cleanup tasks
- **Security architecture**, including trust boundaries, abuse prevention mechanisms, and secrets management.
- **Observability and operational concerns**, such as logging, error tracking, and monitoring expectations.
- **Architectural decisions and trade-offs**, either documented directly in this document or referenced via Architecture Decision Records (ADRs).

### 1.3 Out of Scope

This document intentionally excludes the following areas:

- **UI/UX and visual design**, including styling, layout, and design system implementation details.
- **Feature-level behaviour**, such as detailed descriptions of individual PDF operations, validation rules, and pricing logic.
- **Low-level implementation details**, including application code structure, framework-specific patterns, and configuration syntax.
- **Platform internals**, including Firebase- and GCP-managed service implementations and runtime internals.
- **Operational processes**, such as customer support workflows, incident response procedures, and manual administrative tasks.
- **Non-target platforms**, including native mobile apps, desktop applications, browser extensions, and unsupported third-party integrations.
- **End-user and business documentation**, including marketing content, legal documents, and user guides.

> Topics excluded here may be documented separately in ADRs, runbooks, or product documentation where appropriate.

## 2. Architectural Principles

- **Serverless First** — managed, auto-scaling compute (App Hosting / Cloud Run / Cloud Functions) over self-managed infrastructure.
- **Security by Default** — zero-trust access, signed URLs, least privilege IAM.
- **Monorepo Parity** — DEV, STG, PRD behave identically.
- **Cost Aware Design** — scale-to-zero, retention/cleanup jobs for ephemeral data, batched background work.

These principles are shared across the wider organisation — see [solution-architecture.md §7](solution-architecture.md#7-architectural-principles).

## 3. Architectural Decisions (ADRs)

These are the significant, durable decisions behind PDF-Craft's design. Each is recorded as a lightweight ADR: the decision, why it was made, and what it costs.

### ADR-001: Astro Actions as the primary server-side API layer

**Decision:** Use [Astro Actions](https://docs.astro.build/en/guides/actions/) (`src/actions/*`) as the primary mechanism for browser → server calls (auth, credits, PDF operations), rather than standalone REST endpoints or a separate API service.

**Why:** Astro Actions are colocated with the frontend, type-safe end-to-end (the client gets typed `actions.*` calls derived from the server-side `defineAction` schemas), and run in the same SSR runtime — no separate deployment, routing, or CORS concerns for first-party calls.

**Trade-offs:** Action bodies are capped by `security.actionBodySizeLimit` (Astro default: 1 MB — too small for multi-file PDF uploads; PDF-Craft raises this explicitly in `astro.config.mjs`). Actions also run inside the same Cloud Run instance as page rendering, so CPU-heavy work should be delegated elsewhere (see ADR-003).

### ADR-002: Firebase Functions for asynchronous, event-driven, and scheduled work

**Decision:** Use Firebase Functions (2nd gen, in `functions/`) for work that doesn't belong in the synchronous request/response cycle: Stripe payment processing and webhooks, Pub/Sub-driven side effects (`onAppEvent`), the CMS proxy, and the scheduled cleanup job.

**Why:** This work is either long-running, needs to survive retries (Pub/Sub, Stripe webhooks), needs to run on a schedule independent of user traffic, or needs elevated trust (service-to-service auth, secrets) that shouldn't sit in the page-rendering path.

**Trade-offs:** Two backend runtimes (Astro SSR + Functions) means two places to manage secrets, logging, and observability — mitigated by mirroring the structured-logging and Sentry setup between `src/utils/lib/logger.ts` and `functions/src/utils/logger.ts`.

### ADR-003: A dedicated `pdf-processor` microservice for CPU-bound, native-dependency operations

**Decision:** Encrypt and decrypt operations are delegated over HTTP to `apps/pdf-processor`, a small stateless Express service running on Cloud Run that shells out to the `qpdf` CLI. Merge and image-to-PDF operations, by contrast, run in-process inside the Astro Action using `pdf-lib` (a pure-JS library).

**Why:** `qpdf` is a native binary dependency that cannot run inside the Astro App Hosting / Cloud Run container alongside the web app, and PDF encryption/decryption is CPU-bound work that shouldn't block the request-handling runtime serving every other user. A separate, independently scalable Cloud Run service isolates this dependency and workload.

**Trade-offs:** An extra network hop, an extra service to deploy/monitor, and a service-to-service authentication concern (solved via GCP metadata-server identity tokens in production — see [§9](#9-security)). `pdf-processor` exists solely to serve `pdf-craft` and has no independent lifecycle today.

### ADR-004: Signed download tokens over Storage Security Rules for file access

**Decision:** Firebase Storage rules deny all client access (`allow read, write: if false`). Files are instead served via per-object `firebaseStorageDownloadTokens`, embedded in a signed-style download URL (`...?alt=media&token=<uuid>`) generated at upload time and stored in the corresponding Firestore document.

**Why:** This avoids needing to express "a user may read only their own files" in Storage Security Rules (which historically had limitations expressing per-document ownership cleanly against Storage paths) and keeps all file-serving logic server-side and auditable.

**Trade-offs (flagged as a known gap, see [§9](#9-security)):** A leaked token grants access to that object indefinitely (tokens don't expire on their own — only the cleanup job's deletion of the underlying object ends access). This is materially different from short-lived signed URLs and should be revisited — e.g. by issuing time-boxed signed URLs via the Admin SDK (`file.getSignedUrl()`) instead of static download tokens.

### ADR-005: Server-side session cookies (`__session`) over client-held ID tokens

**Decision:** After Firebase client-side sign-in, the ID token is exchanged for a server-managed session cookie (`auth.createSessionCookie`, 5-day expiry, `httpOnly`, `secure` in production, `sameSite=strict`), stored under the reserved `__session` cookie name (recognised by Firebase Hosting / App Hosting).

**Why:** This lets Astro's SSR pages and Actions authenticate the user from the request itself (`context.request.headers.get('cookie')` → `auth.verifySessionCookie`) without round-tripping to the client for a fresh ID token on every request, and keeps the credential out of reach of client-side JavaScript (`httpOnly`).

**Trade-offs:** Logout requires a server round-trip to clear the cookie (the client cannot delete an `httpOnly` cookie itself) — the client and server must agree on success before the UI reflects "logged out", otherwise the two can drift out of sync (a real defect that was identified and fixed; see the cookie-deletion attributes and the success-gating in `src/components/ui/Header/Header.tsx` and `src/actions/user.ts`).

### ADR-006: Explicit `PUBLIC_APP_ENV` for observability environment tagging

**Decision:** Sentry's `environment` is driven by an explicit `PUBLIC_APP_ENV` variable (`dev` / `stg` / `prod`), set per Firebase backend via Secret Manager (`apphosting.yaml` → `secret: appEnv`) and per-Functions deployment via `.env.<project-id>` files — rather than inferred from `NODE_ENV` or hostname.

**Why:** `NODE_ENV` is a build/runtime concern (`production` vs `development`) that doesn't map cleanly onto *deployment* environments (you can run a `production` build against a staging backend). Hostname parsing is fragile and breaks under custom domains, previews, or local proxying. An explicit, independently-configured variable keeps the two concerns separate and makes the mapping visible in configuration rather than inferred in code.

**Trade-offs:** One more piece of per-environment configuration to set up and keep in sync (tracked as a deployment task — see [§11](#11-deployment-plan)).

### ADR-007: Direct `@sentry/node` initialisation over serverless wrapper integrations in Functions

**Decision:** Firebase Functions initialise Sentry directly (`Sentry.init(...)` + `Sentry.captureException(...)`) rather than using `@sentry/google-cloud-serverless`'s function-wrapping helpers.

**Why:** Firebase Functions v2 (`onRequest`, `onMessagePublished`, `onSchedule`) already provides its own function-wrapping and lifecycle management; stacking a second wrapping layer on top risked subtle conflicts (double-reporting, context loss, or interference with Firebase's own retry/ack semantics) for marginal benefit. Direct initialisation plus a logger-level hook (`log.exception` → `Sentry.captureException`) gives full coverage with a simpler mental model.

## 4. Technical Components

- Astro Frontend
- React
- Firebase
- Stripe
- Resend
- Sentry
- Turborepo
- Github (Actions, Environments, Releases)
- Terraform
- Playwright
- Docker

## 5. Conceptual Architecture

PDF-Craft is a server-rendered Astro application with React islands for interactivity, backed by Firebase as its primary platform (Auth, Firestore, Storage, Functions, Pub/Sub) and a small set of focused third-party integrations (Stripe for payments, Resend for email, DatoCMS for editable content, Sentry for observability, reCAPTCHA for abuse prevention).

The system separates concerns along two axes:

1. **Synchronous vs. asynchronous** — user-facing requests (auth, credit checks, PDF operations) are handled synchronously by Astro Actions within the request/response cycle; everything that can happen *after* the user has what they need (emails, credit reconciliation from payment webhooks, cleanup) is pushed onto Pub/Sub or scheduled Functions.
2. **General-purpose vs. specialised compute** — pure-JS, in-process work (merge, image-to-PDF via `pdf-lib`) runs inside the Astro Action; CPU-bound work with native dependencies (encrypt/decrypt via `qpdf`) is delegated to the dedicated `pdf-processor` service.

### C4 — Container Diagram

```mermaid
C4Container
  title Container Diagram — PDF-Craft

  Person(user, "User", "Signs up, signs in, performs PDF operations, purchases credits")

  System_Boundary(pdfcraft, "PDF-Craft") {
    Container(spa, "Web App (Astro SSR + React islands)", "Astro 5, React 19, @fhdamd/threads", "Renders pages, handles auth UI, PDF operation forms, dashboard, pricing")
    Container(actions, "Astro Actions", "TypeScript, Zod", "Server-side API layer: auth (user), credits, PDF operations (operations) — runs in the same Cloud Run instance as the SSR app")
    Container(processor, "pdf-processor", "Express + qpdf (Cloud Run)", "Stateless service performing PDF encryption/decryption via the qpdf CLI")
    ContainerDb(firestore, "Firestore", "NoSQL document DB", "User profiles, credit balances, file metadata & lifecycle state")
    ContainerDb(storage, "Cloud Storage", "Object storage", "Stores generated PDFs under users/{userId}/{filename}, served via per-object download tokens")
    Container(authsvc, "Firebase Auth", "Managed identity", "Email/password identity, ID token issuance & verification, session cookie minting")
    Container(functions, "Cloud Functions (2nd gen)", "Node.js, TypeScript", "processPayment, stripeWebhook, onAppEvent, cms, deleteExpiredFiles")
    Container(pubsub, "Pub/Sub", "app-event topic", "Decouples PDF-operation completion from downstream side effects (email, etc.)")
  }

  System_Ext(stripe, "Stripe", "Checkout sessions & webhooks")
  System_Ext(resend, "Resend", "Transactional email API")
  System_Ext(datocms, "DatoCMS", "Headless CMS — pricing, FAQs, operation catalogue")
  System_Ext(sentry, "Sentry", "Error tracking, tracing, session replay")
  System_Ext(recaptcha, "Google reCAPTCHA", "Bot/abuse verification")
  System_Ext(gcp, "GCP Metadata Server / Secret Manager", "Service-to-service identity tokens & secrets")

  Rel(user, spa, "Uses", "HTTPS")
  Rel(spa, actions, "Calls", "astro:actions / fetch")
  Rel(actions, authsvc, "Verifies session cookies, mints sessions, creates users", "Admin SDK")
  Rel(actions, firestore, "Reads/writes profiles, credits, file metadata", "Admin SDK")
  Rel(actions, storage, "Uploads generated PDFs, generates download tokens", "Admin SDK")
  Rel(actions, processor, "Delegates encrypt/decrypt", "HTTPS + GCP identity token")
  Rel(actions, pubsub, "Publishes app-event messages", "Pub/Sub client")
  Rel(actions, datocms, "Fetches pricing/operations content (via Functions cms proxy)", "GraphQL")
  Rel(actions, recaptcha, "Verifies tokens on signup/signin", "siteverify API")
  Rel(spa, sentry, "Reports client/server errors, traces, replays", "HTTPS")

  Rel(pubsub, functions, "Triggers onAppEvent", "Pub/Sub push")
  Rel(functions, resend, "Sends transactional emails", "HTTPS API")
  Rel(functions, stripe, "Creates checkout sessions, verifies webhook signatures", "HTTPS API")
  Rel(functions, firestore, "Updates credit balances, queries expired files", "Admin SDK")
  Rel(functions, storage, "Deletes expired file objects", "Admin SDK")
  Rel(functions, datocms, "Proxies CMS queries", "GraphQL")
  Rel(functions, sentry, "Reports errors & traces", "HTTPS")
  Rel(functions, gcp, "Reads secrets (Stripe keys, Resend key, DatoCMS token, ...)", "Secret Manager")

  Rel(stripe, functions, "checkout.session.completed webhook", "HTTPS")
  Rel(processor, gcp, "Verifies caller identity token", "Metadata server")
```

## 6. Sequence Diagrams

### 6.1 High-Level User Journey

End-to-end view of a typical session: sign in, land on the dashboard (content-driven by the CMS), perform an operation, and receive the result — illustrating how the major containers fit together.

```mermaid
sequenceDiagram
  actor U as User
  participant W as Web App (Astro SSR)
  participant A as Astro Actions
  participant FA as Firebase Auth
  participant FS as Firestore
  participant P as pdf-processor
  participant ST as Cloud Storage
  participant PS as Pub/Sub
  participant FN as Cloud Functions

  U->>W: Open /signin, submit credentials
  W->>A: actions.user.verifyUser(idToken, captchaToken)
  A->>FA: verifyIdToken / createSessionCookie
  A-->>W: Set __session cookie, redirect → /dashboard
  W->>A: actions.operations... (fetch CMS-driven operation catalogue)
  A-->>W: Render available operations (DatoCMS content)

  U->>W: Choose an operation, upload file(s), submit
  W->>A: actions.credits.checkCredits(task, creditCost)
  A->>FS: Read profile.credits
  A-->>W: { success: true }

  W->>A: actions.operations.[operation](formData)
  A->>FA: verifySessionCookie
  alt Encrypt / Decrypt
    A->>P: POST /encrypt or /decrypt (multipart)
    P-->>A: Encrypted/decrypted PDF bytes
  else Merge / Image-to-PDF
    Note over A: Processed in-process via pdf-lib
  end
  A->>ST: Upload result, generate download token
  A->>FS: Write file metadata (expiresAt, deleted=false)
  A->>FS: Decrement profile.credits
  A->>PS: Publish app-event (eventType, fileUrl, userEmail, ...)
  A-->>W: { fileUrl }
  W-->>U: Show download link

  PS->>FN: onAppEvent triggers (async)
  FN-->>U: Transactional email with download link (via Resend)
```

### 6.2 Authentication — Sign in, Session Validation, Sign out

```mermaid
sequenceDiagram
  actor U as User
  participant W as Web App
  participant RC as reCAPTCHA
  participant A as Astro Actions (user)
  participant FA as Firebase Auth

  Note over U,FA: Sign in
  U->>W: Submit email + password
  W->>RC: grecaptcha.execute('signin') — fresh token per attempt
  RC-->>W: captchaToken
  W->>FA: signInWithEmailAndPassword (client SDK)
  FA-->>W: idToken
  W->>A: actions.user.verifyUser({ idToken, captchaToken })
  A->>RC: siteverify(captchaToken) — score & action check
  A->>FA: verifyIdToken(idToken)
  A->>FA: createSessionCookie(idToken, { expiresIn: 5 days })
  A-->>W: Set-Cookie: __session (httpOnly, secure, sameSite=strict)
  W-->>U: Redirect → /dashboard

  Note over U,FA: Subsequent requests (no client round-trip needed)
  U->>W: Request a protected page / action
  W->>A: Forwards request with __session cookie
  A->>FA: verifySessionCookie(cookie, checkRevoked=true)
  FA-->>A: Decoded token (uid, email)

  Note over U,FA: Sign out
  U->>W: Click "Log out"
  W->>A: actions.user.signOutUser()
  A-->>W: cookies.delete('__session', { httpOnly, secure, sameSite=strict, path: '/' })
  Note right of A: Deletion attributes must match those used at<br/>creation, or the browser treats it as a different cookie
  W->>FA: signOut(auth) — only after server confirms success
  W-->>U: Redirect → / (UI now matches server session state)
```

> **Design note:** Logout intentionally does **not** require reCAPTCHA verification — it's an authenticated, idempotent, low-risk operation, and gating it behind a third-party verification call only introduced an avoidable failure mode (an expired/reused token would abort the cookie deletion while the client still proceeded to sign out locally, leaving the UI and server session out of sync). Sign-in and sign-up retain reCAPTCHA, generating a **fresh token at the moment of submission** (not cached on mount) since reCAPTCHA v3 tokens are single-use and expire after ~2 minutes.

### 6.3 PDF Operation — Merge Example (representative of Merge / Image-to-PDF / Encrypt / Decrypt)

```mermaid
sequenceDiagram
  actor U as User
  participant W as Web App
  participant A as Astro Actions (operations)
  participant FA as Firebase Auth
  participant FS as Firestore
  participant ST as Cloud Storage
  participant PS as Pub/Sub

  U->>W: Upload PDFs, click "Merge"
  W->>A: actions.credits.checkCredits({ task: 'merge', creditCost })
  A->>FS: users/{uid}.profile.credits
  A-->>W: { success: true }

  W->>A: actions.operations.mergePdfs(formData)
  A->>A: Extract & verify __session cookie
  A->>FA: verifySessionCookie(cookie, true)
  FA-->>A: { uid, email }
  A->>A: Merge PDFs in-process (pdf-lib)
  A->>ST: bucket.file('users/{uid}/merged-{ts}.pdf').save(bytes, { firebaseStorageDownloadTokens })
  A->>A: Build fileUrl = storage URL + ?alt=media&token={uuid}
  A->>FS: users/{uid}/files/{fileId}.set({ fileUrl, operation: 'merge', expiresAt: now+24h, deleted: false, ... })
  A->>PS: publish('app-event', { eventType: 'pdf-merge', fileUrl, userEmail, requestId })
  A->>FS: users/{uid}.profile.credits -= creditCost
  A-->>W: { success: true, data: { fileUrl } }
  W-->>U: Show download link
```

> Encrypt and decrypt follow the same shape, with one difference: between cookie verification and the storage upload, the Action calls out to **pdf-processor** (`POST /encrypt` or `POST /decrypt`, multipart) and uses the returned bytes as the file to store — see [ADR-003](#adr-003-a-dedicated-pdf-processor-microservice-for-cpu-bound-native-dependency-operations).

### 6.4 Stripe Payment & Credit Purchase

```mermaid
sequenceDiagram
  actor U as User
  participant W as Web App (Pricing)
  participant FN as Cloud Functions
  participant FA as Firebase Auth
  participant SP as Stripe
  participant FS as Firestore

  U->>W: Click "Buy credits" on a pricing option
  W->>W: auth.currentUser.getIdToken()
  W->>FN: POST /processPayment (Bearer idToken, credits, amount, productName, requestId)
  FN->>FA: verifyIdToken → uid must match payload userId
  FN->>SP: stripe.checkout.sessions.create({ line_items, metadata: { userId, credits, requestId }, success_url, cancel_url })
  SP-->>FN: { url: checkoutUrl }
  FN-->>W: { url: checkoutUrl }
  W->>U: Redirect → Stripe Checkout

  U->>SP: Completes payment on Stripe-hosted checkout
  SP-->>U: Redirect → /payment-success?session_id=...

  par Asynchronous confirmation
    SP->>FN: POST /stripeWebhook (checkout.session.completed, signed)
    FN->>FN: stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    FN->>FS: users/{userId}.profile.credits += metadata.credits
    FN-->>SP: 200 OK (acknowledge — prevents retry)
  end
```

> Crediting the account happens **only** via the verified webhook (`checkout.session.completed`), not on the client redirect — this is the source of truth and is resilient to the user closing the tab before the success redirect completes. The webhook responds `200` immediately after updating Firestore so Stripe doesn't retry a successfully-processed event.

### 6.5 Scheduled Cleanup — Expired File Deletion

> Corrected from the original placeholder title ("Daily Cron Job") — the job actually runs **hourly**.

```mermaid
sequenceDiagram
  participant SCH as Cloud Scheduler
  participant FN as deleteExpiredFiles (Function)
  participant FS as Firestore
  participant ST as Cloud Storage

  loop Every 60 minutes (UTC)
    SCH->>FN: Trigger
    FN->>FS: For each user: query files where deleted == false AND expiresAt <= now (limit 500)
    loop Each expired file
      FN->>ST: Delete object at storagePath
      FN->>FN: Stage Firestore update (deleted=true, deletedAt, deletionReason='Delete Cron Job')
    end
    FN->>FS: Commit batch update
  end
```

> Files are retained for **24 hours** by default (`retentionMs` in `operations.ts`, currently a flat constant — the code notes this should vary "per subscription plan", which is not yet implemented). The 500-per-user-per-run limit bounds the cost and duration of each invocation; a user with more than 500 simultaneously-expired files would have the remainder cleaned up on the next run.

### 6.6 Transactional Email Delivery (Pub/Sub → Functions → Resend)

```mermaid
sequenceDiagram
  participant A as Astro Actions
  participant PS as Pub/Sub (app-event topic)
  participant FN as onAppEvent (Function)
  participant H as Event Handler (per eventType)
  participant RS as Resend

  A->>PS: publishMessage({ eventType, userEmail, fileUrl, fileName, requestId, ... })
  PS->>FN: Push delivery (at-least-once)
  FN->>FN: Decode message, look up handler by eventType
  alt Handler found
    FN->>H: handle(payload)
    H->>RS: emails.send({ from: 'PDF Craft (no-reply@pdf-craft.app)', to: userEmail, subject, html })
    RS-->>H: Delivery accepted
    FN-->>PS: Ack (success)
  else No handler / handler throws
    FN-->>PS: Re-throw → Pub/Sub retries delivery
  end
```

**Event types & emails** (`functions/src/events/`):

| `eventType` | Handler | Email subject |
|---|---|---|
| `pdf-merge` | `handleMergePdfs` | "Your Merged PDF is Ready!" |
| `image-to-pdf` | `handleImageToPdf` | "Your Image to PDF is Ready!" |
| `pdf-encrypt` | `handleEncryptPdf` | "Your Protected PDF is Ready!" |
| `pdf-decrypt` | `handleDecryptPdf` | "Your Unlocked PDF is Ready!" |

> The handler **re-throws on failure** (`functions/src/index.ts`), which is intentional — it causes Pub/Sub to redeliver the message, giving transient failures (e.g. a Resend outage) a chance to succeed on retry rather than silently dropping the notification.

## 7. Data Architecture

PDF-Craft's data lives in **Firestore**, scoped almost entirely under a per-user document, which keeps ownership boundaries simple and queries naturally user-scoped.

### 7.1 Collections

**`users/{userId}`** — the user's profile and entitlements:

| Field | Type | Notes |
|---|---|---|
| `profile.name` | string | Set at sign-up |
| `profile.isSubscriber` | boolean | Reserved for future subscription tiers; not yet used to vary behaviour (e.g. retention) |
| `profile.credits` | number | Incremented by the Stripe webhook on successful purchase; decremented atomically (`FieldValue.increment`) per completed PDF operation |

**`users/{userId}/files/{fileId}`** — metadata and lifecycle state for every generated file:

| Field | Type | Notes |
|---|---|---|
| `fileId` | string (UUID) | Firestore-generated document ID, duplicated into the document for convenience |
| `fileName` | string | e.g. `merged-<timestamp>.pdf` |
| `storagePath` | string | `users/{userId}/{fileName}` — the Cloud Storage object path |
| `fileUrl` | string | Public download URL embedding the per-object download token |
| `operation` | string | `merge` \| `image-to-pdf` \| `encrypt` \| `decrypt` |
| `createdAt` / `updatedAt` | Timestamp | Server timestamps |
| `expiresAt` | Timestamp | `createdAt + 24h` (flat constant today — see [§6.5](#65-scheduled-cleanup--expired-file-deletion)) |
| `deleted` | boolean | Flips to `true` once the cleanup job removes the underlying object |
| `deletedAt` / `deletionReason` | Timestamp / string \| null | Populated by the cleanup job (`'Delete Cron Job'`) |

### 7.2 Indexes

A composite index on the `files` collection group (`deleted` ASC, `expiresAt` ASC, `__name__` ASC, `SPARSE_ALL` density) supports the cleanup job's query — `where('deleted', '==', false).where('expiresAt', '<=', now)` — efficiently across all users (`firestore.indexes.json`).

### 7.3 Ownership & State Transitions

- Every document under `users/{userId}/...` is owned exclusively by that user; there is no cross-user data sharing.
- A file document moves through exactly one lifecycle: **created** (`deleted: false`, `expiresAt` set) → **expired & cleaned up** (`deleted: true`, `deletedAt` and `deletionReason` populated) by the hourly scheduled job. There is currently no path for a user to delete a file early, or to extend its retention.
- Credit balance changes happen at exactly two points: **decrement** on a completed PDF operation (synchronous, in the same Action that produces the file) and **increment** on a verified Stripe `checkout.session.completed` webhook (asynchronous, source of truth for purchases).

## 8. Storage Architecture

### 8.1 Bucket Structure

All generated files are stored under a single per-user prefix:

```
users/{userId}/{fileName}
```

e.g. `users/abc123/merged-1718000000.pdf`. There is no separation by operation type, environment-specific bucket naming beyond the Firebase project itself, or temporary/staging area — files are written directly to their final location as part of the operation that creates them.

### 8.2 Access Model — Download Tokens, not Security Rules

Storage Security Rules deny all client access outright (`allow read, write: if false` — see [`storage.rules`](../apps/pdf-craft/storage.rules)). Instead, each object is written with a `firebaseStorageDownloadTokens` metadata value (a freshly generated UUID), and the Action constructs a download URL of the form:

```
https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded storagePath}?alt=media&token={uuid}
```

This URL is stored as `fileUrl` on the corresponding Firestore document and returned directly to the browser — see [ADR-004](#adr-004-signed-download-tokens-over-storage-security-rules-for-file-access) for the rationale and the gap this leaves (tokens don't expire independently of the underlying object).

### 8.3 Lifecycle & Retention

- **Retention window:** 24 hours from creation (flat constant, not yet varied by subscription tier — see [§6.5](#65-scheduled-cleanup--expired-file-deletion)).
- **Enforcement:** there is no Cloud Storage lifecycle/TTL rule on the bucket itself; expiry is enforced entirely at the application layer — the hourly `deleteExpiredFiles` Function deletes the object and marks the Firestore document `deleted: true`.
- **Consequence:** if the scheduled Function were to stop running, expired objects would remain in Storage indefinitely (cost and exposure both accrue). This coupling between "the schedule runs" and "data is actually deleted" is worth keeping in mind operationally.

## 9. Security

### 9.1 Trust Boundaries

```
Browser (untrusted)
   │  HTTPS, __session cookie (httpOnly)
   ▼
Astro SSR / Astro Actions (trusted — Cloud Run, App Hosting)
   │  Admin SDK (service account)         │  GCP identity token (service-to-service)
   ▼                                       ▼
Firebase (Auth, Firestore, Storage)    pdf-processor (Cloud Run)
   ▲
   │  Pub/Sub push, Stripe-signed webhooks
Cloud Functions (trusted — separate runtime, separate secrets)
```

The browser is never trusted with long-lived credentials, service account keys, or direct database/storage access — every privileged operation is mediated by either the Astro Actions layer (using the Admin SDK with a service account) or Cloud Functions.

### 9.2 Authentication & Session Management

- **Identity:** Firebase Authentication (email/password).
- **Session:** server-managed `__session` cookie (`httpOnly`, `secure` in production, `sameSite=strict`, 5-day expiry), minted via `auth.createSessionCookie` and verified on every protected request via `auth.verifySessionCookie(cookie, /* checkRevoked */ true)`. See [ADR-005](#adr-005-server-side-session-cookies-__session-over-client-held-id-tokens) and [§6.2](#62-authentication--sign-in-session-validation-sign-out).
- **Protected routes:** page-level cookie checks redirect unauthenticated users to `/signin` (e.g. `dashboard.astro`, the operation pages); Actions independently re-verify the session server-side rather than trusting page-level checks alone.

### 9.3 Abuse Prevention

- **reCAPTCHA v3** gates sign-up and sign-in (`verifyRecaptcha` in `src/actions/user.ts`, score threshold `>= 0.5`), with a fresh token generated at submission time to avoid the single-use/expiry pitfalls of caching a token on mount.
- **Logout is intentionally not gated** by reCAPTCHA — see the design note in [§6.2](#62-authentication--sign-in-session-validation-sign-out).
- **Service-to-service auth:** in production, calls from Astro Actions to `pdf-processor` are authenticated using a GCP-issued identity token fetched from the metadata server (`computeMetadata/v1/.../identity?audience=<processorUrl>`), verified by the receiving Cloud Run service. In local development, the call is made directly without a token (both run on `localhost`).
- **Stripe webhook integrity:** verified via signature check (`stripe.webhooks.constructEvent`) before any state change is made.

### 9.4 Secrets Management

- **Production/staging:** secrets (Firebase config, Stripe keys, Resend API key, DatoCMS token, Sentry DSN/auth token, reCAPTCHA keys, `PUBLIC_APP_ENV`, ...) are referenced from `apphosting.yaml` (App Hosting) and Functions config as named entries in **Google Secret Manager** — never committed to source.
- **Local development:** `.env.local` files (gitignored) hold equivalent values for the Astro app and Functions emulator.
- See the [Appendix](#appendix) for the operational runbook on managing these.

### 9.5 Known Gaps (flagged honestly for future hardening)

These were identified during review and are recorded here so the architecture record stays accurate.

**Resolved:**

1. ~~**Firestore rules are overly permissive.**~~ **Fixed.** Rules now scope `users/{userId}` and `users/{userId}/files/{fileId}` to `request.auth.uid == userId` for reads, and deny all client-side writes outright (every write already went through the Admin SDK, which bypasses rules — denying client writes closes the defence-in-depth gap without changing any actual behaviour).
2. ~~**No automated tests** currently cover the authentication ... or PDF-operation flows.~~ **Partially addressed.** A Playwright E2E suite ([§11.3](#113-release-strategy--rc-promotion-with-an-e2e-gate)) now covers sign-in page rendering, unauthenticated redirect behaviour, authenticated dashboard load, and a real encrypt operation through `pdf-processor`, and gates every promotion to production. It does **not** yet cover payment/Stripe flows, merge/decrypt/image-to-PDF operations, or sign-up — still a gap, just a narrower one.

**Still open:**

1. **Storage rules deny all access**, which is *safe* but means **all** access control for files lives in the download-token scheme described in [ADR-004](#adr-004-signed-download-tokens-over-storage-security-rules-for-file-access) — a leaked `fileUrl` grants indefinite access to that object (until the cleanup job deletes it). **Recommendation:** move to time-boxed signed URLs generated on demand (`file.getSignedUrl({ expires: ... })`) rather than static long-lived tokens, especially for any file containing sensitive content (e.g. decrypted PDFs).

## 10. Observability

PDF-Craft's observability stack spans both runtimes (Astro SSR app and Firebase Functions) and three layers: product analytics, structured logs, and error/performance tracking.

### 10.1 Product Analytics

Google Analytics 4, instrumented via `logEvent`/`setUserId` calls at key journey points (sign-up, login, `begin_checkout`, `pdf_operation_started/completed/failed`, ...).

### 10.2 Structured Logging

Both runtimes share a common logging shape (`src/utils/lib/logger.ts` for Astro, `functions/src/utils/logger.ts` for Functions) built on `firebase-functions/logger`, with semantic helpers — `log.event`, `log.business`, `log.warn`, `log.debug`, `log.error`, `log.exception` — that consistently attach `requestId`, `feature`, and `status` for traceability across a single user action (e.g. correlating a `processPayment` request with its later `stripeWebhook` confirmation via `requestId` in Stripe metadata).

### 10.3 Error Tracking, Tracing & Session Replay (Sentry)

- **Coverage:** client (`sentry.client.config.ts`), server-rendered Astro (`sentry.server.config.ts`), and Firebase Functions (`functions/src/index.ts`) all initialise Sentry — see [ADR-007](#adr-007-direct-sentrynode-initialisation-over-serverless-wrapper-integrations-in-functions).
- **Environment tagging:** `environment` is set from `PUBLIC_APP_ENV` (`dev`/`stg`/`prod`) — see [ADR-006](#adr-006-explicit-public_app_env-for-observability-environment-tagging).
- **Automatic exception capture:** `log.exception` forwards every audited exception to `Sentry.captureException`, so error reporting doesn't depend on remembering to add Sentry calls at each call site.
- **User context:** `Sentry.setUser({ id, email })` is set/cleared on Firebase auth-state changes (in `Header`, which renders on every page), enabling cross-session correlation of a user's error history.
- **Session replay:** enabled only on error (`replaysSessionSampleRate: 0.0`, `replaysOnErrorSampleRate: 1.0`) — replays are available for debugging without the overhead/privacy cost of recording every session.
- **Tracing:** `tracesSampleRate: 0.2` — sampled performance tracing across both runtimes; no custom spans around key business flows (PDF processing, checkout) yet.
- **Source maps:** uploaded at build time (`org: 'fhdamd'`, `project: 'pdf-craft'`) so production stack traces de-minify correctly.

### 10.4 Forward-Looking Items

- **Alerting** is not yet configured — errors land in Sentry but nothing proactively notifies on spikes or new issue types.
- **Release tracking** — Sentry events aren't yet tagged with a release/commit identifier, which would enable regression detection and "did this deploy cause this" correlation.
- **Custom performance spans / Web Vitals** — current tracing is generic; key flows (PDF processing, checkout) and frontend Core Web Vitals aren't separately instrumented.

## 11. Deployment Plan

### 11.1 Environments

| Environment | Firebase project | Status | Notes |
|---|---|---|---|
| **DEV** | `pdf-craft-dev` | **Active** | Continuous deployment from `main` (`deploy-dev.yml`, `deploy-pdf-processor-dev.yml`); App Hosting backend `pdf-craft-web` |
| **STG** | `pdf-craft-stg` | **Active** | Deployed via RC tags; gates promotion to prod behind a Playwright E2E suite; custom domain `stg.pdf-craft.app` |
| **PRD** | `pdf-craft-prd` | **Active** | Deployed via final version tags on a commit already verified in staging; requires manual approval; custom domain `pdf-craft.app` |

All three are now live, closing the gap the original draft of this document flagged here. *Monorepo Parity* (see [§2](#2-architectural-principles)) is realised by provisioning all three from the same Terraform module and the same `firebase.json`/`apphosting.yaml` shape — they differ only in secret values and the gating in front of them.

### 11.2 Infrastructure as Code

All three environments are provisioned by a single reusable Terraform module (`terraform/modules/firebase-env`), parameterised by `project_id` and `environment_label`, with one calling environment per project (`terraform/environments/{dev,staging,prod}`). The module provisions:

- Required GCP APIs (Firestore, Secret Manager, Cloud Functions, Cloud Run, Artifact Registry, Cloud Build, Pub/Sub, Eventarc, Cloud Billing, App Hosting, Identity Toolkit)
- The Firestore database and the default Storage bucket (`lifecycle { prevent_destroy = true }` on both, since all three environments now hold real or test data)
- All 23 application secrets as empty shells — the 16 referenced by `apphosting.yaml` plus 7 bound directly by Cloud Functions via `defineSecret()` that aren't visible from `apphosting.yaml` alone (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_BASE_URL`, `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `DATOCMS_API_TOKEN`, `DATOCMS_ENV`). Values are populated out-of-band via `gcloud secrets versions add`, never committed.
- An Artifact Registry Docker repository for `pdf-processor` images
- A per-environment GitHub Actions deploy identity via **Workload Identity Federation** — no long-lived service account keys are stored anywhere, in GitHub or otherwise

**IAM bindings the module had to discover the hard way.** Standing up `pdf-craft-stg` and `pdf-craft-prd` from a clean GCP project surfaced nine distinct permission gaps that only show up when deploying with a narrowly-scoped service account rather than a personal account with broad project access. All are now permanently encoded in the module, so every future environment gets them for free:

- The deploy identity needs `roles/iam.workloadIdentityPoolAdmin` and `roles/iam.serviceAccountAdmin` to manage the very WIF pool and service-account IAM policy the module itself provisions for it (a bootstrapping/self-reference problem).
- `roles/resourcemanager.projectIamAdmin` — `firebase deploy --only apphosting` sets IAM policy directly as part of its rollout.
- The App Hosting compute service account needs `secretmanager.viewer` **in addition to** `secretmanager.secretAccessor` — the latter only covers `secretmanager.versions.access` (payload read); the build-time secret-resolution step calls `secretmanager.versions.get` (version metadata), which only `viewer` grants.
- The App Hosting compute service account also needs `pubsub.publisher` — Astro server actions (`src/actions/operations.ts`) publish directly to the `app-event` Pub/Sub topic, not just Cloud Functions.
- Gen2 Cloud Functions' `onMessagePublished`/`onSchedule` triggers route through Pub/Sub → Eventarc → Cloud Run, which needs `roles/iam.serviceAccountTokenCreator` on the Pub/Sub service agent and `roles/run.invoker` + `roles/eventarc.eventReceiver` on the default compute service account.
- `cloudbilling.googleapis.com` must be enabled — `firebase deploy --only functions` checks billing status before deploying and fails outright otherwise.

**What's still manual**, because none of it is exposed by the Terraform provider or the Firebase CLI's non-interactive mode:

- The GCS Terraform state bucket must exist before the first `terraform init` (`gcloud storage buckets create gs://<project>-tfstate ...`).
- Firebase Storage needs one-time Console activation (**Build → Storage → Get started**) before `google_firebase_storage_bucket` can succeed — the CLI route (`firebase init storage`) stops working once a project reaches a certain state.
- On a genuinely brand-new project, enabling `pubsub.googleapis.com`/`firebaseapphosting.googleapis.com` doesn't *synchronously* create their service agents — those are lazily provisioned on first real product usage (an App Hosting backend existing, a Pub/Sub topic existing from a Cloud Functions deploy). The bindings above apply cleanly once that first usage has happened; until then, `terraform apply` legitimately fails on just those resources.
- The App Hosting backend is created via `firebase apphosting:backends:create --non-interactive`, with its associated Firebase web app created **explicitly beforehand** (`--app <id>`) — letting the command auto-create one (the default behaviour) produces a confusingly duplicate, ambiguously-named app on every invocation, which then has to be untangled when configuring App Check.

### 11.3 Release Strategy — RC Promotion with an E2E Gate

`pdf-craft` and `pdf-processor` are tagged and promoted independently, using two tag shapes applied to the **same commit**:

```
pdf-craft-v1.0.1-rc.1      → staging   (deploy-staging.yml)
pdf-craft-v1.0.1           → prod      (deploy-prod.yml, gated)

pdf-processor-v1.0.0-rc.1  → staging   (deploy-pdf-processor-staging.yml)
pdf-processor-v1.0.0       → prod      (deploy-pdf-processor-prod.yml, gated)
```

```mermaid
flowchart TD
  RC["RC tag pushed<br/><code>pdf-craft-v1.0.1-rc.1</code>"] --> Guard1["guard<br/>commit reachable from main?"]
  Guard1 --> DeployStg["deploy<br/>→ pdf-craft-stg"]
  DeployStg --> TriggerE2E["trigger-e2e<br/>dispatches e2e-staging.yml"]
  DeployStg --> RelStg["release<br/>(prerelease)"]
  TriggerE2E --> E2E["e2e-staging.yml<br/>Playwright vs stg.pdf-craft.app"]

  E2E -- "passes" --> Retag["Same commit re-tagged<br/><code>pdf-craft-v1.0.1</code>"]
  E2E -- "fails" --> Stop1(["Fix and re-cut a new RC"])

  Retag --> Guard2["guard<br/>on main? not an RC tag?"]
  Guard2 --> Gate{"e2e-gate<br/>green e2e-staging.yml<br/>for this exact commit?"}
  Gate -- "missing" --> Stop2(["Hard fail —<br/>no prod deploy"])
  Gate -- "found" --> Approval["manual approval<br/>(prod GitHub Environment)"]
  Approval --> DeployPrd["deploy<br/>→ pdf-craft-prd"]
  DeployPrd --> RelPrd["release"]

  style Stop1 fill:#f8d7da
  style Stop2 fill:#f8d7da
  style Approval fill:#fff3cd
  style E2E fill:#d4edda
  style Gate fill:#d4edda
```

> The same shape applies to `pdf-processor`, substituting `deploy-pdf-processor-staging.yml`/`deploy-pdf-processor-prod.yml` and the `pdf-processor-vX.Y.Z[-rc.N]` tag — both apps share the single `e2e-staging.yml` gate, since the suite's encrypt-operation test already exercises `pdf-processor` regardless of which app's tag triggered it.

**Staging pipeline** (`deploy-staging.yml` / `deploy-pdf-processor-staging.yml`), triggered on RC tag push:
1. `guard` — verifies the tagged commit is reachable from `main`; RC tags can't be cut from arbitrary branches.
2. `deploy` — authenticates via WIF, deploys Firestore rules, Storage rules, Cloud Functions, and App Hosting (or builds/pushes/deploys the `pdf-processor` Cloud Run image on GitHub's runner — building it locally on Apple Silicon produces an `arm64` image Cloud Run can't execute; this is exactly why the pipeline, not a local shortcut, is the supported path).
3. `trigger-e2e` (pdf-craft only) — explicitly dispatches `e2e-staging.yml` via the GitHub API once the deploy succeeds. (Originally wired as a `workflow_run` trigger; switched to an explicit dispatch after SonarCloud correctly flagged that `workflow_run` inherits secrets access regardless of the triggering ref — a real risk in general, even though this specific chain has no fork-PR path into it.)
4. `release` — publishes a **prerelease** GitHub Release with the deployed URL and commit.

**E2E gate** (`e2e-staging.yml`): a Playwright suite (`apps/pdf-craft/e2e/`) runs against `https://stg.pdf-craft.app`, authenticating via a Firebase Admin SDK session-cookie bypass — UI sign-in can't be exercised in a headless browser, since reCAPTCHA v3 blocks it — for a dedicated test-only account (`e2e-test-stg@pdf-craft.app`). Coverage: sign-in page renders, unauthenticated redirects, authenticated dashboard load, and a real **encrypt** operation through `pdf-processor` — deliberately the one test that exercises the inter-service connectivity and IAM wiring described in [§11.2](#112-infrastructure-as-code).

**Promotion to prod**: re-tagging the *same commit* with the final version number (no `-rc` suffix) triggers `deploy-prod.yml` / `deploy-pdf-processor-prod.yml`:
1. `guard` — verifies the commit is on `main` *and* explicitly rejects any tag containing `-rc.` as defence in depth, in case the tag glob patterns ever overlap unexpectedly.
2. `e2e-gate` — queries the GitHub Actions API for a successful `e2e-staging.yml` run on the exact same commit SHA and **hard-fails the deploy if none exists**. This is the actual enforcement point: a commit cannot reach production without first having passed E2E in staging.
3. `deploy` — runs under the `prod` GitHub Environment, which requires **manual approval** before the job executes, regardless of how the gate above resolved.
4. `release` — publishes a GitHub Release (not marked prerelease, unlike staging's).

This closes most of known gap #3 in [§9.5](#95-known-gaps-flagged-honestly-for-future-hardening) for the specific paths the suite covers, and replaces continuous, ungated deployment to every environment with a verified promotion chain for STG → PRD specifically.

### 11.4 Why DEV Stays Continuous

DEV deliberately does **not** go through the RC/E2E/approval pipeline: it exists to give fast feedback on `main`, holds no real customer data, and gating it would only slow down day-to-day iteration without protecting anything consequential. Promotion gating exists specifically to protect STG → PRD, where a regression has either user-facing or financial (Stripe, live mode) consequences.

### 11.5 Versioning

The application's own `package.json` version stays a flat, unmanaged `0.0.1` — it has no relationship to the deploy tags above. The `pdf-craft-vX.Y.Z[-rc.N]` / `pdf-processor-vX.Y.Z[-rc.N]` tags exist purely as the **deployment pipeline's** versioning scheme (driving RC → staging → promote → prod, and the GitHub Release attached to each step); they are chosen manually per release rather than derived from commit history.

This is a deliberately different model from `@fhdamd/threads`, which **is** released via [Release Please](https://github.com/googleapis/release-please) and Conventional Commits, since it's a published, independently-consumed package where semantic versioning carries real meaning for downstream consumers (see [solution-architecture.md §5](solution-architecture.md#5-shared-platform-decisions)).

## Appendix

### How to update environment variables and secrets in Google Secret Manager

All 23 secrets (16 referenced by `apphosting.yaml`, 7 bound directly by Cloud Functions via `defineSecret()`) are created as empty shells by the Terraform module ([§11.2](#112-infrastructure-as-code)). Populating or rotating a value is a direct `gcloud` call against the target project's Secret Manager — there is no separate "promote a secret" step, since each environment's Secret Manager is independent:

```sh
printf '%s' "the-actual-value" | gcloud secrets versions add <secretName> \
  --data-file=- --project=<pdf-craft-dev|pdf-craft-stg|pdf-craft-prd>
```

Adding a new version doesn't take effect immediately for App Hosting — it's resolved at **build time**, not read dynamically at runtime. After updating a secret that an already-deployed backend depends on, trigger a fresh rollout to pick it up:

```sh
cd apps/pdf-craft
firebase deploy --only apphosting --project <project-id> --force
```

(`--force` is required, not `--non-interactive` — the latter doesn't suppress App Hosting's "deploy your local source?" confirmation prompt.)

**Adding a brand-new secret end-to-end:**
1. Add the name to `local.secret_names` in `terraform/modules/firebase-env/main.tf`.
2. Run `terraform apply` for each environment that needs it (this creates the empty shell — the App Hosting compute service account already has project-level `secretmanager.secretAccessor`/`secretmanager.viewer`, so no per-secret access grant is needed).
3. If the app reads it via `apphosting.yaml`, add the `variable:`/`secret:` mapping there. If Cloud Functions reads it, add `defineSecret('NAME')` and include it in the relevant function's `secrets: [...]` array.
4. Populate the value per environment with the `gcloud secrets versions add` command above.
5. Local development uses `.env.local` (gitignored) with the equivalent variable name and a dev-appropriate value — there's no automated sync between local and deployed values; keep them manually in parity.

**Rotation practice:** if a secret value is ever pasted in plaintext somewhere it shouldn't be (chat, a terminal scrollback shared in a screenshot, etc.), treat it as compromised regardless of whether it was *used* maliciously — generate a fresh value/key and overwrite the secret, rather than reusing the exposed one. This applies most obviously to `firebaseServiceAccountKey` (rotate via `gcloud iam service-accounts keys create` + `keys delete` on the old key ID) and any third-party API key (Stripe, Resend, DatoCMS).

### One-time environment bootstrap checklist

For provisioning a *new* environment (or recovering one from scratch) beyond what `terraform apply` covers automatically:

1. `gcloud storage buckets create gs://<project>-tfstate --project=<project> --location=US --uniform-bucket-level-access`
2. `terraform init && terraform apply` from `terraform/environments/<env>` (uses your personal `gcloud` credentials for this one-time run, since the GitHub Actions deploy identity doesn't exist until this apply creates it)
3. Copy `terraform output -raw workload_identity_provider` / `service_account_email` into the matching GitHub Environment's `GCP_WORKLOAD_IDENTITY_PROVIDER` / `GCP_SERVICE_ACCOUNT` secrets
4. Activate Firebase Storage via Console (**Build → Storage → Get started**) if `google_firebase_storage_bucket` failed on first apply
5. Re-run `terraform apply` — expect it to also fail on the Pub/Sub/App Hosting service-agent bindings if this is a genuinely fresh project; that's expected, see [§11.2](#112-infrastructure-as-code)
6. Create the Firebase web app explicitly (`POST .../webApps`), then `firebase apphosting:backends:create --non-interactive --app <id> --backend pdf-craft-web --primary-region us-central1 --root-dir apps/pdf-craft --runtime nodejs22` — **always pass `--app`**, or the command silently creates a new, confusingly-named duplicate app every time it's run
7. Populate all 23 secrets (see above) — `pdfProcessorUrl` and `STRIPE_WEBHOOK_SECRET` can only get real values after a first deploy (their URLs aren't known in advance), so populate them with a placeholder and circle back
8. Deploy once via the real pipeline (an RC tag for staging; a final tag promoted from a verified RC for prod) — this is what creates the Pub/Sub topic and unblocks the remaining Terraform resource from step 5; re-run `terraform apply` afterward to bring it back to zero drift
9. Get the real `pdf-processor` Cloud Run URL and the real Cloud Functions `stripeWebhook` URL from that deploy, update `pdfProcessorUrl` and (after registering the Stripe webhook endpoint) `STRIPE_WEBHOOK_SECRET`, then trigger one more App Hosting rollout to pick them up
10. Map the custom domain via Firebase Console (App Hosting backend → Custom domains) and add the DNS record at the registrar — SSL provisions automatically afterward, purely time-based
