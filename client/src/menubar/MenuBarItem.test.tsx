import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import MenuBarItem from './MenuBarItem.js'

describe('MenuBarItem', () => {
  it('renders', () => {
    const { asFragment } = render(<MenuBarItem label="foo" translation="foo" />)

    expect(asFragment()).toMatchSnapshot()
  })

  it('handles the click on a button', async () => {
    const handleClick = vi.fn()
    render(<MenuBarItem onClick={handleClick}>label</MenuBarItem>)

    // A button is rendered with the role `menuitem`
    await userEvent.click(screen.getByRole('menuitem'))

    expect(handleClick).toHaveBeenCalled()
  })

  it('handles the click on a link', async () => {
    const handleClick = vi.fn()
    render(
      <MenuBarItem url="#" onClick={handleClick}>
        label
      </MenuBarItem>
    )

    // An anchor tag is rendered with the role `menuitem`
    await userEvent.click(screen.getByRole('menuitem'))

    expect(handleClick).toHaveBeenCalled()
  })

  it('renders children instead of default label if provided', () => {
    render(
      <MenuBarItem>
        <span data-testid="foo">bar</span>
      </MenuBarItem>
    )

    expect(screen.getByTestId('foo')).toHaveTextContent('bar')
    expect(screen.getByText('bar')).toBeInTheDocument()
  })

  it('passes unhandled props to child elements', () => {
    render(<MenuBarItem foo="bar">child</MenuBarItem>)

    expect(screen.getByText('child')).toHaveAttribute('foo', 'bar')
  })
})
