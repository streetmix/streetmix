import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import {
  LightningBoltIcon,
  GlobeIcon,
  // RulerSquareIcon,
  MixerHorizontalIcon
} from '@radix-ui/react-icons'
import USER_ROLES from '../../../app/data/user_roles'
import { ENV } from '../app/config'
import Dialog from './Dialog'
import FeatureFlagSettings from './Settings/FeatureFlagSettings'
import GeneralSettings from './Settings/GeneralSettings'
import LanguageSettings from './Settings/LanguageSettings'
import UnitSettings from './Settings/UnitSettings'
import './SettingsDialog.scss'

SettingsDialog.propTypes = {
  category: PropTypes.string
}

/**
 * Settings shown/modified in this dialog should apply at user-level.
 * Users that are not signed in (anonymous) are applied for the browser
 * session. Don't use this for street-level settings.
 */
function SettingsDialog ({ category = 'general' }) {
  const user = useSelector((state) => state.user?.signInData?.details || {})
  const [activeCategory, setActiveCategory] = useState(category)

  const { roles = [] } = user
  const showFlags =
    ENV !== 'production' || roles.includes(USER_ROLES.ADMIN.value)

  function handleSelectCategory (category) {
    setActiveCategory(category)
  }

  let SettingsPanel
  switch (activeCategory) {
    case 'feature-flags':
      SettingsPanel = <FeatureFlagSettings />
      break
    case 'general':
      SettingsPanel = <GeneralSettings />
      break
    case 'language':
      SettingsPanel = <LanguageSettings />
      break
    case 'units':
      SettingsPanel = <UnitSettings />
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
                  {/* <li
                    onClick={() => handleSelectCategory('units')}
                    className={
                      activeCategory === 'units' ? 'settings-menu-active' : ''
                    }
                  >
                    <RulerSquareIcon className="settings-menu-icon" />
                    Units
                  </li> */}
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
                  {showFlags && (
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
                  )}
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
