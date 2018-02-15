import { infoBubble } from '../info_bubble/info_bubble'
import store from '../store'
import { clearMenus } from '../store/actions/menus'
import { startPrinting, stopPrinting } from '../store/actions/app'

export function attachPrintEventListeners () {
  // Add event listeners
  // Chrome does not have the 'beforeprint' or 'afterprint' events
  window.addEventListener('beforeprint', () => {
    store.dispatch(startPrinting())
  })
  window.addEventListener('afterprint', () => {
    store.dispatch(stopPrinting())
  })

  // Listening for media query change for Chrome
  const mediaQueryList = window.matchMedia('print')
  mediaQueryList.addListener((mql) => {
    if (mql.matches) {
      store.dispatch(startPrinting())
    } else {
      store.dispatch(stopPrinting())
    }
  })
}

export function printImage (event) {
  event.preventDefault()

  store.dispatch(clearMenus())
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
