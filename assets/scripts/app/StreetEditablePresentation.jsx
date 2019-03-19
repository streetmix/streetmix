import React from 'react'
import PropTypes from 'prop-types'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import uuid from 'uuid'
import Segment from '../segments/Segment'
import { getVariantArray } from '../segments/variant_utils'

class StreetEditablePresentation extends React.Component {
  static propTypes = {
    street: PropTypes.object.isRequired,
    updatePerspective: PropTypes.func.isRequired,
    calculateSegmentPos: PropTypes.func.isRequired
  }

  /**
   * A <Transition> callback fired immediately after the `exit` class is applied.
   *
   * @params {HtmlElement}
   */
  handleOnExit = (el) => {
    // Switches the segment "away"
    el.classList.add('create')
    el.style.left = el.savedLeft + 'px'

    this.props.updatePerspective(el)
  }

  updateSegmentData = (ref, dataNo, segmentPos) => {
    const { segments } = this.props.street
    const segment = segments[dataNo]

    if (segment) {
      segment.el = ref
      segment.el.dataNo = dataNo
      segment.el.savedLeft = Math.round(segmentPos)
      segment.el.cssTransformLeft = Math.round(segmentPos)
    }
  }

  handleExitAnimations = (child) => {
    return React.cloneElement(child, {
      exit: !(this.props.street.immediateRemoval)
    })
  }

  /**
   * Renders an array of segments wrapped in <CSSTransition /> components.
   * This function's return value are immediate children of <TransitionGroup />,
   * so there must not be another wrapping element or component between them.
   */
  renderSegments = () => {
    const { segments, units, immediateRemoval } = this.props.street

    return segments.map((segment, i) => {
      const segmentPos = this.props.calculateSegmentPos(i)

      segment.variant = getVariantArray(segment.type, segment.variantString)
      segment.warnings = segment.warnings || []
      segment.id = segment.id || uuid()

      return (
        <CSSTransition
          key={segment.id}
          timeout={250}
          classNames="switching-away"
          enter={false}
          exit={!(immediateRemoval)}
          onExit={this.handleOnExit}
          unmountOnExit
        >
          <Segment
            key={segment.id}
            dataNo={i}
            segment={{ ...segment }}
            actualWidth={segment.width}
            units={units}
            segmentPos={segmentPos}
            updateSegmentData={this.updateSegmentData}
            updatePerspective={this.props.updatePerspective}
          />
        </CSSTransition>
      )
    })
  }

  render () {
    return (
      <TransitionGroup
        key={this.props.street.id}
        component={null}
        childFactory={this.handleExitAnimations}
      >
        {this.renderSegments()}
      </TransitionGroup>
    )
  }
}

export default StreetEditablePresentation
