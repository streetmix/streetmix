import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import {
  URL_NEW_STREET_COPY_LAST,
  URL_NEW_STREET_DEFAULT,
  URL_NEW_STREET_EMPTY
} from '~/src/app/constants'
import Icon from '~/src/ui/Icon'
import Menu, { type MenuProps } from './Menu'
import MenuItem from './MenuItem'
import MenuSeparator from './MenuSeparator'
import BetaTag from './BetaTag'

function NewStreetMenu (props: MenuProps): React.ReactElement {
  const coastmixEnabled = useSelector(
    (state) => state.flags.COASTMIX_MODE.value
  )

  function handleNewExampleStreet (): void {
    window.open(URL_NEW_STREET_DEFAULT, '_blank')
  }

  function handleNewEmptyStreet (): void {
    window.open(URL_NEW_STREET_EMPTY, '_blank')
  }

  function handleCopyStreet (): void {
    window.open(URL_NEW_STREET_COPY_LAST, '_blank')
  }

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
      <MenuItem onClick={handleCopyStreet}>
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
