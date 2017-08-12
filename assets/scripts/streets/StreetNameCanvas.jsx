import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import StreetName from './StreetName'
import StreetMetaData from './StreetMetaData'
import { getStreet, setAndSaveStreet } from './data_model'
import { msg } from '../app/messages'
import { updateStreetName } from './name'

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

    this.lastSentCoords = null

    this.updateCoords = this.updateCoords.bind(this)
    this.streetUpdated = this.streetUpdated.bind(this)
    this.updatePositions = this.updatePositions.bind(this)
    this.handleResizeStreetName = this.handleResizeStreetName.bind(this)
    this.onClickStreetName = this.onClickStreetName.bind(this)
  }

  componentDidMount () {
    window.addEventListener('resize', this.updateCoords)
    window.addEventListener('stmx:set_street', this.streetUpdated)
    window.addEventListener('stmx:width_updated', this.streetUpdated)
    window.addEventListener('stmx:menu_bar_resized', this.updatePositions)
    window.dispatchEvent(new CustomEvent('stmx:streetnamecanvas_mounted'))
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateCoords)
    window.removeEventListener('stmx:set_street', this.streetUpdated)
    window.removeEventListener('stmx:width_updated', this.streetUpdated)
    window.removeEventListener('stmx:menu_bar_resized', this.updatePositions)
  }

  componentDidUpdate (nextProps, nextState) {
    this.updateCoords()
  }

  streetUpdated (e) {
    const street = getStreet()
    this.setState({street})
  }

  handleResizeStreetName (coords) {
    this.setState({
      streetNameLeftPos: coords.left,
      streetNameWidth: coords.width
    })
  }

  updateCoords () {
    const rect = this.streetName.getBoundingClientRect()
    const coords = {
      left: rect.left,
      width: rect.width
    }
    if (!this.lastSentCoords || coords.left !== this.lastSentCoords.left || coords.width !== this.lastSentCoords.width) {
      this.lastSentCoords = coords
      this.handleResizeStreetName(coords)
    }
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

  onClickStreetName () {
    if (!this.props.editable) return

    const newName = window.prompt(msg('PROMPT_NEW_STREET_NAME'), this.state.street.name)

    if (newName) {
      const street = Object.assign({}, this.state.street)
      street.name = StreetName.normalizeStreetName(newName)
      setAndSaveStreet(street)
      updateStreetName()
    }
  }

  render () {
    return (
      <div id="street-name-canvas" className={this.determineClassNames().join(' ')}>
        <StreetName
          id="street-name"
          ref={(ref) => { this.streetName = ref }}
          name={this.state.street.name}
          onClick={this.onClickStreetName}
        />
        <StreetMetaData id="street-metadata" street={this.state.street} />
      </div>
    )
  }
}

StreetNameCanvas.propTypes = {
  editable: PropTypes.bool
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
