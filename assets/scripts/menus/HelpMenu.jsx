import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from './Menu'
import { registerKeypress } from '../app/keypress'
import { trackEvent } from '../app/event_tracking'
import { t } from '../app/locale'
import { showDialog } from '../store/actions/dialogs'

class HelpMenu extends React.PureComponent {
  static propTypes = {
    showDialog: PropTypes.func.isRequired
  }

  componentDidMount () {
    // TODO: This does not really need to be here?
    registerKeypress('?', { shiftKey: 'optional' }, this.onClickAbout)
  }

  onShow () {
    trackEvent('Interaction', 'Open help menu', null, null, false)
  }

  onClickAbout = () => {
    this.props.showDialog()
  }

  render () {
    return (
      <Menu onShow={this.onShow} {...this.props}>
        <a
          href="#"
          onClick={this.onClickAbout}
        >
          {t('menu.item.about', 'About Streetmix…')}
        </a>

        <div className="form non-touch-only help-menu-shortcuts">
          <p>
            <span>
              {t('menu.help.keyboard-label', 'Keyboard shortcuts:')}
            </span>
          </p>
          <table>
            <tbody>
              <tr>
                <td>
                  <kbd className="key">{t('key.backspace', 'Backspace')}</kbd>
                </td>
                <td dangerouslySetInnerHTML={{ __html: t('menu.help.remove', 'Remove a segment you’re pointing at<br />(hold <kbd class="key">Shift</kbd> to remove all)') }} />
              </tr>
              <tr>
                <td>
                  <kbd className="key">-</kbd>
                  <kbd className="key">+</kbd>
                </td>
                <td dangerouslySetInnerHTML={{ __html: t('menu.help.move', 'Change width of a segment you’re pointing at<br />(hold <kbd class="key">Shift</kbd> for more precision)') }} />
              </tr>
              <tr>
                <td>
                  <kbd className="key">&larr;</kbd>
                  <kbd className="key">&rarr;</kbd>
                </td>
                <td dangerouslySetInnerHTML={{ __html: t('menu.help.change', 'Move around the street<br />(hold <kbd class="key">Shift</kbd> to jump to edges)') }} />
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
