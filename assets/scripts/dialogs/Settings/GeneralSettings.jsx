import React from 'react'
import Switch from '../../ui/Switch'

function GeneralSettings (props) {
  return (
    <>
      <h2>General</h2>
      <div className="settings-item">
        <Switch>Silly clowns 1</Switch>
      </div>
      <div className="settings-item">
        <Switch>Silly clowns 2</Switch>
      </div>
      <div className="settings-item">
        <Switch>Silly clowns 3</Switch>
      </div>
      <div className="settings-item">
        <Switch>Silly clowns 4</Switch>
      </div>
      <div className="settings-item">
        <Switch disabled={true}>Silly clowns 5</Switch>
      </div>
      <div className="settings-item">
        <Switch>Silly clowns 6</Switch>
      </div>
      <div className="settings-item">
        <Switch>Silly clowns 7</Switch>
      </div>
    </>
  )
}

export default GeneralSettings
