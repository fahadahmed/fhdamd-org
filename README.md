# fhdamd-org

Personal monorepo for fhdamd products — a pnpm workspace managed with Turborepo.

## Workspace layout

```
apps/
  pdf-craft/        Astro + React web app for PDF creation and manipulation (Firebase App Hosting)
  fhdamd-web/       Personal site (Astro + React, Firebase App Hosting)
  pdf-processor/    Express microservice for server-side PDF processing

packages/
  threads/          @fhdamd/threads — React + CSS Modules design system (published to npm)

tooling/
  eslint/           Shared ESLint config
  prettier/         Shared Prettier config
```

## Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/) 10 — `npm install -g pnpm`

## Getting started

```sh
# Install all dependencies
pnpm install

# Start all apps and packages in dev mode
pnpm dev

# Start a single app
pnpm dev --filter=pdf-craft
pnpm dev --filter=fhdamd-web

# Build everything
pnpm build

# Build a single app
pnpm build --filter=pdf-craft
```

## Packages

### `@fhdamd/threads`

The shared design system used across all fhdamd apps. Published to npm.

```sh
# Build the library
pnpm --filter=@fhdamd/threads build

# Storybook (component development)
pnpm --filter=@fhdamd/threads storybook

# Run tests
pnpm --filter=@fhdamd/threads test
```

See [packages/threads](packages/threads/README.md) for full usage docs.

## Tooling

| Tool | Purpose |
|------|---------|
| [Turborepo](https://turborepo.com) | Task runner with caching |
| [pnpm workspaces](https://pnpm.io/workspaces) | Monorepo package management |
| [TypeScript](https://www.typescriptlang.org/) | Type checking across all packages |
| [ESLint](https://eslint.org/) | Linting |
| [Prettier](https://prettier.io/) | Formatting |
| [Commitizen](https://commitizen.github.io/) | Conventional commit prompts (`pnpm commit`) |
| [Release Please](https://github.com/googleapis/release-please) | Automated versioning and changelogs |

## Committing

Use the interactive commit prompt to follow [Conventional Commits](https://www.conventionalcommits.org/):

```sh
pnpm commit
```

Commits scoped to a package (`feat(threads):`, `fix(pdf-craft):`) trigger Release Please to version that package automatically.

## License

[MIT](./LICENSE)
