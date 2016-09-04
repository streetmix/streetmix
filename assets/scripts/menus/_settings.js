import Menu from './menu_old'
import { trackEvent } from '../app/event_tracking'

export let settingsMenu = new Menu('settings', {
  alignment: 'right',
  onShow: function () {
    trackEvent('Interaction', 'Open settings menu', null, null, false)
  }
})
