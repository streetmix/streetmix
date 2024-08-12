import React, { forwardRef } from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import type { SliderProps } from '@radix-ui/react-slider'

import './Slider.css'

const Slider = forwardRef(
  (
    { value, defaultValue, className, ...props }: SliderProps,
    ref: React.Ref<HTMLSpanElement>
  ) => {
    const displayValues = value ?? defaultValue ?? []

    const classNames = ['slider-root']
    if (className !== undefined) {
      classNames.push(className)
    }

    return (
      <SliderPrimitive.Slider
        value={value}
        defaultValue={defaultValue}
        ref={ref}
        className={classNames.join(' ')}
        {...props}
      >
        <SliderPrimitive.Track className="slider-track">
          <SliderPrimitive.Range className="slider-range" />
        </SliderPrimitive.Track>
        {/* Handles ranged values */}
        {displayValues.map((_, i) => (
          <SliderPrimitive.Thumb key={i} className="slider-thumb" />
        ))}
      </SliderPrimitive.Slider>
    )
  }
)

Slider.displayName = 'Slider'

export default Slider
