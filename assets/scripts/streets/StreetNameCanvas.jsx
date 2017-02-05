import React from 'react'
import { connect } from 'react-redux'
import StreetName from './StreetName'
import StreetMetaData from './StreetMetaData'
import { getStreet } from './data_model'

class StreetNameCanvas extends React.Component {
  constructor (props) {
    super(props)

    const street = getStreet()
    this.state = {
      street: street,
      rightMenuBarLeftPos: 0,
      streetNameLeftPos: 0,
      streetNameWidth: 0
    }

    this.streetUpdated = this.streetUpdated.bind(this)
    this.updatePositions = this.updatePositions.bind(this)
    this.onResizeStreetName = this.onResizeStreetName.bind(this)
  }

  componentDidMount () {
    window.addEventListener('stmx:set_street', this.streetUpdated)
    window.addEventListener('stmx:width_updated', this.streetUpdated)
    window.addEventListener('stmx:menu_bar_resized', this.updatePositions)
    window.dispatchEvent(new CustomEvent('stmx:streetnamecanvas_mounted'))
  }

  componentWillUnmount () {
    window.removeEventListener('stmx:set_street', this.streetUpdated)
    window.removeEventListener('stmx:width_updated', this.streetUpdated)
    window.removeEventListener('stmx:menu_bar_resized', this.updatePositions)
  }

  streetUpdated (e) {
    const street = getStreet()
    this.setState({street})
  }

  onResizeStreetName (coords) {
    this.setState({
      streetNameLeftPos: coords.left,
      streetNameWidth: coords.width
    })
  }

  updatePositions (event) {
    if (event.detail && event.detail.rightMenuBarLeftPos) {
      this.setState({
        rightMenuBarLeftPos: event.detail.rightMenuBarLeftPos
      })
    }
  }

  determineClassNames () {
    const classNames = []
    if (this.state.streetNameLeftPos + this.state.streetNameWidth > this.state.rightMenuBarLeftPos) {
      classNames.push('move-down-for-menu')
    }
    return classNames
  }

  render () {
    return (
      <div id='street-name-canvas' className={this.determineClassNames().join(' ')}>
        <StreetName
          id='street-name'
          ref={(ref) => { this.streetName = ref }}
          street={this.state.street}
          editable={this.props.editable}
          handleResize={this.onResizeStreetName}
        />
        <StreetMetaData id='street-metadata' street={this.state.street} />
      </div>
    )
  }
}

StreetNameCanvas.propTypes = {
  editable: React.PropTypes.bool
}

StreetNameCanvas.defaultProps = {
  editable: true
}

function mapStateToProps (state) {
  return {
    editable: !state.app.readOnly
  }
}

export default connect(mapStateToProps)(StreetNameCanvas)
