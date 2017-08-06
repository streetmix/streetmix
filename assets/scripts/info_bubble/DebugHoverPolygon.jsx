import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

class DebugHoverPolygon extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.updateDimensions = this.updateDimensions.bind(this)

    window.addEventListener('resize', this.updateDimensions)
  }

  shouldComponentUpdate () {
    return this.props.enabled
  }

  updateDimensions (event) {
    if (this.props.enabled === false) return

    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  render () {
    if (this.props.enabled === false) return null

    return (
      <div id='debug-hover-polygon'>
        <canvas
          width={this.state.width}
          height={this.state.height}
        />
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
