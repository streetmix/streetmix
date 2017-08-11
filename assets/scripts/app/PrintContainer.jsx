import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { attachPrintEventListeners } from './print'
import { getStreetImage } from '../streets/image'

class PrintContainer extends React.PureComponent {
  constructor (props) {
    super(props)

    this.createPrintImage = this.createPrintImage.bind(this)
  }

  componentDidMount () {
    attachPrintEventListeners()
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
  isPrinting: PropTypes.bool.isRequired
}

PrintContainer.defaultProps = {
  isPrinting: false
}

function mapStateToProps (state) {
  return {
    isPrinting: state.app.printing
  }
}

export default connect(mapStateToProps)(PrintContainer)
