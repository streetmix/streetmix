import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CloseButton from '../ui/CloseButton'
import { SUN_ICON, MOON_ICON } from '../ui/icons'
import { setEnvironment } from '../store/actions/street'
import './PaletteCommandsLeft.scss'

class PaletteCommandsLeft extends Component {
  static propTypes = {
    env: PropTypes.string,
    setEnvironment: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    let tooltipDismissed
    try {
      tooltipDismissed = window.localStorage.getItem('supermoon-tooltip-dismissed')
    } catch (e) {
      console.log('Could not access localstorage')
    }

    this.state = {
      tooltip: tooltipDismissed !== 'true'
    }
  }

  setToDay = () => {
    this.dismissTooltip()
    this.props.setEnvironment('day')
  }

  setToMoon = () => {
    this.dismissTooltip()
    this.props.setEnvironment('supermoon')
  }

  dismissTooltip = () => {
    this.setState({
      tooltip: false
    })

    try {
      window.localStorage.setItem('supermoon-tooltip-dismissed', 'true')
    } catch (e) {
      console.log('Could not access localstorage')
    }
  }

  render () {
    let Button
    if (this.props.env === 'supermoon') {
      Button = (
        <button
          onClick={this.setToDay}
          title={'Toggle supermoon'}
        >
          <FontAwesomeIcon icon={SUN_ICON} />
        </button>
      )
    } else {
      Button = (
        <button
          onClick={this.setToMoon}
          title={'Toggle supermoon'}
        >
          <FontAwesomeIcon icon={MOON_ICON} />
        </button>

      )
    }

    let Tooltip = (this.state.tooltip) ? (
      <div className="supermoon-tooltip">
        <CloseButton onClick={this.dismissTooltip} />
        <p>
          <strong><a href="https://www.nationalgeographic.com/science/2019/01/how-to-watch-super-blood-wolf-moon-lunar-eclipse/" target="_blank" rel="noopener noreferrer">The “super blood wolf moon” lunar eclipse</a></strong> (external link) is visible in the Americas,
          western Europe and in most of Africa from January 20-21, 2019. You can return to daytime sky with this button below.&lrm;
        </p>
        <div className="palette-tooltip-pointer-container">
          <div className="palette-tooltip-pointer" />
        </div>
      </div>
    ) : null

    return (
      <div className="palette-commands-left">
        {Button}
        {Tooltip}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  env: state.street.environment
})

const mapDispatchToProps = {
  setEnvironment
}

export default connect(mapStateToProps, mapDispatchToProps)(PaletteCommandsLeft)
