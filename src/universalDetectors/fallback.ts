import { CustomDetector, DetectorOptions } from 'i18next-browser-languagedetector';

export const fallback = (fallbackLanguage: string): CustomDetector => {
  return {
    name: 'fallback',
    lookup: (options: DetectorOptions): string => {
      return fallbackLanguage;
    },
    cacheUserLanguage: (): void => {
      // Do nothing, can't cache the user language on the server
    },
  };
};

export default fallback;
