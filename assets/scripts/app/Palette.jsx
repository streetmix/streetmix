import React from 'react'
import PropTypes from 'prop-types'
import { IntlProvider, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import Scrollable from '../ui/Scrollable'
import SegmentForPalette from '../segments/SegmentForPalette'
import UndoRedo from './UndoRedo'
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

    this.commandsEl = React.createRef()
    this.scrollable = React.createRef()
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
    const commandsWidth = this.commandsEl.current.getBoundingClientRect().width

    // Only do work if palette commands has increased in width
    // TODO: don't hardcode magic number
    const delta = commandsWidth - 105 // 105 is approx what default width is

    // Reset palette right position
    this.paletteEl.style.right = ''

    if (delta > 0) {
      const paletteRightPos = Number.parseInt(window.getComputedStyle(this.paletteEl).right, 10)
      const newPaletteRightPos = paletteRightPos + delta
      this.paletteEl.style.right = newPaletteRightPos + 'px'
    }

    // Check button visibility state by calling this method on the Scrollable
    // component directly.
    this.scrollable.current.checkButtonVisibilityState()
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

      return <SegmentForPalette key={segment.id} type={segment.id} variantString={variant} />
    })
  }

  render () {
    const { draggingState } = this.props

    return (
      <div className="palette-container">
        <div className={'palette-trashcan' + (draggingState && draggingState.draggedSegment !== undefined ? ' visible' : '')}>
          <FormattedMessage id="palette.remove" defaultMessage="Drag here to remove" />
        </div>
        <div className="palette-commands" ref={this.commandsEl}>
          <UndoRedo />
        </div>
        <Scrollable className="palette" setRef={this.setScrollableRef} ref={this.scrollable}>
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
