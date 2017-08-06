import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

class DebugHoverPolygon extends React.PureComponent {
  shouldComponentUpdate () {
    if (this.props.enabled === false) return false
  }

  render () {
    if (this.props.enabled === false) return null

    return (
      <div id='debug-hover-polygon'>
        <canvas width={window.innerWidth} height={window.innerHeight} />
      </div>
    )
  }
}

DebugHoverPolygon.propTypes = {
  enabled: PropTypes.bool
}

DebugHoverPolygon.defaultProps = {
  enabled: false
}

function mapStateToProps (state) {
  return {
    enabled: state.debug.hoverPolygon
  }
}

export default connect(mapStateToProps)(DebugHoverPolygon)
