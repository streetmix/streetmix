import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import {
  LightningBoltIcon,
  GlobeIcon,
  RulerSquareIcon,
  MixerHorizontalIcon
} from '@radix-ui/react-icons'
import Dialog from './Dialog'
import GeneralSettings from './Settings/GeneralSettings'
import UnitSettings from './Settings/UnitSettings'
import LanguageSettings from './Settings/LanguageSettings'
import './SettingsDialog.scss'

SettingsDialog.propTypes = {
  category: PropTypes.string
}

function SettingsDialog ({ category = 'general' }) {
  const [activeCategory, setActiveCategory] = useState(category)

  function handleSelectCategory (category) {
    setActiveCategory(category)
  }

  let SettingsPanel
  switch (activeCategory) {
    case 'units':
      SettingsPanel = <UnitSettings />
      break
    case 'language':
      SettingsPanel = <LanguageSettings />
      break
    case 'general':
      SettingsPanel = <GeneralSettings />
      break
    default:
      SettingsPanel = <div>Not implemented</div>
  }

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="settings-dialog">
          <header>
            <h1>
              <FormattedMessage
                id="dialogs.settings.heading"
                defaultMessage="Settings"
              />
            </h1>
          </header>
          <div className="dialog-content dialog-content-bleed">
            <div className="settings-dialog-content">
              <div className="settings-dialog-left">
                <ul>
                  <li
                    onClick={() => handleSelectCategory('general')}
                    className={
                      activeCategory === 'general' ? 'settings-menu-active' : ''
                    }
                  >
                    <MixerHorizontalIcon className="settings-menu-icon" />
                    General
                  </li>
                  <li
                    onClick={() => handleSelectCategory('units')}
                    className={
                      activeCategory === 'units' ? 'settings-menu-active' : ''
                    }
                  >
                    <RulerSquareIcon className="settings-menu-icon" />
                    Units
                  </li>
                  <li
                    onClick={() => handleSelectCategory('language')}
                    className={
                      activeCategory === 'language'
                        ? 'settings-menu-active'
                        : ''
                    }
                  >
                    <GlobeIcon className="settings-menu-icon" />
                    Language
                  </li>
                  <li
                    onClick={() => handleSelectCategory('feature-flags')}
                    className={
                      activeCategory === 'feature-flags'
                        ? 'settings-menu-active'
                        : ''
                    }
                  >
                    <LightningBoltIcon className="settings-menu-icon" />
                    Feature flags
                  </li>
                </ul>
              </div>
              <div className="settings-dialog-right">{SettingsPanel}</div>
            </div>
          </div>
          <button className="dialog-primary-action" onClick={closeDialog}>
            Close
          </button>
        </div>
      )}
    </Dialog>
  )
}

export default SettingsDialog
