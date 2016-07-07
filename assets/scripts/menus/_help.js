import Menu from './menu'
import React from 'react'
import ReactDOM from 'react-dom'
import AboutDialog from '../dialogs/_about'
import { registerKeypress } from '../app/keypress'
import { trackEvent } from '../app/event_tracking'

let helpMenu = new Menu('help', {
  init: () => {
    // Attach React trigger here.
    document.querySelector('#about-streetmix').addEventListener('pointerdown', _mountReactComponent)

    function _mountReactComponent (event) {
      event.preventDefault()
      const mountNode = document.getElementById('dialogs-react')
      ReactDOM.render(<AboutDialog />, mountNode)
    }
  },
  onShow: () => {
    trackEvent('Interaction', 'Open help menu', null, null, false)
  }
})

registerKeypress('?', { shiftKey: 'optional' }, () => {
  helpMenu.onClick()
})
