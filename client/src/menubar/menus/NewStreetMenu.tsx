import { FormattedMessage } from 'react-intl'

import { useSelector } from '~/src/store/hooks.js'
import { URL_NEW_STREET, STREET_TEMPLATES } from '~/src/app/constants.js'
import Icon from '~/src/ui/Icon.js'
import Menu, { type MenuProps } from './Menu.js'
import { MenuItem } from './MenuItem.js'
import { MenuSeparator } from './MenuSeparator.js'
import { BetaTag } from './BetaTag.js'
import { SignInPromo } from './ShareMenu/SignInPromo.js'

function openTemplate(template: string): void {
  const url = `${URL_NEW_STREET}?type=${template}`
  window.open(url, '_blank')
}

export function NewStreetMenu(props: MenuProps) {
  const templatesEnabled = useSelector(
    (state) => state.flags.NEW_STREET_TEMPLATES.value
  )
  const coastmixEnabled = useSelector(
    (state) => state.flags.COASTMIX_MODE.value
  )
  const user = useSelector((state) => state.user)

  return (
    <Menu {...props}>
      <MenuItem
        onClick={() => {
          openTemplate(STREET_TEMPLATES.DEFAULT)
        }}
      >
        <Icon name="new-street" className="menu-item-icon" />
        <FormattedMessage
          id="menu.new-street.default"
          defaultMessage="New example street"
        />
        <Icon name="external-link" />
      </MenuItem>
      <MenuItem
        onClick={() => {
          openTemplate(STREET_TEMPLATES.EMPTY)
        }}
      >
        <FormattedMessage
          id="menu.new-street.empty"
          defaultMessage="New empty street"
        />
        <Icon name="external-link" />
      </MenuItem>
      <MenuItem
        onClick={() => {
          openTemplate(STREET_TEMPLATES.COPY)
        }}
      >
        <Icon name="copy" className="menu-item-icon" />
        <FormattedMessage
          id="menu.new-street.copy"
          defaultMessage="Make a copy"
        />
        <Icon name="external-link" />
      </MenuItem>
      {/* <MenuSeparator />
      <MenuItem>
        <Icon name="template" className="menu-item-icon" />
        <FormattedMessage
          id="menu.new-street.template"
          defaultMessage="New from template…"
        />
        <BetaTag />
      </MenuItem> */}
      {/* Temporarily disable this in Coastmix mode */}
      {templatesEnabled && !coastmixEnabled && (
        <>
          <MenuSeparator />
          <div className="dropdown-menu-label">
            Street templates
            <BetaTag />
          </div>
          <MenuItem
            disabled={!user.signedIn}
            onClick={() => {
              openTemplate(STREET_TEMPLATES.STROAD)
            }}
          >
            Stroad
            <Icon name="external-link" />
          </MenuItem>
          {!user.signedIn && <SignInPromo type="template" />}
        </>
      )}
      {coastmixEnabled && (
        <>
          <MenuSeparator />
          <div className="dropdown-menu-label">
            Coastal resiliency templates
            <BetaTag />
          </div>
          <MenuItem
            onClick={() => {
              openTemplate(STREET_TEMPLATES.HARBORWALK)
            }}
          >
            Harborwalk
            <Icon name="external-link" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              openTemplate(STREET_TEMPLATES.COASTAL_ROAD)
            }}
          >
            Coastal road
            <Icon name="external-link" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              openTemplate(STREET_TEMPLATES.BEACH)
            }}
          >
            Beach
            <Icon name="external-link" />
          </MenuItem>
        </>
      )}
    </Menu>
  )
}
