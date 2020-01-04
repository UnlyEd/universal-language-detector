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
 * XXX Must use the same value as the value used by i18next-browser-languageDetector "lookupCookie"
 * @see https://github.com/i18next/i18next-browser-languageDetector#detector-options
 *
 * @type {string}
 */
export const COOKIE_LOOKUP_KEY_LANG = 'i18next';

/**
 * Replaces a given language by another one if it's not an allowed language
 *
 * @param {string} language
 * @param {string} fallbackLanguage
 * @param {string[]} supportedLanguages
 * @return {string}
 * @private
 */
export const _cleanupDisallowedLanguages = (language: string, fallbackLanguage: string, supportedLanguages: string[]): string => {
  if (!includes(supportedLanguages, language)) {
    return fallbackLanguage.toLowerCase();
  } else {
    return language.toLowerCase();
  }
};

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
  fallbackLanguage: string;
  acceptLanguageHeader?: string | undefined;
  serverCookies?: object | undefined;
  supportedLanguages: string[];
  errorHandler?: ErrorHandler | undefined;
}): string => {
  const {
    fallbackLanguage,
    acceptLanguageHeader = undefined,
    serverCookies = undefined,
    supportedLanguages,
    errorHandler = undefined,
  } = props;

  if(!get(supportedLanguages, 'length')){
    throw new Error(`universal-language-detector is misconfigured. Your "supportedLanguages" should be an array containing at least one language (eg: ['en']).`);
  }

  if(!includes(supportedLanguages, fallbackLanguage)){
    throw new Error(`universal-language-detector is misconfigured. Your "fallbackLanguage" (value: "${fallbackLanguage}") should be within your "supportedLanguages" array.`);
  }

  I18next.init(); // Init may be async, but it doesn't matter here, because we just want to init the services (which is sync) so that we may use them

  const i18nextServices = I18next.services;
  const i18nextUniversalLanguageDetector = new I18nextBrowserLanguageDetector();

  // Add common detectors between the browser and the server
  const fallbackDetector = FallbackDetector(fallbackLanguage);
  i18nextUniversalLanguageDetector.addDetector(fallbackDetector);

  if (isBrowser()) {
    // Rely on native i18next detectors
    i18nextUniversalLanguageDetector.init(i18nextServices, {
      order: ['cookie', 'navigator', fallbackDetector.name],
    });

  } else {
    // Use our own detectors
    const serverCookieDetector = ServerCookieDetector(serverCookies);
    const acceptLanguageDetector = AcceptLanguageDetector(supportedLanguages, acceptLanguageHeader, errorHandler);

    i18nextUniversalLanguageDetector.addDetector(serverCookieDetector);
    i18nextUniversalLanguageDetector.addDetector(acceptLanguageDetector);

    i18nextUniversalLanguageDetector.init(i18nextServices, {
      order: [serverCookieDetector.name, acceptLanguageDetector.name, fallbackDetector.name],
    });
  }

  return _cleanupDisallowedLanguages(i18nextUniversalLanguageDetector.detect() as string, fallbackLanguage, supportedLanguages);
};
