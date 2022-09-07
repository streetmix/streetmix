import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import RadioGroup from '../../ui/RadioGroup'
// import LoadingSpinner from '../../ui/LoadingSpinner'
import { changeLocale } from '../../store/slices/locale'
import { DEFAULT_LOCALE } from '../../locales/constants'
import {
  getAvailableLocales,
  getActualLocaleFromRequested
} from '../../locales/locale'

function LanguageSettings (props) {
  const locale = useSelector((state) => state.locale.locale || DEFAULT_LOCALE)
  // const requestedLocale = useSelector((state) => state.locale.requestedLocale)
  const dispatch = useDispatch()
  const intl = useIntl()

  const availableLocales = getAvailableLocales()
  const actuallySelectedLocale = getActualLocaleFromRequested(locale)

  async function handleValueChange (newLocale) {
    await dispatch(changeLocale(newLocale))
  }

  function makeLocaleValues (availableLocales) {
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
