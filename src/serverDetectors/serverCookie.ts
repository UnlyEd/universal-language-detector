import { CustomDetector, DetectorOptions } from 'i18next-browser-languagedetector';
import get from 'lodash.get';

import { COOKIE_LOOKUP_KEY_LANG } from '../index';

/**
 * Resolves the language from a cookie object
 * Returns "undefined" if fails to resolve
 *
 * @param serverCookies
 * @private
 */
export const _resolveServerCookie = (serverCookies: object | undefined): string | undefined => {
  return get(serverCookies, COOKIE_LOOKUP_KEY_LANG, undefined);
};

export const serverCookie = (serverCookies: object | undefined): CustomDetector => {
  return {
    name: 'serverCookie',
    lookup: (options: DetectorOptions): string | undefined => {
      return _resolveServerCookie(serverCookies);
    },
    cacheUserLanguage: (): void => {
      // Do nothing, we could cache the value but it doesn't make sense to overwrite the cookie with the same value
    },
  };
};

export default serverCookie;
