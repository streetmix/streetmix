import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { TILE_SIZE } from '../segments/constants'

class StreetEditable extends React.Component {
  static propTypes = {
    onResized: PropTypes.bool.isRequired,
    setBuildingWidth: PropTypes.func.isRequired,
    street: PropTypes.object.isRequired
  }

  componentDidUpdate (prevProps) {
    const { onResized } = this.props

    if (onResized && prevProps.onResized !== onResized) {
      this.props.setBuildingWidth(this.streetSectionEditable)
    }
  }

  render () {
    const style = {
      width: (this.props.street.width * TILE_SIZE) + 'px'
    }

    return (
      <div id="street-section-editable" style={style} ref={(ref) => { this.streetSectionEditable = ref }} />
    )
  }
}

function mapStateToProps (state) {
  return {
    street: state.street
  }
}

export default connect(mapStateToProps)(StreetEditable)
