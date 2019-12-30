# Universal Language Detector

> Language detector that works universally (browser + server)
>
> On the server, will rely on "cookies > accept-language header"
>
> On the browser, will rely on "cookies > navigator settings"
>
> Relies on [i18next](https://github.com/i18next/i18next) behind the wheel
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
  * [`universalLanguagesDetect` (plural)](#universallanguagesdetect-plural)
- [Contributing](#contributing)
  * [Working locally](#working-locally)
  * [Test](#test)
  * [Releasing and publishing](#releasing-and-publishing)
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
import { universalLanguagesDetect, universalLanguageDetect } from '@unly/universal-language-detector';
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

**Parameters:** _(All parameters are optional)_
- `fallbackLanguage?`: string | undefined;
- `acceptLanguage?`: string | undefined;
- `serverCookies?`: object | undefined;
- `acceptedLanguages?`: string[] | undefined;
- `errorHandler?`: Function | undefined;

**Example:**
```js
const lang = universalLanguageDetect({
  fallbackLanguage: FALLBACK_LANG, // Fallback language in case the user's language cannot be resolved
  acceptLanguage: get(req, 'headers.accept-language', undefined), // The accept-language header, only used on the server side
  serverCookies: cookies, // Cookie "i18next" takes precedence over navigator configuration (ex: "i18next: fr"), only used on the server side
  acceptedLanguages: ACCEPTED_LANGUAGES, // If the detected main language isn't allowed, then the fallback will be used
  errorHandler: (error) => { // Use you own logger here, Sentry, etc.
    console.log('Custom error handler:');
    console.error(error);
  }
});
```

### `universalLanguagesDetect` (plural)

> Detect the 2 most preferred user's languages.
>
> Most useful if you have some kind of fallback strategy when the content isn't available in the main language
>
> _For instance, it's very useful with GraphCMS and their GraphQL [i18n header implementation](https://graphcms.com/docs/api/content-api/#passing-a-header-flag), which has such built-in fallback_

**Parameters:** _(All parameters are optional)_
- `req`?: IncomingMessage;
- `serverCookies`?: object;
- `fallbackLanguage`?: string;
- `acceptedLanguages`?: string[];
- `errorHandler`?: Function | undefined;
- `resolveSecondaryLanguage`?: Function | undefined;

**Example:**
```js
const bestCountryCodes = universalLanguagesDetect({
  req,
  serverCookies: cookies, // Cookie "i18next" takes precedence over navigator configuration (ex: "i18next: fr")
  fallbackLanguage: FALLBACK_LANG, // Fallback language in case the user's language cannot be resolved
  acceptedLanguages: ACCEPTED_LANGUAGES, // If the detected main language isn't allowed, then the fallback will be used
  errorHandler: (error) => { // Use you own logger here, Sentry, etc.
    console.log('Custom error handler:');
    console.error(error);
  },
  resolveSecondaryLanguage: (primaryLanguage, fallbackLanguage, acceptedLanguages, errorHandler) => { // If not provided, a default implementation that only covers very simple use cases (2 languages) will be used
    switch (primaryLanguage) {
      case 'fr':
        return 'en';
      case 'en':
        return 'es';
      case 'es':
        return 'en';
      default:
        return 'en';
    }
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

### Releasing and publishing

```
yarn releaseAndPublish # Shortcut - Will prompt for bump version, commit, create git tag, push commit/tag and publish to NPM

yarn release # Will prompt for bump version, commit, create git tag, push commit/tag
npm publish # Will publish to NPM
```

## License

MIT

---

> This project was generated using https://github.com/UnlyEd/boilerplate-generator/tree/master/templates/typescript-OSS
