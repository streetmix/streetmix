import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import Menu from './Menu'
import { registerKeypress } from '../app/keypress'
import { trackEvent } from '../app/event_tracking'
import { showDialog } from '../store/actions/dialogs'

export class HelpMenu extends React.PureComponent {
  static propTypes = {
    showDialog: PropTypes.func.isRequired
  }

  componentDidMount () {
    // Set up keyboard shortcuts
    registerKeypress('?', { shiftKey: 'optional' }, this.props.showDialog)
  }

  onShow () {
    trackEvent('Interaction', 'Open help menu', null, null, false)
  }

  render () {
    return (
      <Menu onShow={this.onShow} {...this.props}>
        <a
          href="#"
          onClick={this.props.showDialog}
        >
          <FormattedMessage id="menu.item.about" defaultMessage="About Streetmix…" />
        </a>

        <div className="form non-touch-only help-menu-shortcuts">
          <p>
            <FormattedMessage id="menu.help.keyboard-label" defaultMessage="Keyboard shortcuts:" />
          </p>
          <table>
            <tbody>
              <tr>
                <td>
                  <kbd className="key"><FormattedMessage id="key.backspace" defaultMessage="Backspace" /></kbd>
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
                  <kbd className="key">-</kbd>
                  <kbd className="key">+</kbd>
                </td>
                <td>
                  <FormattedHTMLMessage
                    id="menu.help.change"
                    defaultMessage="Move around the street<br />(hold <kbd class='key'>Shift</kbd> to jump to edges)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <kbd className="key">&larr;</kbd>
                  <kbd className="key">&rarr;</kbd>
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

function mapDispatchToProps (dispatch) {
  return {
    showDialog: () => { dispatch(showDialog('ABOUT')) }
  }
}

export default connect(null, mapDispatchToProps)(HelpMenu)
