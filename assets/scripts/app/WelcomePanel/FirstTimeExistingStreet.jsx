import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import StreetName from '../../streets/StreetName'
import Avatar from '../../users/Avatar'
import { goNewStreet } from '../routing'
import { setSettingsWelcomeDismissed } from '../WelcomePanel'

FirstTimeExistingStreet.propTypes = {
  street: PropTypes.object.isRequired
}

function FirstTimeExistingStreet (props) {
  const street = props.street

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
        {(street.creatorId) ? (
          <FormattedMessage
            id="dialogs.welcome.existing.intro"
            defaultMessage="This is {streetName} made by {creator}."
            values={{
              streetName: <StreetName name={street.name} />,
              creator: (
                <React.Fragment>
                  <Avatar userId={street.creatorId} /> {street.creatorId}
                </React.Fragment>
              )
            }}
          />
        ) : (
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
              <button onClick={onClickGoNewStreet}>
                <FormattedMessage
                  id="dialogs.welcome.existing.instruct-start-own-street"
                  defaultMessage="Start your own street"
                />
              </button>
            )
          }}
        />
      </p>
    </div>
  )
}

function mapStateToProps (state) {
  return {
    street: state.street
  }
}

export default connect(mapStateToProps)(FirstTimeExistingStreet)

function onClickGoNewStreet (event) {
  setSettingsWelcomeDismissed()
  goNewStreet(true)
}
