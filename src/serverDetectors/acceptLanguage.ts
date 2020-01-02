import { CustomDetector, DetectorOptions } from 'i18next-browser-languagedetector';

import { resolvePrimaryLanguageFromServer } from '../index';

export const acceptLanguage = (acceptLanguage: string | undefined, fallbackLanguage?: string | undefined, errorHandler?: Function | undefined): CustomDetector => {
  return {
    name: 'acceptLanguage',
    lookup: (options: DetectorOptions): string | undefined => {
      return resolvePrimaryLanguageFromServer(acceptLanguage, fallbackLanguage, errorHandler);
    },
    cacheUserLanguage: (): void => {
      // Do nothing, can't cache the user language on the server
    },
  };
};

export default acceptLanguage;
