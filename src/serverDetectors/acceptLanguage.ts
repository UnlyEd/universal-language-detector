import acceptLanguageParser from 'accept-language-parser';
import { CustomDetector, DetectorOptions } from 'i18next-browser-languagedetector';
import iso3166 from 'iso3166-1';
import get from 'lodash.get';

import { DEFAULT_LANG } from '../index';
import { _defaultErrorHandler, ErrorHandler, LEVEL_ERROR, LEVEL_WARNING } from '../utils/error';

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
export const _resolvePrimaryLanguageFromServer = (acceptLanguage: string | undefined, fallbackLanguage: string = DEFAULT_LANG, errorHandler: ErrorHandler = _defaultErrorHandler): string => {
  let bestCountryCode: string = fallbackLanguage;

  try {
    const locales: string[] = acceptLanguageParser.parse(acceptLanguage);
    const bestCode: string = get(locales, '[0].code');
    bestCountryCode = iso3166.to2(iso3166.fromLocale(bestCode));

    if (!bestCountryCode) {
      const errorMessage = `Couldn't resolve a proper country code: "${bestCountryCode}" from detected server "accept-language" header "${acceptLanguage}", which yield "${bestCode}" as best locale code - Applying fallback locale "${fallbackLanguage}"`;
      errorHandler(new Error(errorMessage), LEVEL_WARNING);
      bestCountryCode = fallbackLanguage;
    }
  } catch (e) {
    errorHandler(e, LEVEL_ERROR);
  }

  return bestCountryCode.toLowerCase();
};

export const acceptLanguage = (acceptLanguage: string | undefined, fallbackLanguage?: string | undefined, errorHandler?: ErrorHandler | undefined): CustomDetector => {
  return {
    name: 'acceptLanguage',
    lookup: (options: DetectorOptions): string | undefined => {
      return _resolvePrimaryLanguageFromServer(acceptLanguage, fallbackLanguage, errorHandler);
    },
    cacheUserLanguage: (): void => {
      // Do nothing, can't cache the user language on the server
    },
  };
};

export default acceptLanguage;
