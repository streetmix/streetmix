import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CloseButton from '../ui/CloseButton'
import { ICON_TOOLS } from '../ui/icons'
import { toggleToolbox } from '../store/actions/ui'
import './PaletteCommandsLeft.scss'

class PaletteCommandsLeft extends PureComponent {
  static propTypes = {
    enable: PropTypes.bool,
    toggleToolbox: PropTypes.func
  }

  constructor (props) {
    super(props)

    let tooltipDismissed
    try {
      tooltipDismissed = window.localStorage.getItem('new-palette-tooltip-dismissed')
    } catch (e) {
      console.log('Could not access localstorage')
    }

    this.state = {
      tooltip: tooltipDismissed !== 'true'
    }
  }

  handleClickTools = () => {
    this.dismissTooltip()
    this.props.toggleToolbox()
  }

  dismissTooltip = () => {
    this.setState({
      tooltip: false
    })

    try {
      window.localStorage.setItem('new-palette-tooltip-dismissed', 'true')
    } catch (e) {
      console.log('Could not access localstorage')
    }
  }

  render () {
    if (!this.props.enable) return null

    const Button = (
      <button
        onClick={this.handleClickTools}
        title={'Toggle tools'}
      >
        <FontAwesomeIcon icon={ICON_TOOLS} />
      </button>
    )

    const Tooltip = (this.state.tooltip) ? (
      <div className="supermoon-tooltip">
        <CloseButton onClick={this.dismissTooltip} />
        <p>
          <strong>You’ve got some new tools!&lrm;</strong> Click on this button to activate some new abilities.&lrm;
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
  enable: state.flags.ENVIRONMENT_EDITOR.value
})

const mapDispatchToProps = {
  toggleToolbox
}

export default connect(mapStateToProps, mapDispatchToProps)(PaletteCommandsLeft)
