import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { openGallery } from '~/src/store/actions/gallery.js'
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
  const dispatch = useDispatch()

  function handleExamples() {
    dispatch(openGallery({ userId: 'examples' }))
  }

  return (
    <Menu {...props}>
      {coastmixEnabled && (
        <>
          <MenuItem
            onClick={() => {
              openTemplate(STREET_TEMPLATES.EMPTY_WATERFRONT)
            }}
          >
            <Icon name="new-street" className="menu-item-icon" />
            <FormattedMessage
              id="coastmix.new-empty"
              defaultMessage="New empty waterfront"
            />
            <Icon name="external-link" />
          </MenuItem>
          <MenuItem onClick={handleExamples} data-tour-id="new-street-examples">
            From examples...
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
