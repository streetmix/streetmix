/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Checkbox from '../Checkbox'

describe('Checkbox', () => {
  it('renders default snapshot', () => {
    const { asFragment } = render(<Checkbox>foo</Checkbox>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders snapshot with all props', () => {
    const { asFragment } = render(
      <Checkbox
        checked={true}
        disabled={true}
        value="bar"
        id="baz"
        onChange={jest.fn()}
        className="custom-classname"
        style={{ color: 'blue' }}
      >
        foo
      </Checkbox>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('handles click on the label text', () => {
    const handleChange = jest.fn()
    const { getByText } = render(
      <Checkbox onChange={handleChange}>foo</Checkbox>
    )
    userEvent.click(getByText('foo'))
    expect(handleChange).toHaveBeenCalledTimes(1)
  })
})
