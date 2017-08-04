import { infoBubble } from '../info_bubble/info_bubble'
import { hideAllMenus } from '../menus/menu_controller'
import store from '../store'
import { startPrinting } from '../store/actions/app'

export function printImage (event) {
  event.preventDefault()

  hideAllMenus()
  infoBubble.hide()
  infoBubble.hideSegment(true)

  // Manually dispatch printing state here. Workaround for Chrome bug where
  // calling window.print() programatically (even with a timeout) render a
  // blank image instead
  store.dispatch(startPrinting())

  window.setTimeout(function () {
    window.print()
  }, 0)
}
