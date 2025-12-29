import { FormattedMessage } from 'react-intl'

import Icon from '~/src/ui/Icon.js'
import { KeyboardKey } from '~/src/ui/KeyboardKey.js'
import './KeyboardShortcuts.css'

const shiftKey = (
  <KeyboardKey>
    <FormattedMessage id="key.shift" defaultMessage="Shift" />
  </KeyboardKey>
)

export function KeyboardShortcuts() {
  return (
    <div className="keyboard-shortcuts">
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
            <td>
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
            <td>
              {/* Keep arrows in the same order in all language directions */}
              <span dir="ltr">
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
              </span>
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
  )
}
