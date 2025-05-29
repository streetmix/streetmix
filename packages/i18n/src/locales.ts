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

// Assign values to satisfy @typescript-eslint/no-magic-numbers rule
const LEVEL_1 = 1
const LEVEL_2 = 2
const LEVEL_3 = 3
const LEVEL_4 = 4

// Create an object, so that the LocaleLevel type can be derived from it
export const LOCALE_LEVELS = {
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  LEVEL_4
} as const

// Define our special 'default' locale
export const DEFAULT_LOCALE = 'en'

// Valid locale levels are enforced via types
export const DEFAULT_LOCALE_LEVEL = LOCALE_LEVELS.LEVEL_4 // eslint-disable-line @typescript-eslint/prefer-destructuring
export const ENABLED_LOCALE_LEVEL = LOCALE_LEVELS.LEVEL_3 // eslint-disable-line @typescript-eslint/prefer-destructuring

// Define types
export type LocaleLevel = (typeof LOCALE_LEVELS)[keyof typeof LOCALE_LEVELS]
export interface LocaleDefinition {
  label: string
  name: string
  value: string
  key: string
  level: LocaleLevel
}

// Define locale configuration
export const LOCALES: LocaleDefinition[] = [
  {
    label: 'አማርኛ',
    name: 'Amharic',
    value: 'am',
    key: 'i18n.lang.am',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'لغة عربية',
    name: 'Arabic',
    value: 'ar',
    key: 'i18n.lang.ar',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Català',
    name: 'Catalan',
    value: 'ca',
    key: 'i18n.lang.ca',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'čeština',
    name: 'Czech',
    value: 'cs',
    key: 'i18n.lang.cs',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Deutsch',
    name: 'German',
    value: 'de',
    key: 'i18n.lang.de',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'English',
    name: 'English',
    value: 'en',
    key: 'i18n.lang.en',
    level: LOCALE_LEVELS.LEVEL_4
  },
  {
    label: 'English (United Kingdom)',
    name: 'English (United Kingdom)',
    value: 'en-GB',
    key: 'i18n.lang.en-gb',
    level: LOCALE_LEVELS.LEVEL_1
  },
  {
    label: 'Español',
    name: 'Spanish',
    value: 'es',
    key: 'i18n.lang.es',
    level: LOCALE_LEVELS.LEVEL_1
  },
  {
    label: 'Español (América Latina)',
    name: 'Spanish (Latin America)',
    value: 'es-419',
    key: 'i18n.lang.es-419',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Español (España)',
    name: 'Spanish (Spain)',
    value: 'es-ES',
    key: 'i18n.lang.es-es',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Español (México)',
    name: 'Spanish (Mexico)',
    value: 'es-MX',
    key: 'i18n.lang.es-mx',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Suomi',
    name: 'Finnish',
    value: 'fi',
    key: 'i18n.lang.fi',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Filipino',
    name: 'Filipino',
    value: 'fil',
    key: 'i18n.lang.fil',
    level: LOCALE_LEVELS.LEVEL_1
  },
  {
    label: 'Français',
    name: 'French',
    value: 'fr',
    key: 'i18n.lang.fr',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'bahasa Indonesia',
    name: 'Indonesian',
    value: 'id',
    key: 'i18n.lang.id',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Italiano',
    name: 'Italian',
    value: 'it',
    key: 'i18n.lang.it',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: '日本語',
    name: 'Japanese',
    value: 'ja',
    key: 'i18n.lang.ja',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: '한국어',
    name: 'Korean',
    value: 'ko',
    key: 'i18n.lang.ko',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Nederlands',
    name: 'Dutch (Netherlands)',
    value: 'nl-NL',
    key: 'i18n.lang.nl-nl',
    level: LOCALE_LEVELS.LEVEL_2
  },
  {
    label: 'Bokmål',
    name: 'Norwegian Bokmål',
    value: 'nb-NO',
    key: 'i18n.lang.nb-no',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Polski',
    name: 'Polish',
    value: 'pl',
    key: 'i18n.lang.pl',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Português (Brasil)',
    name: 'Portuguese (Brazil)',
    value: 'pt-BR',
    key: 'i18n.lang.pt-br',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Roemeense',
    name: 'Romanian',
    value: 'ro-RO',
    key: 'i18n.lang.ro-ro',
    level: LOCALE_LEVELS.LEVEL_1
  },
  {
    label: 'Русский',
    name: 'Russian',
    value: 'ru',
    key: 'i18n.lang.ru',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Slovak',
    name: 'Slovak',
    value: 'sk',
    key: 'i18n.lang.sk',
    level: LOCALE_LEVELS.LEVEL_1
  },
  {
    label: 'Svenska',
    name: 'Swedish',
    value: 'sv',
    key: 'i18n.lang.sv',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: 'Türkçe',
    name: 'Turkish',
    value: 'tr',
    key: 'i18n.lang.tr',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: '简体中文',
    name: 'Simplified Chinese',
    value: 'zh-Hans',
    key: 'i18n.lang.zh-hans',
    level: LOCALE_LEVELS.LEVEL_3
  },
  {
    label: '繁體中文',
    name: 'Traditional Chinese',
    value: 'zh-Hant',
    key: 'i18n.lang.zh-hant',
    level: LOCALE_LEVELS.LEVEL_3
  }
]
