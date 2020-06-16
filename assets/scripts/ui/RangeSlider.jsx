import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import './RangeSlider.scss'

// This stores an incrementing number for unique IDs.
let idCounter = 1

RangeSlider.propTypes = {
  // Child nodes are wrapped in <label> when rendered.
  children: PropTypes.node.isRequired,

  // Values for the slider element, matches vanilla HTML usage.
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,

  // Whether or not the input is disabled.
  disabled: PropTypes.bool,

  // The value of a checkbox input can be optionally set.
  value: PropTypes.number,

  // The handler function that's called when the value of the input changes.
  onChange: PropTypes.func,

  // Class name applied to containing element
  className: PropTypes.string,

  // An `id` is associates a `label` with an `input` element. If you don't
  // provide one, the component automatically generates one.
  id: PropTypes.string
}

function RangeSlider (props) {
  const {
    children,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    value,
    onChange = () => {},
    id,
    className,

    // Remainder of props will be applied to the containing <div> element
    // for instance, `style`, data attributes, etc.
    ...restProps
  } = props

  // An `id` is required to associate a `label` with an `input` element.
  // You can provide one manually in props, otherwise, this component
  // will generate a unique id value for each instance. Generated ids
  // are not meant to be accessed by other code or CSS selectors.
  const elementId = useRef(id)
  if (!elementId.current) {
    // This exists in an if statement to check if the ref value is present
    // to prevent the counter from incrementing on every render
    elementId.current = `rangeslider-id-${idCounter++}`
  }

  const classNames = ['range-slider-item']
  if (className) {
    classNames.push(className)
  }

  return (
    <div className={classNames.join(' ')} {...restProps}>
      <label htmlFor={elementId.current}>{children}</label>{' '}
      <input
        type="range"
        id={elementId.current}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default RangeSlider
