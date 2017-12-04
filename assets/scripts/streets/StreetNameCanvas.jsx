import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import StreetName from './StreetName'
import StreetMetaData from './StreetMetaData'
import { setAndSaveStreet } from './data_model'
import { updateStreetName } from './name'
import { t } from '../app/locale'

class StreetNameCanvas extends React.Component {
  static propTypes = {
    editable: PropTypes.bool,
    street: PropTypes.object
  }

  static defaultProps = {
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
    const classNames = []
    if (this.state.streetNameLeftPos + this.state.streetNameWidth > this.state.rightMenuBarLeftPos) {
      classNames.push('move-down-for-menu')
    }
    return classNames
  }

  onClickStreetName = () => {
    if (!this.props.editable) return

    const newName = window.prompt(t('prompt.new-street', 'New street name:'), this.props.street.name)

    if (newName) {
      const street = Object.assign({}, this.props.street)
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
          childRef={(ref) => { this.streetName = ref }}
          name={this.props.street.name}
          onClick={this.onClickStreetName}
        />
        <StreetMetaData id="street-metadata" street={this.props.street} />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    editable: !state.app.readOnly,
    street: state.street
  }
}

export default connect(mapStateToProps)(StreetNameCanvas)
