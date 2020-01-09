import { COOKIE_LOOKUP_KEY_LANG } from '../index';
import { _resolveServerCookie } from './serverCookie';

const LANG_FR = 'fr';
const LANG_DE = 'de';

describe(`serverDetectors/serverCookie.ts`, () => {
  describe(`_resolveServerCookie`, () => {
    test(`should resolve the cookie's value when the cookie is defined`, async () => {
      expect(_resolveServerCookie({
        [COOKIE_LOOKUP_KEY_LANG]: LANG_DE,
      })).toEqual(LANG_DE);

      expect(_resolveServerCookie({
        [COOKIE_LOOKUP_KEY_LANG]: LANG_FR,
      })).toEqual(LANG_FR);
    });

    test(`should return undefined when the cookie is not defined`, async () => {
      expect(_resolveServerCookie({})).toEqual(undefined);
    });
  });
});
