/* eslint-env jest */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import RangeSlider from '../RangeSlider'

describe('RangeSlider', () => {
  it('renders default snapshot', () => {
    const { asFragment } = render(<RangeSlider>foo</RangeSlider>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders snapshot with all props', () => {
    const { asFragment } = render(
      <RangeSlider
        min={0}
        max={2000}
        step={10}
        disabled={true}
        value={1000}
        id="baz"
        onChange={jest.fn()}
        className="custom-classname"
        style={{ color: 'blue' }}
      >
        foo
      </RangeSlider>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('handles value change', () => {
    const handleChange = jest.fn((event) => {
      // We must persist React's synthetic event in the handler so that
      // we are able to use the `.toHaveBeenCalledWith()` method below.
      event.persist()
    })
    render(<RangeSlider onChange={handleChange}>foo</RangeSlider>)
    const input = screen.getByLabelText('foo')

    // Initial value is expected to be halfway between the default
    // mininum and maximum range, and per HTML spec, the value is
    // of type string
    expect(input.value).toBe('50')

    // Change the value
    //  TODO: user-event library dosen't seem to have a way to do this
    // or it isn't documented, check back later
    fireEvent.change(input, { target: { value: 5 } })
    expect(input.value).toBe('5')

    // Test the handler
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: '5'
        })
      })
    )
  })
})
