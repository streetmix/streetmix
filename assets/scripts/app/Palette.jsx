import React from 'react'
import PropTypes from 'prop-types'
import { IntlProvider, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import Scrollable from '../ui/Scrollable'
import SegmentForPalette from '../segments/SegmentForPalette'
import UndoRedo from './UndoRedo'
import { TILE_SIZE, WIDTH_PALETTE_MULTIPLIER } from '../segments/constants'
import { getAllSegmentInfo } from '../segments/info'
import { getVariantInfoDimensions } from '../segments/view'
import { generateRandSeed } from '../util/random'

const PALETTE_EXTRA_SEGMENT_PADDING = 8

class Palette extends React.Component {
  static propTypes = {
    everythingLoaded: PropTypes.bool.isRequired,
    flags: PropTypes.object.isRequired,
    draggingState: PropTypes.object,
    locale: PropTypes.object
  }

  componentDidMount () {
    this.adjustPaletteLayout()
  }

  componentDidUpdate () {
    this.adjustPaletteLayout()
  }

  setScrollableRef = (ref) => {
    this.paletteEl = ref
  }

  adjustPaletteLayout = () => {
    const commandsWidth = this.commandsEl.getBoundingClientRect().width

    // Only do work if palette commands has increased in width
    // TODO: don't hardcode magic number
    const delta = commandsWidth - 105 // 105 is approx what default width is

    // Reset palette right position
    this.paletteEl.style.right = ''

    if (delta > 0) {
      const paletteRightPos = window.parseInt(window.getComputedStyle(this.paletteEl).right, 10)
      const newPaletteRightPos = paletteRightPos + delta
      this.paletteEl.style.right = newPaletteRightPos + 'px'
    }

    // Check button visibility state by calling this method on the Scrollable
    // component directly.
    this.scrollable.checkButtonVisibilityState()
  }

  renderPaletteItems = () => {
    const paletteItems = []
    const segments = getAllSegmentInfo()

    for (let id in segments) {
      const segmentInfo = segments[id]

      // Segments that are only enabled with a flag checks to see if flag
      // is set to true. If not, bail.
      if (segmentInfo.enableWithFlag) {
        const flag = this.props.flags[segmentInfo.enableWithFlag]
        if (!flag) continue
        if (!flag.value) continue
      }

      let variantName
      if (segmentInfo.paletteIcon) {
        variantName = segmentInfo.paletteIcon
      } else {
        variantName = Object.keys(segmentInfo.details).shift()
      }

      const variantInfo = segmentInfo.details[variantName]

      const dimensions = getVariantInfoDimensions(variantInfo, 0, 1)

      let width = dimensions.right - dimensions.left
      if (!width) {
        width = segmentInfo.defaultWidth
      }
      width += PALETTE_EXTRA_SEGMENT_PADDING

      paletteItems.push(<SegmentForPalette
        key={id}
        type={id}
        variantString={variantName}
        width={width * TILE_SIZE / WIDTH_PALETTE_MULTIPLIER}
        randSeed={generateRandSeed()}
      />)
    }

    return paletteItems
  }

  render () {
    const { draggingState } = this.props

    return (
      <div className="palette-container">
        <div className={'palette-trashcan' + (draggingState && draggingState.draggedSegment ? ' visible' : '')}>
          <FormattedMessage id="palette.remove" defaultMessage="Drag here to remove" />
        </div>
        <div className="palette-commands" ref={(ref) => { this.commandsEl = ref }}>
          <UndoRedo />
        </div>
        <Scrollable className="palette" setRef={this.setScrollableRef} ref={(ref) => { this.scrollable = ref }}>
          <IntlProvider
            locale={this.props.locale.locale}
            messages={this.props.locale.segmentInfo}
          >
            <React.Fragment>{this.props.everythingLoaded && this.renderPaletteItems()}</React.Fragment>
          </IntlProvider>
        </Scrollable>
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
