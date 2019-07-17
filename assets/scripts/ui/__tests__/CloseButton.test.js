/* eslint-env jest */
import React from 'react'
import { fireEvent, cleanup } from '@testing-library/react'
import { renderWithIntl as render } from '../../../../test/helpers/render'
import CloseButton from '../CloseButton'

describe('CloseButton', () => {
  afterEach(cleanup)

  it('renders snapshot', () => {
    const wrapper = render(<CloseButton onClick={jest.fn()} />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders with custom title, class name, and other attributes', () => {
    const wrapper = render(<CloseButton
      onClick={jest.fn()}
      title="foofoo"
      className="my-class"
      disabled
      hidden
    />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('should call onClick function when button is clicked', () => {
    const onClick = jest.fn()
    const { getByTitle } = render(<CloseButton
      onClick={onClick}
      title="foo"
    />)
    fireEvent.click(getByTitle('foo'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
