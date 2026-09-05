# Changelog

## [0.6.1](https://github.com/fahadahmed/fhdamd-org/compare/threads-v0.6.0...threads-v0.6.1) (2026-09-05)


### Bug Fixes

* **threads:** opaque fullscreen backdrop, center the expanded diagram ([#352](https://github.com/fahadahmed/fhdamd-org/issues/352)) ([d434979](https://github.com/fahadahmed/fhdamd-org/commit/d4349799ad43ef999aacbff61184eb29609b9471))

## [0.6.0](https://github.com/fahadahmed/fhdamd-org/compare/threads-v0.5.2...threads-v0.6.0) (2026-08-26)


### Features

* **threads:** add expand-to-fullscreen control to MermaidDiagramCard ([#304](https://github.com/fahadahmed/fhdamd-org/issues/304)) ([#330](https://github.com/fahadahmed/fhdamd-org/issues/330)) ([303a19b](https://github.com/fahadahmed/fhdamd-org/commit/303a19bf24c83b55d8f4d55815b179e240555a10))

## [0.5.2](https://github.com/fahadahmed/fhdamd-org/compare/threads-v0.5.1...threads-v0.5.2) (2026-08-25)


### Bug Fixes

* **threads:** add align prop to LogoItem ([#293](https://github.com/fahadahmed/fhdamd-org/issues/293)) ([#325](https://github.com/fahadahmed/fhdamd-org/issues/325)) ([1bbdcbe](https://github.com/fahadahmed/fhdamd-org/commit/1bbdcbe6513d1218d60bc41e9f4534d0ec3c39eb))
* **threads:** add default bottom margin to SectionHeader ([#290](https://github.com/fahadahmed/fhdamd-org/issues/290)) ([#321](https://github.com/fahadahmed/fhdamd-org/issues/321)) ([dda337f](https://github.com/fahadahmed/fhdamd-org/commit/dda337f6f91308250f433b79122160b384323b01))
* **threads:** add ghost-inverse Button variant for dark surfaces ([#300](https://github.com/fahadahmed/fhdamd-org/issues/300)) ([#326](https://github.com/fahadahmed/fhdamd-org/issues/326)) ([024696c](https://github.com/fahadahmed/fhdamd-org/commit/024696c1ff1b8a34a6a51d15b1747e760fe3e559))
* **threads:** add stickyOffset prop to TableOfContents, forward className to mobile bar ([#305](https://github.com/fahadahmed/fhdamd-org/issues/305)) ([#327](https://github.com/fahadahmed/fhdamd-org/issues/327)) ([f2b230a](https://github.com/fahadahmed/fhdamd-org/commit/f2b230a09f7c1a5a539ca48769dc7e2eef022deb))
* **threads:** document Card's gap-vs-margin conflict and its escape hatch ([#291](https://github.com/fahadahmed/fhdamd-org/issues/291)) ([#323](https://github.com/fahadahmed/fhdamd-org/issues/323)) ([85abeaf](https://github.com/fahadahmed/fhdamd-org/commit/85abeaf543a72b58e5da22d36c3b5519119af396))
* **threads:** give LogoItem's mark a fixed bounding box ([#292](https://github.com/fahadahmed/fhdamd-org/issues/292)) ([#324](https://github.com/fahadahmed/fhdamd-org/issues/324)) ([9c72d51](https://github.com/fahadahmed/fhdamd-org/commit/9c72d518f7bb45fe3067f530805df149c72c4650))

## [0.5.1](https://github.com/fahadahmed/fhdamd-org/compare/threads-v0.5.0...threads-v0.5.1) (2026-07-22)


### Bug Fixes

* **threads:** move react/react-dom to peerDependencies ([#287](https://github.com/fahadahmed/fhdamd-org/issues/287)) ([58ba3ba](https://github.com/fahadahmed/fhdamd-org/commit/58ba3ba5c837ba20d2cf6523c1dff7b3d59867e0))

## [0.5.0](https://github.com/fahadahmed/fhdamd-org/compare/threads-v0.4.0...threads-v0.5.0) (2026-07-22)


### Features

* **threads:** batch 1 components for fhdamd-web — About, Contact, Homepage ([#277](https://github.com/fahadahmed/fhdamd-org/issues/277)) ([d3ca0b9](https://github.com/fahadahmed/fhdamd-org/commit/d3ca0b95b103e776f28ae54e892fd81d874803d8))
* **threads:** batch 2 components for fhdamd-web — Blog, Case Studies, Lab listing pages ([#282](https://github.com/fahadahmed/fhdamd-org/issues/282)) ([fd1923b](https://github.com/fahadahmed/fhdamd-org/commit/fd1923b6ee4ebbdefbdd67786f54748499c090ad))
* **threads:** batch 3 components for fhdamd-web — long-form article template + case-study pieces ([#284](https://github.com/fahadahmed/fhdamd-org/issues/284)) ([a8d174b](https://github.com/fahadahmed/fhdamd-org/commit/a8d174b312127dfa9b6942469cbca7bbb83a97e7))

## [0.4.0](https://github.com/fahadahmed/fhdamd-org/compare/threads-v0.3.1...threads-v0.4.0) (2026-06-29)


### ⚠ BREAKING CHANGES

* **threads:** removes the `site`/`SiteVariant` prop from both components. Replaced with a generic `brand?: ReactNode` slot (and `brandLabel?: string` on SiteNav for the home link's aria-label). Consumers now author their own wordmark markup instead of selecting from a hardcoded set baked into the library. Removed the now-unused internal wordmark/logo components and their CSS.

### Features

* **threads:** decouple SiteNav/SiteFooter from app-specific branding ([#231](https://github.com/fahadahmed/fhdamd-org/issues/231)) ([bd3b020](https://github.com/fahadahmed/fhdamd-org/commit/bd3b02055b650ff4a5a4158923332f18c2265e65))

## [0.3.1](https://github.com/fahadahmed/fhdamd-org/compare/threads-v0.3.0...threads-v0.3.1) (2026-06-05)


### Bug Fixes

* **threads:** switch to Vite lib build for correct CSS Modules support ([47b8004](https://github.com/fahadahmed/fhdamd-org/commit/47b800486dc54bda60c69fd3f235ae39b7a127db))

## [0.3.0](https://github.com/fahadahmed/fhdamd-org/compare/threads-v0.2.0...threads-v0.3.0) (2026-06-05)


### Features

* **pdf-craft:** implementing @fhdamd/threads npm package ([3c42df2](https://github.com/fahadahmed/fhdamd-org/commit/3c42df26288b961b228a483dd0f7bf63d70072ba))
* **threads:** add ./styles export for component CSS ([ac78087](https://github.com/fahadahmed/fhdamd-org/commit/ac780879f7e1c1279d60b85e95faca4b950dd9c7))

## [0.2.0](https://github.com/fahadahmed/fhdamd-org/compare/threads-v0.1.0...threads-v0.2.0) (2026-06-05)


### Features

* **threads:** added feedback ui components ([d474633](https://github.com/fahadahmed/fhdamd-org/commit/d474633dd209233dfbef7973c9bf80380a8789a0))
* **threads:** added form ui components ([4197e38](https://github.com/fahadahmed/fhdamd-org/commit/4197e3833fbf74df8ef0500615f2d5a4aca456c6))
* **threads:** added layout components ([a347973](https://github.com/fahadahmed/fhdamd-org/commit/a3479736a1afe34ba92f357cfdbb1c5968bfca42))
* **threads:** added more ui components ([8d31df6](https://github.com/fahadahmed/fhdamd-org/commit/8d31df671f917e4982bf94a75c2e5bc2c4d394d4))
* **threads:** adding new ui components ([9c1fa08](https://github.com/fahadahmed/fhdamd-org/commit/9c1fa08e778c335faa40c724542f1271aedadde5))
* **threads:** created more ui components ([1818044](https://github.com/fahadahmed/fhdamd-org/commit/1818044809456349aa41e34712de3920ae50650c))
* **threads:** implementing npm registry deployment ([8bf31d6](https://github.com/fahadahmed/fhdamd-org/commit/8bf31d6fa61916f91984a91e73bd6603ce7240e4))
* **threads:** implementing npm registry deployment ([d3d8f95](https://github.com/fahadahmed/fhdamd-org/commit/d3d8f95431ba62ef889a3f501a4ff5b69b90392e))
* **threads:** initial storybook implementation ([51942b1](https://github.com/fahadahmed/fhdamd-org/commit/51942b1e1aeef95d5d1a1716714276f0b34995c2))


### Bug Fixes

* **pdf-craft:** migrated the homepage to threads design system ([5ffa17d](https://github.com/fahadahmed/fhdamd-org/commit/5ffa17df5173f6af12d86a6c6a3ca726ba023227))
* **threads:** manual increment of version ([2d437c7](https://github.com/fahadahmed/fhdamd-org/commit/2d437c7cd5cf34b42db8e090b63485b8baf4a865))
