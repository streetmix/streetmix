import React from 'react'
import PropTypes from 'prop-types'
import * as SliderPrimitive from '@radix-ui/react-slider'
import './Slider.scss'

// eslint-disable-next-line react/display-name
const Slider = React.forwardRef((props, forwardedRef) => {
  const value = props.value || props.defaultValue

  const classNames = ['slider-root']
  if (props.className) {
    classNames.push(props.className)
  }

  return (
    <SliderPrimitive.Slider
      {...props}
      ref={forwardedRef}
      className={classNames.join(' ')}
    >
      <SliderPrimitive.Track className="slider-track">
        <SliderPrimitive.Range className="slider-range" />
      </SliderPrimitive.Track>
      {/* Handles ranged values */}
      {value.map((_, i) => (
        <SliderPrimitive.Thumb key={i} className="slider-thumb" />
      ))}
    </SliderPrimitive.Slider>
  )
})

Slider.propTypes = {
  value: PropTypes.arrayOf(PropTypes.number),
  defaultValue: PropTypes.arrayOf(PropTypes.number),
  className: PropTypes.string
}

export default Slider
