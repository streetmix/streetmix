import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { attachPrintEventListeners } from './print'
import { getStreetImage } from '../streets/image'

class PrintContainer extends React.PureComponent {
  static propTypes = {
    isPrinting: PropTypes.bool.isRequired,
    street: PropTypes.object.isRequired
  }

  static defaultProps = {
    isPrinting: false
  }

  componentDidMount () {
    attachPrintEventListeners()
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

export default connect(mapStateToProps)(PrintContainer)
