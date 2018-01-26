import React from 'react'
import PropTypes from 'prop-types'
import Scrollable from '../ui/Scrollable'
import { connect } from 'react-redux'
import { t } from '../app/locale'
import { generateRandSeed } from '../util/random'
import { SEGMENT_INFO } from '../segments/info'
import { TILE_SIZE, getVariantInfoDimensions } from '../segments/view'
import Segment from '../segments/Segment'
import UndoRedo from './UndoRedo'

const WIDTH_PALETTE_MULTIPLIER = 4
const PALETTE_EXTRA_SEGMENT_PADDING = 8

class Palette extends React.Component {
  static propTypes = {
    everythingLoaded: PropTypes.bool.isRequired,
    flags: PropTypes.object.isRequired
  }

  componentDidMount () {
    // We have to run this after this event in order to give images time to load.
    window.addEventListener('stmx:everything_loaded', (event) => {
      this.adjustPaletteLayout()
      window.addEventListener('stmx:language_changed', this.onLocaleChange)
    })
  }

  onLocaleChange = () => {
    this.forceUpdate() // Forces translated text to re-render
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

    for (let id in SEGMENT_INFO) {
      let segmentInfo = SEGMENT_INFO[id]

      // Segments that are only enabled with a flag checks to see if flag
      // is set to true. If not, bail.
      if (segmentInfo.enableWithFlag) {
        const flag = this.props.flags[segmentInfo.enableWithFlag]
        if (!flag) break
        if (!flag.value) break
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

      paletteItems.push(<Segment
        key={id}
        type={id}
        variantString={variantName}
        width={width * TILE_SIZE / WIDTH_PALETTE_MULTIPLIER}
        isUnmovable={false}
        forPalette
        randSeed={generateRandSeed()}
      />)
    }

    return paletteItems
  }

  render () {
    return (
      <div className="palette-container">
        <div className="palette-trashcan">
          {t('palette.remove', 'Drag here to remove')}
        </div>
        <div className="palette-commands" ref={(ref) => { this.commandsEl = ref }}>
          <UndoRedo />
        </div>
        <Scrollable className="palette" setRef={this.setScrollableRef} ref={(ref) => { this.scrollable = ref }}>
          <React.Fragment>{this.props.everythingLoaded && this.renderPaletteItems()}</React.Fragment>
        </Scrollable>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    everythingLoaded: state.app.everythingLoaded,
    flags: state.flags
  }
}

export default connect(mapStateToProps)(Palette)
