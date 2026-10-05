# @fhdamd/threads

Accessible React + CSS Modules design system for fhdamd products. Threads 2.0 shares its tokens with ThreadsKit (Swift).

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
import '@fhdamd/threads/base'; // optional: reset, body, link styles and .th-* role classes
```

Fonts are not bundled. Add the Google Fonts link to your layout (do not `@import` it from CSS, which blocks rendering):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,SOFT,WONK,wght@0,9..144,0..100,0..1,300..900;1,9..144,0..100,0..1,300..900&family=Hanken+Grotesk:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:wght@400;500&display=swap"
/>
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
| `@fhdamd/threads/base` | Optional global reset, `body`, link styles and `.th-*` role classes |

## Design principles

- **21 colour names** — one palette shared with ThreadsKit: teal for done and settled, terracotta for the one action
- **WCAG AA minimum** — text tokens meet 4.5:1 contrast; the Colours page checks the pairs live
- **RTL-first** — CSS logical properties throughout; `dir=rtl` flips everything with no JS
- **One token contract** — semantic names mean dark theme and the native apps are a mapping, not a rewrite
- **No hardcoded values** — components never use raw hex, px, or magic numbers

## Migrating from 1.x

2.0 is a major release: the palette, body font (Hanken Grotesk replaces Bricolage Grotesque), radii, shadows and motion change visually. The 1.x `--th-color-*`, `--th-radius-*`, `--th-shadow-*` and `--th-duration-base` names still resolve as deprecated aliases and are removed in 3.0. The `--th-prim-*` primitives are removed. `Button` variants `solid-ink` and `solid-sage` render as `ghost` and warn in development. See the Colours page in Storybook for the full 1.x to v2 map.

## Dark theme

Set `data-theme="dark"` on your `<html>` element. Tokens handle the rest.

## Storybook

[fhdamd-threads.web.app](https://fhdamd-threads.web.app)

## License

[MIT](./LICENSE)
