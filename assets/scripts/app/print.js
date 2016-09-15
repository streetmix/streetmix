import { infoBubble } from '../info_bubble/info_bubble'
import { getStreetImage } from '../streets/image'
import { hideAllMenus } from '../menus/menu_controller'

class Print
{
  attachEventListeners () {
    var self = this
    // Add event listeners
    // Chrome does not have the 'beforeprint' or 'afterprint' events
    window.addEventListener('beforeprint', () => {
      self.onBeforePrint(false)
    })

    // Listening for media query change for Chrome
    var mediaQueryList = window.matchMedia('print')
    mediaQueryList.addListener(function (mql) {
      if (mql.matches) {
        self.onBeforePrint(true)
      }
    })
  }

  updatePrintImage () {
    document.querySelector('#print > div').innerHTML = ''

    var el = getStreetImage(true, true)
    var dataUrl = el.toDataURL('image/png')

    var imgEl = document.createElement('img')
    imgEl.src = dataUrl
    document.querySelector('#print > div').appendChild(imgEl)
  }

  onBeforePrint (mediaMatch) {
    // So that max-height: 100% works
    if (mediaMatch) {
      document.querySelector('#print > div').style.width = window.innerWidth + 'px'
      document.querySelector('#print > div').style.height = window.innerHeight + 'px'
    }

    this.updatePrintImage()

    if (!mediaMatch) {
      document.querySelector('#print > div > img').style.width = '100%'
    }
  }

  printImage (event) {
    event.preventDefault()

    hideAllMenus()
    infoBubble.hide()
    infoBubble.hideSegment(true)

    window.setTimeout(function () {
      window.print()
    }, 50)
  }
}

export default new Print()
