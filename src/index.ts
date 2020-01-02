import { isBrowser } from '@unly/utils';
import acceptLanguageParser from 'accept-language-parser';
import { IncomingMessage } from 'http';
import I18next from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import iso3166 from 'iso3166-1';
import get from 'lodash.get';
import includes from 'lodash.includes';

import AcceptLanguageDetector from './serverDetectors/acceptLanguage';
import FallbackDetector from './universalDetectors/fallback';
import ServerCookieDetector from './serverDetectors/serverCookie';

export const LANG_EN = 'en';
export const LANG_FR = 'fr';
export const DEFAULT_ACCEPTED_LANGUAGES = [
  LANG_EN,
  LANG_FR,
];

/**
 * Language used by default if no user language can be resolved
 * We use English because it's the most used languages among those supported
 *
 * @type {string}
 */
export const DEFAULT_LANG: string = LANG_EN;

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
 * Default error handler
 * Doesn't do anything but log the error to the console
 *
 * @param error
 * @private
 */
const _defaultErrorHandler = (error: Error): void => {
  // eslint-disable-next-line no-console
  console.error(error);
};

/**
 * Resolves a secondary locale based on a given primary locale
 * The alternative locale won't be the same as the primary locale
 *
 * XXX This implementation assumes the app uses only FR/EN locales,
 *  if other locales are added then the implementation should be changed
 *
 * Because the implementation of such a function could be business-related, we decided to provide a very simple way of handling it,
 * while allowing to use a custom function to resolve it
 *
 * @param {string} primaryLocale
 * @param {string} fallbackSecondaryLanguage
 * @param {string[]} acceptedLanguages
 * @param {Function} errorHandler
 * @return {string}
 * @private
 */
export const _defaultResolveSecondaryLanguage = (primaryLocale: string, fallbackSecondaryLanguage: string = DEFAULT_LANG, acceptedLanguages: string[] = DEFAULT_ACCEPTED_LANGUAGES, errorHandler: Function = _defaultErrorHandler): string => {
  if (acceptedLanguages.length > 2) {
    errorHandler(new Error(`[NOT IMPLEMENTED] - resolveSecondaryLanguage was called with ${acceptedLanguages.length} accepted languages, but the current implementation was not made to support more than 2. Please implement.`));
    return fallbackSecondaryLanguage.toLowerCase();
  } else {
    if (primaryLocale.toLowerCase() === LANG_FR.toLowerCase()) {
      return LANG_EN.toLowerCase();
    } else if (primaryLocale === LANG_EN.toLowerCase()) {
      return LANG_FR.toLowerCase();
    } else {
      return fallbackSecondaryLanguage.toLowerCase();
    }
  }
};

/**
 * Resolve the user's primary language (on the server side)
 *
 * Relies on the "accept-language" header
 *
 * @param {string} acceptLanguage
 * @param {string} fallbackLanguage
 * @param {Function} errorHandler
 * @return {string}
 * @private
 */
export const _resolvePrimaryLanguageFromServer = (acceptLanguage: string | undefined, fallbackLanguage: string = DEFAULT_LANG, errorHandler: Function = _defaultErrorHandler): string => {
  let bestCountryCode: string = fallbackLanguage;

  try {
    const locales: string[] = acceptLanguageParser.parse(acceptLanguage);
    const bestCode: string = get(locales, '[0].code');
    bestCountryCode = iso3166.to2(iso3166.fromLocale(bestCode));

    if (!bestCountryCode) {
      const errorMessage = `Couldn't resolve a proper country code: "${bestCountryCode}" from detected server "accept-language" header "${acceptLanguage}", which yield "${bestCode}" as best locale code - Applying fallback locale "${fallbackLanguage}"`;
      errorHandler(new Error(errorMessage));
      bestCountryCode = fallbackLanguage;
    }
  } catch (e) {
    errorHandler(e);
  }

  return bestCountryCode.toLowerCase();
};

/**
 * Replaces a given language by another one if it's not an allowed language
 *
 * @param {string} language
 * @param {string} fallbackLanguage
 * @param {string[]} acceptedLanguages
 * @return {string}
 * @private
 */
export const _cleanupDisallowedLanguages = (language: string, fallbackLanguage: string = DEFAULT_LANG, acceptedLanguages: string[] = DEFAULT_ACCEPTED_LANGUAGES): string => {
  if (!includes(acceptedLanguages, language)) {
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
  fallbackLanguage?: string | undefined;
  acceptLanguage?: string | undefined;
  serverCookies?: object | undefined;
  acceptedLanguages?: string[] | undefined;
  errorHandler?: Function | undefined;
} = {}): string => {
  const {
    fallbackLanguage = DEFAULT_LANG,
    acceptLanguage = undefined,
    serverCookies = undefined,
    acceptedLanguages = DEFAULT_ACCEPTED_LANGUAGES,
    errorHandler = undefined,
  } = props;

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
    const acceptLanguageDetector = AcceptLanguageDetector(acceptLanguage, fallbackLanguage, errorHandler);

    i18nextUniversalLanguageDetector.addDetector(serverCookieDetector);
    i18nextUniversalLanguageDetector.addDetector(acceptLanguageDetector);

    i18nextUniversalLanguageDetector.init(i18nextServices, {
      order: [serverCookieDetector.name, acceptLanguageDetector.name, fallbackDetector.name],
    });
  }

  return _cleanupDisallowedLanguages(i18nextUniversalLanguageDetector.detect() as string, fallbackLanguage, acceptedLanguages);
};

/**
 * Detect the 2 most preferred user's languages, universally (browser + server)
 *
 * @param props
 */
export const universalLanguagesDetect = (props: {
  req?: IncomingMessage;
  serverCookies?: object;
  fallbackLanguage?: string;
  acceptedLanguages?: string[];
  errorHandler?: Function | undefined;
  resolveSecondaryLanguage?: Function | undefined;
} = {}): string[] => {
  const {
    req = undefined,
    serverCookies = undefined,
    fallbackLanguage = DEFAULT_LANG,
    acceptedLanguages = DEFAULT_ACCEPTED_LANGUAGES,
    errorHandler = undefined,
    resolveSecondaryLanguage = _defaultResolveSecondaryLanguage,
  } = props;
  const primaryLanguage = universalLanguageDetect({
    fallbackLanguage,
    acceptLanguage: get(req, 'headers.accept-language', undefined),
    serverCookies,
    acceptedLanguages,
    errorHandler,
  });

  return [primaryLanguage, resolveSecondaryLanguage(primaryLanguage, fallbackLanguage, acceptedLanguages, errorHandler)];
};
