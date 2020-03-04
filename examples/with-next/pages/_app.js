import universalLanguageDetect from '@unly/universal-language-detector';
import get from 'lodash.get';
import NextCookies from 'next-cookies';
import NextApp from 'next/app';
import React from 'react';

import { FALLBACK_LANG, SUPPORTED_LANGUAGES } from '../utils/i18n';

class App extends NextApp {
  static async getInitialProps(props) {
    const { ctx } = props;
    const { req } = ctx;
    const cookies = NextCookies(ctx); // Parses Next.js cookies in a universal way (server + client) - It's an object

    // Universally detects the user's language
    const lang = universalLanguageDetect({
      supportedLanguages: SUPPORTED_LANGUAGES, // Whitelist of supported languages, will be used to filter out languages that aren't supported
      fallbackLanguage: FALLBACK_LANG, // Fallback language in case the user's language cannot be resolved
      acceptLanguageHeader: get(req, 'headers.accept-language'), // Optional - Accept-language header will be used when resolving the language on the server side
      serverCookies: cookies, // Optional - Cookie "i18next" takes precedence over navigator configuration (ex: "i18next: fr"), will only be used on the server side
      errorHandler: (error, level, origin, context) => { // Optional - Use you own logger here, Sentry, etc.
        console.log('Custom error handler:');
        console.error(error);

        // Example if using Sentry in your app:
        // Sentry.withScope((scope): void => {
        //   scope.setExtra('level', level);
        //   scope.setExtra('origin', origin);
        //   scope.setContext('context', context);
        //   Sentry.captureException(error);
        // });
      },
    });
    console.log('lang', lang)

    // Calls page's `getInitialProps` and fills `appProps.pageProps` - XXX See https://nextjs.org/docs#custom-app
    const appProps = await NextApp.getInitialProps(props);

    appProps.pageProps = {
      ...appProps.pageProps,
      cookies, // Object containing all cookies
      lang, // i.e: 'en'
      isSSR: !!req,
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
