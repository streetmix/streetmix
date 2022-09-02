import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setFeatureFlag } from '../../store/slices/flags'
import Switch from '../../ui/Switch'

function GeneralSettings (props) {
  return (
    <>
      <h2>General</h2>
      <SillyClownSetting />
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
        Silly clowns
      </Switch>
    </div>
  )
}

export default GeneralSettings
