import React from 'react'
import ReactDOM from 'react-dom'
import Menu from './Menu'
import AboutDialog from '../dialogs/AboutDialog'
import { registerKeypress } from '../app/keypress'
import { trackEvent } from '../app/event_tracking'
import { t } from '../app/locale'

export default class HelpMenu extends React.PureComponent {
  componentDidMount () {
    // TODO: This does not really need to be here?
    registerKeypress('?', { shiftKey: 'optional' }, () => {
      this.onClickAbout()
    })
  }

  onShow () {
    trackEvent('Interaction', 'Open help menu', null, null, false)
  }

  onClickAbout () {
    const mountNode = document.getElementById('dialogs-react')
    ReactDOM.render(<AboutDialog />, mountNode)
  }

  render () {
    return (
      <Menu name='help' onShow={this.onShow} {...this.props}>
        <a
          href='#'
          data-i18n='menu.item.about'
          onClick={this.onClickAbout}
        >
          About Streetmix…
        </a>

        <div className='form non-touch-only help-menu-shortcuts'>
          <p>
            <span data-i18n='menu.help.keyboard-label'>
              Keyboard shortcuts:
            </span>
          </p>
          <table>
            <tbody>
              <tr>
                <td>
                  <span className='key' data-i18n='key.backspace'>Backspace</span>
                </td>
                <td>
                  Remove a segment you’re pointing at<br />
                  (hold <span className='key'>Shift</span> to remove all)
                </td>
              </tr>
              <tr>
                <td>
                  <span className='key'>-</span>
                  <span className='key'>+</span>
                </td>
                <td>
                  Change width of a segment you’re pointing at<br />
                  (hold <span className='key'>Shift</span> for more precision)
                </td>
              </tr>
              <tr>
                <td>
                  <span className='key'>&larr;</span>
                  <span className='key'>&rarr;</span>
                </td>
                <td>
                  Move around the street
                  (hold <span className='key'>Shift</span> to jump to edges)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Menu>
    )
  }
}
