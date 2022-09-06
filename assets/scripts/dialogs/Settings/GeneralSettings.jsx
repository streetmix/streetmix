import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setFeatureFlag } from '../../store/slices/flags'
import Switch from '../../ui/Switch'
import UnitSettings from './UnitSettings'

function GeneralSettings (props) {
  return (
    <>
      <section>
        <h2>General</h2>
        <hr />
      </section>

      <UnitSettings />

      <section>
        <h2>Miscellaneous</h2>
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
    <Switch onCheckedChange={handleCheckedChange} checked={flag.value}>
      Silly clowns
    </Switch>
  )
}

export default GeneralSettings
