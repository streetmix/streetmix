import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  LightningBoltIcon,
  GlobeIcon,
  MixerHorizontalIcon,
  PersonIcon
} from '@radix-ui/react-icons'

import type { UserProfile } from '~/src/types'
import { useSelector } from '~/src/store/hooks'
import { ENV } from '~/src/app/config'
import USER_ROLES from '../../../app/data/user_roles.json'
import Dialog from './Dialog'
import FeatureFlagSettings from './Settings/FeatureFlagSettings'
import GeneralSettings from './Settings/GeneralSettings'
import LanguageSettings from './Settings/LanguageSettings'
import ProfileSettings from './Settings/ProfileSettings'
import UnitSettings from './Settings/UnitSettings'
import './SettingsDialog.scss'

interface SettingsDialogProps {
  category: string
}

/**
 * Settings shown/modified in this dialog should apply at user-level.
 * Users that are not signed in (anonymous) are applied for the browser
 * session. Don't use this for street-level settings.
 */
function SettingsDialog ({
  category = 'profile'
}: SettingsDialogProps): React.ReactElement {
  const user: Partial<UserProfile> = useSelector(
    (state) => state.user?.signInData?.details ?? {}
  )
  const [activeCategory, setActiveCategory] = useState(category)

  // `user` is allowed to initialize as an empty object, and in that case
  // make `roles` initialize as an empty array.
  const { roles = [] } = user
  const showFlags: boolean =
    ENV !== 'production' || roles.includes(USER_ROLES.ADMIN.value)

  function handleSelectCategory (category: string): void {
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
    case 'profile':
      SettingsPanel = <ProfileSettings />
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
                // TODO: Rename translation key
                // id="settings.heading"
                id="menu.item.settings"
                defaultMessage="Settings"
              />
            </h1>
          </header>
          <div className="dialog-content dialog-content-bleed">
            <div className="settings-dialog-content">
              <div className="settings-dialog-left">
                <ul>
                  <li
                    onClick={() => {
                      handleSelectCategory('profile')
                    }}
                    className={
                      activeCategory === 'profile' ? 'settings-menu-active' : ''
                    }
                  >
                    <PersonIcon className="settings-menu-icon" />
                    <FormattedMessage
                      id="settings.profile.label"
                      defaultMessage="Profile"
                    />
                  </li>

                  <li
                    onClick={() => {
                      handleSelectCategory('general')
                    }}
                    className={
                      activeCategory === 'general' ? 'settings-menu-active' : ''
                    }
                  >
                    <MixerHorizontalIcon className="settings-menu-icon" />
                    <FormattedMessage
                      id="settings.general.label"
                      defaultMessage="General"
                    />
                  </li>
                  {/* <li
                    onClick={() => handleSelectCategory('units')}
                    className={
                      activeCategory === 'units' ? 'settings-menu-active' : ''
                    }
                  >
                    <RulerSquareIcon className="settings-menu-icon" />
                    <FormattedMessage
                      id="settings.units.label"
                      defaultMessage="Units"
                    />
                  </li> */}
                  <li
                    onClick={() => {
                      handleSelectCategory('language')
                    }}
                    className={
                      activeCategory === 'language'
                        ? 'settings-menu-active'
                        : ''
                    }
                  >
                    <GlobeIcon className="settings-menu-icon" />
                    <FormattedMessage
                      id="settings.language.label"
                      defaultMessage="Language"
                    />
                  </li>
                  {showFlags && (
                    <li
                      onClick={() => {
                        handleSelectCategory('feature-flags')
                      }}
                      className={
                        activeCategory === 'feature-flags'
                          ? 'settings-menu-active'
                          : ''
                      }
                    >
                      <LightningBoltIcon className="settings-menu-icon" />
                      {/* Not translated, on purpose */}
                      Feature flags
                    </li>
                  )}
                </ul>
              </div>
              <div className="settings-dialog-right">{SettingsPanel}</div>
            </div>
          </div>
          <button className="dialog-primary-action" onClick={closeDialog}>
            <FormattedMessage id="btn.close" defaultMessage="Close" />
          </button>
        </div>
      )}
    </Dialog>
  )
}

export default SettingsDialog
