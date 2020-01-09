[![Maintainability](https://api.codeclimate.com/v1/badges/424ff73928475fd2331f/maintainability)](https://codeclimate.com/github/UnlyEd/universal-language-detector/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/424ff73928475fd2331f/test_coverage)](https://codeclimate.com/github/UnlyEd/universal-language-detector/test_coverage)

# Universal Language Detector

> Language detector that works universally (browser + server)
>
> - On the server, will rely on "cookies > accept-language header"
> - On the browser, will rely on "cookies > navigator settings"
>
> Meant to be used with a universal framework, such as Next.js


Note that this lib helps resolving the **`language`** (`fr`, `en`, `es`, etc.), **not the locale** (`fr-FR`, `en-US`, etc.)

_It is not out of scope though, PR are welcome to support universal locale detection._ 

---

<!-- toc -->

- [Demo](#demo)
- [Getting started](#getting-started)
- [Examples](#examples)
- [API](#api)
  * [`universalLanguageDetect`](#universallanguagedetect)
- [Contributing](#contributing)
  * [Working locally](#working-locally)
  * [Test](#test)
  * [Versions](#versions)
    + [SemVer](#semver)
  * [Releasing and publishing](#releasing-and-publishing)
- [Changelog](#changelog)
- [License](#license)

<!-- tocstop -->

---

## Demo

[Live demo with the Next.js example](https://universal-language-detector.now.sh/)

## Getting started

```
yarn install @unly/universal-language-detector
```

Use:

```
import universalLanguageDetect from '@unly/universal-language-detector';

OR

import { universalLanguageDetect } from '@unly/universal-language-detector';
```

## Examples

See [our example](./examples/with-next) featuring the Next.js framework

---

## API

> Extensive API documentation can be found in the [source code documentation](./src/index.ts)
>
> Only the most useful API methods are documented here, the other aren't meant to be used, even though they may be

### `universalLanguageDetect`

> Detects the language used, universally. 

**Parameters:**
- `supportedLanguages`: string[];
- `fallbackLanguage`: string;
- `acceptLanguageHeader?`: string | undefined;
- `serverCookies?`: object | undefined;
- `errorHandler?`: [ErrorHandler](./src/utils/error.ts) | undefined;

**Example:**
```js
const lang = universalLanguageDetect({
  supportedLanguages: SUPPORTED_LANGUAGES, // Whitelist of supported languages, will be used to filter out languages that aren't supported
  fallbackLanguage: FALLBACK_LANG, // Fallback language in case the user's language cannot be resolved
  acceptLanguageHeader: get(req, 'headers.accept-language'), // Optional - Accept-language header will be used when resolving the language on the server side
  serverCookies: cookies, // Optional - Cookie "i18next" takes precedence over navigator configuration (ex: "i18next: fr"), will only be used on the server side
  errorHandler: (error) => { // Optional - Use you own logger here, Sentry, etc.
    console.log('Custom error handler:');
    console.error(error);
  },
});
```

---

## Contributing

We gladly accept PRs, but please open an issue first so we can discuss it beforehand.

### Working locally

```
yarn start # Shortcut - Runs linter + build + tests in concurrent mode (watch mode)

OR run each process separately for finer control

yarn lint
yarn build
yarn test
```

### Test

```
yarn test # Run all tests, interactive and watch mode
yarn test:once
yarn test:coverage
```

### Versions

#### SemVer

We use Semantic Versioning for this project: https://semver.org/. (`vMAJOR.MINOR.PATCH`: `v1.0.1`)

- Major version: Must be changed when Breaking Changes are made (public API isn't backward compatible).
  - A function has been renamed/removed from the public API
  - Something has changed that will cause the app to behave differently with the same configuration
- Minor version: Must be changed when a new feature is added or updated (without breaking change nor behavioral change)
- Patch version: Must be changed when any change is made that isn't either Major nor Minor. (Misc, doc, etc.)

### Releasing and publishing

```
yarn releaseAndPublish # Shortcut - Will prompt for bump version, commit, create git tag, push commit/tag and publish to NPM

yarn release # Will prompt for bump version, commit, create git tag, push commit/tag
npm publish # Will publish to NPM
```

> Don't forget we are using SemVer, please follow our SemVer rules.

**Pro hint**: use `beta` tag if you're in a work-in-progress (or unsure) to avoid releasing WIP versions that looks legit

---

## Changelog

> Our API change (including breaking changes and "how to migrate") are documented in the Changelog.

See [changelog](./CHANGELOG.md)

---

## License

MIT

---

> This project was generated using https://github.com/UnlyEd/boilerplate-generator/tree/master/templates/typescript-OSS
