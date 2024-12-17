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
import type { LocaleLevel } from '@streetmix/i18n'

// Locale levels stored as constants
export const LOCALES_LEVEL_1: LocaleLevel = 1
export const LOCALES_LEVEL_2: LocaleLevel = 2
export const LOCALES_LEVEL_3: LocaleLevel = 3
export const LOCALES_LEVEL_4: LocaleLevel = 4

export const DEFAULT_LOCALE = 'en'

// Valid locale levels are enforced via types
export const DEFAULT_LOCALE_LEVEL: LocaleLevel = LOCALES_LEVEL_4
export const ENABLED_LOCALE_LEVEL: LocaleLevel = LOCALES_LEVEL_3
