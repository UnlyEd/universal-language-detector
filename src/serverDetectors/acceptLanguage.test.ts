import { _resolveAcceptLanguage } from './acceptLanguage';

const LANG_EN = 'en';
const LANG_FR = 'fr';
const LANG_ES = 'es';
const LANG_DE = 'de';

describe(`serverDetectors/acceptLanguage.ts`, () => {
  describe(`_resolveAcceptLanguage`, () => {
    describe(`when using languages ('fr', 'en', etc.) as acceptLanguageHeader`, () => {
      test(`should resolve the main language, when the main language is supported`, async () => {
        expect(_resolveAcceptLanguage(
          [LANG_EN, LANG_FR],
          `fr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
        )).toEqual(LANG_FR);
      });

      test(`should resolve the fallback language, when the main language is not supported`, async () => {
        expect(_resolveAcceptLanguage(
          [LANG_EN],
          `fr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
        )).toEqual(LANG_EN);
      });

      test(`should resolve the best supported language, when the main language is not supported but there is another supported language available`, async () => {
        expect(_resolveAcceptLanguage(
          [LANG_EN, LANG_ES],
          `fr,es,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
        )).toEqual(LANG_ES);

        expect(_resolveAcceptLanguage(
          [LANG_EN, LANG_ES],
          `fr,es;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
        )).toEqual(LANG_ES);

        expect(_resolveAcceptLanguage(
          [LANG_DE],
          `fr,es;q=0.9,en-GB;q=0.8,en-US;q=0.7,de;q=0.6`,
        )).toEqual(LANG_DE);
      });
    });

    describe(`when using localized languages ('en-GB', 'en-US', etc.) as acceptLanguageHeader`, () => {
      test(`should resolve the main language, when the main language is supported`, async () => {
        expect(_resolveAcceptLanguage(
          [LANG_EN, LANG_FR],
          'en-GB,en-US;q=0.9,fr-CA;q=0.7,en;q=0.8',
        )).toEqual(LANG_EN);
      });

      test(`should resolve the fallback language, when the main language is not supported`, async () => {
        expect(_resolveAcceptLanguage(
          [LANG_EN],
          'en-GB,en-US;q=0.9,fr-CA;q=0.7,en;q=0.8',
        )).toEqual(LANG_EN);
      });
    });

    describe(`when using invalid acceptLanguageHeader`, () => {
      test(`should return undefined (empty string)`, async () => {
        expect(_resolveAcceptLanguage(
          [LANG_EN, LANG_FR],
          '',
        )).toEqual(undefined);
      });

      test(`should return undefined (null)`, async () => {
        expect(_resolveAcceptLanguage(
          [LANG_EN, LANG_FR],
          // @ts-ignore
          null,
        )).toEqual(undefined);
      });

      test(`should return undefined (undefined)`, async () => {
        expect(_resolveAcceptLanguage(
          [LANG_EN, LANG_FR],
          // @ts-ignore
          undefined,
        )).toEqual(undefined);
      });

      test(`should return undefined (object)`, async () => {
        expect(_resolveAcceptLanguage(
          [LANG_EN, LANG_FR],
          // @ts-ignore
          {},
        )).toEqual(undefined);
      });

      test(`should return undefined (number)`, async () => {
        expect(_resolveAcceptLanguage(
          [LANG_EN, LANG_FR],
          // @ts-ignore
          15,
        )).toEqual(undefined);
      });
    });
  });
});
