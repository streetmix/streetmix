import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { setFeatureFlag } from '../../store/slices/flags'
import Popover from '../../ui/Popover'
import Switch from '../../ui/Switch'
import AppearanceSettings from './AppearanceSettings'
import UnitSettings from './UnitSettings'

function GeneralSettings (props) {
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
function SillyClownSetting (props) {
  const flag = useSelector((state) => state.flags.SILLY_CLOWNS)
  const dispatch = useDispatch()

  function handleCheckedChange (checked) {
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
