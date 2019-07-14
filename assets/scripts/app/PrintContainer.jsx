import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { startPrinting, stopPrinting } from '../store/actions/app'
import { getStreetImage } from '../streets/image'
import './PrintContainer.scss'

class PrintContainer extends React.PureComponent {
  static propTypes = {
    isPrinting: PropTypes.bool.isRequired,
    street: PropTypes.object.isRequired,
    startPrinting: PropTypes.func.isRequired,
    stopPrinting: PropTypes.func.isRequired
  }

  static defaultProps = {
    isPrinting: false
  }

  constructor (props) {
    super(props)

    this.mediaQueryList = null
  }

  /**
   * Add event listeners to handle a print event
   */
  componentDidMount () {
    // Chrome does not have the 'beforeprint' or 'afterprint' events
    window.addEventListener('beforeprint', this.props.startPrinting)
    window.addEventListener('afterprint', this.props.stopPrinting)

    // Listen for media query change on Chrome
    this.mediaQueryList = window.matchMedia('print')
    this.mediaQueryList.addListener(this.mediaQueryChangeHandler)
  }

  /**
   * Clean up event listeners
   */
  componentWillUnmount () {
    window.removeEventListener('beforeprint', this.props.startPrinting)
    window.removeEventListener('afterprint', this.props.stopPrinting)
    this.mediaQueryList.removeListener(this.mediaQueryChangeHandler)
  }

  mediaQueryChangeHandler = (mql) => {
    if (mql.matches) {
      this.props.startPrinting()
    } else {
      this.props.stopPrinting()
    }
  }

  createPrintImage = () => {
    if (this.props.isPrinting) {
      const dataUrl = getStreetImage(this.props.street, true, true, false).toDataURL('image/png')
      return <img src={dataUrl} />
    }

    return null
  }

  render () {
    return (
      <div className="print-container">
        {this.createPrintImage()}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    isPrinting: state.app.printing,
    street: state.street
  }
}

function mapDispatchToProps (dispatch) {
  return {
    startPrinting: () => { dispatch(startPrinting()) },
    stopPrinting: () => { dispatch(stopPrinting()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintContainer)
