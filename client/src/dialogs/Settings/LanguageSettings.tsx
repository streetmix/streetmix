import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { changeLocale } from '~/src/store/slices/locale'
import RadioGroup, { type RadioItemProps } from '~/src/ui/RadioGroup'
import { DEFAULT_LOCALE } from '~/src/locales/constants'
import {
  getAvailableLocales,
  getActualLocaleFromRequested
} from '~/src/locales/locale'

import type { LocaleDefinition } from '@streetmix/i18n'

function LanguageSettings (): React.ReactElement {
  const locale = useSelector((state) => state.locale.locale ?? DEFAULT_LOCALE)
  const dispatch = useDispatch()
  const intl = useIntl()

  const availableLocales = getAvailableLocales()
  const actuallySelectedLocale = getActualLocaleFromRequested(locale)

  function handleValueChange (newLocale: string): void {
    dispatch(changeLocale(newLocale))
  }

  function makeLocaleValues (
    availableLocales: LocaleDefinition[]
  ): RadioItemProps[] {
    return availableLocales.map((locale) => ({
      value: locale.value,
      label: locale.label,
      sublabel: intl.formatMessage({
        id: locale.key,
        defaultMessage: locale.name
      })
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

export default LanguageSettings
