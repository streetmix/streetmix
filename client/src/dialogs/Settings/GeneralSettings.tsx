import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { setFeatureFlag } from '~/src/store/slices/flags'
import Popover from '~/src/ui/Popover'
import Switch from '~/src/ui/Switch'
import AppearanceSettings from './AppearanceSettings'
import UnitSettings from './UnitSettings'

function GeneralSettings (): React.ReactElement {
  const flags = useSelector((state) => state.flags)

  return (
    <>
      <section>
        <h2>
          <FormattedMessage
            id="settings.general.label"
            defaultMessage="General"
          />
        </h2>
        <hr />
      </section>

      <UnitSettings />

      {/* This might be a new side panel when we have more settings */}
      {flags.COLOR_MODE_TOGGLE.value && <AppearanceSettings />}

      <section>
        <h2>
          <FormattedMessage
            id="settings.misc.label"
            defaultMessage="Miscellaneous"
          />
        </h2>
        <SillyClownSetting />
      </section>
    </>
  )
}

/**
 * Silly clowns is a feature flag that is also now user-editable.
 */
function SillyClownSetting (): React.ReactElement {
  const flag = useSelector((state) => state.flags.SILLY_CLOWNS)
  const dispatch = useDispatch()

  function handleCheckedChange (checked: boolean): void {
    dispatch(
      setFeatureFlag({
        flag: 'SILLY_CLOWNS',
        value: checked
      })
    )
  }

  return (
    <div className="settings-item">
      <Switch onCheckedChange={handleCheckedChange} checked={flag.value}>
        <FormattedMessage
          id="settings.misc.silly-clowns"
          defaultMessage="Silly clowns"
        />
      </Switch>
      <Popover>
        <FormattedMessage
          id="settings.misc.silly-clowns-description"
          defaultMessage="Enables Easter eggs."
        />
      </Popover>
    </div>
  )
}

export default GeneralSettings
