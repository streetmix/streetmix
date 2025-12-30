import { FormattedMessage, useIntl } from 'react-intl'
import { DEFAULT_LOCALE } from '@streetmix/i18n'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { changeLocale } from '~/src/store/slices/locale.js'
import RadioGroup, { type RadioItemProps } from '~/src/ui/RadioGroup.js'
import {
  getAvailableLocales,
  getActualLocaleFromRequested,
} from '~/src/locales/locale.js'

import type { LocaleDefinition } from '@streetmix/i18n'

export function LanguageSettings() {
  const locale = useSelector((state) => state.locale.locale ?? DEFAULT_LOCALE)
  const dispatch = useDispatch()
  const intl = useIntl()

  const availableLocales = getAvailableLocales()
  const actuallySelectedLocale = getActualLocaleFromRequested(locale)

  function handleValueChange(newLocale: string): void {
    dispatch(changeLocale(newLocale))
  }

  function makeLocaleValues(
    availableLocales: LocaleDefinition[]
  ): RadioItemProps[] {
    return availableLocales.map((locale) => ({
      value: locale.value,
      label: locale.label,
      sublabel: intl.formatMessage({
        id: locale.key,
        defaultMessage: locale.name,
      }),
    }))
  }

  return (
    <section>
      <h2>
        <FormattedMessage
          id="settings.language.label"
          defaultMessage="Language"
        />
      </h2>
      <hr />
      <RadioGroup
        name="language"
        value={actuallySelectedLocale}
        defaultValue={DEFAULT_LOCALE}
        onValueChange={handleValueChange}
        values={makeLocaleValues(availableLocales)}
      />
    </section>
  )
}
