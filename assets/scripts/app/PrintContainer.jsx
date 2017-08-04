import React from 'react'
import { getStreetImage } from '../streets/image'

export default class PrintContainer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isPrinting: false
    }

    this.createPrintImage = this.createPrintImage.bind(this)
  }

  componentDidMount () {
    // Add event listeners
    // Chrome does not have the 'beforeprint' or 'afterprint' events
    window.addEventListener('beforeprint', () => {
      this.setState({ isPrinting: true })
    })
    window.addEventListener('afterprint', () => {
      this.setState({ isPrinting: false })
    })

    // Listening for media query change for Chrome
    var mediaQueryList = window.matchMedia('print')
    mediaQueryList.addListener((mql) => {
      if (mql.matches) {
        this.setState({ isPrinting: true })
      } else {
        this.setState({ isPrinting: false })
      }
    })
  }

  createPrintImage () {
    const dataUrl = getStreetImage(true, true).toDataURL('image/png')

    return (this.state.isPrinting) ? <img src={dataUrl} /> : null
  }

  render () {
    return (
      <div id='print' className='print-container'>
        {this.createPrintImage()}
      </div>
    )
  }
}
