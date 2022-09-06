import React from 'react'
import { FormattedMessage } from 'react-intl'
import Switch from '../../ui/Switch'

function LanguageSettings (props) {
  return (
    <section>
      <h2>
        <FormattedMessage
          id="settings.language.label"
          defaultMessage="Language"
        />
      </h2>
      <hr />
      <Switch>Z</Switch>
    </section>
  )
}

export default LanguageSettings
