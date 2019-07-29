import React from 'react'
import PropTypes from 'prop-types'
import Draggable from 'react-draggable'
import { Transition } from 'react-spring/renderprops'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from '../ui/icons'
import { handleSegmentResizeStart, handleSegmentResizeMove } from './drag_and_drop'
import './ResizeHandle.scss'

// Controls the animation of react-spring
const SPRING_CONFIG = {
  tension: 130,
  friction: 10,
  clamp: true
}

// Direction-specific variables
const DIRECTION = {
  'left': {
    TRANSFORM: 'rotateY(90deg)',
    CLASSNAME: 'resize-handle-left',
    ICON: ICON_CHEVRON_LEFT
  },
  'right': {
    TRANSFORM: 'rotateY(-90deg)',
    CLASSNAME: 'resize-handle-right',
    ICON: ICON_CHEVRON_RIGHT
  }
}

export class ResizeHandle extends React.Component {
  static propTypes = {
    hide: PropTypes.bool,
    direction: PropTypes.oneOf(['left', 'right']).isRequired,
    offsetLeft: PropTypes.number.isRequired,
    activeSegment: PropTypes.number
  }

  static defaultProps = {
    hide: false
  }

  constructor (props) {
    super(props)

    this.state = {
      isDragging: false
    }
  }

  handleStart = (event) => {
    console.log('hey')
    this.setState({
      isDragging: true
    })
    handleSegmentResizeStart(event, this.props.direction, this.props.activeSegment)
  }

  handleDrag = (event) => {
    console.log('hey2')
    handleSegmentResizeMove(event, this.props.direction, this.props.activeSegment)
  }

  handleStop = (event) => {
    this.setState({
      isDragging: false
    })
  }

  render () {
    const { direction } = this.props
    const item = {
      isHidden: this.props.hide,
      offsetLeft: this.props.offsetLeft
    }

    return (
      <Transition
        items={[ item ]}
        from={{ opacity: 0, transform: DIRECTION[direction].TRANSFORM }}
        enter={{ opacity: 1, transform: 'rotateY(0)' }}
        leave={{ opacity: 0, transform: DIRECTION[direction].TRANSFORM }}
        config={SPRING_CONFIG}
      >
        {item => item && (props => (
          <Draggable
            axis="x"
            onStart={this.handleStart}
            onDrag={this.handleDrag}
            onStop={this.handleStop}
          >
            {/* Outer container is transformed by Draggable's position */}
            <div
              className={`resize-handle ${DIRECTION[direction].CLASSNAME}`}
              style={{ display: (item.isHidden) ? 'none' : null, left: item.offsetLeft }}
            >
              {/* Inner container contains transition styles from Transition */}
              <div style={props} className={(this.state.isDragging) ? 'resize-handle-active' : ''}>
                <FontAwesomeIcon icon={DIRECTION[direction].ICON} />
              </div>
            </div>
          </Draggable>
        ))}
      </Transition>
    )
  }
}

export default ResizeHandle
