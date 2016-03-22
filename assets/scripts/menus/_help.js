import Menu from './menu'
import { registerKeypress } from '../app/keypress'
import { trackEvent } from '../app/event_tracking'

let helpMenu = new Menu('help', {
  onShow: () => {
    trackEvent('Interaction', 'Open help menu', null, null, false)
  }
})

registerKeypress('?', { shiftKey: 'optional' }, () => {
  helpMenu.onClick()
})
