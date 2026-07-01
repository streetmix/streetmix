import { FormattedMessage } from 'react-intl'
import { useShepherd } from 'react-shepherd'

import { useSelector } from '~/src/store/hooks.js'
import { URL_NEW_STREET, STREET_TEMPLATES } from '~/src/app/constants.js'
import { BetaTag } from '~/src/ui/BetaTag.js'
import { Icon } from '~/src/ui/Icon.js'
import Menu, { type MenuProps } from './Menu.js'
import { MenuItem } from './MenuItem.js'
import { MenuSeparator } from './MenuSeparator.js'
import { SignInPromo } from './ShareMenu/SignInPromo.js'

function openTemplate(template: string, tour: boolean = false): void {
  const url =
    `${URL_NEW_STREET}?type=${template}` + (tour ? `&tour=${true}` : '')
  window.open(url, '_blank')
}

export function NewStreetMenu(props: MenuProps) {
  const templatesEnabled = useSelector(
    (state) => state.flags.NEW_STREET_TEMPLATES.value ?? false
  )
  const coastmixEnabled = useSelector(
    (state) => state.flags.COASTMIX_MODE.value ?? false
  )
  const user = useSelector((state) => state.user)
  const Shepherd = useShepherd()

  return (
    <Menu {...props}>
      {coastmixEnabled && (
        <>
          <MenuItem
            onClick={() => {
              // If this menu item is clicked as part of the Coastmix tutorial
              // it will be on step `coastmix-practice-03` and we need to
              // activate the remainder of the steps in the next window
              openTemplate(
                STREET_TEMPLATES.HARBORWALK,
                Shepherd.activeTour?.currentStep.id === 'coastmix-practice-03'
              )
            }}
            data-tour-id="new-street-harborwalk"
          >
            <FormattedMessage
              id="coastmix.templates.harborwalk"
              defaultMessage="Harborwalk"
            />
            <Icon name="external-link" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              openTemplate(STREET_TEMPLATES.COASTAL_ROAD)
            }}
          >
            <FormattedMessage
              id="coastmix.templates.coastal-road"
              defaultMessage="Coastal road"
            />
            <Icon name="external-link" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              openTemplate(STREET_TEMPLATES.BEACH)
            }}
          >
            <FormattedMessage
              id="coastmix.templates.beach"
              defaultMessage="Beach"
            />
            <Icon name="external-link" />
          </MenuItem>
          <MenuSeparator />
        </>
      )}

      {/* Temporarily disable this in Coastmix mode */}
      {!coastmixEnabled && (
        <>
          {' '}
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
        </>
      )}
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
          <div className="dropdown-menu-label" role="presentation">
            <FormattedMessage
              id="menu.new-street.templates-label"
              defaultMessage="Street templates"
            />
            <BetaTag />
          </div>
          <MenuItem
            disabled={!user.signedIn}
            onClick={() => {
              openTemplate(STREET_TEMPLATES.STROAD)
            }}
          >
            <FormattedMessage
              id="menu.new-street.templates.stroad"
              defaultMessage="Stroad"
            />
            <Icon name="external-link" />
          </MenuItem>
          {!user.signedIn && <SignInPromo type="template" />}
        </>
      )}
    </Menu>
  )
}
