/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../../../../test/helpers/render'
import MenuBarItem from '../MenuBarItem'

describe('MenuBarItem', () => {
  it('renders', () => {
    const { asFragment } = renderWithIntl(
      <MenuBarItem label="foo" translation="foo" />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('handles the click on a button', () => {
    const handleClick = jest.fn()
    renderWithIntl(<MenuBarItem onClick={handleClick}>label</MenuBarItem>)

    userEvent.click(screen.getByRole('button'))

    expect(handleClick).toBeCalled()
  })

  it('handles the click on a link', () => {
    const handleClick = jest.fn()
    renderWithIntl(
      <MenuBarItem url="#" onClick={handleClick}>
        label
      </MenuBarItem>
    )

    // Expect an anchor tag element to be present, then click it
    userEvent.click(screen.getByRole('link'))

    expect(handleClick).toBeCalled()
  })

  it('renders children instead of default label if provided', () => {
    renderWithIntl(
      <MenuBarItem>
        <span data-testid="foo">bar</span>
      </MenuBarItem>
    )

    expect(screen.getByTestId('foo')).toHaveTextContent('bar')
    expect(screen.getByText('bar')).toBeInTheDocument()
  })

  it('passes unhandled props to child elements', () => {
    renderWithIntl(<MenuBarItem foo="bar">child</MenuBarItem>)

    expect(screen.getByText('child')).toHaveAttribute('foo', 'bar')
  })
})
