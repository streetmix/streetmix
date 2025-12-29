import React from 'react'
import { IntlProvider, FormattedMessage } from 'react-intl'

import StreetmixPlusPrompt from '~/src/app/StreetmixPlusPrompt'
import { useSelector, useDispatch } from '~/src/store/hooks'
import { setSkybox } from '~/src/store/slices/street'
import { toggleToolbox } from '~/src/store/slices/ui'
import { FloatingPanel } from '~/src/ui/FloatingPanel'
import { DEFAULT_SKYBOX } from '../constants'
import SkyOptions from './SkyOptions'
import './SkyPicker.css'

function SkyPicker(): React.ReactElement {
  const selected = useSelector((state) => state.street.skybox ?? DEFAULT_SKYBOX)
  const show = useSelector((state) => state.ui.toolboxVisible ?? false)
  const isSubscriber = useSelector((state) => state.user.isSubscriber ?? false)
  const locale = useSelector((state) => state.locale)
  const dispatch = useDispatch()

  function handleClose(): void {
    dispatch(toggleToolbox())
  }

  function handleSelect(id: string): void {
    dispatch(setSkybox(id))
  }

  return (
    <FloatingPanel
      icon="sun"
      title={
        <FormattedMessage
          id="tools.skybox.heading"
          defaultMessage="Environment"
        />
      }
      show={show}
      className="sky-picker"
      handleClose={handleClose}
    >
      <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
        <SkyOptions
          enabled={isSubscriber}
          selected={selected}
          handleSelect={handleSelect}
        />
      </IntlProvider>

      {!isSubscriber && (
        <div className="sky-picker-upgrade">
          <StreetmixPlusPrompt>
            <FormattedMessage
              id="plus.prompt.text"
              defaultMessage="This feature is only available to Streetmix+ users.&lrm;"
            />
          </StreetmixPlusPrompt>
        </div>
      )}
    </FloatingPanel>
  )
}

export default SkyPicker
