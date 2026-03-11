import { FormattedMessage } from 'react-intl'

import { useSelector } from '~/src/store/hooks.js'
import { useGetUserQuery } from '~/src/store/services/api.js'
import { Button } from '~/src/ui/Button.js'
import StreetName from '~/src/streets/StreetName.js'
import { Avatar } from '~/src/users/Avatar.js'
import { goNewStreet } from '../routing.js'
import { setIsReturningUser } from './localstorage.js'

export function FirstTimeExistingStreet() {
  const street = useSelector((state) => state.street)
  const { data: creatorProfile } = useGetUserQuery(street.creatorId)

  function handleGoNewStreet(): void {
    setIsReturningUser()
    goNewStreet(true)
  }

  return (
    <div className="welcome-panel-content">
      <h1>
        <FormattedMessage
          id="dialogs.welcome.heading"
          defaultMessage="Welcome to Streetmix."
        />
      </h1>
      <p>
        {/* Display street creator if creatorId is available. */}
        {typeof street.creatorId === 'string' ? (
          <FormattedMessage
            id="dialogs.welcome.existing.intro"
            defaultMessage="This is {streetName} made by {creator}."
            values={{
              streetName: <StreetName name={street.name} />,
              creator: (
                <>
                  <Avatar userId={street.creatorId} />{' '}
                  {creatorProfile?.displayName ?? street.creatorId}
                </>
              ),
            }}
          />
        ) : (
          <FormattedMessage
            id="dialogs.welcome.existing.intro-without-creator"
            defaultMessage="This is {streetName}."
            values={{
              streetName: <StreetName name={street.name} />,
            }}
          />
        )}
      </p>
      <div className="welcome-panel-buttons">
        <FormattedMessage
          id="dialogs.welcome.existing.instruct"
          defaultMessage="Remix it by moving some segments around, or {startYourOwnStreet}."
          values={{
            startYourOwnStreet: (
              <Button onClick={handleGoNewStreet}>
                <FormattedMessage
                  id="dialogs.welcome.existing.instruct-start-own-street"
                  defaultMessage="Start your own street"
                />
              </Button>
            ),
          }}
        />
      </div>
    </div>
  )
}
