/* eslint-env jest */
import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import Checkbox from '../Checkbox'

describe('Checkbox', () => {
  it('renders default snapshot', () => {
    const wrapper = render(<Checkbox>foo</Checkbox>)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders snapshot with all props', () => {
    const wrapper = render(
      <Checkbox
        checked={true}
        disabled={true}
        value="bar"
        id="baz"
        onChange={jest.fn()}
      >
        foo
      </Checkbox>
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('handles click', () => {
    const handleChange = jest.fn()
    const { getByText } = render(
      <Checkbox onChange={handleChange}>foo</Checkbox>
    )
    fireEvent.click(getByText('foo'))
    expect(handleChange).toHaveBeenCalledTimes(1)
  })
})
