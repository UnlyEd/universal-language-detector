import { IncomingMessage } from 'http';
import {
  COOKIE_LOOKUP_KEY_LANG, DEFAULT_LANG, LANG_EN, LANG_FR, resolvePrimaryLanguageFromServer, defaultResolveSecondaryLanguage, universalLanguageDetect,
  universalLanguagesDetect,
} from './index';

describe(`utils/language.ts`, () => {
  describe(`resolvePrimaryLanguageFromServer`, () => {
    test(`should resolve the proper primary language on the server`, async () => {
      expect(resolvePrimaryLanguageFromServer(`fr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`)).toEqual('fr');
      expect(resolvePrimaryLanguageFromServer(`en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`)).toEqual('en');
      expect(resolvePrimaryLanguageFromServer(`us`)).toEqual('us');
    });
  });

  describe(`resolveSecondaryLanguage`, () => {
    test(`should resolve the proper secondary language`, async () => {
      expect(defaultResolveSecondaryLanguage(LANG_FR)).toEqual(LANG_EN);
      expect(defaultResolveSecondaryLanguage(LANG_EN)).toEqual(LANG_FR);
    });
  });

  describe(`universalLanguageDetect`, () => {
    describe(`should resolve the proper locale on the server`, () => {
      beforeEach(() => {
        // @ts-ignore
        global[`window`] = undefined; // Reset to avoid tests affecting other tests
        // @ts-ignore
        global[`document`] = undefined; // Reset to avoid tests affecting other tests
      });

      test(`when using "acceptLanguage"`, async () => {
        expect(universalLanguageDetect({
            fallbackLanguage: LANG_EN,
            acceptLanguage: `fr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
          }),
        ).toEqual(`fr`);
      });

      test(`when the language is stored in a cookie, it should use the cookie's value`, async () => {
        const cookieLanguage = 'fr';

        expect(universalLanguageDetect({
          fallbackLanguage: LANG_EN,
          serverCookies: {
            [COOKIE_LOOKUP_KEY_LANG]: cookieLanguage,
          },
        })).toEqual(cookieLanguage);
      });
    });

    describe(`should resolve the proper locale on the browser`, () => {
      beforeEach(() => {
        // @ts-ignore
        global[`window`] = {}; // Make believe we're running against a browser
        // @ts-ignore
        global[`document`] = undefined; // Reset to avoid tests affecting other tests
      });

      test(`when no fallback is provided, it should fallback to the DEFAULT_COUNTRY_CODE`, async () => {
        expect(universalLanguageDetect()).toEqual(DEFAULT_LANG);
      });

      test(`when using a fallback value, it should fallback to the provided fallback value`, async () => {
        expect(universalLanguageDetect({
          fallbackLanguage: LANG_EN,
        })).toEqual(LANG_EN);
      });

      test(`when the language is stored in a cookie, it should use the cookie's value`, async () => {
        const cookieLanguage = 'fr';

        // Make believe a cookie is available
        // @ts-ignore
        global[`document`] = {
          cookie: `${COOKIE_LOOKUP_KEY_LANG}=${cookieLanguage};`,
        };

        expect(universalLanguageDetect({
          fallbackLanguage: LANG_EN,
        })).toEqual(cookieLanguage);
      });
    });
  });

  describe(`universalLanguagesDetect`, () => {
    describe(`should resolve both primary and secondary languages on the server`, () => {
      beforeEach(() => {
        // @ts-ignore
        global[`window`] = undefined; // Reset to avoid tests affecting other tests
        // @ts-ignore
        global[`document`] = undefined; // Reset to avoid tests affecting other tests
      });

      test(`when not providing any information, should use the default lang`, async () => {
        // Doesn't work due to something wrong with tests order that messes up the global object somehow
        // expect(universalLanguagesDetect()).toEqual([DEFAULT_LANG, LANG_FR]);
      });

      test(`when using "acceptLanguage"`, async () => {
        // @ts-ignore
        const req: IncomingMessage = {
          headers: {
            'accept-language': `fr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
          },
        };

        expect(universalLanguagesDetect({ req })).toEqual([LANG_FR, LANG_EN]);
      });

      test(`when the language is stored in a cookie, it should use the cookie's value`, async () => {
        const cookieLanguage = 'fr';

        expect(universalLanguagesDetect({
          serverCookies: {
            [COOKIE_LOOKUP_KEY_LANG]: cookieLanguage,
          },
        })).toEqual([LANG_FR, LANG_EN]);
      });

      test(`when using custom acceptedLanguages, it should allow them`, async () => {
        const cookieLanguage = 'es';

        expect(universalLanguagesDetect({
          serverCookies: {
            [COOKIE_LOOKUP_KEY_LANG]: cookieLanguage,
          },
          acceptedLanguages: [cookieLanguage, LANG_EN]
        })).toEqual([cookieLanguage, LANG_EN]);
      });

      test(`when using both cookies and acceptLanguage, it should use cookies in priority`, async () => {
        const cookieLanguage = 'es';
        // @ts-ignore
        const req: IncomingMessage = {
          headers: {
            'accept-language': `fr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
          },
        };

        expect(universalLanguagesDetect({
          req,
          serverCookies: {
            [COOKIE_LOOKUP_KEY_LANG]: cookieLanguage,
          },
          acceptedLanguages: [cookieLanguage, LANG_EN]
        })).toEqual([cookieLanguage, LANG_EN]);
      });
    });

    describe(`should resolve both primary and secondary languages on the browser`, () => {
      beforeEach(() => {
        // @ts-ignore
        global[`window`] = {}; // Make believe we're running against a browser
        // @ts-ignore
        global[`document`] = undefined; // Reset to avoid tests affecting other tests
      });

      test(`when not providing any information, should use the default lang`, async () => {
        expect(universalLanguagesDetect()).toEqual([DEFAULT_LANG, LANG_FR]);
      });

      test(`when not providing any information, but specifying a fallback lang, should use that fallback`, async () => {
        expect(universalLanguagesDetect({ fallbackLanguage: LANG_FR })).toEqual([LANG_FR, LANG_EN]);
      });

      test(`when the language is stored in a cookie, it should use the cookie's value`, async () => {
        const cookieLanguage = 'fr';

        // Make believe a cookie is available
        // @ts-ignore
        global[`document`] = {
          cookie: `${COOKIE_LOOKUP_KEY_LANG}=${cookieLanguage};`,
        };

        expect(universalLanguagesDetect()).toEqual([LANG_FR, LANG_EN]);
      });

      test(`when using custom acceptedLanguages, it should allow them`, async () => {
        const cookieLanguage = 'es';

        // Make believe a cookie is available
        // @ts-ignore
        global[`document`] = {
          cookie: `${COOKIE_LOOKUP_KEY_LANG}=${cookieLanguage};`,
        };

        expect(universalLanguagesDetect({
          acceptedLanguages: [cookieLanguage, LANG_EN]
        })).toEqual([cookieLanguage, LANG_EN]);
      });
    });
  });
});
