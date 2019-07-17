import React from 'react'
import PropTypes from 'prop-types'
import { IntlProvider } from 'react-intl'
import { connect } from 'react-redux'
import Scrollable from '../ui/Scrollable'
import SegmentForPalette from '../segments/SegmentForPalette'
import { getAllSegmentInfoArray } from '../segments/info'
import './Palette.scss'

class Palette extends React.PureComponent {
  static propTypes = {
    // Provided by parent component
    handlePointerOver: PropTypes.func.isRequired,
    handlePointerOut: PropTypes.func.isRequired,
    handleScroll: PropTypes.func.isRequired,

    // Provided by Redux
    everythingLoaded: PropTypes.bool.isRequired,
    flags: PropTypes.object.isRequired,
    locale: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.scrollable = React.createRef()
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
          onPointerOver={this.props.handlePointerOver}
        />
      )
    })
  }

  render () {
    return (
      <div onPointerOut={this.props.handlePointerOut}>
        <Scrollable className="palette" ref={this.scrollable} onScroll={this.props.handleScroll}>
          <IntlProvider
            locale={this.props.locale.locale}
            messages={this.props.locale.segmentInfo}
          >
            <React.Fragment>{this.renderPaletteItems()}</React.Fragment>
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
    locale: state.locale
  }
}

export default connect(mapStateToProps)(Palette)
