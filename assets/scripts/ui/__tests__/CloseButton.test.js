/* eslint-env jest */
import React from 'react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl as render } from '../../../../test/helpers/render'
import CloseButton from '../CloseButton'

describe('CloseButton', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<CloseButton onClick={jest.fn()} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders with custom title, class name, and other attributes', () => {
    const { asFragment } = render(
      <CloseButton
        onClick={jest.fn()}
        title="foofoo"
        className="my-class"
        disabled={true}
        hidden={true}
      />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should call onClick function when button is clicked', () => {
    const onClick = jest.fn()
    const { getByTitle } = render(<CloseButton onClick={onClick} title="foo" />)
    userEvent.click(getByTitle('foo'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
