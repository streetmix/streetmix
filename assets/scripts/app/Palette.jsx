import React from 'react'
import PropTypes from 'prop-types'
import { IntlProvider, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import Scrollable from '../ui/Scrollable'
import SegmentForPalette from '../segments/SegmentForPalette'
import UndoRedo from './UndoRedo'
import PaletteTooltips from '../palette/PaletteTooltips'
import PaletteCommandsLeft from '../palette/PaletteCommandsLeft'
import { getAllSegmentInfoArray } from '../segments/info'

class Palette extends React.Component {
  static propTypes = {
    everythingLoaded: PropTypes.bool.isRequired,
    flags: PropTypes.object.isRequired,
    draggingState: PropTypes.object,
    locale: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.scrollable = React.createRef()

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
   * When locale changes, <Palette /> is remounted. This lifecycle function
   * forces the scrollable container to display scroll buttons, if needed.
   */
  componentDidMount () {
    if (this.scrollable.current) {
      window.setTimeout(this.scrollable.current.checkButtonVisibilityState, 0)
    }
  }

  /**
   * When the app is first started, we need to wait for assets to load and the
   * palette items to be rendered. This lifecycle function forces the scrollable
   * scrollable container to display scroll buttons, if needed. It only runs
   * once (when `everythingLoaded` is flipped to true) and not on every update.
   */
  componentDidUpdate (prevProps) {
    if (!prevProps.everythingLoaded && this.props.everythingLoaded) {
      if (this.scrollable.current) {
        window.setTimeout(this.scrollable.current.checkButtonVisibilityState, 0)
      }
    }
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

  renderPaletteItems = () => {
    const segments = getAllSegmentInfoArray()

    // Filter out segments that are not enabled.
    const enabledSegments = segments.filter(segment => {
      // Accept segments that don't have the `enableWithFlag` property
      const enabledByDefault = !segment.enableWithFlag
      // Accept segments with the `enableWithFlag` property, but only if
      // the flags have that value set to true.
      const enabledByFlag = segment.enableWithFlag && this.props.flags[segment.enableWithFlag].value

      return enabledByDefault || enabledByFlag
    })

    // Return all enabled segments as an array of SegmentForPalette components.
    return enabledSegments.map(segment => {
      const variant = segment.paletteIcon
        ? segment.paletteIcon
        : Object.keys(segment.details).shift()

      return (
        <SegmentForPalette
          key={segment.id}
          type={segment.id}
          variantString={variant}
          onPointerOver={this.handlePointerOver}
        />
      )
    })
  }

  render () {
    const { draggingState } = this.props

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
        <div className={'palette-trashcan' + (draggingState && draggingState.draggedSegment !== undefined ? ' visible' : '')}>
          <FormattedMessage id="palette.remove" defaultMessage="Drag here to remove" />
        </div>
        <div className="palette-commands">
          <UndoRedo />
        </div>
        <div onPointerOut={this.handlePointerOut}>
          <Scrollable className="palette" ref={this.scrollable} onScroll={this.handleScroll}>
            <IntlProvider
              locale={this.props.locale.locale}
              messages={this.props.locale.segmentInfo}
            >
              <React.Fragment>{this.renderPaletteItems()}</React.Fragment>
            </IntlProvider>
          </Scrollable>
        </div>
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
    flags: state.flags,
    draggingState: state.ui.draggingState,
    locale: state.locale
  }
}

export default connect(mapStateToProps)(Palette)
