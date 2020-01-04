export enum ERROR_LEVELS {
  ERROR = 'error',
  WARNING = 'warning',
}

export const LEVEL_ERROR = ERROR_LEVELS.ERROR;
export const LEVEL_WARNING = ERROR_LEVELS.WARNING;

export declare type ErrorHandler = (
  error: Error,
  level: ERROR_LEVELS,
  origin: string, // Origin of the error (function's name)
  context?: object, // Additional data context to help further debug
) => void;

/**
 * Default error handler
 * Doesn't do anything but log the error to the console
 *
 * @param error
 * @param level
 * @private
 */
export const _defaultErrorHandler: ErrorHandler = (error: Error, level: ERROR_LEVELS): void => {
  if (level === LEVEL_ERROR) {
    // eslint-disable-next-line no-console
    console.error(error);
  } else if (level === LEVEL_WARNING) {
    // eslint-disable-next-line no-console
    console.warn(error);
  } else {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

