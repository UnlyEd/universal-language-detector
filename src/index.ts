import { isBrowser } from '@unly/utils';
import acceptLanguageParser from 'accept-language-parser';
import { IncomingMessage } from 'http';
import I18next from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import iso3166 from 'iso3166-1';
import get from 'lodash.get';
import includes from 'lodash.includes';

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
 * Resolve the user's primary language (on the server side)
 *
 * Relies on the "accept-language" header
 *
 * @param {string} acceptLanguage
 * @param {string} fallbackLanguage
 * @return {string}
 */
export const resolvePrimaryLanguageFromServer = (acceptLanguage: string | undefined, fallbackLanguage: string = DEFAULT_LANG): string => {
  let bestCountryCode: string = fallbackLanguage;

  try {
    const locales: string[] = acceptLanguageParser.parse(acceptLanguage);
    const bestCode: string = get(locales, '[0].code');
    bestCountryCode = iso3166.to2(iso3166.fromLocale(bestCode));

    if (!bestCountryCode) {
      const errorMessage = `Couldn't resolve a proper country code: "${bestCountryCode}" from detected server "accept-language" header "${acceptLanguage}", which yield "${bestCode}" as best locale code - Applying fallback locale "${fallbackLanguage}"`;
      // logger.error(errorMessage);
      // Sentry.captureException(new Error(errorMessage));
      bestCountryCode = fallbackLanguage;
    }
  } catch (e) {
    // logger.error(e);
    // Sentry.captureException(e);
  }

  return bestCountryCode.toLowerCase();
};

/**
 * Resolves a secondary locale based on a given primary locale
 * The alternative locale won't be the same as the primary locale
 *
 * XXX This implementation assumes the app uses only FR/EN locales,
 *  if other locales are added then the implementation should be changed
 *
 * @param primaryLocale
 * @param fallbackSecondaryLanguage
 * @return {string}
 */
export const resolveSecondaryLanguage = (primaryLocale: string, fallbackSecondaryLanguage: string = DEFAULT_LANG): string => {
  if (DEFAULT_ACCEPTED_LANGUAGES.length > 2) {
    // Sentry.captureMessage(`[NOT IMPLEMENTED] - resolveSecondaryLanguage was called with ${DEFAULT_ACCEPTED_LANGUAGES.length} accepted languages, but the current implementation was not made to support more than 2. Please implement.`);
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
 * Replaces a given language by another one if it's not an allowed language
 *
 * @param {string} language
 * @param {string} fallbackLanguage
 * @param {string[]} acceptedLanguages
 * @return {string}
 */
export const cleanupDisallowedLanguages = (language: string, fallbackLanguage: string = DEFAULT_LANG, acceptedLanguages: string[] = DEFAULT_ACCEPTED_LANGUAGES): string => {
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
 * @param {{fallbackLanguage: string; acceptLanguage?: string}} props
 * @return {string}
 */
export const universalLanguageDetect = (props: {
  fallbackLanguage: string | undefined;
  acceptLanguage?: string | undefined;
  serverCookies?: object | undefined;
  acceptedLanguages?: string[] | undefined;
} = {
  fallbackLanguage: DEFAULT_LANG,
  acceptLanguage: undefined,
  serverCookies: undefined,
  acceptedLanguages: DEFAULT_ACCEPTED_LANGUAGES,
}): string => {
  const { acceptLanguage, fallbackLanguage, serverCookies, acceptedLanguages } = props;

  I18next.init(); // Init may be async, but it doesn't matter here, because we just want to init the services (which is sync) so that we may use them

  const i18nextServices = I18next.services;
  const i18nextUniversalLanguageDetector = new I18nextBrowserLanguageDetector();
  const fallbackDetectorName = 'fallback';
  const fallbackDetector = {
    name: fallbackDetectorName,
    lookup: (): string | undefined => {
      return fallbackLanguage;
    },
    cacheUserLanguage: (): void => {
      // Do nothing, can't cache the user language on the server
    },
  };
  i18nextUniversalLanguageDetector.addDetector(fallbackDetector);

  if (isBrowser()) {
    i18nextUniversalLanguageDetector.init(i18nextServices, {
      order: ['cookie', 'navigator', fallbackDetectorName],
    });

  } else {
    const serverCookieDetectorName = 'serverCookie';
    const serverCookieDetector = {
      name: serverCookieDetectorName,
      lookup: (): string => {
        return get(serverCookies, COOKIE_LOOKUP_KEY_LANG, undefined);
      },
      cacheUserLanguage: (): void => {
        // Do nothing, we could cache the value but it doesn't make sense to overwrite the cookie with the same value
      },
    };
    const acceptLanguageDetectorName = 'acceptLanguage';
    const acceptLanguageDetector = {
      name: acceptLanguageDetectorName,
      lookup: (): string | undefined => {
        return resolvePrimaryLanguageFromServer(acceptLanguage);
      },
      cacheUserLanguage: (): void => {
        // Do nothing, can't cache the user language on the server
      },
    };

    i18nextUniversalLanguageDetector.addDetector(serverCookieDetector);
    i18nextUniversalLanguageDetector.addDetector(acceptLanguageDetector);
    i18nextUniversalLanguageDetector.init(i18nextServices, {
      order: [serverCookieDetectorName, acceptLanguageDetectorName, fallbackDetectorName],
    });
  }

  return cleanupDisallowedLanguages(i18nextUniversalLanguageDetector.detect() as string, fallbackLanguage, acceptedLanguages);
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
} = {
  req: undefined,
  serverCookies: undefined,
  fallbackLanguage: DEFAULT_LANG,
  acceptedLanguages: DEFAULT_ACCEPTED_LANGUAGES,
}): string[] => {
  const { req, serverCookies, fallbackLanguage, acceptedLanguages } = props;
  const primaryLanguage = universalLanguageDetect({
    fallbackLanguage,
    acceptLanguage: get(req, 'headers.accept-language', undefined),
    serverCookies,
    acceptedLanguages,
  });

  return [primaryLanguage, resolveSecondaryLanguage(primaryLanguage)];
};
