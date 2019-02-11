import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedHTMLMessage, injectIntl, intlShape } from 'react-intl'
import Menu from './Menu'
import KeyboardKey from '../ui/KeyboardKey'
import {
  ICON_MINUS,
  ICON_PLUS,
  ICON_ARROW_RIGHT,
  ICON_ARROW_LEFT
} from '../ui/icons'
import { registerKeypress } from '../app/keypress'
import { trackEvent } from '../app/event_tracking'
import { showDialog } from '../store/actions/dialogs'
import './HelpMenu.scss'

class HelpMenu extends React.PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    showAboutDialog: PropTypes.func,
    showWhatsNewDialog: PropTypes.func
  }

  componentDidMount () {
    // Set up keyboard shortcuts
    registerKeypress('?', { shiftKey: 'optional' }, this.props.showAboutDialog)
  }

  onShow () {
    trackEvent('Interaction', 'Open help menu', null, null, false)
  }

  render () {
    return (
      <Menu onShow={this.onShow} {...this.props}>
        <a
          href="#"
          onClick={this.props.showAboutDialog}
        >
          <FormattedMessage id="menu.item.about" defaultMessage="About Streetmix…" />
        </a>
        <a
          href="#"
          onClick={this.props.showWhatsNewDialog}
        >
          <FormattedMessage id="dialogs.whatsnew.heading" defaultMessage="What’s new in Streetmix? [en]&lrm;" />
        </a>
        <div className="form non-touch-only help-menu-shortcuts">
          <p>
            <FormattedMessage id="menu.help.keyboard-label" defaultMessage="Keyboard shortcuts:" />
          </p>
          <table>
            <tbody>
              <tr>
                <td>
                  <KeyboardKey>
                    <FormattedMessage id="key.backspace" defaultMessage="Backspace" />
                  </KeyboardKey>
                </td>
                <td>
                  <FormattedHTMLMessage
                    id="menu.help.remove"
                    defaultMessage="Remove a segment you’re pointing at<br />(hold <kbd class='key'>Shift</kbd> to remove all)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  {/* <FormattedMessage> used with render prop because we pass the translated
                      text to <KeyboardKey> as a string, not as a component */}
                  <FormattedMessage id="key.minus" defaultMessage="Minus">
                    {(label) => <KeyboardKey icon={ICON_MINUS} label={label} />}
                  </FormattedMessage>
                  <FormattedMessage id="key.plus" defaultMessage="Plus">
                    {(label) => <KeyboardKey icon={ICON_PLUS} label={label} />}
                  </FormattedMessage>
                </td>
                <td>
                  {/* Note: the keyboard keys are currently hard-coded into the translation text. */}
                  <FormattedHTMLMessage
                    id="menu.help.change"
                    defaultMessage="Move around the street<br />(hold <kbd class='key'>Shift</kbd> to jump to edges)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <FormattedMessage id="key.left-arrow" defaultMessage="Left arrow">
                    {(label) => <KeyboardKey icon={ICON_ARROW_LEFT} label={label} />}
                  </FormattedMessage>
                  <FormattedMessage id="key.right-arrow" defaultMessage="Right arrow">
                    {(label) => <KeyboardKey icon={ICON_ARROW_RIGHT} label={label} />}
                  </FormattedMessage>
                </td>
                <td>
                  <FormattedHTMLMessage
                    id="menu.help.move"
                    defaultMessage="Change width of a segment you’re pointing at<br />(hold <kbd class='key'>Shift</kbd> for more precision)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Menu>
    )
  }
}

// Inject Intl via a higher-order component provided by react-intl.
// Exported so that this component can be tested.
export const HelpMenuWithIntl = injectIntl(HelpMenu)

function mapDispatchToProps (dispatch) {
  return {
    showAboutDialog: () => { dispatch(showDialog('ABOUT')) },
    showWhatsNewDialog: () => { dispatch(showDialog('WHATS_NEW')) }
  }
}

export default connect(null, mapDispatchToProps)(HelpMenuWithIntl)
