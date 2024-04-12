import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { updateDisplayName } from '../../store/slices/user'
import Button from '../../ui/Button'
import LoadingSpinner from '../../ui/LoadingSpinner'
import Popover from '../../ui/Popover'
import { patchUser } from '../../util/api'
import './ProfileSettings.scss'

const DISPLAY_NAME_MAX_CHARS = 30
const DISPLAY_NAME_MAX_CHARS_WARN = DISPLAY_NAME_MAX_CHARS - 10

function ProfileSettings (props) {
  const displayNameInputRef = useRef()
  const user = useSelector((state) => state.user.signInData?.details)
  const [displayNameValue, setDisplayNameValue] = useState(
    user.displayName || user.id
  )
  const [isEditing, setEditing] = useState(false)
  const [isPending, setPending] = useState(false)
  const [isError, setError] = useState(false)
  const intl = useIntl()
  const dispatch = useDispatch()

  function handleEditDisplayName (event) {
    setEditing(true)

    // Focuses the input and selects it if has the default username
    // setTimeout of 0 is needed to run after render
    window.setTimeout(() => {
      if (displayNameInputRef.current) {
        displayNameInputRef.current.focus()
        if (displayNameValue === user.id) {
          displayNameInputRef.current.select()
        }
      }
    }, 0)
  }

  function handleResetDisplayName (event) {
    setEditing(false)
    setDisplayNameValue(user.displayName || user.id)
  }

  function handleChangeDisplayName (event) {
    setDisplayNameValue(event.target.value)
  }

  async function handleSaveDisplayName (event) {
    setPending(true)

    try {
      // Update display name
      await patchUser(user.id, { displayName: displayNameValue })

      // Update local data for it
      dispatch(updateDisplayName(displayNameValue))

      // Restore editing state
      setError(false)

      // "Thinking time"
      window.setTimeout(() => {
        setEditing(false)
        setPending(false)
      }, 500)
    } catch (err) {
      console.error('Profile settings error', err)

      // "Thinking time"
      window.setTimeout(() => {
        setError(true)
        setPending(false)
        if (displayNameInputRef.current) {
          displayNameInputRef.current.focus()
        }
      }, 500)
    }
  }

  function handleSubmit (event) {
    event.preventDefault()
    handleSaveDisplayName(event)
  }

  // Not signed-in users shouldn't see this,
  // but if they somehow access it, just refuse to render
  if (!user) {
    return null
  }

  const messages = []

  if (
    isEditing &&
    !isPending &&
    displayNameValue.length >= DISPLAY_NAME_MAX_CHARS_WARN
  ) {
    messages.push(
      intl.formatMessage(
        {
          id: 'settings.profile.display-name-characters-remaining',
          defaultMessage:
            'Characters remaining: {currentNum} ({maxNum} maximum)'
        },
        {
          currentNum: DISPLAY_NAME_MAX_CHARS - displayNameValue.length,
          maxNum: DISPLAY_NAME_MAX_CHARS
        }
      )
    )
  }
  if (isError) {
    messages.push(
      intl.formatMessage({
        id: 'settings.profile..display-name-error',
        defaultMessage: 'Display name could not be saved'
      })
    )
  }

  return (
    <section>
      <h2>
        <FormattedMessage
          id="settings.profile.label"
          defaultMessage="Profile"
        />
      </h2>
      <hr />

      <div className="profile-settings-item">
        <h3>
          <FormattedMessage
            id="settings.profile.username"
            defaultMessage="Username"
          />
          <Popover>
            <FormattedMessage
              id="settings.profile.username-description"
              defaultMessage="Your username is a unique account identifier."
            />
          </Popover>
        </h3>
        <div className="profile-settings-editable">
          <p>{user.id}</p>
          <div className="profile-settings-button">
            <Button disabled={true}>
              <FormattedMessage id="btn.edit" defaultMessage="Edit" />
            </Button>
          </div>
        </div>
      </div>

      <div className="profile-settings-item">
        <h3>
          <label htmlFor="display-name-input">
            <FormattedMessage
              id="settings.profile.display-name"
              defaultMessage="Display name"
            />
          </label>
          <Popover>
            <FormattedMessage
              id="settings.profile.display-name-description"
              defaultMessage="Your display name is how you appear to other users in Streetmix."
            />
          </Popover>
        </h3>
        {/* eslint-disable-next-line */}
        {isEditing ? (
          <div className="profile-settings-editable">
            <form onSubmit={handleSubmit}>
              <p>
                <input
                  ref={displayNameInputRef}
                  id="display-name-input"
                  type="text"
                  value={displayNameValue}
                  onChange={handleChangeDisplayName}
                  disabled={isPending}
                  maxLength={DISPLAY_NAME_MAX_CHARS}
                />
              </p>
              <div className="profile-settings-button">
                <Button
                  onClick={handleSaveDisplayName}
                  primary={true}
                  disabled={isPending}
                >
                  <FormattedMessage id="btn.save" defaultMessage="Save" />
                  {isPending && (
                    <div className="profile-settings-pending">
                      <LoadingSpinner size="small" />
                    </div>
                  )}
                </Button>
                <Button
                  onClick={handleResetDisplayName}
                  tertiary={true}
                  disabled={isPending}
                >
                  <FormattedMessage id="btn.cancel" defaultMessage="Cancel" />
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-settings-editable">
            <p>
              {user.displayName || (
                <span className="profile-display-name-not-set">
                  <FormattedMessage
                    id="settings.profile.display-name-not-set"
                    defaultMessage="You have not added a display name yet."
                  />
                </span>
              )}
            </p>
            <div className="profile-settings-button">
              <Button onClick={handleEditDisplayName}>
                <FormattedMessage id="btn.edit" defaultMessage="Edit" />
              </Button>
            </div>
          </div>
        )}
        <div className="profile-display-name-messages">
          {messages.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProfileSettings
