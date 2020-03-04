import { COOKIE_LOOKUP_KEY_LANG, universalLanguageDetect } from './index';

const LANG_EN = 'en';
const LANG_FR = 'fr';
const LANG_ES = 'es';
const LANG_DE = 'de';

describe(`index.ts`, () => {
  describe(`universalLanguageDetect`, () => {
    describe(`should resolve the proper locale on the server`, () => {
      beforeEach(() => {
        // @ts-ignore
        global[`window`] = undefined; // Reset to avoid tests affecting other tests
        // @ts-ignore
        global[`document`] = undefined; // Reset to avoid tests affecting other tests
      });

      test(`when using "acceptLanguageHeader"`, async () => {
        expect(universalLanguageDetect({
            fallbackLanguage: LANG_EN,
            acceptLanguageHeader: `fr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
            supportedLanguages: [LANG_EN, LANG_FR],
          }),
        ).toEqual(LANG_FR);

        expect(universalLanguageDetect({
            fallbackLanguage: LANG_EN,
            acceptLanguageHeader: `fr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
            supportedLanguages: [LANG_EN],
          }),
        ).toEqual(LANG_EN);

        expect(universalLanguageDetect({
            fallbackLanguage: LANG_ES,
            acceptLanguageHeader: `fr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
            supportedLanguages: [LANG_DE, LANG_ES],
          }),
        ).toEqual(LANG_DE);
      });

      test(`when the language is stored in a cookie, it should use the cookie's value`, async () => {
        const cookieLanguage = LANG_FR;

        expect(universalLanguageDetect({
          fallbackLanguage: LANG_EN,
          serverCookies: {
            [COOKIE_LOOKUP_KEY_LANG]: cookieLanguage,
          },
          supportedLanguages: [LANG_EN, LANG_FR],
        })).toEqual(cookieLanguage);
      });

      test(`when using both cookies and acceptLanguageHeader, it should use cookies in priority`, async () => {
        const cookieLanguage = LANG_ES;

        expect(universalLanguageDetect({
          fallbackLanguage: LANG_DE,
          serverCookies: {
            [COOKIE_LOOKUP_KEY_LANG]: cookieLanguage,
          },
          acceptLanguageHeader: `fr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
          supportedLanguages: [LANG_EN, LANG_FR, LANG_DE, LANG_ES],
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

      test(`when using a fallback value, it should fallback to the provided fallback value`, async () => {
        expect(universalLanguageDetect({
          fallbackLanguage: LANG_EN,
          supportedLanguages: [LANG_EN, LANG_FR],
        })).toEqual(LANG_EN);
      });

      test(`when relying on "navigator" resolver`, async () => {
        // @ts-ignore
        global[`navigator`] = {
          languages: [LANG_EN, LANG_FR],
        };

        expect(universalLanguageDetect({
          fallbackLanguage: LANG_FR,
          supportedLanguages: [LANG_EN, LANG_FR],
        })).toEqual(LANG_EN);
      });

      test(`when relying on "navigator" resolver and the device uses localised languages (eg: "en-US")`, async () => {
        // @ts-ignore
        global[`navigator`] = {
          languages: ["en-US", "fr-FR", "fr", "en"],
        };

        expect(universalLanguageDetect({
          fallbackLanguage: LANG_FR,
          supportedLanguages: [LANG_EN, LANG_FR],
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
          supportedLanguages: [LANG_EN, LANG_FR],
        })).toEqual(cookieLanguage);
      });
    });

    describe(`should throw an error when misconfigured`, () => {
      test(`when the supported languages isn't properly defined`, async () => {
        expect(() => {
          universalLanguageDetect({
            fallbackLanguage: LANG_EN,
            supportedLanguages: [],
          });
        }).toThrowError();

        expect(() => {
          universalLanguageDetect({
            fallbackLanguage: LANG_EN,
            // @ts-ignore
            supportedLanguages: undefined,
          });
        }).toThrowError();

        expect(() => {
          universalLanguageDetect({
            fallbackLanguage: LANG_EN,
            // @ts-ignore
            supportedLanguages: null,
          });
        }).toThrowError();
      });

      test(`when the fallback language isn't present in the supported languages`, async () => {
        expect(() => {
          universalLanguageDetect({
            fallbackLanguage: LANG_EN,
            supportedLanguages: [LANG_FR],
          });
        }).toThrowError();
      });
    });
  });
});
