import { LOCALES, type LocaleDefinition } from '@streetmix/i18n'

// Load locale file. This is intentionally simple; we're not resolving locale
// namespaces intelligently or verifying if users have access to locales
// TODO: Verify if imports are cached by Node
// TODO: Fix return type on function
async function getTranslations (
  locale: string,
  namespace: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const localeData = LOCALES.find((l: LocaleDefinition) => l.value === locale)

  if (localeData === undefined) {
    locale = 'en'
  }

  let messages
  if (namespace === 'segment-info') {
    const { default: data } = await import(
      `@streetmix/i18n/locales/${locale}/segment-info.json`,
      { with: { type: 'json' } }
    )
    messages = data
  } else {
    const { default: data } = await import(
      `@streetmix/i18n/locales/${locale}/main.json`,
      { with: { type: 'json' } }
    )
    messages = data
  }

  return messages
}

// Keep this simple, don't need to re-implement entire Intl pipeline right now
export async function getWatermarkString (
  locale: string,
  fallback: string
): Promise<string> {
  const translation = await getTranslations(locale, 'main')

  if (translation.export.watermark === '') {
    return fallback
  }

  return translation.export.watermark ?? fallback
}
