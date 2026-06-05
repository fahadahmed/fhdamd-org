# @fhdamd/threads

Earthy, accessible React + CSS Modules design system for fhdamd products.

[![npm](https://img.shields.io/npm/v/@fhdamd/threads)](https://www.npmjs.com/package/@fhdamd/threads)
[![license](https://img.shields.io/npm/l/@fhdamd/threads)](./LICENSE)

## Install

```sh
npm install @fhdamd/threads
# or
pnpm add @fhdamd/threads
```

## Usage

Import the design tokens and component styles once at your app root:

```ts
import '@fhdamd/threads/tokens';
import '@fhdamd/threads/styles';
```

Then use components:

```tsx
import { Button, Card, CardTitle, CardBody } from '@fhdamd/threads';

export function MyPage() {
  return (
    <Card accentBar="top" accentColor="terra">
      <CardTitle>Merge PDFs</CardTitle>
      <CardBody>Combine documents in seconds.</CardBody>
      <Button variant="solid-terra" href="/merge">
        Get started
      </Button>
    </Card>
  );
}
```

## Exports

| Path | Contents |
|------|----------|
| `@fhdamd/threads` | All components and hooks |
| `@fhdamd/threads/tokens` | CSS custom property tokens (import once at root) |
| `@fhdamd/threads/styles` | Component styles (import once at root) |

## Design principles

- **Ceramic palette** — bone, ink, terracotta, sage; warm neutrals that feel considered
- **WCAG AA minimum** — every text token meets 4.5:1 contrast
- **RTL-first** — CSS logical properties throughout; `dir=rtl` flips everything with no JS
- **One token contract** — semantic aliases mean dark theme is a mapping, not a rewrite
- **No hardcoded values** — components never use raw hex, px, or magic numbers

## Dark theme

Set `data-theme="dark"` on your `<html>` element. Tokens handle the rest.

## Storybook

[fhdamd-threads.web.app](https://fhdamd-threads.web.app)

## License

[MIT](./LICENSE)
