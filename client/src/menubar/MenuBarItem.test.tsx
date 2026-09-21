import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { MenuBarItem } from './MenuBarItem.js'

/* eslint-disable formatjs/no-literal-string-in-jsx */

describe('MenuBarItem', () => {
  it('renders', () => {
    const { asFragment } = render(<MenuBarItem>foo</MenuBarItem>)

    expect(asFragment()).toMatchSnapshot()
  })

  it('handles the click on a button', async () => {
    const handleClick = vi.fn()
    render(<MenuBarItem onClick={handleClick}>label</MenuBarItem>)

    await userEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalled()
  })

  it('renders children if provided', () => {
    render(
      <MenuBarItem>
        <span aria-label="foo">bar</span>
      </MenuBarItem>
    )

    expect(screen.getByLabelText('foo')).toHaveTextContent('bar')
    expect(screen.getByText('bar')).toBeInTheDocument()
  })

  it('passes unhandled props to child elements', () => {
    render(<MenuBarItem id="bar">child</MenuBarItem>)

    expect(screen.getByText('child')).toHaveAttribute('id', 'bar')
  })
})
