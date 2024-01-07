import React from 'react'
import { useTransition, animated } from '@react-spring/web'
import { IntlProvider, FormattedMessage } from 'react-intl'
import Draggable from 'react-draggable'
import CloseButton from '../../ui/CloseButton'
import Icon from '../../ui/Icon'
import StreetmixPlusPrompt from '../../app/StreetmixPlusPrompt'
import { useSelector, useDispatch } from '../../store/hooks'
import { setEnvironment } from '../../store/slices/street'
import { toggleToolbox } from '../../store/slices/ui'
import { DEFAULT_ENVIRONS } from '../constants'
import EnvironmentSelector from './EnvironmentSelector'
import './EnvironmentEditor.scss'

function EnvironmentEditor (): React.ReactElement {
  const selected = useSelector(
    (state) => state.street.environment || DEFAULT_ENVIRONS
  )
  const show = useSelector((state) => state.ui.toolboxVisible || false)
  const isSubscriber = useSelector((state) => state.user.isSubscriber || false)
  const locale = useSelector((state) => state.locale)
  const dispatch = useDispatch()

  function handleClose (event: React.MouseEvent): void {
    dispatch(toggleToolbox())
  }

  function handleSelect (id: string): void {
    dispatch(setEnvironment(id))
  }

  const transitions = useTransition(show, {
    from: { opacity: 0, scale: 0.75, pointerEvents: 'none' },
    enter: { opacity: 1, scale: 1, pointerEvents: 'auto' },
    leave: { opacity: 0, scale: 0.85, pointerEvents: 'none' },
    config: { tension: 300, friction: 5, clamp: true }
  })

  return transitions(
    (style, item) =>
      item && (
        <Draggable bounds="parent" handle="header" cancel=".close">
          {/* Two containers are necessary because different libraries are applying CSS transforms */}
          {/* Outer container is transformed by Draggable's position */}
          <div className="environment-editor environment-editor-container-outer">
            {/* Inner container contains transition styles from Transition */}
            <animated.div
              className="environment-editor-container-inner"
              style={style}
            >
              <header>
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
                    <StreetmixPlusPrompt>
                      <FormattedMessage
                        id="plus.prompt.text"
                        defaultMessage="This feature is only available to Streetmix+ users.&lrm;"
                      />
                    </StreetmixPlusPrompt>
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
