import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from './Menu'
import { registerKeypress } from '../app/keypress'
import { trackEvent } from '../app/event_tracking'
import { t } from '../app/locale'
import { SHOW_DIALOG } from '../store/actions'

class HelpMenu extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired
  }

  componentDidMount () {
    // TODO: This does not really need to be here?
    registerKeypress('?', { shiftKey: 'optional' }, () => {
      this.onClickAbout()
    })
  }

  onShow () {
    trackEvent('Interaction', 'Open help menu', null, null, false)
  }

  onClickAbout = () => {
    this.props.dispatch({
      type: SHOW_DIALOG,
      name: 'ABOUT'
    })
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
                  <span className="key">{t('key.backspace', 'Backspace')}</span>
                </td>
                <td dangerouslySetInnerHTML={{ __html: t('menu.help.remove', 'Remove a segment you’re pointing at<br />(hold <span class="key">Shift</span> to remove all)') }} />
              </tr>
              <tr>
                <td>
                  <span className="key">-</span>
                  <span className="key">+</span>
                </td>
                <td dangerouslySetInnerHTML={{ __html: t('menu.help.move', 'Change width of a segment you’re pointing at<br />(hold <span class="key">Shift</span> for more precision)') }} />
              </tr>
              <tr>
                <td>
                  <span className="key">&larr;</span>
                  <span className="key">&rarr;</span>
                </td>
                <td dangerouslySetInnerHTML={{ __html: t('menu.help.change', 'Move around the street(hold <span class="key">Shift</span> to jump to edges)') }} />
              </tr>
            </tbody>
          </table>
        </div>
      </Menu>
    )
  }
}

export default connect()(HelpMenu)
