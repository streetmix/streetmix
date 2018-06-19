/**
 * # Locale levels
 *
 * Locales are grouped into four levels of "readiness" for production.
 *
 *    1.  Incomplete or in progress, available for translators to test,
 *        but not for end-users.
 *    2.  Complete or nearly complete, available for quality assurance
 *        & feedback with small group of users.
 *    3.  Complete and ready for production use.
 *    4.  This is a special category for the "default" locale, which is
 *        English. This should never be disabled and we don't have a special
 *        flag to toggle group 4 on or off. It's always on.
 *
 * Levels are lower bounds and inclusive. In other words, allowing level 1
 * means all locales 1 or higher are enabled. You cannot _only_ turn on level 1
 * but not level 2 for example.
 *
 */

// Locale levels stored as constants
/* eslint-disable no-unused-vars */
const LOCALES_LEVEL_1 = 1
const LOCALES_LEVEL_2 = 2
/* eslint-enable no-unused-vars */

const LOCALES_LEVEL_3 = 3
const LOCALES_LEVEL_4 = 4

export const DEFAULT_LOCALE = 'en'
export const DEFAULT_LOCALE_LEVEL = LOCALES_LEVEL_4
export const ENABLED_LOCALE_LEVEL = LOCALES_LEVEL_3
