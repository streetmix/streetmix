import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import KeyboardKey from '../ui/KeyboardKey'
import {
  ICON_MINUS,
  ICON_PLUS,
  ICON_ARROW_RIGHT,
  ICON_ARROW_LEFT
} from '../ui/icons'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { showDialog } from '../store/slices/dialogs'
import './HelpMenu.scss'

const shiftKey = (
  <KeyboardKey>
    <FormattedMessage id="key.shift" defaultMessage="Shift" />
  </KeyboardKey>
)

function HelpMenu (props) {
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
      <a href="#" onClick={() => dispatch(showDialog('ABOUT'))}>
        <FormattedMessage
          id="menu.item.about"
          defaultMessage="About Streetmix…"
        />
      </a>
      <a href="#" onClick={() => dispatch(showDialog('WHATS_NEW'))}>
        <FormattedMessage
          id="dialogs.whatsnew.heading"
          defaultMessage="What’s new in Streetmix? [en]&lrm;"
        />
      </a>
      <div className="help-menu-shortcuts">
        <p>
          <FormattedMessage
            id="menu.help.keyboard-label"
            defaultMessage="Keyboard shortcuts:"
          />
        </p>
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
                  {(label) => (
                    <KeyboardKey icon={ICON_MINUS}>{label}</KeyboardKey>
                  )}
                </FormattedMessage>
                <FormattedMessage id="key.plus" defaultMessage="Plus">
                  {(label) => (
                    <KeyboardKey icon={ICON_PLUS}>{label}</KeyboardKey>
                  )}
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
                    <KeyboardKey icon={ICON_ARROW_LEFT}>{label}</KeyboardKey>
                  )}
                </FormattedMessage>
                <FormattedMessage
                  id="key.right-arrow"
                  defaultMessage="Right arrow"
                >
                  {(label) => (
                    <KeyboardKey icon={ICON_ARROW_RIGHT}>{label}</KeyboardKey>
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
