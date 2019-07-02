import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import UndoRedo from './UndoRedo'
import Palette from './Palette'
import PaletteTooltips from './PaletteTooltips'
import PaletteTrashcan from './PaletteTrashcan'
import PaletteCommandsLeft from './PaletteCommandsLeft'
import './PaletteContainer.scss'

class PaletteContainer extends React.Component {
  static propTypes = {
    everythingLoaded: PropTypes.bool.isRequired,
    draggingState: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      tooltipLabel: null,
      tooltipVisible: false,
      tooltipPosition: {}
    }
  }

  /**
   * Prevent tooltips from displaying during a drag action
   *
   * @param {object} props - incoming props
   */
  static getDerivedStateFromProps (props) {
    if (props.draggingState) {
      return {
        tooltipVisible: false
      }
    }

    return null
  }

  /**
   * Each segment in palette calls this function when the pointer hovers over it so we know
   * what to display in the tooltip
   *
   * @param {Object} event - event handler object
   * @param {string} label - text to display inside the tooltip
   * @param {Object} rect - result of getBoundingClientRect() on segment element
   */
  handlePointerOver = (event, label, rect) => {
    // x is the position right above the middle of the segment element to point at
    const x = rect.x + (rect.width / 2)

    this.setState({
      tooltipLabel: label,
      tooltipVisible: true,
      tooltipPosition: { x }
    })
  }

  /**
   * When the pointer leaves the segment area, hide tooltip.
   */
  handlePointerOut = (event) => {
    this.setState({
      tooltipVisible: false
    })
  }

  /**
   * When the segment area is being scrolled, hide tooltip.
   */
  handleScroll = (event) => {
    this.setState({
      tooltipVisible: false
    })
  }

  render () {
    // Render an empty container before assets for palette items have loaded.
    // (Another part of the app depends on this element for layout calculation.)
    if (!this.props.everythingLoaded) {
      return (
        <div className="palette-container" />
      )
    }

    return (
      <div className="palette-container">
        <PaletteCommandsLeft />
        <PaletteTrashcan />
        <div className="palette-commands">
          <UndoRedo />
        </div>
        <Palette
          handlePointerOver={this.handlePointerOver}
          handlePointerOut={this.handlePointerOut}
          handleScroll={this.handleScroll}
        />
        <PaletteTooltips
          label={this.state.tooltipLabel}
          visible={this.state.tooltipVisible}
          pointAt={this.state.tooltipPosition}
        />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    everythingLoaded: state.app.everythingLoaded,
    draggingState: state.ui.draggingState
  }
}

export default connect(mapStateToProps)(PaletteContainer)
