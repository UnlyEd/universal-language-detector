import { isBrowser } from '@unly/utils';
import I18next from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import includes from 'lodash.includes';
import get from 'lodash.get';

import AcceptLanguageDetector from './serverDetectors/acceptLanguage';
import ServerCookieDetector from './serverDetectors/serverCookie';
import FallbackDetector from './universalDetectors/fallback';
import { ErrorHandler } from './utils/error';

/**
 * Lookup key that contains the value of the user's selected language
 *
 * @see https://github.com/i18next/i18next-browser-languageDetector#detector-options
 *
 * @type {string}
 */
export const COOKIE_LOOKUP_KEY_LANG = 'i18next';

/**
 * Detects the user's language, universally (browser + server)
 * Internally relies on i18next to help resolve the language
 *
 * Language lookup:
 *  - On the server, relies on cookies (provided), then on the accept-language header
 *  - On the browser, relies on cookies (global), then navigator's language
 *
 * @param props
 * @return {string}
 */
export const universalLanguageDetect = (props: {
  supportedLanguages: string[];
  fallbackLanguage: string;
  acceptLanguageHeader?: string | undefined;
  serverCookies?: object | undefined;
  errorHandler?: ErrorHandler | undefined;
}): string => {
  const {
    supportedLanguages,
    fallbackLanguage,
    acceptLanguageHeader = undefined,
    serverCookies = undefined,
    errorHandler = undefined,
  } = props;

  if(!get(supportedLanguages, 'length')){
    throw new Error(`universal-language-detector is misconfigured. Your "supportedLanguages" should be an array containing at least one language (eg: ['en']).`);
  }

  if(!includes(supportedLanguages, fallbackLanguage)){
    throw new Error(`universal-language-detector is misconfigured. Your "fallbackLanguage" (value: "${fallbackLanguage}") should be within your "supportedLanguages" array.`);
  }

  // Init may be async, but it doesn't matter here, because we just want to init the services (which is sync) so that we may use them
  I18next.init({
    whitelist: supportedLanguages, // Filter out unsupported languages (i.e: when using "navigator" detector) - See https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    nonExplicitWhitelist: true, // We only provide "simple" supported languages ("en", "fr", etc.) - This option ensures en-US and alike are still matched and not ignored - See https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
  });

  const i18nextServices = I18next.services;
  const i18nextUniversalLanguageDetector = new I18nextBrowserLanguageDetector();

  // Add common detectors between the browser and the server
  const fallbackDetector = FallbackDetector(fallbackLanguage);
  i18nextUniversalLanguageDetector.addDetector(fallbackDetector);

  if (isBrowser()) {
    // Rely on native i18next detectors
    i18nextUniversalLanguageDetector.init(i18nextServices, {
      order: ['cookie', 'navigator', fallbackDetector.name],
      lookupCookie: COOKIE_LOOKUP_KEY_LANG,
    });

  } else {
    // Use our own detectors
    const serverCookieDetector = ServerCookieDetector(serverCookies);
    const acceptLanguageDetector = AcceptLanguageDetector(supportedLanguages, acceptLanguageHeader, errorHandler);

    i18nextUniversalLanguageDetector.addDetector(serverCookieDetector);
    i18nextUniversalLanguageDetector.addDetector(acceptLanguageDetector);

    i18nextUniversalLanguageDetector.init(i18nextServices, {
      order: [serverCookieDetector.name, acceptLanguageDetector.name, fallbackDetector.name],
      lookupCookie: COOKIE_LOOKUP_KEY_LANG,
    });
  }

  // Transform potential localised language into non-localised language:
  // "en-US" > "en"
  // "en" > "en"
  return (i18nextUniversalLanguageDetector.detect() as string).split('-')[0];
};

export default universalLanguageDetect;
