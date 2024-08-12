import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { showDialog } from '~/src/store/slices/dialogs'
import ExternalLink from '~/src/ui/ExternalLink'
import Icon from '~/src/ui/Icon'
import KeyboardKey from '~/src/ui/KeyboardKey'
import { registerKeypress, deregisterKeypress } from '~/src/app/keypress'
import Menu, { type MenuProps } from './Menu'
import MenuSeparator from './MenuSeparator'
import './HelpMenu.css'

const shiftKey = (
  <KeyboardKey>
    <FormattedMessage id="key.shift" defaultMessage="Shift" />
  </KeyboardKey>
)

function HelpMenu (props: MenuProps): React.ReactElement {
  const offline = useSelector((state) => state.system.offline)
  const dispatch = useDispatch()

  useEffect(() => {
    // Set up keyboard shortcuts
    registerKeypress('?', { shiftKey: 'optional' }, () =>
      dispatch(showDialog('ABOUT'))
    )

    return () => {
      deregisterKeypress('?', () => dispatch(showDialog('ABOUT')))
    }
  })

  return (
    <Menu {...props}>
      <a onClick={() => dispatch(showDialog('ABOUT'))}>
        <Icon name="info" className="menu-item-icon" />
        <FormattedMessage
          id="menu.item.about"
          defaultMessage="About Streetmix…"
        />
      </a>
      <a onClick={() => dispatch(showDialog('WHATS_NEW'))}>
        <Icon name="rocket" className="menu-item-icon" />
        <FormattedMessage
          id="menu.item.whatsnew"
          defaultMessage="What’s new?&lrm;"
        />
      </a>
      {!offline && (
        <>
          <ExternalLink
            href="https://docs.streetmix.net/user-guide/intro"
            icon={true}
          >
            <Icon name="trail-sign" className="menu-item-icon" />
            <FormattedMessage
              id="menu.help.guidebook-link"
              defaultMessage="Guidebook"
            />
          </ExternalLink>
          <MenuSeparator />
          <ExternalLink
            href="https://cottonbureau.com/people/streetmix"
            icon={true}
          >
            <Icon name="cart" className="menu-item-icon" />
            <FormattedMessage id="menu.item.store" defaultMessage="Store" />
          </ExternalLink>
        </>
      )}
      <MenuSeparator />
      <div className="help-menu-shortcuts">
        <Icon name="keyboard" className="menu-item-icon" />
        <FormattedMessage
          id="menu.help.keyboard-label"
          defaultMessage="Keyboard shortcuts:"
        />
        <table>
          <tbody>
            <tr>
              <td>
                <KeyboardKey>
                  <FormattedMessage
                    id="key.backspace"
                    defaultMessage="Backspace"
                  />
                </KeyboardKey>
              </td>
              <td>
                <FormattedMessage
                  id="menu.help.remove-instruction"
                  defaultMessage="Remove a segment you’re pointing at"
                />
                <br />
                <FormattedMessage
                  id="menu.help.remove-shift-instruction"
                  defaultMessage="(hold {shiftKey} to remove all)&lrm;"
                  values={{ shiftKey }}
                />
              </td>
            </tr>
            <tr>
              <td dir="ltr">
                {/*
                  <FormattedMessage> is used with a render prop because we need
                  to pass a string child to <KeyboardKey /> when the `icon`
                  prop is used. <KeyboardKey /> will not render correctly if
                  the child is a React component.
                */}
                <FormattedMessage id="key.minus" defaultMessage="Minus">
                  {(label) => <KeyboardKey icon="minus">{label}</KeyboardKey>}
                </FormattedMessage>
                <FormattedMessage id="key.plus" defaultMessage="Plus">
                  {(label) => <KeyboardKey icon="plus">{label}</KeyboardKey>}
                </FormattedMessage>
              </td>
              <td>
                <FormattedMessage
                  id="menu.help.change-instruction"
                  defaultMessage="Change width of a segment you’re pointing at"
                />
                <br />
                <FormattedMessage
                  id="menu.help.change-shift-instruction"
                  defaultMessage="(hold {shiftKey} for more precision)&lrm;"
                  values={{ shiftKey }}
                />
              </td>
            </tr>
            <tr>
              <td dir="ltr">
                <FormattedMessage
                  id="key.left-arrow"
                  defaultMessage="Left arrow"
                >
                  {(label) => (
                    <KeyboardKey icon="arrow-left">{label}</KeyboardKey>
                  )}
                </FormattedMessage>
                <FormattedMessage
                  id="key.right-arrow"
                  defaultMessage="Right arrow"
                >
                  {(label) => (
                    <KeyboardKey icon="arrow-right">{label}</KeyboardKey>
                  )}
                </FormattedMessage>
              </td>
              <td>
                <FormattedMessage
                  id="menu.help.move-instruction"
                  defaultMessage="Move around the street"
                />
                <br />
                <FormattedMessage
                  id="menu.help.move-shift-instruction"
                  defaultMessage="(hold {shiftKey} to jump to edges)&lrm;"
                  values={{ shiftKey }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Menu>
  )
}

export default HelpMenu
