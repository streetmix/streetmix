import React from 'react'

export default class Flash extends React.PureComponent {
  componentDidMount () {
    window.addEventListener('stmx:live_update', (event) => {
      this.flash()
    })
  }

  flash () {
    this.el.classList.add('visible')

    window.setTimeout(() => {
      this.el.classList.add('fading-out')
    }, 100)

    window.setTimeout(() => {
      this.el.classList.remove('visible')
      this.el.classList.remove('fading-out')
    }, 1000)
  }

  render () {
    return <div className="flash" ref={(ref) => { this.el = ref }} />
  }
}
