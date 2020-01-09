import acceptLanguageParser from 'accept-language-parser';
import { CustomDetector, DetectorOptions } from 'i18next-browser-languagedetector';
import iso3166 from 'iso3166-1';
import { _defaultErrorHandler, ERROR_LEVELS, ErrorHandler } from '../utils/error';

/**
 * Resolves the best supported language from a accept-language header
 * Returns "undefined" if fails to resolve
 *
 * @param supportedLanguages
 * @param acceptLanguageHeader
 * @param errorHandler
 * @private
 */
export const _resolveAcceptLanguage = (supportedLanguages: string[], acceptLanguageHeader: string | undefined, errorHandler: ErrorHandler = _defaultErrorHandler): string | undefined => {
  let bestSupportedLanguage: string | undefined;

  try {
    // Resolves the best language to used, based on an array of supportedLanguages (filters out disallowed languages)
    // acceptLanguageParser.pick returns either a language ('fr') or a locale ('fr-FR')
    bestSupportedLanguage = acceptLanguageParser.pick(supportedLanguages, acceptLanguageHeader, {
      loose: true, // See https://www.npmjs.com/package/accept-language-parser#parserpicksupportedlangugagesarray-acceptlanguageheader-options--
    });

  } catch (e) {
    errorHandler(e, ERROR_LEVELS.ERROR, '_resolveAcceptLanguage', {
      inputs: {
        supportedLanguages,
        acceptLanguageHeader,
      },
    });
  }

  if (bestSupportedLanguage) {
    try {
      // Attempts to convert the language/locale into an actual language (2 chars string)
      return iso3166.to2(iso3166.fromLocale(bestSupportedLanguage)).toLowerCase();
    } catch (e) {
      errorHandler(e, ERROR_LEVELS.ERROR, '_resolveAcceptLanguage', {
        inputs: {
          supportedLanguages,
          acceptLanguageHeader,
        },
        bestSupportedLanguage,
      });
    }
  }
};

export const acceptLanguage = (supportedLanguages: string[], acceptLanguageHeader: string | undefined, errorHandler?: ErrorHandler | undefined): CustomDetector => {
  return {
    name: 'acceptLanguage',
    lookup: (options: DetectorOptions): string | undefined => {
      return _resolveAcceptLanguage(supportedLanguages, acceptLanguageHeader, errorHandler);
    },
    cacheUserLanguage: (): void => {
      // Do nothing, can't cache the user language on the server
    },
  };
};

export default acceptLanguage;
