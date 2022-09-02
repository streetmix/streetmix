import React from 'react'
import Switch from '../../ui/Switch'

function UnitSettings (props) {
  return (
    <>
      <h2>Units</h2>
      <div className="settings-item">
        <Switch>Imperial units</Switch>
      </div>
    </>
  )
}

export default UnitSettings
