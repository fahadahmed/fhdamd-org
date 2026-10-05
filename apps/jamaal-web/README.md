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
