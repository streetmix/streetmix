import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTransition, animated } from 'react-spring'
import { IntlProvider, FormattedMessage } from 'react-intl'
import Draggable from 'react-draggable'
import USER_ROLES from '../../../app/data/user_roles'
import CloseButton from '../ui/CloseButton'
import Icon from '../ui/Icon'
import { doSignIn } from '../users/authentication'
import { showDialog } from '../store/slices/dialogs'
import { setEnvironment } from '../store/slices/street'
import { toggleToolbox } from '../store/slices/ui'
// import emojiIcon from '../../images/openmoji/color/1F324.svg'
import { DEFAULT_ENVIRONS } from './constants'
import EnvironmentSelector from './EnvironmentSelector'
import './EnvironmentEditor.scss'

function EnvironmentEditor (props) {
  const selected = useSelector(
    (state) => state.street.environment || DEFAULT_ENVIRONS
  )
  const show = useSelector((state) => state.ui.toolboxVisible || false)
  const user = useSelector((state) => state.user.signInData?.details || null)
  const signedIn = useSelector((state) => state.user.signedIn || false)
  const locale = useSelector((state) => state.locale)
  const dispatch = useDispatch()

  const isSubscriber = user?.roles.includes(USER_ROLES.SUBSCRIBER_1.value)

  function handleClose (event) {
    dispatch(toggleToolbox())
  }

  function handleClickSignIn (event) {
    event.preventDefault()
    doSignIn()
  }

  function handleClickUpgrade (event) {
    event.preventDefault()
    dispatch(showDialog('UPGRADE'))
  }

  function handleSelect (id) {
    dispatch(setEnvironment(id))
  }

  const transitions = useTransition(show, null, {
    from: { opacity: 0, transform: 'scale(0.75)', pointerEvents: 'none' },
    enter: { opacity: 1, transform: 'scale(1)', pointerEvents: 'auto' },
    leave: { opacity: 0, transform: 'scale(0.85)', pointerEvents: 'none' },
    config: { tension: 600, velocity: 20, clamp: true }
  })

  return transitions.map(
    ({ item, key, props }) =>
      item && (
        <Draggable bounds="parent" handle="header" cancel=".close" key={key}>
          {/* Two containers are necessary because different libraries are applying CSS transforms */}
          {/* Outer container is transformed by Draggable's position */}
          <div className="environment-editor environment-editor-container-outer">
            {/* Inner container contains transition styles from Transition */}
            <animated.div
              className="environment-editor-container-inner"
              style={props}
            >
              <header>
                {/* <img
                  src={emojiIcon}
                  alt="Sun behind rain cloud"
                  draggable="false"
                /> */}
                <h3>
                  <Icon icon="sun" />
                  <FormattedMessage
                    id="tools.environment.heading"
                    defaultMessage="Environment"
                  />
                </h3>
                <CloseButton onClick={handleClose} />
              </header>
              <div className="environment-editor-content">
                <IntlProvider
                  locale={locale.locale}
                  messages={locale.segmentInfo}
                >
                  <EnvironmentSelector
                    enabled={isSubscriber}
                    selected={selected}
                    handleSelect={handleSelect}
                  />
                </IntlProvider>
                {!isSubscriber && (
                  <div className="environment-upgrade-box">
                    <FormattedMessage
                      id="plus.prompt.text"
                      defaultMessage="This feature is only available to Streetmix+ users!&lrm;"
                    />
                    {/* If users are not signed in, they must sign in first
                        If they're signed in, and are not a subscriber, show
                        the upgrade button */}
                    {signedIn
                      ? (
                        <button onClick={handleClickUpgrade}>
                          <FormattedMessage
                            id="plus.prompt.action"
                            defaultMessage="Upgrade to unlock"
                          />
                        </button>
                        )
                      : (
                        <button onClick={handleClickSignIn}>
                          <FormattedMessage
                            id="menu.item.sign-in"
                            defaultMessage="Sign in"
                          />
                        </button>
                        )}
                  </div>
                )}
              </div>
            </animated.div>
          </div>
        </Draggable>
      )
  )
}

export default EnvironmentEditor
