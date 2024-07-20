import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { getLastStreet } from '~/src/store/actions/street'
import { NEW_STREET_DEFAULT, NEW_STREET_EMPTY } from '~/src/streets/constants'
import {
  onNewStreetDefaultClick,
  onNewStreetEmptyClick
} from '~/src/streets/creation'

function NewStreet (): React.ReactElement {
  const newStreetPreference = useSelector(
    (state) => state.settings.newStreetPreference
  )
  const priorLastStreetId = useSelector((state) => state.app.priorLastStreetId)
  const street = useSelector((state) => state.street)
  const dispatch = useDispatch()

  // If welcomeType is WELCOME_NEW_STREET, there is an additional state
  // property that determines which of the new street modes is selected
  let selectedNewStreetType
  switch (newStreetPreference) {
    case NEW_STREET_EMPTY:
      selectedNewStreetType = 'new-street-empty'
      break
    case NEW_STREET_DEFAULT:
    default:
      selectedNewStreetType = 'new-street-default'
      break
  }

  const [state, setState] = useState({ selectedNewStreetType })

  // Handles changing the "checked" state of the input buttons.
  function handleChangeNewStreetType (
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    setState({
      selectedNewStreetType: event.target.id
    })
  }

  function handleGetLastStreet (): void {
    void dispatch(getLastStreet())
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
            checked={
              state.selectedNewStreetType === 'new-street-default' ||
              !state.selectedNewStreetType
            }
            onChange={handleChangeNewStreetType}
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
            onChange={handleChangeNewStreetType}
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
        {priorLastStreetId !== null && priorLastStreetId !== street.id && (
          <li>
            <input
              type="radio"
              name="new-street"
              id="new-street-last"
              checked={state.selectedNewStreetType === 'new-street-last'}
              onChange={handleChangeNewStreetType}
              onClick={handleGetLastStreet}
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

export default NewStreet
