import { infoBubble } from '../info_bubble/info_bubble'
import { hideAllMenus } from '../menus/menu_controller'

export function printImage (event) {
  event.preventDefault()

  hideAllMenus()
  infoBubble.hide()
  infoBubble.hideSegment(true)

  window.setTimeout(function () {
    window.print()
  }, 50)
}
