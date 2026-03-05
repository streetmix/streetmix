import { FormattedMessage } from 'react-intl'

export function FirstTimeNewStreet() {
  return (
    <div className="welcome-panel-content">
      <h1>
        <FormattedMessage
          id="dialogs.welcome.heading"
          defaultMessage="Welcome to Streetmix."
        />
      </h1>
      <p>
        <FormattedMessage
          id="dialogs.welcome.new.intro"
          defaultMessage="Design, remix, and share your neighborhood street.
            Add trees or bike paths, widen sidewalks or traffic lanes, learn
            how your decisions can impact your community."
        />
      </p>
      <p>
        <FormattedMessage
          id="dialogs.welcome.new.instruction"
          defaultMessage="Start by moving some segments around."
        />
      </p>
    </div>
  )
}
