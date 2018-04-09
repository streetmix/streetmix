import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import StreetName from './StreetName'
import StreetMeta from './StreetMeta'
import { saveStreetName } from '../store/actions/street'

class StreetNameCanvas extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    editable: PropTypes.bool,
    street: PropTypes.object,
    saveStreetName: PropTypes.func
  }

  static defaultProps = {
    visible: true,
    editable: true
  }

  constructor (props) {
    super(props)

    this.state = {
      rightMenuBarLeftPos: 0,
      streetNameLeftPos: 0,
      streetNameWidth: 0
    }

    this.lastSentCoords = null
  }

  componentDidMount () {
    window.addEventListener('resize', this.updateCoords)
    window.addEventListener('stmx:menu_bar_resized', this.updatePositions)
    window.dispatchEvent(new CustomEvent('stmx:streetnamecanvas_mounted'))
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateCoords)
    window.removeEventListener('stmx:menu_bar_resized', this.updatePositions)
  }

  componentDidUpdate (nextProps, nextState) {
    this.updateCoords()
  }

  handleResizeStreetName = (coords) => {
    this.setState({
      streetNameLeftPos: coords.left,
      streetNameWidth: coords.width
    })
  }

  updateCoords = () => {
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

  updatePositions = (event) => {
    if (event.detail && event.detail.rightMenuBarLeftPos) {
      this.setState({
        rightMenuBarLeftPos: event.detail.rightMenuBarLeftPos
      })
    }
  }

  determineClassNames = () => {
    const classNames = ['street-name-canvas']
    if (this.state.streetNameLeftPos + this.state.streetNameWidth > this.state.rightMenuBarLeftPos) {
      classNames.push('move-down-for-menu')
    }
    if (!this.props.visible) {
      classNames.push('hidden')
    }
    return classNames
  }

  handleStreetNameChange = (newName) => {
    const name = StreetName.normalizeStreetName(newName)
    this.props.saveStreetName(name, true)
  }

  render () {
    return (
      <div className={this.determineClassNames().join(' ')}>
        <StreetName
          id="street-name"
          childRef={(ref) => { this.streetName = ref }}
          name={this.props.street.name}
          handleStreetNameChange={this.handleStreetNameChange}
          editable={this.props.editable}
        />
        <StreetMeta />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    visible: state.ui.streetNameCanvasVisible,
    editable: !state.app.readOnly,
    street: state.street
  }
}

function mapDispatchToProps (dispatch) {
  return {
    saveStreetName: (...args) => { dispatch(saveStreetName(...args)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetNameCanvas)
