import React from 'react'
import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../test/helpers/render'
import CloseButton from './CloseButton'

describe('CloseButton', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<CloseButton onClick={vi.fn()} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders with custom title, class name, and other attributes', () => {
    const { asFragment } = render(
      <CloseButton
        onClick={vi.fn()}
        title="foofoo"
        className="my-class"
        disabled={true}
        hidden={true}
      />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should call onClick function when button is clicked', async () => {
    const onClick = vi.fn()
    const { getByTitle } = render(<CloseButton onClick={onClick} title="foo" />)
    await userEvent.click(getByTitle('foo'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
