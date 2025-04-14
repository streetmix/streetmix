import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { updateSettings } from '~/src/store/slices/settings'
import { NEW_STREET_DEFAULT, NEW_STREET_EMPTY } from '~/src/streets/constants'
import Icon from '~/src/ui/Icon'
import Menu, { type MenuProps } from './Menu'
import MenuItem from './MenuItem'
import MenuSeparator from './MenuSeparator'
import BetaTag from './BetaTag'

function NewStreetMenu (props: MenuProps): React.ReactElement {
  const dispatch = useDispatch()
  const coastmixEnabled = useSelector(
    (state) => state.flags.COASTMIX_MODE.value
  )

  function handleNewExampleStreet (): void {
    dispatch(
      updateSettings({
        newStreetPreference: NEW_STREET_DEFAULT
      })
    )

    // window.open('/new', '_blank')
  }

  function handleNewEmptyStreet (): void {
    dispatch(
      updateSettings({
        newStreetPreference: NEW_STREET_EMPTY
      })
    )

    // window.open('/new', '_blank')
  }

  function handleCopyCurrentStreet (): void {}

  return (
    <Menu {...props}>
      <MenuItem onClick={handleNewExampleStreet}>
        <Icon name="new-street" className="menu-item-icon" />
        <FormattedMessage
          id="menu.new-street.default"
          defaultMessage="New example street"
        />
        <Icon name="external-link" />
      </MenuItem>
      <MenuItem onClick={handleNewEmptyStreet}>
        <FormattedMessage
          id="menu.new-street.empty"
          defaultMessage="New empty street"
        />
        <Icon name="external-link" />
      </MenuItem>
      <MenuItem onClick={handleCopyCurrentStreet}>
        <Icon name="copy" className="menu-item-icon" />
        <FormattedMessage
          id="menu.new-street.copy"
          defaultMessage="Make a copy"
        />
        <Icon name="external-link" />
      </MenuItem>
      <MenuSeparator />
      <MenuItem>
        <Icon name="template" className="menu-item-icon" />
        <FormattedMessage
          id="menu.new-street.template"
          defaultMessage="New from template…"
        />
        <BetaTag />
      </MenuItem>
      {coastmixEnabled && (
        <>
          <MenuSeparator />
          <div className="dropdown-menu-label">
            Coastal resiliency templates
          </div>
          <MenuItem>
            Harborwalk <BetaTag />
          </MenuItem>
        </>
      )}
    </Menu>
  )
}

export default NewStreetMenu
