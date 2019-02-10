import React from 'react'
import './Flash.scss'

export default class Flash extends React.PureComponent {
  componentDidMount () {
    window.addEventListener('stmx:live_update', (event) => {
      this.flash()
    })
  }

  flash () {
    this.el.classList.add('flash-visible')

    window.setTimeout(() => {
      this.el.classList.add('flash-fading-out')
    }, 100)

    window.setTimeout(() => {
      this.el.classList.remove('flash-visible')
      this.el.classList.remove('flash-fading-out')
    }, 1000)
  }

  render () {
    return <div className="flash" ref={(ref) => { this.el = ref }} />
  }
}
