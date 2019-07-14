import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import {
  NEW_STREET_DEFAULT,
  NEW_STREET_EMPTY,
  onNewStreetDefaultClick,
  onNewStreetEmptyClick
} from '../../streets/creation'
import { getLastStreet } from '../../store/actions/street'

NewStreet.propTypes = {
  newStreetPreference: PropTypes.number,
  priorLastStreetId: PropTypes.string,
  street: PropTypes.object,
  getLastStreet: PropTypes.func
}

NewStreet.defaultProps = {
  priorLastStreetId: null
}

function NewStreet (props) {
  // If welcomeType is WELCOME_NEW_STREET, there is an additional state
  // property that determines which of the new street modes is selected
  let selectedNewStreetType
  switch (props.newStreetPreference) {
    case NEW_STREET_EMPTY:
      selectedNewStreetType = 'new-street-empty'
      break
    case NEW_STREET_DEFAULT:
    default:
      selectedNewStreetType = 'new-street-default'
      break
  }

  const [ state, setState ] = useState({ selectedNewStreetType })

  // Handles changing the "checked" state of the input buttons.
  function onChangeNewStreetType (event) {
    setState({
      selectedNewStreetType: event.target.id
    })
  }

  return (
    <div className="welcome-panel-content new-street">
      <h1>
        <FormattedMessage
          id="dialogs.new-street.heading"
          defaultMessage="Here’s your new street."
        />
      </h1>
      <ul>
        <li>
          <input
            type="radio"
            name="new-street"
            id="new-street-default"
            checked={state.selectedNewStreetType === 'new-street-default' || !state.selectedNewStreetType}
            onChange={onChangeNewStreetType}
            onClick={onNewStreetDefaultClick}
          />
          <label htmlFor="new-street-default">
            <FormattedMessage
              id="dialogs.new-street.default"
              defaultMessage="Start with an example street"
            />
          </label>
        </li>
        <li>
          <input
            type="radio"
            name="new-street"
            id="new-street-empty"
            checked={state.selectedNewStreetType === 'new-street-empty'}
            onChange={onChangeNewStreetType}
            onClick={onNewStreetEmptyClick}
          />
          <label htmlFor="new-street-empty">
            <FormattedMessage
              id="dialogs.new-street.empty"
              defaultMessage="Start with an empty street"
            />
          </label>
        </li>
        {/* Display this button only if there is a previous street to copy
            from that is not the same as the current street */}
        {(props.priorLastStreetId && props.priorLastStreetId !== props.street.id) && (
          <li>
            <input
              type="radio"
              name="new-street"
              id="new-street-last"
              checked={state.selectedNewStreetType === 'new-street-last'}
              onChange={onChangeNewStreetType}
              onClick={props.getLastStreet}
            />
            <label htmlFor="new-street-last">
              <FormattedMessage
                id="dialogs.new-street.last"
                defaultMessage="Start with a copy of last street"
              />
            </label>
          </li>
        )}
      </ul>
    </div>
  )
}

function mapStateToProps (state) {
  return {
    newStreetPreference: state.settings.newStreetPreference,
    priorLastStreetId: state.settings.priorLastStreetId,
    street: state.street
  }
}

const mapDispatchToProps = {
  getLastStreet
}

export default connect(mapStateToProps, mapDispatchToProps)(NewStreet)
