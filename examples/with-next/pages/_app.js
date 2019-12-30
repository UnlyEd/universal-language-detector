import { universalLanguagesDetect } from '@unly/universal-language-detector';
import get from 'lodash.get';
import NextCookies from 'next-cookies';
import NextApp from 'next/app';
import React from 'react';

import { ACCEPTED_LANGUAGES, FALLBACK_LANG } from '../utils/i18n';

class App extends NextApp {
  static async getInitialProps(props) {
    const { ctx } = props;
    const { req } = ctx;
    const cookies = NextCookies(ctx); // Parses Next.js cookies in a universal way (server + client) - It's an object

    // Detect the two best languages (main language and secondary language)
    // Alternatively, you can also use "universalLanguageDetect" instead if you only need to know the main language
    // "Secondary language" comes in handy when using some kind of fallback language that is used when the content isn't available in the main language, but that's an advanced use case that most people don't need
    const bestCountryCodes = universalLanguagesDetect({
      req,
      serverCookies: cookies, // Cookie "i18next" takes precedence over navigator configuration (ex: "i18next: fr")
      fallbackLanguage: FALLBACK_LANG, // Fallback language in case the user's language cannot be resolved
      acceptedLanguages: ACCEPTED_LANGUAGES, // If the detected main language isn't allowed, then the fallback will be used
      errorHandler: (error) => { // Use you own logger here, Sentry, etc.
        console.log('Custom error handler:');
        console.error(error);
      },
    });
    const lang = get(bestCountryCodes, '[0]', FALLBACK_LANG).toLowerCase();

    // Calls page's `getInitialProps` and fills `appProps.pageProps` - XXX See https://nextjs.org/docs#custom-app
    const appProps = await NextApp.getInitialProps(props);

    appProps.pageProps = {
      ...appProps.pageProps,
      cookies, // Object containing all cookies
      bestCountryCodes, // i.e: ['en', 'fr']
      lang, // i.e: 'en'
    };

    return { ...appProps };
  }

  render() {
    const { Component, pageProps, router, err } = this.props;
    const modifiedPageProps = {
      ...pageProps,
      err,
      router,
    };

    return (
      <Component {...modifiedPageProps} />
    );
  }
}

export default App;
