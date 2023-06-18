import React from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Button from '../../ui/Button'
import StreetName from '../../streets/StreetName'
import Avatar from '../../users/Avatar'
import { goNewStreet } from '../routing'
import { setIsReturningUserInLocalStorage } from '../WelcomePanel'
import { useGetUserQuery } from '../../store/services/api'

function FirstTimeExistingStreet (props) {
  const street = useSelector((state) => state.street)
  const { data: creatorProfile } = useGetUserQuery(street.creatorId)

  function handleGoNewStreet (event) {
    setIsReturningUserInLocalStorage()
    goNewStreet(true)
  }

  return (
    <div className="welcome-panel-content first-time-existing-street">
      <h1>
        <FormattedMessage
          id="dialogs.welcome.heading"
          defaultMessage="Welcome to Streetmix."
        />
      </h1>
      {/* Enclose child elements in a paragraph-like <div> to get around
          React's warning that <div> elements from StreetName and
          Avatar components cannot exist inside a <p> */}
      <div className="paragraph">
        {/* Display street creator if creatorId is available. */}
        {street.creatorId
          ? (
            <FormattedMessage
              id="dialogs.welcome.existing.intro"
              defaultMessage="This is {streetName} made by {creator}."
              values={{
                streetName: <StreetName name={street.name} />,
                creator: (
                  <>
                    <Avatar userId={street.creatorId} />{' '}
                    {creatorProfile?.displayName || street.creatorId}
                  </>
                )
              }}
            />
            )
          : (
            <FormattedMessage
              id="dialogs.welcome.existing.intro-without-creator"
              defaultMessage="This is {streetName}."
              values={{
                streetName: <StreetName name={street.name} />
              }}
            />
            )}
      </div>
      <p className="important">
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
            )
          }}
        />
      </p>
    </div>
  )
}

export default FirstTimeExistingStreet
