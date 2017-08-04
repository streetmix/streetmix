import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { startPrinting, stopPrinting } from '../store/actions/app'
import { getStreetImage } from '../streets/image'

class PrintContainer extends React.PureComponent {
  constructor (props) {
    super(props)

    this.createPrintImage = this.createPrintImage.bind(this)
  }

  componentDidMount () {
    // Add event listeners
    // Chrome does not have the 'beforeprint' or 'afterprint' events
    window.addEventListener('beforeprint', () => {
      this.props.startPrinting()
    })
    window.addEventListener('afterprint', () => {
      this.props.stopPrinting()
    })

    // Listening for media query change for Chrome
    const mediaQueryList = window.matchMedia('print')
    mediaQueryList.addListener((mql) => {
      if (mql.matches) {
        this.props.startPrinting()
      } else {
        this.props.stopPrinting()
      }
    })
  }

  createPrintImage () {
    if (this.props.isPrinting) {
      const dataUrl = getStreetImage(true, true).toDataURL('image/png')
      return <img src={dataUrl} />
    }

    return null
  }

  render () {
    return (
      <div id='print' className='print-container'>
        {this.createPrintImage()}
      </div>
    )
  }
}

PrintContainer.propTypes = {
  isPrinting: PropTypes.bool.isRequired,
  startPrinting: PropTypes.func.isRequired,
  stopPrinting: PropTypes.func.isRequired
}

PrintContainer.defaultProps = {
  isPrinting: false
}

function mapStateToProps (state) {
  return {
    isPrinting: state.app.printing
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ startPrinting, stopPrinting }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintContainer)
